import { useState } from 'react';
import { AppSidebar } from '@/components/layout/AppSidebar';
import { AppHeader } from '@/components/layout/AppHeader';
import { DashboardView } from '@/components/views/DashboardView';
import { LeadsView } from '@/components/views/LeadsView';
import { ConversationsView } from '@/components/views/ConversationsView';
import { AgentConfigView } from '@/components/views/AgentConfigView';
import { ScheduleView } from '@/components/views/ScheduleView';
import { SettingsView } from '@/components/views/SettingsView';
import { ExportView } from '@/components/views/ExportView';
import { mockLeads, mockConversations } from '@/data/mockLeads';

const viewMeta: Record<string, { title: string; subtitle?: string }> = {
  dashboard: { title: 'Dashboard', subtitle: 'Visão geral do seu funil de vendas' },
  leads: { title: 'Gestão de Leads', subtitle: `Gerencie todos os seus leads` },
  conversations: { title: 'Conversas', subtitle: 'Acompanhe as interações da IA' },
  schedule: { title: 'Agenda', subtitle: 'Eventos e reuniões agendadas' },
  agent: { title: 'Agente IA', subtitle: 'Configure o comportamento da IA' },
  export: { title: 'Exportar', subtitle: 'Exporte seus dados' },
  settings: { title: 'Configurações', subtitle: 'Personalize sua plataforma' },
};

const Index = () => {
  const [currentView, setCurrentView] = useState('dashboard');

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
          {currentView === 'dashboard' && <DashboardView leads={mockLeads} onSelectLead={handleSelectLead} />}
          {currentView === 'leads' && <LeadsView leads={mockLeads} onSelectLead={handleSelectLead} />}
          {currentView === 'conversations' && <ConversationsView conversations={mockConversations} />}
          {currentView === 'schedule' && <ScheduleView />}
          {currentView === 'agent' && <AgentConfigView />}
          {currentView === 'export' && <ExportView leads={mockLeads} />}
          {currentView === 'settings' && <SettingsView />}
        </main>
      </div>
    </div>
  );
};

export default Index;
