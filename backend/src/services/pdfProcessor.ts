import pdf2pic from 'pdf2pic';
import { Mistral } from '@mistralai/mistralai';
import fs from 'fs/promises';

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

export async function processPDFWithOCR(filePath: string): Promise<PDFProcessingResult[]> {
  try {
    const convert = pdf2pic.fromPath(filePath, {
      density: 300,
      saveFilename: "untitled",
      savePath: "./temp",
      format: "png",
      width: 2048,
      height: 2048
    });

    const results: PDFProcessingResult[] = [];
    const mistral = getMistralClient();

    const pages = await convert.bulk(-1);
    
    for (let i = 0; i < pages.length; i++) {
      const page = pages[i];
      if (!page || !page.path) continue;

      try {
        const imageBuffer = await fs.readFile(page.path);
        const base64Image = imageBuffer.toString('base64');

        const response = await mistral.chat.complete({
          model: "pixtral-12b-2409",
          messages: [
            {
              role: "user",
              content: [
                {
                  type: "text",
                  text: "Extract all text from this image. Return only the text content, no additional formatting or descriptions."
                },
                {
                  type: "image_url",
                  imageUrl: `data:image/png;base64,${base64Image}`
                }
              ]
            }
          ]
        });

        const messageContent = response.choices?.[0]?.message?.content;
        const extractedText = typeof messageContent === 'string' ? messageContent : '';

        results.push({
          text: extractedText,
          pageNumber: i + 1,
          imageBuffer
        });

        await fs.unlink(page.path);
        console.log(`Processed page ${i + 1} with OCR`);

      } catch (pageError) {
        console.error(`Error processing page ${i + 1}:`, pageError);
        results.push({
          text: '',
          pageNumber: i + 1
        });
      }
    }

    return results;

  } catch (error) {
    console.error('Error processing PDF with OCR:', error);
    throw error;
  }
}

export async function extractTextFromPDF(filePath: string): Promise<string> {
  const results = await processPDFWithOCR(filePath);
  return results.map(result => result.text).join('\n\n');
}