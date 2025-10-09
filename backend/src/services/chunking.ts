// Define the structure of a text chunk
export interface TextChunk {
    text: string;
    metadata: {
      fileName: string;
      chunkIndex: number;
      pageNumber: number;
    };
  }
  
  // Function to split text into chunks
  export function chunkText(
    text: string,
    fileName: string,
    chunkSize: number = 800,  // Reduced for better granularity
    overlap: number = 150
  ): TextChunk[] {
    const chunks: TextChunk[] = [];
    const CHARS_PER_PAGE = 3000;
    
    // Better paragraph splitting: try double newlines first, fall back to single newlines
    let paragraphs = text.split(/\n\n+/);
    
    // If we only got 1-2 paragraphs, the document uses single newlines
    if (paragraphs.length <= 2) {
      // Split by sentences or single newlines for better chunking
      paragraphs = text.split(/\n+/);
    }
    
    let currentChunk = '';
    let chunkIndex = 0;
    let currentPosition = 0;
    
    for (const paragraph of paragraphs) {
      const trimmedParagraph = paragraph.trim();
      if (!trimmedParagraph) continue; // Skip empty paragraphs
      
      const paragraphLength = trimmedParagraph.length;
      
      // If adding this paragraph exceeds chunk size and we have content
      if (currentChunk.length + paragraphLength > chunkSize && currentChunk.length > 0) {
        // Calculate page number based on character position
        const pageNumber = Math.floor(currentPosition / CHARS_PER_PAGE) + 1;
        
        // Save current chunk
        chunks.push({
          text: currentChunk.trim(),
          metadata: {
            fileName,
            chunkIndex,
            pageNumber
          }
        });
        
        // Create overlap: keep last portion of previous chunk
        const overlapLength = Math.min(overlap, currentChunk.length);
        const overlapText = currentChunk.slice(-overlapLength);
        
        // Start new chunk with overlap + new paragraph
        currentChunk = overlapText + '\n' + trimmedParagraph;
        chunkIndex++;
      } else {
        // Add paragraph to current chunk
        currentChunk += (currentChunk ? '\n' : '') + trimmedParagraph;
      }
      
      currentPosition += paragraphLength + 1;
    }
    
    // Save the last chunk
    if (currentChunk.trim()) {
      const pageNumber = Math.floor(currentPosition / CHARS_PER_PAGE) + 1;
      chunks.push({
        text: currentChunk.trim(),
        metadata: {
          fileName,
          chunkIndex,
          pageNumber
        }
      });
    }
    
    return chunks;
  }