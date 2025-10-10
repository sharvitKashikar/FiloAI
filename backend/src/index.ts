import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import uploadRoutes from './routes/upload';
import chatRoutes from './routes/chat';
import authRoutes from './routes/auth';
import { initializePinecone } from './services/pinecone';

// Load environment variables
dotenv.config();

// TEST: Log to see if keys are loaded
console.log('Environment check:');
console.log('PINECONE_API_KEY:', process.env.PINECONE_API_KEY ? '✓ Set' : '✗ Missing');
console.log('OPENAI_API_KEY:', process.env.OPENAI_API_KEY ? '✓ Set' : '✗ Missing');
console.log('JWT_SECRET:', process.env.JWT_SECRET ? '✓ Set' : '✗ Missing');
console.log('DATABASE_URL:', process.env.DATABASE_URL ? '✓ Set' : '✗ Missing');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: [
    'https://filoai.vercel.app',
    'http://localhost:5173',
    'http://localhost:3000'
  ],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api', uploadRoutes);
app.use('/api', chatRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'FiloAI API is running!',
    version: '1.0.0',
    endpoints: {
      auth: {
        signup: 'POST /api/auth/signup',
        login: 'POST /api/auth/login',
        me: 'GET /api/auth/me (protected)',
        logout: 'POST /api/auth/logout (protected)',
      },
      documents: {
        upload: 'POST /api/upload (protected)',
      },
      chat: {
        sendMessage: 'POST /api/chat (protected)',
        getChats: 'GET /api/chats (protected)',
        getChatMessages: 'GET /api/chats/:chatId (protected)',
        deleteChat: 'DELETE /api/chats/:chatId (protected)',
      },
      system: {
        health: 'GET /api/health',
      }
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
      console.log(`\nFiloAI Server running on http://localhost:${PORT}\n`);
      console.log(`   Auth:   POST http://localhost:${PORT}/api/auth/signup`);
      console.log(`   Auth:   POST http://localhost:${PORT}/api/auth/login`);
      console.log(`   Upload: POST http://localhost:${PORT}/api/upload (🔒 protected)`);
      console.log(`   Chat:   POST http://localhost:${PORT}/api/chat (🔒 protected)`);
      console.log(`   Health: GET  http://localhost:${PORT}/api/health\n`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();