import { useState } from 'react';
import { FileUpload, UploadedFile } from '@/components/FileUpload';
import { ChatInterface } from '@/components/ChatInterface';

const Index = () => {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);

  const handleFileUploaded = (file: UploadedFile) => {
    setUploadedFiles(prev => [...prev, file]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10 shadow-sm">
        <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <div>
            <h1 className="text-lg sm:text-xl md:text-2xl font-bold">ShardulAI</h1>
            <p className="text-xs sm:text-sm text-muted-foreground hidden sm:block">
              Upload documents and ask questions powered by AI
            </p>
          </div>
        </div>
      </header>

      <main className="w-full max-w-4xl mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6">
        <div className="w-full space-y-6">
          <div className="flex flex-col min-h-[350px] sm:min-h-[400px] w-full">
            <FileUpload
              onFileUploaded={handleFileUploaded}
              uploadedFiles={uploadedFiles}
            />
          </div>

          <div className="flex flex-col min-h-[400px] sm:min-h-[500px] w-full">
            <ChatInterface hasUploadedFiles={uploadedFiles.length > 0} />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
