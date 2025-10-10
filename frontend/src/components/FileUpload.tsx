import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, CheckCircle2, AlertCircle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { uploadAPI } from '@/lib/api';

export interface UploadedFile {
  name: string;
  size: number;
  uploadedAt: Date;
  status: 'success' | 'error';
}

interface FileUploadProps {
  onFileUploaded: (file: UploadedFile) => void;
  uploadedFiles: UploadedFile[];
}

export function FileUpload({ onFileUploaded, uploadedFiles }: FileUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const { toast } = useToast();

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;

    const file = acceptedFiles[0];
    setUploading(true);
    setProgress(0);

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      await uploadAPI.uploadFile(file);

      clearInterval(progressInterval);
      setProgress(100);

      const uploadedFile: UploadedFile = {
        name: file.name,
        size: file.size,
        uploadedAt: new Date(),
        status: 'success',
      };

      onFileUploaded(uploadedFile);

      toast({
        title: 'Upload successful',
        description: `${file.name} has been uploaded successfully.`,
      });
    } catch (error) {
      const uploadedFile: UploadedFile = {
        name: file.name,
        size: file.size,
        uploadedAt: new Date(),
        status: 'error',
      };

      onFileUploaded(uploadedFile);

      toast({
        title: 'Upload failed',
        description: `Failed to upload ${file.name}. Please try again.`,
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
      setTimeout(() => setProgress(0), 1000);
    }
  }, [onFileUploaded, toast]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: false,
    accept: {
      'application/pdf': ['.pdf'],
      'text/plain': ['.txt'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    },
  });

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  return (
    <div className="flex flex-col gap-6 h-full">
      <Card
        {...getRootProps()}
        className={`border-2 border-dashed p-6 sm:p-8 text-center cursor-pointer transition-all duration-300 ${
          isDragActive
            ? 'border-primary bg-primary/5 scale-[1.02]'
            : 'border-border hover:border-primary/50 hover:bg-accent/5'
        }`}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center gap-4">
          <div className="p-4 rounded-full bg-primary/10">
            <Upload className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-2">
              {isDragActive ? 'Drop your file here' : 'Upload a document'}
            </h3>
            <p className="text-sm text-muted-foreground">
              Drag and drop or click to select a file
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              Supports TXT for now
            </p>
          </div>
          {!isDragActive && (
            <Button type="button" variant="outline" size="sm">
              Browse Files
            </Button>
          )}
        </div>
      </Card>

      {uploading && (
        <Card className="p-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Uploading...</span>
              <span className="font-medium">{progress}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </Card>
      )}

      {uploadedFiles.length > 0 && (
        <Card className="flex-1 overflow-hidden flex flex-col">
          <div className="p-4 border-b bg-muted/30">
            <h3 className="font-semibold">Uploaded Files</h3>
            <p className="text-sm text-muted-foreground">
              {uploadedFiles.length} {uploadedFiles.length === 1 ? 'file' : 'files'} uploaded
            </p>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {uploadedFiles.map((file, index) => (
              <Card key={index} className="p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-primary/10 shrink-0">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-medium text-sm truncate">{file.name}</p>
                      <Badge
                        variant={file.status === 'success' ? 'default' : 'destructive'}
                        className="shrink-0"
                      >
                        {file.status === 'success' ? (
                          <>
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            Success
                          </>
                        ) : (
                          <>
                            <AlertCircle className="h-3 w-3 mr-1" />
                            Error
                          </>
                        )}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                      <span>{formatFileSize(file.size)}</span>
                      <span>•</span>
                      <span>{formatDate(file.uploadedAt)}</span>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
