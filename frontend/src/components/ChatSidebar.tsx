import { useEffect, useState } from 'react';
import { chatAPI } from '@/lib/api';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { MessageSquare, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface Chat {
  id: string;
  title: string;
  messageCount: number;
  createdAt: string;
  updatedAt: string;
}

interface ChatSidebarProps {
  activeChatId: string | null;
  onSelectChat: (chatId: string) => void;
  onDeleteChat: (chatId: string) => void;
  refreshTrigger: number;
}

export function ChatSidebar({ activeChatId, onSelectChat, onDeleteChat, refreshTrigger }: ChatSidebarProps) {
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadChats();
  }, [refreshTrigger]);

  const loadChats = async () => {
    try {
      const response = await chatAPI.getChats();
      const chatData = response.data.chats || [];
      
      // Map the backend format to frontend format
      const mappedChats = chatData.map((chat: any) => ({
        id: chat.id,
        title: chat.title,
        messageCount: chat._count?.messages || 0,
        createdAt: chat.createdAt,
        updatedAt: chat.updatedAt,
      }));
      
      setChats(mappedChats);
    } catch (error: any) {
      console.error('Failed to load chats:', error);
      // Set empty array on error to prevent crash
      setChats([]);
      toast({
        variant: 'destructive',
        title: 'Failed to load chats',
        description: error.response?.data?.error || 'Could not retrieve chat history. Make sure the backend server is running.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (chatId: string) => {
    try {
      await chatAPI.deleteChat(chatId);
      setChats(chats.filter(chat => chat.id !== chatId));
      onDeleteChat(chatId);
      toast({
        title: 'Chat deleted',
        description: 'Chat history has been removed',
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Failed to delete chat',
        description: 'Could not remove chat',
      });
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="w-full h-full border-r bg-card/30 p-4">
        <div className="space-y-3">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full border-r bg-card/30 flex flex-col">
      <div className="p-4 border-b">
        <h2 className="font-semibold flex items-center gap-2">
          <MessageSquare className="h-4 w-4" />
          Chat History
        </h2>
      </div>

      <ScrollArea className="flex-1">
        {chats.length === 0 ? (
          <div className="p-4 text-center">
            <p className="text-sm text-muted-foreground">No chats yet</p>
            <p className="text-xs text-muted-foreground mt-1">Start a new conversation</p>
          </div>
        ) : (
          <div className="p-2 space-y-2">
            {chats.map((chat) => (
              <Card
                key={chat.id}
                className={cn(
                  'p-3 cursor-pointer hover:bg-accent/50 transition-colors',
                  activeChatId === chat.id && 'bg-accent'
                )}
                onClick={() => onSelectChat(chat.id)}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{chat.title}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-muted-foreground">
                        {chat.messageCount} messages
                      </span>
                      <span className="text-xs text-muted-foreground">•</span>
                      <span className="text-xs text-muted-foreground">
                        {formatDate(chat.updatedAt)}
                      </span>
                    </div>
                  </div>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 shrink-0"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete chat?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will permanently delete this chat and all its messages. This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDelete(chat.id)}>
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </Card>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
