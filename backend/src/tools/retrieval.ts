import { createTool } from '@voltagent/core';
import { z } from 'zod';
import { getIndex } from '../services/pinecone';
import { createEmbedding } from '../services/embedding';

// Create retrieval tool with userId and optional documentId for filtering
export const getRetrievalTool = (userId?: string, documentId?: string) => {
  return createTool({
    name: 'search_documents',
    description: documentId 
      ? 'Search through the specific uploaded document to find relevant information. Use this tool whenever the user asks a question about this document.'
      : 'Search through uploaded documents to find relevant information. Use this tool whenever the user asks a question about their documents.',
    
    parameters: z.object({
      query: z.string().describe('The search query or question to look up in the documents')
    }),
    
    execute: async ({ query }) => {
    try {
      console.log(`Searching for: "${query}"`);
      if (documentId) {
        console.log(`Filtering by documentId: ${documentId}`);
      }
      
      // 1. Convert query to embedding
      const queryEmbedding = await createEmbedding(query);
      
      // 2. Search Pinecone for similar vectors (filtered by userId and optional documentId)
      const index = getIndex();
      const queryOptions: any = {
        vector: queryEmbedding,
        topK: 10, // Increased from 5 to get more context
        includeMetadata: true
      };
      
      // Build filter based on provided parameters
      const filter: any = {};
      if (userId) {
        filter.userId = { $eq: userId };
      }
      if (documentId) {
        filter.documentId = { $eq: documentId };
      }
      
      // Apply filter if any conditions exist
      if (Object.keys(filter).length > 0) {
        queryOptions.filter = filter;
      }
      
      const searchResults = await index.query(queryOptions);
      
      console.log(`Found ${searchResults.matches.length} matches`);
      
      // Log similarity scores for debugging
      searchResults.matches.forEach((match, i) => {
        console.log(`Match ${i + 1} score: ${match.score?.toFixed(3)} - ${match.metadata?.fileName}`);
      });
      
      // 3. Filter results by relevance score (only keep good matches)
      const relevantResults = searchResults.matches.filter(
        match => match.score && match.score > 0.05  // Lowered threshold to include more context
      );
      
      console.log(`Relevant results after filtering: ${relevantResults.length}`);
      
      // 4. If no relevant results found
      if (relevantResults.length === 0) {
        return {
          found: false,
          message: documentId 
            ? 'No relevant information found in this document.'
            : 'No relevant information found in the uploaded documents.'
        };
      }
      
      // 5. Format results for the AI
      const formattedResults = relevantResults.map(match => ({
        text: match.metadata?.text || '',
        fileName: match.metadata?.fileName || 'unknown',
        pageNumber: match.metadata?.pageNumber || 0,
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