import { createTool } from '@voltagent/core';
import { z } from 'zod';
import { getIndex } from '../services/pinecone';
import { createEmbedding } from '../services/embedding';
import { prisma } from '../lib/prisma';

// Helper function to get document IDs for a specific chat
async function getChatDocumentIds(chatId: string): Promise<string[]> {
  const chatDocuments = await prisma.chatDocument.findMany({
    where: { chatId },
    select: { documentId: true }
  });
  return chatDocuments.map(cd => cd.documentId);
}

// Create retrieval tool with userId and optional chatId for filtering
export const getRetrievalTool = (userId?: string, chatId?: string) => {
  return createTool({
    name: 'search_documents',
    description: 'Search through uploaded documents to find relevant information. Use this tool whenever the user asks a question about their documents.',
    
    parameters: z.object({
      query: z.string().describe('The search query or question to look up in the documents')
    }),
    
    execute: async ({ query }) => {
    try {
      console.log(`Searching for: "${query}"`);

      // 1. Convert query to embedding
      const queryEmbedding = await createEmbedding(query);

      // 2. Determine which documents to search
      let documentIds: string[] | null = null;

      if (chatId) {
        // Get chat-specific documents
        documentIds = await getChatDocumentIds(chatId);
        console.log(`Chat ${chatId} has ${documentIds.length} document(s)`);

        // If chat has no documents, fall back to all user documents
        if (documentIds.length === 0) {
          console.log('No chat-specific documents, falling back to all user documents');
          documentIds = null; // Will use userId filter only
        }
      }

      // 3. Search Pinecone for similar vectors
      const index = getIndex();
      const queryOptions: any = {
        vector: queryEmbedding,
        topK: 5,
        includeMetadata: true
      };

      // Build filter based on available context
      if (userId) {
        queryOptions.filter = { userId: { $eq: userId } };

        // If we have chat-specific documents, add documentId filter
        if (documentIds && documentIds.length > 0) {
          queryOptions.filter = {
            $and: [
              { userId: { $eq: userId } },
              { documentId: { $in: documentIds } }
            ]
          };
          console.log(`Searching only in ${documentIds.length} chat-specific document(s)`);
        } else {
          console.log('Searching all user documents');
        }
      }

      const searchResults = await index.query(queryOptions);
      
      // Log similarity scores for debugging
      searchResults.matches.forEach((match, i) => {
        console.log(`Match ${i + 1} score: ${match.score?.toFixed(3)}`);
      });
      
      // 3. Filter results by relevance score (only keep good matches)
      const relevantResults = searchResults.matches.filter(
        match => match.score && match.score > 0.1  // Lowered threshold for testing
      );
      
      console.log(`Relevant results after filtering: ${relevantResults.length}`);
      
      // 4. If no relevant results found
      if (relevantResults.length === 0) {
        return {
          found: false,
          message: 'No relevant information found in the uploaded documents.'
        };
      }
      
      // 5. Format results for the AI
      const formattedResults = relevantResults.map(match => ({
        text: match.metadata?.text || '',
        fileName: match.metadata?.fileName || 'unknown',
        pageNumber: match.metadata?.pageNumber || 0,
        chunkIndex: match.metadata?.chunkIndex || 0,
        fileType: (match.metadata?.fileName as string)?.endsWith('.pdf') ? 'PDF' : 'Text',
        relevanceScore: match.score
      }));
      
      return {
        found: true,
        results: formattedResults,
        count: formattedResults.length
      };
      
    } catch (error: any) {
      console.error('Retrieval error:', error);
      return {
        found: false,
        error: 'Failed to search documents',
        details: error.message
      };
    }
  }
  });
};