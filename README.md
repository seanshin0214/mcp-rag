# MCP-RAG

**Your Personal NotebookLM for Claude Desktop**

Universal RAG (Retrieval-Augmented Generation) MCP server for Claude Desktop. Index documents via CLI, search them in Claude Desktop with 0% hallucination.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org/)
[![Python Version](https://img.shields.io/badge/python-%3E%3D3.8-blue)](https://python.org/)

---

## What is MCP-RAG?

Think of it as **NotebookLM for Claude Desktop**:

- 📚 **Index any documents**: PDF, Word, PowerPoint, Excel, 한글, TXT, MD
- 🔍 **Natural language search**: Ask questions in Claude Desktop
- ✅ **0% Hallucination**: Answers based ONLY on your documents
- 💻 **100% Local**: All data stays on your computer (ChromaDB)
- 🎯 **Simple workflow**: CLI for indexing → Claude Desktop for searching

---

## Architecture

```
┌─────────────────────┐
│  Your Documents     │
│  (PDF, DOCX, etc)   │
└──────────┬──────────┘
           │
           ▼
    [CLI: npm run cli add]
           │
           ▼
┌─────────────────────┐
│   ChromaDB Server   │ ◄─── Vector embeddings
│   (localhost:8000)  │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│   MCP-RAG Server    │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  Claude Desktop     │ ◄─── You ask questions here!
└─────────────────────┘
```

**Two-Part System:**
1. **CLI** = Document management (add, delete, list)
2. **Claude Desktop** = Search and Q&A

---

## Quick Start

### 1. Install

```bash
git clone https://github.com/seanshin0214/mcp-rag.git
cd mcp-rag
npm install
pip install chromadb
```

### 2. Start ChromaDB Server

**Keep this running in a separate terminal:**

```bash
chroma run --host localhost --port 8000
```

### 3. Add Documents (CLI)

```bash
# Add single document
npm run cli add school "path/to/regulations.pdf"

# Add multiple documents
npm run cli add research "paper1.pdf"
npm run cli add research "paper2.docx"
npm run cli add work "handbook.pptx"
```

**Supported formats:**
- Documents: PDF, DOCX, HWP, TXT, MD
- Presentations: PPTX
- Spreadsheets: XLSX, XLS

### 4. Configure Claude Desktop

**Windows:** `%APPDATA%\Claude\claude_desktop_config.json`

**macOS:** `~/Library/Application Support/Claude/claude_desktop_config.json`

**✨ Option 1: Auto-start ChromaDB (Recommended)**

```json
{
  "mcpServers": {
    "mcp-rag": {
      "command": "node",
      "args": ["/absolute/path/to/mcp-rag/start-with-chroma.js"]
    }
  }
}
```

This automatically starts ChromaDB before starting MCP-RAG!

**Option 2: Manual ChromaDB start**

```json
{
  "mcpServers": {
    "mcp-rag": {
      "command": "node",
      "args": ["/absolute/path/to/mcp-rag/src/index.js"]
    }
  }
}
```

You need to manually run `chroma run --host localhost --port 8000` before starting.

**Important:** Use your actual installation path!

### 5. Restart Claude Desktop

### 6. Ask Questions!

In Claude Desktop:

```
"What does the school collection say about attendance?"
```

```
"Search the research collection for methodology"
```

```
"Show me all my collections"
```

---

## CLI Commands

```bash
# Add document
npm run cli add <collection> <file> [-d "description"]

# List all collections
npm run cli list

# Get collection info
npm run cli info <collection>

# Search test
npm run cli search <collection> "query"

# Delete collection
npm run cli delete <collection>
```

### Examples

```bash
# Add with description
npm run cli add school "regulations.pdf" -d "School regulations 2024"

# Add multiple files (PowerShell)
Get-ChildItem "*.docx" | ForEach-Object {
    npm run cli add MyCollection $_.FullName
}

# Check what's indexed
npm run cli list
npm run cli info school
```

---

## MCP Tools (Claude Desktop)

When you ask questions in Claude Desktop, these tools are automatically used:

| Tool | Description |
|------|-------------|
| `search_documents` | Search in specific collection or all collections |
| `list_collections` | List all available collections |
| `get_collection_info` | Get details about a collection |

**Note:** Document addition is CLI-only, not available in Claude Desktop.

---

## How It Works

### Indexing (CLI)

```
1. Read file (PDF/DOCX/PPTX/etc)
2. Extract text
3. Split into 500-token chunks (50-token overlap)
4. Generate embeddings (ChromaDB)
5. Store in collection
```

### Searching (Claude Desktop)

```
1. You ask: "What's the attendance policy?"
2. MCP-RAG searches ChromaDB
3. Returns top 5 most relevant chunks
4. Claude answers using ONLY those chunks
```

---

## Use Cases

### 📚 Students
```bash
npm run cli add math "calculus-textbook.pdf"
npm run cli add physics "lecture-notes.docx"
```
→ "Explain the concept of derivatives from my math collection"

### 🏢 Professionals
```bash
npm run cli add company "employee-handbook.pdf"
npm run cli add project "requirements.docx"
```
→ "What's our vacation policy?"

### 🔬 Researchers
```bash
npm run cli add literature "papers/*.pdf"
npm run cli add notes "research-notes.md"
```
→ "Summarize the methodology from the literature collection"

---

## Features

- ✅ **Multi-collection support** - Organize by topic
- ✅ **Semantic search** - ChromaDB vector embeddings
- ✅ **Source attribution** - See which document/chunk
- ✅ **Relevance scoring** - Know how confident the match is
- ✅ **Multiple file formats** - PDF, DOCX, PPTX, XLSX, HWP, TXT, MD
- ✅ **100% local** - No cloud, all on your machine
- ✅ **0% hallucination** - Only document-based answers

---

## Comparison

| Feature | NotebookLM | MCP-RAG |
|---------|-----------|---------|
| Platform | Google Cloud | Local |
| AI Model | Gemini | Claude |
| Privacy | Cloud | 100% Local |
| Multi-collection | ❌ | ✅ |
| CLI | ❌ | ✅ |
| Cost | Free (limited) | Free (unlimited) |

---

## Troubleshooting

### ChromaDB Connection Error

**Problem:** `Cannot connect to ChromaDB`

**Solution:**
```bash
chroma run --host localhost --port 8000
```

Keep this terminal open!

### Claude Desktop: MCP Server Not Showing

1. Check `claude_desktop_config.json` syntax
2. Use absolute path (not relative)
3. Restart Claude Desktop completely
4. Check ChromaDB is running

### No Search Results

```bash
# Verify documents are indexed
npm run cli list
npm run cli info <collection>

# Re-index if needed
npm run cli add <collection> <file>
```

---

## Advanced

### Batch Add Files

**PowerShell:**
```powershell
Get-ChildItem "C:\docs\*.pdf" | ForEach-Object {
    npm run cli add MyCollection $_.FullName
}
```

**Bash:**
```bash
for f in /path/to/docs/*.pdf; do
    npm run cli add MyCollection "$f"
done
```

### Custom Chunk Size

Edit `src/indexer.js`:
```javascript
const CHUNK_SIZE = 500;      // Tokens per chunk
const CHUNK_OVERLAP = 50;    // Overlap between chunks
```

Larger chunks = more context, fewer chunks
Smaller chunks = more precise, more chunks

---

## Project Structure

```
mcp-rag/
├── src/
│   ├── index.js       # MCP server
│   ├── cli.js         # CLI tool
│   └── indexer.js     # Document processing
├── chroma/            # ChromaDB data (auto-created)
├── package.json
├── README.md
├── QUICK_START.md
└── HOW_TO_USE.md
```

---

## Requirements

- **Node.js** 18+
- **Python** 3.8+ (for ChromaDB)
- **Claude Desktop** (latest version)

---

## Contributing

Contributions welcome! This is a universal tool that can benefit many users.

---

## License

MIT License - see [LICENSE](LICENSE)

---

## Credits

Built with:
- [Model Context Protocol (MCP)](https://modelcontextprotocol.io/) - Anthropic
- [ChromaDB](https://www.trychroma.com/) - Vector database
- [pdf-parse](https://www.npmjs.com/package/pdf-parse) - PDF extraction
- [mammoth](https://www.npmjs.com/package/mammoth) - DOCX extraction
- [officeparser](https://www.npmjs.com/package/officeparser) - PPTX extraction
- [xlsx](https://www.npmjs.com/package/xlsx) - Excel extraction
- [node-hwp](https://www.npmjs.com/package/node-hwp) - 한글 extraction

---

**MCP-RAG** - Your documents, Claude's intelligence, zero hallucination.

