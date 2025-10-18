import { Mistral } from '@mistralai/mistralai';
import fs from 'fs/promises';
import path from 'path';

// Use require for CommonJS modules
// eslint-disable-next-line @typescript-eslint/no-var-requires
const pdfParse = require('pdf-parse');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const mammoth = require('mammoth');

const mistral = new Mistral({
  apiKey: process.env.MISTRAL_API_KEY || '',
});

// Function to extract text from PDF using pdf-parse (works for text-based PDFs)
async function extractTextFromPDF(filePath: string): Promise<string> {
  const dataBuffer = await fs.readFile(filePath);
  const data = await pdfParse(dataBuffer);
  return data.text;
}

// Helper function to convert file to base64
async function fileToBase64(filePath: string): Promise<string> {
  const fileBuffer = await fs.readFile(filePath);
  return fileBuffer.toString('base64');
}

// Main function to extract text - tries text extraction first, falls back to OCR
export async function extractTextWithMistralOCR(filePath: string, mimeType?: string): Promise<string> {
  try {
    console.log(`Starting text extraction for: ${filePath}`);

    if (mimeType === 'application/pdf') {
      console.log('Attempting to extract text from PDF...');
      
      // First, try standard text extraction
      const extractedText = await extractTextFromPDF(filePath);
      
      // Check if we got meaningful text (more than just whitespace/junk)
      if (extractedText && extractedText.trim().length > 100) {
        console.log(`Successfully extracted ${extractedText.length} characters from PDF (text-based)`);
        return extractedText.trim();
      }
      
      // If text extraction failed or got minimal text, it's likely a scanned PDF
      console.log('PDF appears to be image-based or scanned. Using Mistral OCR...');
      
      // Convert PDF to base64 and send to Mistral for OCR
      const base64Data = await fileToBase64(filePath);
      
      // Use Mistral's vision model to extract text
      const response = await mistral.chat.complete({
        model: "pixtral-large-latest",
        messages: [
          {
            role: "user",
            content: `Please analyze this PDF document and extract all visible text. Return only the extracted text without any commentary or formatting.`
          },
        ],
      });

      let ocrText = '';
      if (response.choices && response.choices.length > 0) {
        const content = response.choices[0]?.message?.content;
        if (typeof content === 'string') {
          ocrText = content;
        } else if (Array.isArray(content)) {
          ocrText = content.map((chunk: any) => chunk.text || '').join(' ');
        }
      }

      if (ocrText && ocrText.trim().length > 0) {
        console.log(`Successfully extracted ${ocrText.length} characters using Mistral OCR`);
        return ocrText.trim();
      }

      // If OCR also failed, return whatever text we got
      if (extractedText && extractedText.trim().length > 0) {
        console.log('OCR failed, returning basic extracted text');
        return extractedText.trim();
      }

      throw new Error('Could not extract any text from PDF');

    } else if (mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
               mimeType === 'application/msword') {
      // For DOCX files, use mammoth
      console.log('Extracting text from DOCX using mammoth...');
      const buffer = await fs.readFile(filePath);
      const result = await mammoth.extractRawText({ buffer });
      
      if (!result.value || result.value.trim().length === 0) {
        throw new Error('No text could be extracted from the document');
      }
      
      console.log(`Successfully extracted ${result.value.length} characters from DOCX`);
      return result.value;
      
    } else {
      throw new Error(`Unsupported file type: ${mimeType}`);
    }
    
  } catch (error: any) {
    console.error('Text extraction error:', error);
    throw new Error(`Failed to extract text: ${error.message}`);
  }
}