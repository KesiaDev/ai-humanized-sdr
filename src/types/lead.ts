export type LeadStatus = 'novo' | 'contatado' | 'qualificado' | 'proposta' | 'fechado' | 'perdido';
export type LeadUrgency = 'baixa' | 'media' | 'alta' | 'critica';
export type LeadSource = 'whatsapp' | 'instagram' | 'site' | 'indicacao' | 'google' | 'outro';

export interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  position: string;
  source: LeadSource;
  status: LeadStatus;
  urgency: LeadUrgency;
  score: number;
  notes: string;
  tags: string[];
  createdAt: Date;
  lastContact: Date | null;
  nextFollowUp: Date | null;
}

export interface Message {
  id: string;
  content: string;
  sender: 'lead' | 'sdr' | 'ia';
  timestamp: Date;
  leadId: string;
}

export interface Conversation {
  id: string;
  leadId: string;
  leadName: string;
  messages: Message[];
  status: 'ativa' | 'pausada' | 'encerrada';
  lastMessage: Date;
}
