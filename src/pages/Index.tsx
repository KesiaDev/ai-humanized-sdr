import { useState, useEffect } from 'react';
import { AppSidebar } from '@/components/layout/AppSidebar';
import { AppHeader } from '@/components/layout/AppHeader';
import { DashboardView } from '@/components/views/DashboardView';
import { LeadsView } from '@/components/views/LeadsView';
import { ConversationsView } from '@/components/views/ConversationsView';
import { AgentConfigView } from '@/components/views/AgentConfigView';
import { ScheduleView } from '@/components/views/ScheduleView';
import { SettingsView } from '@/components/views/SettingsView';
import { ExportView } from '@/components/views/ExportView';
import { supabase } from '@/integrations/supabase/client';
import { Lead, Conversation } from '@/types/lead';
import { Tables } from '@/integrations/supabase/types';

const viewMeta: Record<string, { title: string; subtitle?: string }> = {
  dashboard: { title: 'Dashboard', subtitle: 'Visão geral do seu funil de vendas' },
  leads: { title: 'Gestão de Leads', subtitle: 'Gerencie todos os seus leads' },
  conversations: { title: 'Conversas', subtitle: 'Acompanhe as interações da IA' },
  schedule: { title: 'Agenda', subtitle: 'Eventos e reuniões agendadas' },
  agent: { title: 'Agente IA', subtitle: 'Configure o comportamento da IA' },
  export: { title: 'Exportar', subtitle: 'Exporte seus dados' },
  settings: { title: 'Configurações', subtitle: 'Personalize sua plataforma' },
};

function mapDbLeadToLead(db: Tables<'leads'>): Lead {
  return {
    id: db.id,
    name: db.name,
    email: db.email || '',
    phone: db.phone || '',
    company: db.company || '',
    position: db.position || '',
    source: (db.source as Lead['source']) || 'outro',
    status: (db.status as Lead['status']) || 'novo',
    urgency: (db.urgency as Lead['urgency']) || 'baixa',
    score: db.score,
    notes: db.notes || '',
    tags: db.tags || [],
    createdAt: new Date(db.created_at),
    lastContact: db.last_contact ? new Date(db.last_contact) : null,
    nextFollowUp: db.next_follow_up ? new Date(db.next_follow_up) : null,
  };
}

const Index = () => {
  const [currentView, setCurrentView] = useState('dashboard');
  const [leads, setLeads] = useState<Lead[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);

  useEffect(() => {
    fetchLeads();
    fetchConversations();

    // Real-time subscriptions
    const leadsChannel = supabase
      .channel('leads-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'leads' }, () => fetchLeads())
      .subscribe();

    const convsChannel = supabase
      .channel('conversations-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'conversations' }, () => fetchConversations())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'messages' }, () => fetchConversations())
      .subscribe();

    return () => {
      supabase.removeChannel(leadsChannel);
      supabase.removeChannel(convsChannel);
    };
  }, []);

  const fetchLeads = async () => {
    const { data } = await supabase.from('leads').select('*').order('created_at', { ascending: false });
    if (data) setLeads(data.map(mapDbLeadToLead));
  };

  const fetchConversations = async () => {
    const { data: convData } = await supabase
      .from('conversations')
      .select('*')
      .order('last_message', { ascending: false });

    if (convData) {
      const convsWithMessages: Conversation[] = await Promise.all(
        convData.map(async (conv) => {
          const { data: msgs } = await supabase
            .from('messages')
            .select('*')
            .eq('conversation_id', conv.id)
            .order('created_at', { ascending: true });

          return {
            id: conv.id,
            leadId: conv.lead_id,
            leadName: conv.lead_name,
            status: conv.status as Conversation['status'],
            lastMessage: new Date(conv.last_message || conv.created_at),
            messages: (msgs || []).map(m => ({
              id: m.id,
              content: m.content,
              sender: m.sender as 'lead' | 'sdr' | 'ia',
              timestamp: new Date(m.created_at),
              leadId: m.lead_id,
            })),
          };
        })
      );
      setConversations(convsWithMessages);
    }
  };

  const handleSelectLead = (leadId: string) => {
    setCurrentView('leads');
  };

  const meta = viewMeta[currentView] || { title: 'SDR IA Humanizado' };

  return (
    <div className="min-h-screen bg-background">
      <AppSidebar currentView={currentView} onViewChange={setCurrentView} />
      <div className="ml-[260px] transition-all duration-300">
        <AppHeader title={meta.title} subtitle={meta.subtitle} />
        <main className="p-6">
          {currentView === 'dashboard' && <DashboardView leads={leads} onSelectLead={handleSelectLead} />}
          {currentView === 'leads' && <LeadsView leads={leads} onSelectLead={handleSelectLead} />}
          {currentView === 'conversations' && <ConversationsView conversations={conversations} />}
          {currentView === 'schedule' && <ScheduleView />}
          {currentView === 'agent' && <AgentConfigView />}
          {currentView === 'export' && <ExportView leads={leads} />}
          {currentView === 'settings' && <SettingsView />}
        </main>
      </div>
    </div>
  );
};

export default Index;
