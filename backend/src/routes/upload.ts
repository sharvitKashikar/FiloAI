import { Router } from 'express';
import multer from 'multer';
import fs from 'fs/promises';
import { chunkText } from '../services/chunking';
import { createEmbeddings } from '../services/embedding';
import { getIndex } from '../services/pinecone';

const router = Router();

// Configure multer for file uploads
const upload = multer({
  dest: 'uploads/',
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// POST /upload - Handle file uploads
router.post('/upload', upload.single('file'), async (req, res) => {
  console.log('Upload request has been received');

  try {
    // 1. to see if file exists
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const fileName = req.file.originalname;
    console.log(`Processing file: ${fileName}`);

    // 2. Read file content
    const content = await fs.readFile(req.file.path, 'utf-8');
    console.log(`Total File size: ${content.length} characters`);

    // 3. Chunk the text
    const chunks = chunkText(content, fileName);
    console.log(`Created ${chunks.length} chunks`);

    // 4. Create embeddings for all chunks
    console.log('Creating embeddings........');
    const texts = chunks.map(chunk => chunk.text);
    const embeddings = await createEmbeddings(texts);
    console.log(`Created ${embeddings.length} embeddings`);

    // 5. Prepare vectors for Pinecone
    const vectors = chunks.map((chunk, index) => ({
      id: `${fileName.replace(/[^a-zA-Z0-9]/g, '_')}_chunk_${index}_${Date.now()}`,
      values: embeddings[index]!,
      metadata: {
        text: chunk.text,
        fileName: chunk.metadata.fileName,
        chunkIndex: chunk.metadata.chunkIndex,
        pageNumber: chunk.metadata.pageNumber
      }
    }));

    // 6. Upload to Pinecone
    console.log('Saving to Pinecone...');
    const index = getIndex();
    await index.upsert(vectors);
    console.log('Saved to Pinecone successfully');

    // 7. Clean up temporary file
    await fs.unlink(req.file.path);

    // 8. Return success response
    res.json({
      success: true,
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