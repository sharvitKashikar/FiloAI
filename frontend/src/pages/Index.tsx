import { useState } from 'react';
import { FileUpload, UploadedFile } from '@/components/FileUpload';
import { ChatInterface } from '@/components/ChatInterface';
import { ChatSidebar } from '@/components/ChatSidebar';
import { Header } from '@/components/Header';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

const Index = () => {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [refreshChats, setRefreshChats] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleFileUploaded = (file: UploadedFile) => {
    setUploadedFiles(prev => [...prev, file]);
  };

  const handleNewChat = () => {
    setActiveChatId(null);
  };

  const handleChatCreated = (chatId: string) => {
    setActiveChatId(chatId);
    setRefreshChats(prev => prev + 1);
  };

  const handleSelectChat = (chatId: string) => {
    setActiveChatId(chatId);
    setSidebarOpen(false);
  };

  const handleDeleteChat = (chatId: string) => {
    if (activeChatId === chatId) {
      setActiveChatId(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex flex-col">
      <Header onNewChat={handleNewChat} onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

      <div className="flex-1 flex overflow-hidden">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:block w-80 h-[calc(100vh-73px)]">
          <ChatSidebar
            activeChatId={activeChatId}
            onSelectChat={handleSelectChat}
            onDeleteChat={handleDeleteChat}
            refreshTrigger={refreshChats}
          />
        </aside>

        {/* Mobile Sidebar */}
        <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
          <SheetContent side="left" className="p-0 w-80">
            <ChatSidebar
              activeChatId={activeChatId}
              onSelectChat={handleSelectChat}
              onDeleteChat={handleDeleteChat}
              refreshTrigger={refreshChats}
            />
          </SheetContent>
        </Sheet>

        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          <div className="container mx-auto px-4 py-6 max-w-4xl">
            <div className="space-y-6">
              {!activeChatId && (
                <div className="min-h-[400px]">
                  <FileUpload
                    onFileUploaded={handleFileUploaded}
                    uploadedFiles={uploadedFiles}
                  />
                </div>
              )}

              <div className="min-h-[500px]">
                <ChatInterface
                  hasUploadedFiles={uploadedFiles.length > 0}
                  activeChatId={activeChatId}
                  onChatCreated={handleChatCreated}
                />
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Index;
