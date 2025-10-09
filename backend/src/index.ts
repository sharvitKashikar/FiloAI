import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import uploadRoutes from './routes/upload';
import chatRoutes from './routes/chat';
import { initializePinecone } from './services/pinecone';

// Load environment variables
dotenv.config();

// TEST: Log to see if keys are loaded
console.log('Environment check:');
console.log('PINECONE_API_KEY:', process.env.PINECONE_API_KEY ? '✓ Set' : '✗ Missing');
console.log('OPENAI_API_KEY:', process.env.OPENAI_API_KEY ? '✓ Set' : '✗ Missing');
console.log('OPENROUTER_API_KEY:', process.env.OPENROUTER_API_KEY ? '✓ Set' : '✗ Missing');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// Routes
app.use('/api', uploadRoutes);
app.use('/api', chatRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'ByteBell API is running!',
    endpoints: {
      upload: 'POST /api/upload',
      chat: 'POST /api/chat',
      health: 'GET /api/health'
    }
  });
});

// Initialize and start server
async function startServer() {
  try {
    console.log('Initializing ByteBell API...');
    
    // Initialize Pinecone
    await initializePinecone();
    
    // Start server
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
      console.log(`Upload: POST http://localhost:${PORT}/api/upload`);
      console.log(`Chat: POST http://localhost:${PORT}/api/chat`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();