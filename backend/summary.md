#Summary 

### When You Upload a Document
1. File gets split into chunks with some overlap to know where the last chunk ends.
2. Each chunk goes through OpenAI's embedding model which turns the text into 1536 numbers. 
3. These vectors get stored in Pinecone along with some metadata:
   - File name
   - Estimated page number (3000 characters = 1 page)

### When You Ask a Question
1. Your prompt also gets turned into a vector
2. Pinecone finds the 5 most similar chunks from your documents
3. Only keeps chunks which are more than 0.5 similarity score
4. Sends those chunks + your prompt to gpt-4o-mini
5. AI reads the chunks and answers with proper citations for ex: `[Source: document.txt, Page 3]`
6. Everything gets saved to PostgreSQL so you can see your chat history and have a persistent chat. 

## The Summarization Challenge
When User asks for "summarize this document," what will happen is the system only grabs 5 relevant chunks. That's fine for specific questions but not good for summaries since you're missing most of the document.

### Idea 1
Working on detecting keywords like "summarize," "summary," or "summarization" and automatically increasing the chunk retrieval from 5 to maybe 20-35 chunks. 
It will help but may still not cover everything when a larger document is provided.

### Idea 2 

Building a dedicated `summarize_doc` tool that will do:
1. Match summary keywords in your message
2. VoltAgent calls this tool
3. Tool fetches ALL chunks for that specific document from Pinecone (uses fileName + userId + chunkIndex to get the right ones)
4. Sends everything to the AI model
5. Model generates a full summary

This may use way more tokens (costs more money) and could hit rate limits early on large documents. Still figuring out the best approach here.
