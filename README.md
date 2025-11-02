# MCP-RAG

**Your Personal NotebookLM for Claude Desktop**

Universal RAG (Retrieval-Augmented Generation) MCP server that turns Claude Desktop into a powerful document question-answering system. Index any PDF documents and ask questions - Claude will answer based ONLY on your documents, with 0% hallucination.

## What is MCP-RAG?

Think of it as **NotebookLM, but for Claude Desktop**:

- 📚 Upload any PDF documents (regulations, manuals, research papers, notes)
- 🔍 Ask questions in natural language
- ✅ Get answers based ONLY on your documents
- 🚫 Zero hallucination - if it's not in your docs, Claude says so
- 💻 100% local processing with ChromaDB vector search

## Features

### 🎯 Core Features

- **Multi-Collection Support**: Organize documents by topic (school, work, research, etc.)
- **Vector Search**: Semantic search powered by ChromaDB embeddings
- **0% Hallucination**: Strict document-only responses
- **Source Attribution**: Every answer includes source file and chunk location
- **Multiple Formats**: PDF, TXT, Markdown support

### 🔧 Technical Features

- **MCP Protocol**: Seamless Claude Desktop integration
- **Token-based Chunking**: Smart 500-token chunks with 50-token overlap
- **Relevance Scoring**: See how relevant each search result is
- **CLI Management**: Easy command-line collection management
- **Local-First**: All data stays on your computer

## Quick Start

### 1. Install Dependencies

**Windows:**
```bash
cd mcp-rag
install.bat
```

**macOS/Linux:**
```bash
cd mcp-rag
npm install
pip install chromadb
```

### 2. Start ChromaDB Server

Open a terminal and keep it running:

```bash
chroma run --host localhost --port 8000
```

### 3. Add Your Documents

```bash
# Add a document to a collection
npm run cli add school regulations.pdf
npm run cli add research "my-paper.pdf"
npm run cli add work "employee-handbook.pdf"

# You can add multiple documents to the same collection
npm run cli add school "student-guide.pdf"
```

### 4. Configure Claude Desktop

**Windows:** Edit `%APPDATA%\Claude\claude_desktop_config.json`

**macOS:** Edit `~/Library/Application Support/Claude/claude_desktop_config.json`

Add this configuration:

```json
{
  "mcpServers": {
    "mcp-rag": {
      "command": "node",
      "args": [
        "C:\\Users\\sshin\\Documents\\mcp-rag\\src\\index.js"
      ]
    }
  }
}
```

**Important:** Update the path to match your actual installation directory!

### 5. Restart Claude Desktop

1. Completely quit Claude Desktop
2. Verify ChromaDB is running
3. Start Claude Desktop
4. Check the hamburger menu for MCP server connection

### 6. Start Asking Questions!

In Claude Desktop:

```
"Search in the school collection for attendance policy"
```

```
"What does my research collection say about methodology?"
```

```
"Find information about vacation days in the work collection"
```

Claude will automatically use the MCP-RAG tools to search your documents!

## CLI Commands

### Add Documents

```bash
# Add document to collection
npm run cli add <collection> <file>

# With description
npm run cli add school regulations.pdf -d "School regulations 2024"
```

### List Collections

```bash
npm run cli list
```

Output:
```
📚 Collections (3):

   📁 school
      Chunks: 127
      Description: School regulations 2024

   📁 research
      Chunks: 89

   📁 work
      Chunks: 234
```

### Collection Info

```bash
npm run cli info <collection>
```

Example:
```bash
npm run cli info school
```

Output:
```
📊 Collection: school

   Total chunks: 127
   Documents: 2

   📄 Files:
      - regulations.pdf
      - student-guide.pdf
```

### Search (Test)

```bash
npm run cli search <collection> "<query>"
```

Example:
```bash
npm run cli search school "attendance policy"
```

### Delete Collection

```bash
npm run cli delete <collection>
```

## Usage Patterns

### Pattern 1: Search Specific Collection

In Claude Desktop:
```
"Search the school collection for graduation requirements"
```

Claude will use `search_documents` with `collection: "school"`

### Pattern 2: Search All Collections

```
"Search all my documents for the term 'deadline'"
```

Claude will search across all collections and return the most relevant results.

### Pattern 3: List What's Available

```
"What collections do I have?"
```

Claude will use `list_collections` to show all available document collections.

### Pattern 4: Collection Details

```
"Show me what's in the research collection"
```

Claude will use `get_collection_info` to show details.

## How It Works

### Indexing Flow

```
PDF/TXT File
    ↓
Text Extraction
    ↓
Split into 500-token chunks (50-token overlap)
    ↓
Generate embeddings (ChromaDB)
    ↓
Store in collection
```

### Search Flow

```
User Question in Claude Desktop
    ↓
MCP-RAG receives search request
    ↓
ChromaDB vector similarity search
    ↓
Top 5 most relevant chunks
    ↓
Return to Claude with source attribution
    ↓
Claude answers using ONLY the retrieved content
```

## Architecture

```
Claude Desktop
    ↕ MCP Protocol (stdio)
MCP-RAG Server (Node.js)
    ↕ HTTP (localhost:8000)
ChromaDB Server (Python)
    ↕ Local Storage
Vector Database (chroma_db/)
```

Everything runs locally on your computer!

## Advanced Usage

### Environment Variables

```bash
# Custom ChromaDB URL
export CHROMA_URL=http://localhost:9000

# Then start the server
npm start
```

### Chunk Size Optimization

Edit `src/indexer.js`:

```javascript
const CHUNK_SIZE = 500;      // Increase for more context
const CHUNK_OVERLAP = 50;    // Increase for better continuity
```

Re-index documents after changing:
```bash
npm run cli add collection document.pdf
```

### Multiple Document Formats

Supported formats:
- `.pdf` - PDF documents
- `.txt` - Plain text
- `.md` - Markdown files

## Project Structure

```
mcp-rag/
├── src/
│   ├── index.js       # MCP server
│   ├── cli.js         # CLI tool
│   └── indexer.js     # Document indexing
├── chroma_db/         # ChromaDB storage (auto-created)
├── package.json
├── install.bat        # Windows installer
└── README.md
```

## Troubleshooting

### ChromaDB Connection Error

**Problem:**
```
❌ ChromaDB connection failed
```

**Solution:**
```bash
# Start ChromaDB server in a separate terminal
chroma run --host localhost --port 8000
```

### No Results Found

**Problem:** Search returns no results

**Solutions:**
1. Check if documents are indexed:
   ```bash
   npm run cli list
   npm run cli info <collection>
   ```

2. Try broader search terms

3. Re-index with different chunk size (see Advanced Usage)

### MCP Server Not Showing in Claude Desktop

**Solutions:**

1. Check `claude_desktop_config.json` syntax (valid JSON)
2. Verify file path is correct and uses double backslashes (Windows)
3. Completely quit Claude Desktop (check system tray)
4. Ensure ChromaDB is running
5. Restart Claude Desktop

### "Collection Not Found" Error

**Problem:**
```
❌ Error: Collection not found
```

**Solution:**
```bash
# Create collection by adding a document
npm run cli add <collection> <file>
```

## Comparison with NotebookLM

| Feature | NotebookLM | MCP-RAG |
|---------|-----------|---------|
| **Platform** | Google Cloud | Local |
| **AI Model** | Gemini | Claude |
| **Data Privacy** | Cloud storage | 100% local |
| **Multi-Collection** | No | Yes |
| **CLI Management** | No | Yes |
| **Cost** | Free (limited) | Free (unlimited) |
| **Integration** | Web only | Claude Desktop |

## Why MCP-RAG?

1. **Privacy**: All data stays local - no cloud upload
2. **Flexibility**: Multiple collections for different topics
3. **Claude Integration**: Best-in-class AI with your documents
4. **Developer-Friendly**: CLI tools, extensible architecture
5. **Free & Open**: No API costs, run unlimited queries

## Use Cases

### 📚 Students
- Index course materials, textbooks
- Ask questions about study materials
- Organize notes by subject

### 🏢 Professionals
- Company handbooks and policies
- Project documentation
- Meeting notes and reports

### 🔬 Researchers
- Academic papers
- Research notes
- Literature reviews

### ⚖️ Legal/Compliance
- Regulations and laws
- Contract templates
- Compliance documents

## Roadmap

- [ ] Support for DOCX files
- [ ] Web interface
- [ ] Multiple embedding models
- [ ] Export conversations
- [ ] Batch document import
- [ ] Cross-collection search optimization

## Contributing

Contributions welcome! This is a universal tool that can benefit many users.

## License

MIT

## Credits

Built with:
- [Model Context Protocol](https://github.com/anthropics/anthropic-sdk-typescript) - Anthropic
- [ChromaDB](https://www.trychroma.com/) - Vector database
- [pdf-parse](https://www.npmjs.com/package/pdf-parse) - PDF text extraction

---

**MCP-RAG** - Your documents, Claude's intelligence, zero hallucination.
