import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import ReactMarkdown from 'react-markdown';
import { chatAPI } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

export interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface ChatInterfaceProps {
  hasUploadedFiles: boolean;
  activeChatId: string | null;
  onChatCreated: (chatId: string) => void;
}

export function ChatInterface({ hasUploadedFiles, activeChatId, onChatCreated }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (activeChatId && activeChatId !== currentChatId) {
      loadChatHistory(activeChatId);
    } else if (!activeChatId) {
      setMessages([]);
      setCurrentChatId(null);
    }
  }, [activeChatId]);

  const loadChatHistory = async (chatId: string) => {
    setLoading(true);
    try {
      const response = await chatAPI.getChat(chatId);
      const chat = response.data.chat;
      const chatMessages = (chat.messages || []).map((msg: any) => ({
        role: msg.role,
        content: msg.content,
        timestamp: new Date(msg.createdAt || msg.timestamp),
      }));
      setMessages(chatMessages);
      setCurrentChatId(chatId);
    } catch (error: any) {
      console.error('Failed to load chat:', error);
      toast({
        variant: 'destructive',
        title: 'Failed to load chat',
        description: error.response?.data?.error || 'Could not retrieve chat history',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage: Message = {
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    const messageText = input;
    setInput('');
    setLoading(true);

    try {
      const response = await chatAPI.sendMessage({
        message: messageText,
        chatId: currentChatId || undefined,
      });

      const { chatId, response: aiResponse } = response.data;

      if (!currentChatId && chatId) {
        setCurrentChatId(chatId);
        onChatCreated(chatId);
      }

      const assistantMessage: Message = {
        role: 'assistant',
        content: aiResponse,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error: any) {
      const errorMessage: Message = {
        role: 'assistant',
        content: 'Sorry, I encountered an error processing your request. Please try again.',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.response?.data?.message || 'Failed to send message',
      });
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  return (
    <div className="flex flex-col h-full">
      {!hasUploadedFiles && !activeChatId ? (
        <div className="flex-1 flex items-center justify-center p-8">
          <Alert className="max-w-md">
            <AlertDescription className="text-center">
              <div className="mb-4">
                <Bot className="h-12 w-12 mx-auto text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Upload insurance quotes to start</h3>
              <p className="text-sm text-muted-foreground">
                Upload your insurance quotes first, then I'll help you compare and choose the best one.
              </p>
            </AlertDescription>
          </Alert>
        </div>
      ) : (
        <>
          <Card className="flex-1 overflow-hidden flex flex-col">
            <div className="p-4 border-b bg-muted/30">
              <h3 className="font-semibold">Insurance Quote Comparison</h3>
              <p className="text-sm text-muted-foreground">
                Ask me to compare quotes, explain coverage, or recommend the best option for your needs
              </p>
            </div>
            <ScrollArea className="flex-1 p-4" ref={scrollRef}>
              {messages.length === 0 ? (
                <div className="flex items-center justify-center h-full text-center">
                  <div>
                    <Bot className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">
                      Ready to help! Try asking: "Compare all my quotes" or "Which is best for a family of 4?"
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map((message, index) => (
                    <div
                      key={index}
                      className={`flex gap-3 ${
                        message.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                      }`}
                    >
                      <div
                        className={`p-2 rounded-full h-8 w-8 shrink-0 flex items-center justify-center ${
                          message.role === 'user'
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-accent text-accent-foreground'
                        }`}
                      >
                        {message.role === 'user' ? (
                          <User className="h-4 w-4" />
                        ) : (
                          <Bot className="h-4 w-4" />
                        )}
                      </div>
                      <div
                        className={`flex-1 max-w-[85%] sm:max-w-[80%] ${
                          message.role === 'user' ? 'items-end' : 'items-start'
                        }`}
                      >
                        <Card
                          className={`p-3 ${
                            message.role === 'user'
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-card'
                          }`}
                        >
                          {message.role === 'user' ? (
                            <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                          ) : (
                            <div className="prose prose-sm max-w-none dark:prose-invert">
                              <ReactMarkdown
                                components={{
                                  p: ({ children }) => (
                                    <p className="mb-2 last:mb-0">{children}</p>
                                  ),
                                  ul: ({ children }) => (
                                    <ul className="list-disc pl-4 mb-2">{children}</ul>
                                  ),
                                  ol: ({ children }) => (
                                    <ol className="list-decimal pl-4 mb-2">{children}</ol>
                                  ),
                                  code: ({ children, className }) => {
                                    const isInline = !className;
                                    return isInline ? (
                                      <code className="bg-muted px-1 py-0.5 rounded text-xs">
                                        {children}
                                      </code>
                                    ) : (
                                      <code className="block bg-muted p-2 rounded text-xs overflow-x-auto">
                                        {children}
                                      </code>
                                    );
                                  },
                                }}
                              >
                                {message.content}
                              </ReactMarkdown>
                            </div>
                          )}
                        </Card>
                        <p className="text-xs text-muted-foreground mt-1 px-1">
                          {formatTime(message.timestamp)}
                        </p>
                      </div>
                    </div>
                  ))}
                  {loading && (
                    <div className="flex gap-3">
                      <div className="p-2 rounded-full h-8 w-8 shrink-0 flex items-center justify-center bg-accent text-accent-foreground">
                        <Bot className="h-4 w-4" />
                      </div>
                      <Card className="flex-1 max-w-[80%] p-3 space-y-2">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                      </Card>
                    </div>
                  )}
                </div>
              )}
            </ScrollArea>
          </Card>

          <div className="p-3 sm:p-4 border-t bg-card">
            <div className="flex gap-2">
              <Input
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
                placeholder="Ask about insurance quotes (e.g., 'Compare all quotes' or 'Which is best for me?')..."
                disabled={loading}
                className="flex-1 text-sm sm:text-base"
              />
              <Button
                onClick={handleSend}
                disabled={loading || !input.trim()}
                size="icon"
                className="shrink-0"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
