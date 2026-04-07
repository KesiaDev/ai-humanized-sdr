import { supabase } from '@/integrations/supabase/client';
import type { Lead, Conversation, Message } from '@/types/lead';

// ── Leads ──────────────────────────────────────────────────

export interface LeadStats {
  total: number;
  byStatus: Record<string, number>;
  avgScore: number;
  conversionRate: number;
  changes: {
    total: string;
    qualified: string;
    avgScore: string;
    conversionRate: string;
  };
}

export const getLeads = async (): Promise<Lead[]> => {
  const { data, error } = await supabase
    .from('leads')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []).map(mapLead);
};

export const getLead = async (id: string): Promise<Lead> => {
  const { data, error } = await supabase
    .from('leads')
    .select('*')
    .eq('id', id)
    .single();
  if (error) throw new Error(error.message);
  return mapLead(data);
};

export const createLead = async (input: Omit<Lead, 'id' | 'createdAt'>): Promise<Lead> => {
  const { data, error } = await supabase
    .from('leads')
    .insert([{
      name: input.name,
      email: input.email,
      phone: input.phone,
      company: input.company,
      position: input.position,
      source: input.source,
      status: input.status,
      urgency: input.urgency,
      score: input.score,
      notes: input.notes,
      tags: input.tags,
    }])
    .select()
    .single();
  if (error) throw new Error(error.message);
  return mapLead(data);
};

export const updateLead = async (id: string, update: Partial<Lead>): Promise<Lead> => {
  const { data, error } = await supabase
    .from('leads')
    .update(update)
    .eq('id', id)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return mapLead(data);
};

export const updateLeadScore = (id: string, score: number): Promise<Lead> =>
  updateLead(id, { score } as Partial<Lead>);

export const getLeadStats = async (): Promise<LeadStats> => {
  const leads = await getLeads();
  const total = leads.length;
  const byStatus: Record<string, number> = {};
  let scoreSum = 0;
  let converted = 0;
  for (const l of leads) {
    byStatus[l.status] = (byStatus[l.status] ?? 0) + 1;
    scoreSum += l.score;
    if (l.status === 'fechado') converted++;
  }
  const avgScore = total > 0 ? Math.round(scoreSum / total) : 0;
  const conversionRate = total > 0 ? Math.round((converted / total) * 100) : 0;
  return {
    total,
    byStatus,
    avgScore,
    conversionRate,
    changes: { total: '+0', qualified: '+0', avgScore: '+0', conversionRate: '+0' },
  };
};

// ── Conversas ──────────────────────────────────────────────

export const getConversations = async (): Promise<Conversation[]> => {
  const { data, error } = await supabase
    .from('conversations')
    .select('*, messages(*)')
    .order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []).map(mapConversation);
};

export const getConversation = async (leadId: string): Promise<Conversation> => {
  const { data, error } = await supabase
    .from('conversations')
    .select('*, messages(*)')
    .eq('lead_id', leadId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();
  if (error) throw new Error(error.message);
  return mapConversation(data);
};

export const sendMessage = async (leadId: string, content: string): Promise<Message> => {
  // Find or create conversation
  let { data: conv } = await supabase
    .from('conversations')
    .select('id')
    .eq('lead_id', leadId)
    .single();

  if (!conv) {
    const { data: newConv, error: convErr } = await supabase
      .from('conversations')
      .insert([{ lead_id: leadId, status: 'ativa' }])
      .select()
      .single();
    if (convErr) throw new Error(convErr.message);
    conv = newConv;
  }

  const { data, error } = await supabase
    .from('messages')
    .insert([{ conversation_id: conv.id, content, sender: 'sdr' }])
    .select()
    .single();
  if (error) throw new Error(error.message);
  return mapMessage(data);
};

// ── Agenda ─────────────────────────────────────────────────

export interface Appointment {
  id: string;
  title: string;
  leadId: string;
  leadName: string;
  date: string;
  time: string;
  type: 'demo' | 'followup' | 'meeting' | 'proposal' | 'onboarding';
}

export const getAppointments = async (): Promise<Appointment[]> => {
  const { data, error } = await supabase
    .from('schedule_events')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []).map((e: Record<string, unknown>) => ({
    id: String(e.id ?? ''),
    title: String(e.title ?? ''),
    leadId: String(e.lead_id ?? ''),
    leadName: String(e.lead_name ?? ''),
    date: String(e.date ?? ''),
    time: String(e.time ?? ''),
    type: (e.type as Appointment['type']) ?? 'meeting',
  }));
};

export const createAppointment = async (input: Omit<Appointment, 'id'>): Promise<Appointment> => {
  const { data, error } = await supabase
    .from('schedule_events')
    .insert([{
      title: input.title,
      lead_id: input.leadId,
      lead_name: input.leadName,
      event_date: input.date,
      event_time: input.time,
      type: input.type,
    }])
    .select()
    .single();
  if (error) throw new Error(error.message);
  return {
    id: String(data.id),
    title: data.title,
    leadId: data.lead_id,
    leadName: data.lead_name,
    date: data.event_date ?? data.date,
    time: data.event_time ?? data.time,
    type: data.type,
  };
};

// ── WhatsApp / N8N ─────────────────────────────────────────

const N8N_WEBHOOK = 'https://ujypxavysrxbdkdapenv.supabase.co/functions/v1/n8n-webhook';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVqeXB4YXZ5c3J4YmRrZGFwZW52Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU0Njg0OTgsImV4cCI6MjA5MTA0NDQ5OH0.DdyTqAFUw-K13xBW2G-WhI8-hGODCwawTwz4_2nVb0w';

const webhookHeaders = {
  'Content-Type': 'application/json',
  'apikey': SUPABASE_ANON_KEY,
  'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
};

export const triggerWhatsApp = async (leadId: string, phone: string): Promise<{ success: boolean }> => {
  const res = await fetch(`${N8N_WEBHOOK}/lead`, {
    method: 'POST',
    headers: webhookHeaders,
    body: JSON.stringify({ phone, source: 'manual', notes: `Disparado da plataforma — lead ID: ${leadId}` }),
  });
  return { success: res.ok };
};

export const updateLeadStatus = async (phone: string, status: string, score?: number): Promise<void> => {
  await fetch(`${N8N_WEBHOOK}/lead-update`, {
    method: 'PATCH',
    headers: webhookHeaders,
    body: JSON.stringify({ phone, status, ...(score !== undefined ? { score } : {}) }),
  });
};

// ── Configuração do Agente ─────────────────────────────────

export interface FullAgentConfig {
  // Status
  active: boolean;
  // Info básicas
  agentName: string;
  agentDescription: string;
  role: string;
  companyName: string;
  language: string;
  // Horário
  alwaysOn: boolean;
  startTime: string;
  endTime: string;
  offHoursMsg: string;
  // Canais
  channelWhatsApp: boolean;
  channelInstagram: boolean;
  channelFacebook: boolean;
  channelSiteChat: boolean;
  channelEmail: boolean;
  // Credenciais
  apiKey: string;
  webhookUrl: string;
  // Comunicação
  bufferSec: number;
  timeBetweenSec: number;
  errorResponse: string;
  tone: string;
  useEmojis: boolean;
  maxResponseLength: number;
  // Humanização
  simulateTyping: boolean;
  vocabularyVariation: boolean;
  contextMemory: boolean;
  splitMessages: boolean;
  audioResponses: boolean;
  naturalReactions: boolean;
  // Voz
  voiceEngine: string;
  voiceSelected: string;
  voiceSpeed: string;
  autoAudio: boolean;
  // Gatilhos
  triggerMode: string;
  triggerMatchType: string;
  keywords: string[];
  welcomeMsg: string;
  closingMsg: string;
  // Instruções
  systemPrompt: string;
  productDescription: string;
  forbiddenTopics: string;
  qualificationQuestions: string;
  // Base de Conhecimento
  faqContent: string;
  knowledgeUrl: string;
  // Seguir
  followUpEnabled: boolean;
  followUpDelayHours: number;
  maxAttempts: number;
  followUpMsg: string;
  finalMsg: string;
  // Agenda
  autoSchedule: boolean;
  calendarIntegration: string;
  meetingDuration: string;
  meetingInterval: string;
  meetingLink: string;
  // Intenções
  intents: { intent: string; action: string; active: boolean }[];
}

export const DEFAULT_AGENT_CONFIG: FullAgentConfig = {
  active: true,
  agentName: 'Ana',
  agentDescription: 'Assistente comercial da Prevensul',
  role: 'Consultora de Vendas',
  companyName: 'Prevensul Comercial Elétrica',
  language: 'pt-br',
  alwaysOn: true,
  startTime: '08:00',
  endTime: '18:00',
  offHoursMsg: 'Obrigado pelo contato! Atendemos seg-sex 8h-18h. Retornamos em breve!',
  channelWhatsApp: true,
  channelInstagram: false,
  channelFacebook: false,
  channelSiteChat: true,
  channelEmail: false,
  apiKey: '',
  webhookUrl: '',
  bufferSec: 10,
  timeBetweenSec: 3,
  errorResponse: 'Desculpa, não entendi. Pode enviar de outra forma?',
  tone: 'amigavel',
  useEmojis: true,
  maxResponseLength: 500,
  simulateTyping: true,
  vocabularyVariation: true,
  contextMemory: true,
  splitMessages: false,
  audioResponses: false,
  naturalReactions: true,
  voiceEngine: 'elevenlabs',
  voiceSelected: 'sofia',
  voiceSpeed: 'normal',
  autoAudio: false,
  triggerMode: 'especifica',
  triggerMatchType: 'igual',
  keywords: ['Quero saber mais'],
  welcomeMsg: 'Olá! 👋 Seja bem-vindo(a)! Como posso ajudá-lo(a) hoje?',
  closingMsg: 'Foi um prazer ajudá-lo(a)! Se precisar de algo mais, estou por aqui. 😊',
  systemPrompt: 'Você é uma assistente de vendas profissional e empática. Seu objetivo é qualificar leads e agendar reuniões. Seja amigável, use linguagem simples e direta.',
  productDescription: '',
  forbiddenTopics: 'Preços específicos sem aprovação, descontos não autorizados, informações de concorrentes',
  qualificationQuestions: '1. Qual é o seu principal desafio atualmente?\n2. Qual o tamanho da sua equipe?\n3. Já utiliza alguma solução semelhante?\n4. Qual o prazo para implementação?',
  faqContent: '',
  knowledgeUrl: '',
  followUpEnabled: true,
  followUpDelayHours: 2,
  maxAttempts: 3,
  followUpMsg: 'Oi! Vi que não conseguimos conversar ainda. Posso ajudar? 😊',
  finalMsg: 'Olá! Só passando para avisar que estou por aqui caso precise. Sem compromisso! 🙂',
  autoSchedule: true,
  calendarIntegration: 'google',
  meetingDuration: '30',
  meetingInterval: '15',
  meetingLink: '',
  intents: [
    { intent: 'Interesse em comprar', action: 'Apresentar produto e agendar demo', active: true },
    { intent: 'Pedido de preço', action: 'Coletar info e encaminhar para vendedor', active: true },
    { intent: 'Suporte técnico', action: 'Redirecionar para equipe de suporte', active: true },
    { intent: 'Reclamação', action: 'Registrar e escalar para gerência', active: false },
    { intent: 'Cancelamento', action: 'Oferecer retenção e encaminhar para CS', active: false },
  ],
};

export const getAgentConfig = async (): Promise<FullAgentConfig> => {
  const { data } = await supabase
    .from('agent_config')
    .select('config')
    .eq('id', 1)
    .maybeSingle();
  if (!data?.config) return { ...DEFAULT_AGENT_CONFIG };
  return { ...DEFAULT_AGENT_CONFIG, ...(data.config as Partial<FullAgentConfig>) };
};

export const updateAgentConfig = async (config: FullAgentConfig): Promise<void> => {
  const { error } = await supabase
    .from('agent_config')
    .upsert({ id: 1, config: config as unknown as Record<string, unknown>, updated_at: new Date().toISOString() });
  if (error) throw new Error(error.message);
};

// ── Mappers ────────────────────────────────────────────────

function mapLead(row: Record<string, unknown>): Lead {
  return {
    id: String(row.id ?? ''),
    name: String(row.name ?? ''),
    email: String(row.email ?? ''),
    phone: String(row.phone ?? ''),
    company: String(row.company ?? ''),
    position: String(row.position ?? ''),
    source: (row.source as Lead['source']) ?? 'outro',
    status: (row.status as Lead['status']) ?? 'novo',
    urgency: (row.urgency as Lead['urgency']) ?? 'media',
    score: Number(row.score ?? 0),
    notes: String(row.notes ?? ''),
    tags: Array.isArray(row.tags) ? row.tags : [],
    createdAt: row.created_at ? new Date(row.created_at as string) : new Date(),
    lastContact: row.last_contact ? new Date(row.last_contact as string) : null,
    nextFollowUp: row.next_follow_up ? new Date(row.next_follow_up as string) : null,
  };
}

function mapMessage(row: Record<string, unknown>): Message {
  return {
    id: String(row.id ?? ''),
    content: String(row.content ?? ''),
    sender: (row.sender as Message['sender']) ?? 'ia',
    timestamp: row.created_at ? new Date(row.created_at as string) : new Date(),
    leadId: String(row.lead_id ?? row.conversation_id ?? ''),
  };
}

function mapConversation(row: Record<string, unknown>): Conversation {
  const msgs = Array.isArray(row.messages) ? row.messages.map(mapMessage) : [];
  const lastMsg = msgs.length > 0 ? msgs[msgs.length - 1].timestamp : new Date();
  return {
    id: String(row.id ?? ''),
    leadId: String(row.lead_id ?? ''),
    leadName: String(row.lead_name ?? ''),
    messages: msgs,
    status: (row.status as Conversation['status']) ?? 'ativa',
    lastMessage: lastMsg,
  };
}
