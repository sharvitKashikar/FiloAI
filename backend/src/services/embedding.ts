import OpenAI from 'openai';

// Lazy-initialized OpenAI client
let openaiInstance: OpenAI | null = null;

// Get or create OpenAI client instance
const getOpenAIClient = (): OpenAI => {
  if (!openaiInstance) {
    openaiInstance = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
  }
  return openaiInstance;
};

// Function to create embedding for a single text
export async function createEmbedding(text: string): Promise<number[]> {
  try {
    const openai = getOpenAIClient();
    const response = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: text,
      dimensions: 1024 // Match Pinecone index dimension
    });
    
    return response.data[0]!.embedding;
  } catch (error) {
    console.error('Error creating embedding:', error);
    throw error;
  }
}

// Function to create embeddings for multiple texts (batch processing)
export async function createEmbeddings(texts: string[]): Promise<number[][]> {
  try {
    const openai = getOpenAIClient();
    const allEmbeddings: number[][] = [];
    const batchSize = 100; // OpenAI's limit per request
    
    // Process in batches of 100
    for (let i = 0; i < texts.length; i += batchSize) {
      const batch = texts.slice(i, i + batchSize);
      
      console.log(`Creating embeddings for batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(texts.length / batchSize)}`);
      
      const response = await openai.embeddings.create({
        model: "text-embedding-3-small",
        input: batch,
        dimensions: 1024 // Match Pinecone index dimension
      });
      
      // Extract embeddings from response
      const batchEmbeddings = response.data.map(item => item.embedding);
      allEmbeddings.push(...batchEmbeddings);
    }
    
    console.log(`Created ${allEmbeddings.length} embeddings`);
    return allEmbeddings;
    
  } catch (error) {
    console.error('Error creating embeddings:', error);
    throw error;
  }
}