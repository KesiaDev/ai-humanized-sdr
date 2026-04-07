import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
<<<<<<< HEAD
import { Send, Bot, User, Clock } from 'lucide-react';
=======
import { Send, Bot, User, Clock, MessageSquareOff } from 'lucide-react';
>>>>>>> af8b612617ead079803111f0945c88896d7ac9c9
import { Conversation, Message } from '@/types/lead';

interface ConversationsViewProps {
  conversations: Conversation[];
}

export function ConversationsView({ conversations }: ConversationsViewProps) {
  const [selectedConv, setSelectedConv] = useState<Conversation | null>(conversations[0] || null);
  const [inputMessage, setInputMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [selectedConv]);

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
  };

<<<<<<< HEAD
=======
  if (conversations.length === 0) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-140px)]">
        <div className="text-center text-muted-foreground">
          <MessageSquareOff className="w-16 h-16 mx-auto mb-4 opacity-30" />
          <h3 className="font-display font-semibold text-lg text-card-foreground mb-2">Nenhuma conversa ainda</h3>
          <p className="text-sm max-w-md">As conversas aparecerão aqui quando o agente IA começar a interagir com leads via WhatsApp, Instagram ou outros canais conectados</p>
        </div>
      </div>
    );
  }

>>>>>>> af8b612617ead079803111f0945c88896d7ac9c9
  return (
    <div className="flex gap-4 h-[calc(100vh-140px)]">
      {/* Conversation List */}
      <Card className="w-80 flex-shrink-0 shadow-card flex flex-col">
        <CardHeader className="pb-3">
          <CardTitle className="font-display text-base">Conversas</CardTitle>
        </CardHeader>
        <CardContent className="flex-1 overflow-y-auto p-0">
          <div className="space-y-0.5 px-2">
            {conversations.map((conv) => (
              <button
                key={conv.id}
                onClick={() => setSelectedConv(conv)}
                className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors ${
                  selectedConv?.id === conv.id ? 'bg-accent' : 'hover:bg-muted'
                }`}
              >
                <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center text-primary-foreground font-semibold text-sm flex-shrink-0">
                  {conv.leadName.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-card-foreground truncate">{conv.leadName}</p>
                    <span className="text-[10px] text-muted-foreground">{formatDate(conv.lastMessage)}</span>
                  </div>
                  <p className="text-xs text-muted-foreground truncate">
                    {conv.messages[conv.messages.length - 1]?.content}
                  </p>
                </div>
                <span className={`w-2 h-2 rounded-full flex-shrink-0 ${
                  conv.status === 'ativa' ? 'bg-success' : 'bg-muted-foreground'
                }`} />
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Chat */}
      <Card className="flex-1 shadow-card flex flex-col">
        {selectedConv ? (
          <>
            <CardHeader className="pb-3 border-b border-border">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full gradient-primary flex items-center justify-center text-primary-foreground font-semibold text-sm">
                  {selectedConv.leadName.charAt(0)}
                </div>
                <div>
                  <CardTitle className="font-display text-sm">{selectedConv.leadName}</CardTitle>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <span className={`w-1.5 h-1.5 rounded-full ${selectedConv.status === 'ativa' ? 'bg-success' : 'bg-muted-foreground'}`} />
                    {selectedConv.status === 'ativa' ? 'Ativa' : 'Pausada'}
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
              {selectedConv.messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex gap-2 ${msg.sender === 'lead' ? 'justify-start' : 'justify-end'}`}
                >
                  {msg.sender === 'lead' && (
                    <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center flex-shrink-0 mt-1">
                      <User className="w-3.5 h-3.5 text-muted-foreground" />
                    </div>
                  )}
                  <div className={`max-w-[70%] rounded-2xl px-4 py-2.5 ${
                    msg.sender === 'lead'
                      ? 'bg-muted text-foreground rounded-tl-sm'
                      : 'gradient-primary text-primary-foreground rounded-tr-sm'
                  }`}>
                    <p className="text-sm leading-relaxed">{msg.content}</p>
                    <div className={`flex items-center gap-1 mt-1 ${
                      msg.sender === 'lead' ? 'text-muted-foreground' : 'text-primary-foreground/70'
                    }`}>
                      {msg.sender === 'ia' && <Bot className="w-3 h-3" />}
                      <span className="text-[10px]">{formatTime(msg.timestamp)}</span>
                    </div>
                  </div>
                  {msg.sender !== 'lead' && (
                    <div className="w-7 h-7 rounded-full gradient-primary flex items-center justify-center flex-shrink-0 mt-1">
                      <Bot className="w-3.5 h-3.5 text-primary-foreground" />
                    </div>
                  )}
                </div>
              ))}
              <div ref={messagesEndRef} />
            </CardContent>
            <div className="p-4 border-t border-border">
              <div className="flex gap-2">
                <Input
                  placeholder="Digite uma mensagem..."
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  className="bg-muted border-none"
                  onKeyDown={(e) => e.key === 'Enter' && setInputMessage('')}
                />
                <Button size="icon" onClick={() => setInputMessage('')}>
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <Bot className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="font-medium">Selecione uma conversa</p>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
