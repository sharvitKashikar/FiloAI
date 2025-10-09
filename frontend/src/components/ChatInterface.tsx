import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import ReactMarkdown from 'react-markdown';
import axios from 'axios';

export interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface ChatInterfaceProps {
  hasUploadedFiles: boolean;
}

export function ChatInterface({ hasUploadedFiles }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage: Message = {
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
      const response = await axios.post(`${apiUrl}/chat`, {
        message: input,
      });

      const assistantMessage: Message = {
        role: 'assistant',
        content: response.data.response,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      const errorMessage: Message = {
        role: 'assistant',
        content: 'Sorry, I encountered an error processing your request. Please try again.',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
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
      {!hasUploadedFiles ? (
        <div className="flex-1 flex items-center justify-center p-4 sm:p-8">
          <Alert className="max-w-md w-full">
            <AlertDescription className="text-center">
              <div className="mb-3 sm:mb-4">
                <Bot className="h-10 w-10 sm:h-12 sm:w-12 mx-auto text-primary" />
              </div>
              <h3 className="text-sm sm:text-base font-semibold mb-2">Upload a document to start</h3>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Upload a document first, then ask questions about its content.
              </p>
            </AlertDescription>
          </Alert>
        </div>
      ) : (
        <>
          <Card className="flex-1 overflow-hidden flex flex-col min-h-0">
            <div className="p-3 sm:p-4 border-b bg-muted/30">
              <h3 className="text-sm sm:text-base font-semibold">Chat</h3>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Ask questions about your uploaded documents
              </p>
            </div>
            <ScrollArea className="flex-1 p-3 sm:p-4" ref={scrollRef}>
              {messages.length === 0 ? (
                <div className="flex items-center justify-center h-full text-center p-4">
                  <div>
                    <Bot className="h-10 w-10 sm:h-12 sm:w-12 mx-auto mb-3 sm:mb-4 text-muted-foreground" />
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      No messages yet. Start by asking a question!
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-3 sm:space-y-4">
                  {messages.map((message, index) => (
                    <div
                      key={index}
                      className={`flex gap-2 sm:gap-3 ${
                        message.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                      }`}
                    >
                      <div
                        className={`p-1.5 sm:p-2 rounded-full h-7 w-7 sm:h-8 sm:w-8 shrink-0 flex items-center justify-center ${
                          message.role === 'user'
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-accent text-accent-foreground'
                        }`}
                      >
                        {message.role === 'user' ? (
                          <User className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                        ) : (
                          <Bot className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                        )}
                      </div>
                      <div
                        className={`flex-1 max-w-[90%] sm:max-w-[85%] md:max-w-[80%] ${
                          message.role === 'user' ? 'items-end' : 'items-start'
                        }`}
                      >
                        <Card
                          className={`p-2.5 sm:p-3 ${
                            message.role === 'user'
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-card'
                          }`}
                        >
                          {message.role === 'user' ? (
                            <p className="text-xs sm:text-sm whitespace-pre-wrap break-words">{message.content}</p>
                          ) : (
                            <div className="prose prose-sm max-w-none dark:prose-invert text-xs sm:text-sm">
                              <ReactMarkdown
                                components={{
                                  p: ({ children }) => (
                                    <p className="mb-1.5 sm:mb-2 last:mb-0 break-words">{children}</p>
                                  ),
                                  ul: ({ children }) => (
                                    <ul className="list-disc pl-3 sm:pl-4 mb-1.5 sm:mb-2 space-y-1">{children}</ul>
                                  ),
                                  ol: ({ children }) => (
                                    <ol className="list-decimal pl-3 sm:pl-4 mb-1.5 sm:mb-2 space-y-1">{children}</ol>
                                  ),
                                  li: ({ children }) => (
                                    <li className="break-words">{children}</li>
                                  ),
                                  code: ({ children, className }) => {
                                    const isInline = !className;
                                    return isInline ? (
                                      <code className="bg-muted px-1 py-0.5 rounded text-xs break-all">
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
                        <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5 sm:mt-1 px-1">
                          {formatTime(message.timestamp)}
                        </p>
                      </div>
                    </div>
                  ))}
                  {loading && (
                    <div className="flex gap-2 sm:gap-3">
                      <div className="p-1.5 sm:p-2 rounded-full h-7 w-7 sm:h-8 sm:w-8 shrink-0 flex items-center justify-center bg-accent text-accent-foreground">
                        <Bot className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                      </div>
                      <Card className="flex-1 max-w-[90%] sm:max-w-[80%] p-2.5 sm:p-3 space-y-2">
                        <Skeleton className="h-3 sm:h-4 w-full" />
                        <Skeleton className="h-3 sm:h-4 w-3/4" />
                        <Skeleton className="h-3 sm:h-4 w-1/2" />
                      </Card>
                    </div>
                  )}
                </div>
              )}
            </ScrollArea>
          </Card>

          <div className="p-2.5 sm:p-3 md:p-4 border-t bg-card">
            <div className="flex gap-2">
              <Input
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
                placeholder="Ask a question..."
                disabled={loading}
                className="flex-1 text-sm h-9 sm:h-10"
              />
              <Button
                onClick={handleSend}
                disabled={loading || !input.trim()}
                size="icon"
                className="shrink-0 h-9 w-9 sm:h-10 sm:w-10"
              >
                <Send className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
