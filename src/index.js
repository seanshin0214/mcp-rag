#!/usr/bin/env node

/**
 * MCP-RAG Server
 * Universal RAG server for Claude Desktop
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { ChromaClient } from 'chromadb';

const CHROMA_URL = process.env.CHROMA_URL || 'http://localhost:8000';
const DEFAULT_TOP_K = 5;

let chromaClient;

/**
 * ChromaDB 초기화
 */
async function initializeChromaDB() {
  try {
    chromaClient = new ChromaClient({ path: CHROMA_URL });
    await chromaClient.heartbeat();
    console.error('✅ ChromaDB connected');
    return true;
  } catch (error) {
    console.error('❌ ChromaDB connection failed:', error.message);
    console.error('\n💡 Start ChromaDB server:');
    console.error('   chroma run --host localhost --port 8000\n');
    return false;
  }
}

/**
 * 컬렉션에서 검색
 */
async function searchInCollection(collectionName, query, topK = DEFAULT_TOP_K) {
  const collection = await chromaClient.getCollection({ name: collectionName });

  const results = await collection.query({
    queryTexts: [query],
    nResults: topK,
  });

  const formattedResults = [];

  if (results.documents && results.documents[0]) {
    for (let i = 0; i < results.documents[0].length; i++) {
      const document = results.documents[0][i];
      const metadata = results.metadatas[0][i];
      const distance = results.distances[0][i];

      formattedResults.push({
        content: document,
        metadata: {
          chunk_index: metadata.chunk_index,
          source: metadata.source,
          collection: collectionName,
          relevance_score: (1 - distance).toFixed(4)
        }
      });
    }
  }

  return formattedResults;
}

/**
 * 모든 컬렉션에서 검색
 */
async function searchAllCollections(query, topK = DEFAULT_TOP_K) {
  const collections = await chromaClient.listCollections();
  const allResults = [];

  for (const col of collections) {
    try {
      const results = await searchInCollection(col.name, query, topK);
      allResults.push(...results);
    } catch (error) {
      console.error(`Error searching in ${col.name}:`, error.message);
    }
  }

  // 유사도 기준으로 정렬
  allResults.sort((a, b) => parseFloat(b.metadata.relevance_score) - parseFloat(a.metadata.relevance_score));

  return allResults.slice(0, topK);
}

/**
 * MCP 서버 설정
 */
const server = new Server(
  {
    name: 'mcp-rag',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

/**
 * 도구 목록
 */
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'search_documents',
        description: 'Search in your indexed documents. You can search in a specific collection or across all collections. This tool ONLY returns information from indexed documents - no external knowledge or assumptions.',
        inputSchema: {
          type: 'object',
          properties: {
            query: {
              type: 'string',
              description: 'Search query or question',
            },
            collection: {
              type: 'string',
              description: 'Collection name to search in (optional - if not provided, searches all collections)',
            },
            top_k: {
              type: 'number',
              description: 'Number of results to return (default: 5)',
              default: DEFAULT_TOP_K,
            },
          },
          required: ['query'],
        },
      },
      {
        name: 'list_collections',
        description: 'List all available document collections',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'get_collection_info',
        description: 'Get detailed information about a specific collection',
        inputSchema: {
          type: 'object',
          properties: {
            collection: {
              type: 'string',
              description: 'Collection name',
            },
          },
          required: ['collection'],
        },
      },
    ],
  };
});

/**
 * 도구 실행
 */
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    if (name === 'search_documents') {
      const query = args.query;
      const collectionName = args.collection;
      const topK = args.top_k || DEFAULT_TOP_K;

      let results;
      if (collectionName) {
        results = await searchInCollection(collectionName, query, topK);
      } else {
        results = await searchAllCollections(query, topK);
      }

      if (results.length === 0) {
        return {
          content: [
            {
              type: 'text',
              text: `Query: "${query}"\n\n❌ No relevant information found in the indexed documents.\n\nThe information you're looking for is not available in any collection.`,
            },
          ],
        };
      }

      let responseText = `Query: "${query}"\n\n`;
      if (collectionName) {
        responseText += `📚 Found ${results.length} relevant chunks in collection "${collectionName}":\n\n`;
      } else {
        responseText += `📚 Found ${results.length} relevant chunks across all collections:\n\n`;
      }
      responseText += `⚠️ IMPORTANT: The following content is ONLY from indexed documents. Do NOT add external knowledge or assumptions.\n\n`;
      responseText += `${'='.repeat(80)}\n\n`;

      results.forEach((result, index) => {
        responseText += `### 📄 Result ${index + 1}\n`;
        responseText += `**Collection:** ${result.metadata.collection}\n`;
        responseText += `**Source:** ${result.metadata.source} (chunk #${result.metadata.chunk_index})\n`;
        responseText += `**Relevance:** ${(parseFloat(result.metadata.relevance_score) * 100).toFixed(1)}%\n\n`;
        responseText += `**Content:**\n${result.content}\n\n`;
        responseText += `${'-'.repeat(80)}\n\n`;
      });

      responseText += `\n✅ All content above is from indexed documents.\n`;
      responseText += `💡 Answer based ONLY on the content above. If the information is not present, say "This information is not available in the documents."\n`;

      return {
        content: [
          {
            type: 'text',
            text: responseText,
          },
        ],
      };
    }
    else if (name === 'list_collections') {
      try {
        const collections = await chromaClient.listCollections();

        if (collections.length === 0) {
          return {
            content: [
              {
                type: 'text',
                text: '📭 No collections found.\n\nAdd documents using:\n  mcp-rag add <collection> <file>',
              },
            ],
          };
        }

        let text = `📚 Available Collections (${collections.length}):\n\n`;

        for (const colName of collections) {
          try {
            const collection = await chromaClient.getCollection({ name: colName });
            const count = await collection.count();

            text += `📁 **${colName}**\n`;
            text += `   - Chunks: ${count}\n`;
            text += `\n`;
          } catch (colError) {
            console.error(`Error getting collection ${colName}:`, colError);
            text += `📁 **${colName}** (error reading details)\n\n`;
          }
        }

        return {
          content: [
            {
              type: 'text',
              text: text,
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: 'text',
              text: `❌ Error listing collections: ${error.message}\n\nMake sure ChromaDB server is running:\n  chroma run --host localhost --port 8000`,
            },
          ],
          isError: true,
        };
      }
    }
    else if (name === 'get_collection_info') {
      const collectionName = args.collection;
      const collection = await chromaClient.getCollection({ name: collectionName });

      const count = await collection.count();
      const sample = await collection.get({ limit: 100, include: ['metadatas'] });

      const sources = [...new Set(sample.metadatas.map(m => m.source))];

      let text = `📊 Collection: **${collectionName}**\n\n`;
      text += `**Total chunks:** ${count}\n`;
      text += `**Documents:** ${sources.length}\n\n`;
      text += `**Files:**\n`;
      sources.forEach(src => {
        const chunks = sample.metadatas.filter(m => m.source === src);
        text += `  📄 ${src} (${chunks.length} chunks)\n`;
      });

      return {
        content: [
          {
            type: 'text',
            text: text,
          },
        ],
      };
    }
    else {
      throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: `❌ Error: ${error.message}`,
        },
      ],
      isError: true,
    };
  }
});

/**
 * 서버 시작
 */
async function main() {
  console.error('🚀 MCP-RAG Server starting...\n');

  const initialized = await initializeChromaDB();
  if (!initialized) {
    console.error('\n❌ Cannot start server.');
    process.exit(1);
  }

  const transport = new StdioServerTransport();
  await server.connect(transport);

  console.error('\n✅ MCP-RAG Server running');
  console.error('💡 Ready for Claude Desktop\n');
}

main().catch((error) => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
