import { useState, useRef, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Send, Bot, User, MessageSquareOff, Search, Phone, RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Conversation, Message } from '@/types/lead';
import { LeadAvatar } from '@/components/ui/lead-avatar';

// ── Tipos internos ──────────────────────────────────────────
interface RawMessage {
  id: string;
  content: string;
  sender: string;
  created_at: string;
  conversation_id: string;
}

interface RawConversation {
  id: string;
  lead_id: string;
  lead_name: string;
  status: string;
  created_at: string;
  updated_at: string;
  messages: RawMessage[];
}

// ── Fetchers ────────────────────────────────────────────────
async function fetchConversations(): Promise<Conversation[]> {
  const { data, error } = await supabase
    .from('conversations')
    .select('*, messages(*)')
    .order('updated_at', { ascending: false });

  if (error) throw error;

  return (data as RawConversation[]).map((c) => {
    const msgs: Message[] = (c.messages || [])
      .sort((a: RawMessage, b: RawMessage) =>
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      )
      .map((m: RawMessage) => ({
        id: m.id,
        content: m.content,
        sender: (m.sender as Message['sender']) ?? 'ia',
        timestamp: new Date(m.created_at),
        leadId: c.lead_id,
      }));

    const lastMsg = msgs.length > 0 ? msgs[msgs.length - 1].timestamp : new Date(c.created_at);

    return {
      id: c.id,
      leadId: c.lead_id,
      leadName: c.lead_name || 'Lead',
      messages: msgs,
      status: (c.status as Conversation['status']) ?? 'ativa',
      lastMessage: lastMsg,
    };
  });
}

async function fetchMessages(conversationId: string): Promise<Message[]> {
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true });

  if (error) throw error;

  return (data as RawMessage[]).map((m) => ({
    id: m.id,
    content: m.content,
    sender: (m.sender as Message['sender']) ?? 'ia',
    timestamp: new Date(m.created_at),
    leadId: m.conversation_id,
  }));
}

// ── Componente Principal ────────────────────────────────────
interface ConversationsViewProps {
  conversations?: Conversation[];
}

export function ConversationsView({ conversations: _unused }: ConversationsViewProps) {
  const queryClient = useQueryClient();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Dados com polling a cada 5s como fallback
  const { data: conversations = [], isLoading, refetch } = useQuery({
    queryKey: ['conversations-realtime'],
    queryFn: fetchConversations,
    refetchInterval: 8000,
  });

  const { data: messages = [] } = useQuery({
    queryKey: ['messages', selectedId],
    queryFn: () => selectedId ? fetchMessages(selectedId) : Promise.resolve([]),
    enabled: !!selectedId,
    refetchInterval: 4000,
  });

  // Realtime via Supabase channels
  useEffect(() => {
    const channel = supabase
      .channel('sdr-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'messages' }, () => {
        queryClient.invalidateQueries({ queryKey: ['conversations-realtime'] });
        if (selectedId) queryClient.invalidateQueries({ queryKey: ['messages', selectedId] });
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'conversations' }, () => {
        queryClient.invalidateQueries({ queryKey: ['conversations-realtime'] });
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [queryClient, selectedId]);

  // Auto-seleciona primeira conversa
  useEffect(() => {
    if (!selectedId && conversations.length > 0) {
      setSelectedId(conversations[0].id);
    }
  }, [conversations, selectedId]);

  // Scroll automático para o final
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Filtro de busca
  const filtered = conversations.filter(c =>
    c.leadName.toLowerCase().includes(search.toLowerCase())
  );

  const selected = conversations.find(c => c.id === selectedId) ?? null;

  // ── Helpers de formatação ───────────────────────────────────
  const formatTime = (date: Date) =>
    new Date(date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

  const formatDate = (date: Date) => {
    const d = new Date(date);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    if (d.toDateString() === today.toDateString()) return 'Hoje';
    if (d.toDateString() === yesterday.toDateString()) return 'Ontem';
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
  };

  // initials handled by LeadAvatar

  const dotColor = (status: string) =>
    status === 'ativa' ? 'bg-success' :
    status === 'pausada' ? 'bg-warning' : 'bg-muted-foreground';

  const statusLabel = (status: string) =>
    status === 'ativa' ? 'Ativa' : status === 'pausada' ? 'Pausada' : 'Encerrada';

  // ── Estado vazio ────────────────────────────────────────────
  if (!isLoading && conversations.length === 0) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-140px)]">
        <div className="text-center text-muted-foreground">
          <MessageSquareOff className="w-16 h-16 mx-auto mb-4 opacity-30" />
          <h3 className="font-display font-semibold text-lg text-card-foreground mb-2">
            Nenhuma conversa ainda
          </h3>
          <p className="text-sm max-w-sm">
            As conversas aparecem aqui em tempo real quando leads interagem com a Ana via WhatsApp
          </p>
          <Button variant="outline" className="mt-4" onClick={() => refetch()}>
            <RefreshCw className="w-4 h-4 mr-2" /> Atualizar
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-4 h-[calc(100vh-140px)]">

      {/* ── Lista de conversas ──────────────────────────────── */}
      <Card className="w-80 flex-shrink-0 shadow-card flex flex-col">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between mb-2">
            <CardTitle className="font-display text-base flex items-center gap-2">
              Conversas
              {conversations.length > 0 && (
                <Badge variant="secondary" className="text-xs">{conversations.length}</Badge>
              )}
            </CardTitle>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => refetch()}>
              <RefreshCw className="w-3.5 h-3.5" />
            </Button>
          </div>
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-muted-foreground" />
            <Input
              placeholder="Buscar..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-8 h-8 text-sm bg-muted border-none"
            />
          </div>
        </CardHeader>

        <CardContent className="flex-1 overflow-y-auto p-0">
          {isLoading ? (
            <div className="space-y-1 p-3">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-lg animate-pulse">
                  <div className="w-10 h-10 rounded-full bg-muted flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 bg-muted rounded w-3/4" />
                    <div className="h-2.5 bg-muted rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-0.5 px-2 pb-2">
              {filtered.map((conv) => {
                const lastMsg = conv.messages[conv.messages.length - 1];
                const isSelected = conv.id === selectedId;

                return (
                  <button
                    key={conv.id}
                    onClick={() => setSelectedId(conv.id)}
                    className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors ${
                      isSelected ? 'bg-accent' : 'hover:bg-muted'
                    }`}
                  >
                    <LeadAvatar name={conv.leadName} size="md" status={conv.status} showStatus />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <p className="text-sm font-medium text-card-foreground truncate">{conv.leadName}</p>
                        <span className="text-[10px] text-muted-foreground flex-shrink-0 ml-1">
                          {formatDate(conv.lastMessage)}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground truncate">
                        {lastMsg
                          ? (lastMsg.sender !== 'lead' ? '🤖 ' : '👤 ') + lastMsg.content
                          : 'Sem mensagens'}
                      </p>
                    </div>
                  </button>
                );
              })}

              {filtered.length === 0 && !isLoading && (
                <p className="text-center text-xs text-muted-foreground py-8">
                  Nenhuma conversa encontrada
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── Área do chat ────────────────────────────────────── */}
      <Card className="flex-1 shadow-card flex flex-col min-w-0">
        {selected ? (
          <>
            {/* Header */}
            <CardHeader className="pb-3 border-b border-border">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <LeadAvatar name={selected.leadName} size="md" status={selected.status} showStatus />
                  <div>
                    <p className="text-sm font-semibold text-card-foreground">{selected.leadName}</p>
                    <div className="flex items-center gap-1.5">
                      <span className={`w-1.5 h-1.5 rounded-full ${dotColor(selected.status)}`} />
                      <span className="text-xs text-muted-foreground">{statusLabel(selected.status)}</span>
                      <span className="text-xs text-muted-foreground">·</span>
                      <span className="text-xs text-muted-foreground">{messages.length} mensagens</span>
                    </div>
                  </div>
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Phone className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>

            {/* Mensagens */}
            <CardContent className="flex-1 overflow-y-auto p-4 space-y-1">
              {messages.length === 0 ? (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  <div className="text-center">
                    <Bot className="w-10 h-10 mx-auto mb-2 opacity-30" />
                    <p className="text-sm">Nenhuma mensagem ainda</p>
                  </div>
                </div>
              ) : (
                messages.map((msg, idx) => {
                  const isIA = msg.sender !== 'lead';
                  const showSep =
                    idx === 0 ||
                    new Date(msg.timestamp).toDateString() !==
                    new Date(messages[idx - 1].timestamp).toDateString();

                  return (
                    <div key={msg.id}>
                      {showSep && (
                        <div className="flex items-center gap-2 my-3">
                          <div className="flex-1 h-px bg-border" />
                          <span className="text-[11px] text-muted-foreground px-2">
                            {formatDate(msg.timestamp)}
                          </span>
                          <div className="flex-1 h-px bg-border" />
                        </div>
                      )}

                      <div className={`flex gap-2 mb-1 ${isIA ? 'justify-end' : 'justify-start'}`}>
                        {!isIA && (
                          <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center flex-shrink-0 mt-1">
                            <User className="w-3.5 h-3.5 text-muted-foreground" />
                          </div>
                        )}

                        <div className={`max-w-[70%] rounded-2xl px-4 py-2.5 ${
                          isIA
                            ? 'gradient-primary text-primary-foreground rounded-tr-sm'
                            : 'bg-muted text-foreground rounded-tl-sm'
                        }`}>
                          <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                          <div className={`flex items-center gap-1 mt-0.5 ${
                            isIA ? 'text-primary-foreground/60 justify-end' : 'text-muted-foreground'
                          }`}>
                            {isIA && <Bot className="w-3 h-3" />}
                            <span className="text-[10px]">{formatTime(msg.timestamp)}</span>
                          </div>
                        </div>

                        {isIA && (
                          <div className="w-7 h-7 rounded-full gradient-primary flex items-center justify-center flex-shrink-0 mt-1">
                            <Bot className="w-3.5 h-3.5 text-primary-foreground" />
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </CardContent>

            {/* Rodapé */}
            <div className="p-4 border-t border-border">
              <div className="flex gap-2">
                <Input
                  placeholder="Resposta automática via WhatsApp pela Ana..."
                  className="bg-muted border-none text-sm"
                  disabled
                />
                <Button size="icon" disabled>
                  <Send className="w-4 h-4" />
                </Button>
              </div>
              <p className="text-[11px] text-muted-foreground mt-1 text-center">
                🤖 Ana responde automaticamente • Atualiza a cada 4s
              </p>
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
