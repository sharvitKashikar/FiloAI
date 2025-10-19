import { Router } from 'express';
import multer from 'multer';
import fs from 'fs/promises';
import path from 'path';
import { chunkText } from '../services/chunking';
import { createEmbeddings } from '../services/embedding';
import { getIndex } from '../services/pinecone';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { prisma } from '../lib/prisma';
import { extractTextFromPDF } from '../services/pdfProcessor';

const router = Router();

// Configure multer for file uploads
const upload = multer({
  dest: 'uploads/',
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['text/plain', 'text/markdown', 'application/pdf'];
    const allowedExtensions = ['.txt', '.md', '.pdf'];
    const ext = path.extname(file.originalname).toLowerCase();
    
    if (allowedTypes.includes(file.mimetype) || allowedExtensions.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Only .txt, .md, and .pdf files are allowed'));
    }
  }
});

// POST /upload - Handle file uploads (PROTECTED)
router.post('/upload', authenticateToken, upload.single('file'), async (req: AuthRequest, res) => {
  console.log('Upload request has been received');

  try {
    // 1. Check if file exists
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // 2. Get userId from auth middleware
    const userId = req.userId!;
    const fileName = req.file.originalname;
    console.log(`Processing file: ${fileName} for user: ${userId}`);

    // 2. Read file content based on file type
    const fileExtension = path.extname(fileName).toLowerCase();
    let content: string;
    
    if (fileExtension === '.pdf') {
      console.log('Processing PDF with OCR...');
      content = await extractTextFromPDF(req.file.path);
      console.log(`Extracted text from PDF: ${content.length} characters`);
    } else {
      content = await fs.readFile(req.file.path, 'utf-8');
      console.log(`Total File size: ${content.length} characters`);
    }

    // 3. Chunk the text
    const chunks = chunkText(content, fileName);
    console.log(`Created ${chunks.length} chunks`);

    // 4. Create embeddings for all chunks
    console.log('Creating embeddings........');
    const texts = chunks.map(chunk => chunk.text);
    const embeddings = await createEmbeddings(texts);
    console.log(`Created ${embeddings.length} embeddings`);

    // 5. Prepare vectors for Pinecone (with userId)
    const vectors = chunks.map((chunk, index) => ({
      id: `${fileName.replace(/[^a-zA-Z0-9]/g, '_')}_chunk_${index}_${Date.now()}`,
      values: embeddings[index]!,
      metadata: {
        text: chunk.text,
        fileName: chunk.metadata.fileName,
        chunkIndex: chunk.metadata.chunkIndex,
        pageNumber: chunk.metadata.pageNumber,
        userId: userId  // Add userId to metadata for filtering
      }
    }));

    // 6. Upload to Pinecone
    console.log('Saving to Pinecone...');
    const index = getIndex();
    await index.upsert(vectors);
    console.log('Saved to Pinecone successfully');

    // 7. Save document metadata to database
    console.log('Saving to database...');
    const document = await prisma.document.create({
      data: {
        fileName: fileName,
        userId: userId,
        fileType: fileExtension
      }
    });
    console.log(`Document saved to database with ID: ${document.id}`);

    // 8. Clean up temporary file
    await fs.unlink(req.file.path);

    // 9. Return success response
    res.json({
      success: true,
      documentId: document.id,
      fileName,
      chunksProcessed: chunks.length,
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

// GET /health - Health check endpoint
router.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Upload service is running' });
});

export default router;