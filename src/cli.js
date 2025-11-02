#!/usr/bin/env node

/**
 * MCP-RAG CLI - 컬렉션 관리 도구
 */

import { Command } from 'commander';
import { ChromaClient } from 'chromadb';
import { indexDocument } from './indexer.js';
import path from 'path';
import fs from 'fs';

const CHROMA_URL = process.env.CHROMA_URL || 'http://localhost:8000';

const program = new Command();

program
  .name('mcp-rag')
  .description('Universal RAG MCP Server - Manage your document collections')
  .version('1.0.0');

/**
 * 문서 추가
 */
program
  .command('add <collection> <file>')
  .description('Add a document to a collection')
  .option('-d, --description <desc>', 'Collection description')
  .action(async (collection, file, options) => {
    try {
      console.log(`\n📚 Adding document to collection "${collection}"...\n`);

      const client = new ChromaClient({ path: CHROMA_URL });
      await client.heartbeat();

      const filePath = path.resolve(file);
      if (!fs.existsSync(filePath)) {
        console.error(`❌ File not found: ${filePath}`);
        process.exit(1);
      }

      const result = await indexDocument(client, collection, filePath, {
        description: options.description
      });

      console.log(`✅ Success!`);
      console.log(`   Collection: ${result.collectionName}`);
      console.log(`   File: ${result.fileName}`);
      console.log(`   Pages: ${result.numPages}`);
      console.log(`   Chunks: ${result.numChunks}\n`);
    } catch (error) {
      console.error(`\n❌ Error: ${error.message}\n`);
      process.exit(1);
    }
  });

/**
 * 컬렉션 목록
 */
program
  .command('list')
  .description('List all collections')
  .action(async () => {
    try {
      const client = new ChromaClient({ path: CHROMA_URL });
      const collections = await client.listCollections();

      if (collections.length === 0) {
        console.log('\n📭 No collections found.\n');
        return;
      }

      console.log(`\n📚 Collections (${collections.length}):\n`);

      for (const colName of collections) {
        try {
          const collection = await client.getCollection({ name: colName });
          const count = await collection.count();

          console.log(`   📁 ${colName}`);
          console.log(`      Chunks: ${count}`);
          console.log();
        } catch (err) {
          console.log(`   📁 ${colName} (error: ${err.message})`);
          console.log();
        }
      }
    } catch (error) {
      console.error(`\n❌ Error: ${error.message}\n`);
      if (error.message.includes('connect')) {
        console.log('💡 Make sure ChromaDB is running:');
        console.log('   chroma run --host localhost --port 8000\n');
      }
      process.exit(1);
    }
  });

/**
 * 컬렉션 정보
 */
program
  .command('info <collection>')
  .description('Show collection information')
  .action(async (collectionName) => {
    try {
      const client = new ChromaClient({ path: CHROMA_URL });
      const collection = await client.getCollection({ name: collectionName });

      const count = await collection.count();
      const sample = await collection.get({ limit: 10, include: ['metadatas'] });

      console.log(`\n📊 Collection: ${collectionName}\n`);
      console.log(`   Total chunks: ${count}`);

      if (sample.metadatas.length > 0) {
        const sources = [...new Set(sample.metadatas.map(m => m.source))];
        console.log(`   Documents: ${sources.length}`);
        console.log(`\n   📄 Files:`);
        sources.forEach(src => console.log(`      - ${src}`));
      }

      console.log();
    } catch (error) {
      console.error(`\n❌ Error: ${error.message}\n`);
      process.exit(1);
    }
  });

/**
 * 컬렉션 삭제
 */
program
  .command('delete <collection>')
  .description('Delete a collection')
  .action(async (collectionName) => {
    try {
      const client = new ChromaClient({ path: CHROMA_URL });
      await client.deleteCollection({ name: collectionName });

      console.log(`\n✅ Collection "${collectionName}" deleted.\n`);
    } catch (error) {
      console.error(`\n❌ Error: ${error.message}\n`);
      process.exit(1);
    }
  });

/**
 * 검색 테스트
 */
program
  .command('search <collection> <query>')
  .description('Search in a collection (test)')
  .option('-k, --top-k <number>', 'Number of results', '5')
  .action(async (collectionName, query, options) => {
    try {
      const client = new ChromaClient({ path: CHROMA_URL });
      const collection = await client.getCollection({ name: collectionName });

      const results = await collection.query({
        queryTexts: [query],
        nResults: parseInt(options.topK)
      });

      console.log(`\n🔍 Search results for: "${query}"\n`);

      if (results.documents[0].length === 0) {
        console.log('   No results found.\n');
        return;
      }

      for (let i = 0; i < results.documents[0].length; i++) {
        const doc = results.documents[0][i];
        const meta = results.metadatas[0][i];
        const distance = results.distances[0][i];

        console.log(`   ${i + 1}. ${meta.source} (chunk ${meta.chunk_index})`);
        console.log(`      Relevance: ${((1 - distance) * 100).toFixed(1)}%`);
        console.log(`      ${doc.substring(0, 150)}...`);
        console.log();
      }
    } catch (error) {
      console.error(`\n❌ Error: ${error.message}\n`);
      process.exit(1);
    }
  });

program.parse();
