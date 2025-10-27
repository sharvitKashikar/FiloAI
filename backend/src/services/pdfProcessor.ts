import { Mistral } from '@mistralai/mistralai';
import fs from 'fs/promises';
import pdfParse from '@cedrugs/pdf-parse';

let mistralInstance: Mistral | null = null;

const getMistralClient = (): Mistral => {
  if (!mistralInstance) {
    mistralInstance = new Mistral({
      apiKey: process.env.MISTRAL_API_KEY!
    });
  }
  return mistralInstance;
};

interface PDFProcessingResult {
  text: string;
  pageNumber: number;
  imageBuffer?: Buffer;
}

// Extract text directly from PDF using pdf-parse
export async function extractTextFromPDF(filePath: string): Promise<string> {
  try {
    const dataBuffer = await fs.readFile(filePath);
    const data = await pdfParse(dataBuffer);
    
    // Return the extracted text
    const extractedText = data.text || '';
    console.log(`Extracted ${extractedText.length} characters of text from PDF`);
    
    // If we have very little text, the PDF might be image-based
    if (extractedText.trim().length < 50) {
      console.log('PDF appears to be image-based or has minimal text.');
      console.log('Note: For OCR of image-based PDFs, you may need additional processing.');
      
      // Return whatever text we found
      return extractedText || 'No text could be extracted from this PDF. It may be an image-based or scanned document.';
    }
    
    return extractedText;
  } catch (error) {
    console.error('Error extracting text from PDF:', error);
    throw new Error('Failed to extract text from PDF. The file may be corrupted or in an unsupported format.');
  }
}

// OCR-based extraction using Mistral (for image-heavy PDFs)
// Note: This is a simplified version that uses pdf-parse
export async function processPDFWithOCR(filePath: string): Promise<PDFProcessingResult[]> {
  try {
    // For now, we'll use pdf-parse and return a single result
    // A full OCR implementation would require additional libraries
    const text = await extractTextFromPDF(filePath);
    
    return [{
      text: text,
      pageNumber: 1,
    }];
  } catch (error) {
    console.error('Error processing PDF with OCR:', error);
    throw error;
  }
}
