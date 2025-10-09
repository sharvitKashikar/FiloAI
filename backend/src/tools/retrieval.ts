import { createTool } from '@voltagent/core';
import { z } from 'zod';
import { getIndex } from '../services/pinecone';
import { createEmbedding } from '../services/embedding';

// Lazy-initialized retrieval tool
let toolInstance: any = null;

export const getRetrievalTool = () => {
  if (!toolInstance) {
    toolInstance = createTool({
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
      
      // 2. Search Pinecone for similar vectors
      const index = getIndex();
      const searchResults = await index.query({
        vector: queryEmbedding,
        topK: 5,
        includeMetadata: true
      });
      
      console.log(`Found ${searchResults.matches.length} matches`);
      
      // Log similarity scores for debugging
      searchResults.matches.forEach((match, i) => {
        console.log(`Match ${i + 1} score: ${match.score?.toFixed(3)}`);
      });
      
      // 3. Filter results by relevance score (only keep good matches)
      const relevantResults = searchResults.matches.filter(
        match => match.score && match.score > 0.5  // Lowered threshold for testing
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
  }
  
  return toolInstance;
};

// Legacy export for backward compatibility (just the getter, not called yet)
export const retrievalTool = getRetrievalTool;