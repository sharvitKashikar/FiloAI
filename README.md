# FiloAI

A modern Document Q&A application powered by AI that allows users to upload documents and ask questions about their content.

## Features

- 📄 **Document Upload**: Support for PDF, TXT, DOC, DOCX files
- 🤖 **AI-Powered Q&A**: Ask questions and get intelligent answers from your documents
- 🎯 **Source Citations**: Every answer includes source references with page numbers
- 💬 **Chat Interface**: Beautiful, responsive chat UI built with React and shadcn/ui
- 🔍 **Semantic Search**: Uses vector embeddings for accurate information retrieval
- 📱 **Responsive Design**: Works seamlessly on mobile, tablet, and desktop

## Tech Stack

### Backend
- **Node.js** + **Express** + **TypeScript**
- **VoltAgent** - AI agent framework for intelligent responses
- **OpenAI API** - GPT-4o-mini for text generation, text-embedding-ada-002 for embeddings
- **Pinecone** - Vector database for semantic search
- **Multer** - File upload handling

### Frontend
- **React** + **TypeScript** + **Vite**
- **shadcn/ui** - Beautiful UI components
- **Tailwind CSS** - Styling
- **React Markdown** - Formatted AI responses
- **Axios** - API calls

## Architecture

```
┌─────────────┐
│   Frontend  │  (React + shadcn/ui)
└──────┬──────┘
       │
       ├─ Upload Document ──────────┐
       │                            │
       ├─ Ask Question ─────────┐   │
       │                        ▼   ▼
┌──────┴──────┐          ┌───────────────┐
│   Backend   │          │  Document     │
│  (Express)  │          │  Ingestion    │
└──────┬──────┘          │  Pipeline     │
       │                 └───────┬───────┘
       │                         │
       ├─ VoltAgent             │
       │  (AI Orchestration)    │
       │                         │
       ├─ OpenAI API            │
       │  (Embeddings & LLM)    │
       │                         │
       └─ Pinecone ◄────────────┘
          (Vector DB)
```

## How It Works

### 1. Document Ingestion
1. User uploads a document
2. Backend splits it into overlapping chunks (800 chars, 150 overlap)
3. Each chunk is converted to a vector embedding using OpenAI
4. Embeddings are stored in Pinecone with metadata (filename, page number)

### 2. Question Answering
1. User asks a question
2. Question is converted to a vector embedding
3. Semantic search finds the 5 most similar chunks (score > 0.5)
4. VoltAgent uses retrieved context to generate an answer with GPT-4o-mini
5. Response includes citations to source documents

## Setup

### Prerequisites
- Node.js 18+
- OpenAI API key
- Pinecone account and API key

### Environment Variables

**Backend** (`.env` in `backend/` folder):
```env
OPENAI_API_KEY=your_openai_api_key
PINECONE_API_KEY=your_pinecone_api_key
PINECONE_INDEX_NAME=your_pinecone_index_name
PORT=3000
```

**Frontend** (`.env` in `frontend/` folder):
```env
VITE_API_URL=http://localhost:3000/api
```

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/sharvitKashikar/FiloAI.git
cd FiloAI
```

2. **Install backend dependencies**
```bash
cd backend
npm install
```

3. **Install frontend dependencies**
```bash
cd ../frontend
npm install
```

4. **Create environment files** (see Environment Variables section above)

5. **Start the backend**
```bash
cd backend
npm start
```

6. **Start the frontend** (in a new terminal)
```bash
cd frontend
npm run dev
```

7. **Open your browser** to `http://localhost:5173`

## Usage

1. **Upload a Document**: Click or drag-and-drop a text file (PDF, TXT, DOC, DOCX)
2. **Wait for Processing**: The document will be chunked and indexed
3. **Ask Questions**: Type your question in the chat interface
4. **Get Answers**: Receive AI-generated answers with source citations

## Project Structure

```
FiloAI/
├── backend/
│   ├── src/
│   │   ├── agents/          # VoltAgent configuration
│   │   ├── routes/          # API endpoints
│   │   ├── services/        # Core services
│   │   │   ├── chunking.ts  # Text splitting logic
│   │   │   ├── embedding.ts # OpenAI embeddings
│   │   │   └── pinecone.ts  # Vector DB operations
│   │   ├── tools/           # Agent tools
│   │   │   └── retrieval.ts # Semantic search
│   │   └── index.ts         # Server entry point
│   ├── uploads/             # Temporary file storage
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── components/      # React components
    │   │   ├── FileUpload.tsx
    │   │   ├── ChatInterface.tsx
    │   │   └── ui/          # shadcn/ui components
    │   ├── pages/           # Page components
    │   └── main.tsx         # App entry point
    └── package.json
```

## API Endpoints

### `POST /api/upload`
Upload a document for processing
- **Body**: `multipart/form-data` with `file` field
- **Response**: Success message

### `POST /api/chat`
Ask a question about uploaded documents
- **Body**: `{ "message": "your question" }`
- **Response**: `{ "success": true, "response": "AI answer with citations" }`

## Configuration

### Adjust Chunk Size
Edit `backend/src/services/chunking.ts`:
```typescript
chunkSize: 800,  // Characters per chunk
overlap: 150     // Overlap between chunks
```

### Adjust Retrieval Settings
Edit `backend/src/tools/retrieval.ts`:
```typescript
topK: 5,              // Number of chunks to retrieve
match.score > 0.5    // Minimum similarity threshold
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License

## Author

Sharvit Kashikar

## Acknowledgments

- Built with [VoltAgent](https://voltagent.dev)
- UI components from [shadcn/ui](https://ui.shadcn.com)
- Powered by [OpenAI](https://openai.com) and [Pinecone](https://pinecone.io)

