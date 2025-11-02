# Quick Start Guide - MCP-RAG

Get started in 5 minutes!

## Prerequisites

- Node.js 18+ installed
- Python 3.8+ installed

## Installation Steps

### 1️⃣ Install (1 minute)

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

---

### 2️⃣ Start ChromaDB (30 seconds)

Open a **new terminal** and run:

```bash
chroma run --host localhost --port 8000
```

**Keep this terminal open!** ChromaDB must stay running.

---

### 3️⃣ Add Your First Document (1 minute)

```bash
# Example: Add school regulations
npm run cli add school regulations.pdf

# Example: Add research paper
npm run cli add research "my-paper.pdf"

# Example: Add work manual
npm run cli add work handbook.pdf
```

You should see:
```
✅ Success!
   Collection: school
   File: regulations.pdf
   Pages: 45
   Chunks: 127
```

---

### 4️⃣ Configure Claude Desktop (2 minutes)

#### Windows

1. Open: `%APPDATA%\Claude\claude_desktop_config.json`
2. Add:

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

**⚠️ Update the path to match your installation location!**

#### macOS

1. Open: `~/Library/Application Support/Claude/claude_desktop_config.json`
2. Add:

```json
{
  "mcpServers": {
    "mcp-rag": {
      "command": "node",
      "args": [
        "/Users/yourusername/mcp-rag/src/index.js"
      ]
    }
  }
}
```

---

### 5️⃣ Start Using! (30 seconds)

1. **Quit Claude Desktop completely**
2. **Verify ChromaDB is running** (terminal from step 2)
3. **Restart Claude Desktop**
4. **Ask questions!**

Example questions in Claude Desktop:

```
"Search in the school collection for attendance policy"
```

```
"What does my research collection say about methodology?"
```

```
"List all my collections"
```

---

## Quick Commands Reference

```bash
# Add document
npm run cli add <collection> <file>

# List collections
npm run cli list

# Get collection info
npm run cli info <collection>

# Search (test)
npm run cli search <collection> "query"

# Delete collection
npm run cli delete <collection>
```

---

## Checklist

Before using, verify:

- [ ] ChromaDB running (`http://localhost:8000`)
- [ ] At least one document indexed (`npm run cli list`)
- [ ] Claude Desktop config updated
- [ ] Claude Desktop restarted

---

## Common Issues

### ChromaDB not connecting

```bash
# Make sure it's running
chroma run --host localhost --port 8000
```

### MCP server not showing in Claude

1. Check JSON syntax in config file
2. Verify file path (double backslashes on Windows)
3. Completely quit Claude Desktop
4. Restart

### No search results

```bash
# Verify documents are indexed
npm run cli list
npm run cli info school
```

---

## Next Steps

- Read full [README.md](README.md) for advanced features
- Add more documents to your collections
- Try searching across multiple collections
- Organize documents by topic

---

**You're ready!** Start asking Claude questions about your documents! 🎉
