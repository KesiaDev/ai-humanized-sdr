import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, MessageSquare, TrendingUp, Target, ArrowUpRight, ArrowDownRight, BarChart3, Bot, MessageCircle } from 'lucide-react';
import { Lead } from '@/types/lead';
import { LeadAvatar } from '@/components/ui/lead-avatar';
import { getAgentConfig } from '@/lib/api';
import { supabase } from '@/integrations/supabase/client';

interface DashboardViewProps {
  leads: Lead[];
  onSelectLead: (id: string) => void;
}

const funnelStages = [
  { label: 'Novos', key: 'novo', color: 'bg-info' },
  { label: 'Contatados', key: 'contatado', color: 'bg-warning' },
  { label: 'Qualificados', key: 'qualificado', color: 'bg-primary' },
  { label: 'Proposta', key: 'proposta', color: 'bg-accent-foreground' },
  { label: 'Fechados', key: 'fechado', color: 'bg-success' },
  { label: 'Perdidos', key: 'perdido', color: 'bg-destructive' },
];

export function DashboardView({ leads, onSelectLead }: DashboardViewProps) {
  const totalLeads = leads.length;
  const qualifiedLeads = leads.filter(l => l.status === 'qualificado' || l.status === 'proposta' || l.status === 'fechado').length;
  const avgScore = totalLeads > 0 ? Math.round(leads.reduce((sum, l) => sum + l.score, 0) / totalLeads) : 0;
  const closedLeads = leads.filter(l => l.status === 'fechado').length;
  const conversionRate = totalLeads > 0 ? Math.round((closedLeads / totalLeads) * 100) : 0;

  const { data: agentConfig } = useQuery({ queryKey: ['agent-config'], queryFn: getAgentConfig });
  const { data: lastActivity } = useQuery({
    queryKey: ['last-message'],
    queryFn: async () => {
      const { data } = await supabase
        .from('messages')
        .select('created_at')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      return data?.created_at ? new Date(data.created_at) : null;
    },
    refetchInterval: 15000,
  });

  const stats = [
    { label: 'Total de Leads', value: totalLeads, icon: Users, change: '+12%', up: true },
    { label: 'Qualificados', value: qualifiedLeads, icon: Target, change: '+8%', up: true },
    { label: 'Score Médio', value: avgScore, icon: TrendingUp, change: '+5pts', up: true },
    { label: 'Taxa de Conversão', value: `${conversionRate}%`, icon: MessageSquare, change: '-2%', up: false },
  ];

  const isActive = agentConfig?.active === true;
  const agentName = agentConfig?.agentName || 'Nandi';
  const companyName = agentConfig?.companyName || 'NandiDev';

  return (
    <div className="space-y-6">
      {/* Agent Status */}
      <Card className="shadow-card">
        <CardContent className="p-5">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${isActive ? 'bg-success/10' : 'bg-muted'}`}>
                <Bot className={`w-6 h-6 ${isActive ? 'text-success' : 'text-muted-foreground'}`} />
              </div>
              <div>
                <p className="font-display font-semibold text-card-foreground">{agentName} — {companyName}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`inline-flex items-center gap-1.5 text-xs px-2 py-0.5 rounded-full font-medium ${isActive ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground'}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-success animate-pulse' : 'bg-muted-foreground'}`} />
                    {isActive ? 'Ativo' : 'Inativo'}
                  </span>
                  {agentConfig?.channelWhatsApp && (
                    <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                      <MessageCircle className="w-3 h-3" /> WhatsApp ✓
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="text-right">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Última atividade</p>
              <p className="text-sm font-medium text-card-foreground">
                {lastActivity ? lastActivity.toLocaleString('pt-BR') : 'Sem atividade ainda'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="shadow-card hover:shadow-elevated transition-shadow">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{stat.label}</p>
                  <p className="text-2xl font-display font-bold text-card-foreground mt-1">{stat.value}</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center">
                  <stat.icon className="w-5 h-5 text-accent-foreground" />
                </div>
              </div>
              <div className={`flex items-center gap-1 mt-3 text-xs font-medium ${stat.up ? 'text-success' : 'text-destructive'}`}>
                {stat.up ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                {stat.change} vs mês anterior
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Funnel */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="font-display text-base">Funil de Vendas</CardTitle>
        </CardHeader>
        <CardContent>
          {totalLeads > 0 ? (
            <div className="flex items-end gap-3 h-48">
              {funnelStages.map((stage) => {
                const count = leads.filter(l => l.status === stage.key).length;
                const pct = totalLeads > 0 ? (count / totalLeads) * 100 : 0;
                return (
                  <div key={stage.key} className="flex-1 flex flex-col items-center gap-2">
                    <span className="text-sm font-semibold text-card-foreground">{count}</span>
                    <div className="w-full rounded-t-lg relative" style={{ height: `${Math.max(pct * 1.5, 8)}%` }}>
                      <div className={`absolute inset-0 rounded-t-lg ${stage.color} opacity-80`} />
                    </div>
                    <span className="text-[11px] text-muted-foreground text-center">{stage.label}</span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <BarChart3 className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="font-medium">Sem dados no funil</p>
              <p className="text-sm">Os leads aparecerão aqui quando forem captados pelo agente</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Leads */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="font-display text-base">Leads Recentes</CardTitle>
        </CardHeader>
        <CardContent>
          {leads.length > 0 ? (
            <div className="space-y-3">
              {leads.slice(0, 5).map((lead) => (
                <button
                  key={lead.id}
                  onClick={() => onSelectLead(lead.id)}
                  className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-muted transition-colors text-left"
                >
                  <div className="flex items-center gap-3">
                    <LeadAvatar name={lead.name} size="sm" />
                    <div>
                      <p className="text-sm font-medium text-card-foreground">{lead.name}</p>
                      <p className="text-xs text-muted-foreground">{lead.company || lead.phone}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      lead.urgency === 'critica' ? 'bg-destructive/10 text-destructive' :
                      lead.urgency === 'alta' ? 'bg-warning/10 text-warning' :
                      lead.urgency === 'media' ? 'bg-info/10 text-info' :
                      'bg-muted text-muted-foreground'
                    }`}>
                      {lead.urgency}
                    </span>
                    <span className="text-sm font-semibold text-card-foreground">{lead.score}</span>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="font-medium">Nenhum lead captado ainda</p>
              <p className="text-sm">Configure seu agente IA e conecte via n8n para começar a captar leads</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
