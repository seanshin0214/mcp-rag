# Quick Start - MCP-RAG

Get started in 5 minutes!

## Step 1: Install (1 minute)

```bash
git clone https://github.com/seanshin0214/mcp-rag.git
cd mcp-rag
npm install
pip install chromadb
```

---

## Step 2: Start ChromaDB (30 seconds)

**Open a new terminal and keep it running:**

```bash
chroma run --host localhost --port 8000
```

✅ You should see:
```
Connect to Chroma at: http://localhost:8000
Listening on localhost:8000
```

⚠️ **Leave this terminal open!**

---

## Step 3: Add Your First Document (1 minute)

```bash
cd mcp-rag

# Add a document
npm run cli add school "path/to/document.pdf"
```

**Example:**
```bash
npm run cli add school "C:\Documents\regulations.pdf"
npm run cli add research "~/papers/study.docx"
```

✅ You should see:
```
✅ Success!
   Collection: school
   File: regulations.pdf
   Pages: 45
   Chunks: 127
```

---

## Step 4: Configure Claude Desktop (2 minutes)

### Windows

1. Open: `%APPDATA%\Claude\claude_desktop_config.json`
2. Add:

```json
{
  "mcpServers": {
    "mcp-rag": {
      "command": "node",
      "args": ["C:\\Users\\YourName\\mcp-rag\\src\\index.js"]
    }
  }
}
```

**⚠️ Change `C:\\Users\\YourName\\mcp-rag` to your actual path!**

### macOS/Linux

1. Open: `~/Library/Application Support/Claude/claude_desktop_config.json`
2. Add:

```json
{
  "mcpServers": {
    "mcp-rag": {
      "command": "node",
      "args": ["/Users/yourname/mcp-rag/src/index.js"]
    }
  }
}
```

---

## Step 5: Restart Claude Desktop (30 seconds)

1. **Quit Claude Desktop completely**
2. **Check ChromaDB is still running** (from Step 2)
3. **Start Claude Desktop again**

---

## Step 6: Test It! (30 seconds)

In Claude Desktop, ask:

```
"Show me my collections"
```

You should see:
```
📚 Available Collections (1):

📁 **school**
   - Chunks: 127
```

Then ask:
```
"What does the school collection say about [your topic]?"
```

---

## That's It! 🎉

You now have your personal NotebookLM!

---

## What's Next?

### Add More Documents

```bash
# Add multiple documents to same collection
npm run cli add school "student-guide.pdf"
npm run cli add school "syllabus.docx"

# Create different collections
npm run cli add research "paper1.pdf"
npm run cli add work "handbook.docx"
```

### Bulk Add (PowerShell)

```powershell
Get-ChildItem "C:\docs\*.pdf" | ForEach-Object {
    npm run cli add MyCollection $_.FullName
}
```

### Check Your Collections

```bash
npm run cli list           # List all
npm run cli info school    # Details
```

---

## Checklist Before Using

- [ ] ChromaDB server running (`http://localhost:8000`)
- [ ] At least one document added (`npm run cli list`)
- [ ] Claude Desktop config updated with correct path
- [ ] Claude Desktop restarted

---

## Common Issues

### "Cannot connect to ChromaDB"

```bash
# Start ChromaDB server
chroma run --host localhost --port 8000
```

### "MCP server not showing in Claude"

1. Check JSON syntax in config file
2. Use **absolute path** (not relative)
3. Restart Claude Desktop **completely**

### "No search results"

```bash
# Verify documents are indexed
npm run cli list
npm run cli info school
```

---

## Quick Commands Reference

```bash
# Document Management (CLI)
npm run cli add <collection> <file>    # Add document
npm run cli list                       # List collections
npm run cli info <collection>          # Collection details
npm run cli delete <collection>        # Delete collection

# In Claude Desktop (automatic)
"Show me my collections"               # List
"What's in the school collection?"     # Info
"Search school for [topic]"            # Search
```

---

## Supported File Formats

- **Documents**: PDF, DOCX, HWP, TXT, MD
- **Presentations**: PPTX
- **Spreadsheets**: XLSX, XLS

---

## Architecture

```
CLI → ChromaDB → MCP Server → Claude Desktop
 ↓                                ↓
Add docs                      Ask questions
```

**Remember:**
- **CLI** = Add/manage documents
- **Claude Desktop** = Search/ask questions

---

For detailed documentation, see [README.md](README.md) or [HOW_TO_USE.md](HOW_TO_USE.md).
