import { Router } from 'express';
import multer from 'multer';
import fs from 'fs/promises';
import path from 'path';
import { chunkText } from '../services/chunking';
import { createEmbeddings } from '../services/embedding';
import { getIndex } from '../services/pinecone';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { prisma } from '../lib/prisma';
import { extractTextWithMistralOCR } from '../services/mistralOCR';

const router = Router();

// Simple multer configuration without fileFilter
const upload = multer({
  dest: 'uploads/',
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// Helper function to check if file type is allowed
function isFileTypeAllowed(filename: string): boolean {
  const allowedExtensions = ['.txt', '.pdf', '.docx', '.doc'];
  const ext = path.extname(filename).toLowerCase();
  return allowedExtensions.includes(ext);
}

// Helper function to extract text based on file type
async function extractTextFromFile(filePath: string, mimeType: string): Promise<string> {
  switch (mimeType) {
    case 'text/plain':
      console.log('Reading plain text file...');
      return await fs.readFile(filePath, 'utf-8');
    
    case 'application/pdf':
    case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
    case 'application/msword':
      console.log('Using extraction service for document...');
      return await extractTextWithMistralOCR(filePath, mimeType);
    
    default:
      throw new Error(`Unsupported file type: ${mimeType}`);
  }
}

// POST /upload - Handle file uploads (PROTECTED)
router.post('/upload', authenticateToken, upload.single('file'), async (req: AuthRequest, res) => {
  console.log('Upload request has been received');

  try {
    // 1. Check if file exists
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // 2. Check if file type is allowed (simple validation)
    if (!isFileTypeAllowed(req.file.originalname)) {
      await fs.unlink(req.file.path); // Clean up
      return res.status(400).json({ 
        error: 'Invalid file type. Only TXT, PDF, and DOCX files are allowed.' 
      });
    }

    // 3. Get userId from auth middleware
    const userId = req.userId!;
    const fileName = req.file.originalname;
    const fileType = req.file.mimetype;
    console.log(`Processing file: ${fileName} (${fileType}) for user: ${userId}`);

    // 4. Extract text based on file type
    console.log('Starting text extraction...');
    const content = await extractTextFromFile(req.file.path, fileType);
    console.log(`Extracted text: ${content.length} characters`);

    // Validate content is not empty
    if (!content || content.trim().length === 0) {
      await fs.unlink(req.file.path);
      return res.status(400).json({ error: 'File contains no extractable text' });
    }

    // 5. Chunk the text
    console.log('Chunking text...');
    const chunks = chunkText(content, fileName);
    console.log(`Created ${chunks.length} chunks`);

    // 6. Create embeddings for all chunks
    console.log('Creating embeddings...');
    const texts = chunks.map(chunk => chunk.text);
    const embeddings = await createEmbeddings(texts);
    console.log(`Created ${embeddings.length} embeddings`);

    // 7. Save document metadata to database first to get documentId
    console.log('Saving to database...');
    const document = await prisma.document.create({
      data: {
        fileName,
        userId,
        fileType: req.file.mimetype  // Use req.file.mimetype directly
      }
    });
    console.log(`Document saved to database with ID: ${document.id}`);

    // 8. Prepare vectors for Pinecone with documentId
    const vectors = chunks.map((chunk, index) => ({
      id: `${fileName.replace(/[^a-zA-Z0-9]/g, '_')}_chunk_${index}_${Date.now()}`,
      values: embeddings[index]!,
      metadata: {
        text: chunk.text,
        fileName: chunk.metadata.fileName,
        chunkIndex: chunk.metadata.chunkIndex,
        pageNumber: chunk.metadata.pageNumber,
        userId: userId,
        fileType: fileType,
        documentId: document.id  // Add documentId for filtering
      }
    }));

    // 9. Upload to Pinecone
    console.log('Saving to Pinecone...');
    const index = getIndex();
    await index.upsert(vectors);
    console.log('Saved to Pinecone successfully');

    // 10. Clean up temporary file
    await fs.unlink(req.file.path);

    // 11. Return success response
    res.json({
      success: true,
      documentId: document.id,
      fileName,
      fileType,
      chunksProcessed: chunks.length,
      extractedCharacters: content.length,
      message: 'File uploaded and indexed successfully!'
    });

  } catch (error: any) {
    console.error('Upload error:', error);

    // Clean up file if it exists
    if (req.file) {
      try {
        await fs.unlink(req.file.path);
      } catch (cleanupError) {
        // Ignore cleanup errors
      }
    }

    res.status(500).json({
      error: 'Failed to process file',
      details: error.message
    });
  }
});

// GET /documents - Get all documents for the authenticated user (PROTECTED)
router.get('/documents', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.userId!;

    const documents = await prisma.document.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        fileName: true,
        fileType: true,
        createdAt: true,
      }
    });

    res.json({
      success: true,
      documents,
      count: documents.length
    });

  } catch (error: any) {
    console.error('Get documents error:', error);
    res.status(500).json({
      error: 'Failed to retrieve documents',
      details: error.message
    });
  }
});

// GET /health - Health check endpoint
router.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Upload service is running' });
});

export default router;