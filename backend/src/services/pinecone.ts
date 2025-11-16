import { Pinecone } from '@pinecone-database/pinecone';

// Lazy-initialized Pinecone client
let pc: Pinecone | null = null;

// Get or create Pinecone client instance
const getPineconeClient = () => {
  if (!pc) {
    pc = new Pinecone({
      apiKey: process.env.PINECONE_API_KEY!
    });
  }
  return pc;
};

// Function to get the index
export const getIndex = () => {
  return getPineconeClient().index(process.env.PINECONE_INDEX_NAME!);
};

// Function to initialize Pinecone (create index if doesn't exist)
export const initializePinecone = async () => {
  const indexName = process.env.PINECONE_INDEX_NAME!;
  const client = getPineconeClient();
  
  try {
    // Check if index exists
    const existingIndexes = await client.listIndexes();
    const indexExists = existingIndexes.indexes?.some(
      (index) => index.name === indexName
    );

    if (!indexExists) {
      console.log('working on pinecone index');
      await client.createIndex({
        name: indexName,
        dimension: 1024, 
        metric: 'cosine',
        spec: {
          serverless: {
            cloud: 'aws',
            region: 'us-east-1'
          }
        }
      });
      console.log('Pinecone index created successfully!');
    } else {
      console.log(' Pinecone index already exists');
    }
  } catch (error) {
    console.error('Error initializing Pinecone!', error);
    throw error;
  }
};