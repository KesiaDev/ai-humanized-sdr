import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, TrendingUp, MessageSquare, Target, Calendar, Award } from 'lucide-react';

async function fetchReportData() {
  const [leadsRes, convsRes, msgsRes] = await Promise.all([
    supabase.from('leads').select('status, score, source, created_at, urgency'),
    supabase.from('conversations').select('status, created_at'),
    supabase.from('messages').select('sender, created_at'),
  ]);
  return {
    leads: leadsRes.data ?? [],
    conversations: convsRes.data ?? [],
    messages: msgsRes.data ?? [],
  };
}

const STATUS_LABELS: Record<string, string> = {
  novo: 'Novo', contatado: 'Contatado', qualificado: 'Qualificado',
  proposta: 'Proposta', fechado: 'Fechado', perdido: 'Perdido',
};
const STATUS_COLORS: Record<string, string> = {
  novo: 'bg-slate-100 text-slate-700', contatado: 'bg-blue-100 text-blue-700',
  qualificado: 'bg-yellow-100 text-yellow-700', proposta: 'bg-purple-100 text-purple-700',
  fechado: 'bg-green-100 text-green-700', perdido: 'bg-red-100 text-red-700',
};
const SOURCE_LABELS: Record<string, string> = {
  whatsapp: 'WhatsApp', instagram: 'Instagram', site: 'Site',
  indicacao: 'Indicação', google: 'Google', outro: 'Outro',
};

export function ReportsView() {
  const { data, isLoading } = useQuery({ queryKey: ['reports'], queryFn: fetchReportData });

  if (isLoading || !data) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground text-sm">
        Carregando relatórios...
      </div>
    );
  }

  const { leads, conversations, messages } = data;
  const total = leads.length;
  const qualified = leads.filter(l => l.status === 'qualificado' || l.status === 'proposta' || l.status === 'fechado').length;
  const closed = leads.filter(l => l.status === 'fechado').length;
  const avgScore = total > 0 ? Math.round(leads.reduce((s, l) => s + (l.score ?? 0), 0) / total) : 0;
  const convRate = total > 0 ? Math.round((closed / total) * 100) : 0;
  const iaMessages = messages.filter(m => m.sender === 'ia').length;

  // By status
  const byStatus = Object.entries(STATUS_LABELS).map(([key, label]) => ({
    key, label, count: leads.filter(l => l.status === key).length,
  })).filter(s => s.count > 0);
  const maxStatus = Math.max(...byStatus.map(s => s.count), 1);

  // By source
  const bySource = Object.entries(SOURCE_LABELS).map(([key, label]) => ({
    key, label, count: leads.filter(l => l.source === key).length,
  })).filter(s => s.count > 0).sort((a, b) => b.count - a.count);

  // Last 7 days
  const last7 = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const dateStr = d.toISOString().split('T')[0];
    return {
      label: d.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit' }),
      leads: leads.filter(l => l.created_at?.startsWith(dateStr)).length,
      convs: conversations.filter(c => c.created_at?.startsWith(dateStr)).length,
    };
  });
  const maxDay = Math.max(...last7.map(d => d.leads + d.convs), 1);

  return (
    <div className="space-y-6 max-w-6xl">
      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { icon: Users, label: 'Total de Leads', value: total, color: 'text-blue-600' },
          { icon: Target, label: 'Qualificados', value: qualified, color: 'text-yellow-600' },
          { icon: Award, label: 'Fechados', value: closed, color: 'text-green-600' },
          { icon: TrendingUp, label: 'Conversão', value: `${convRate}%`, color: 'text-purple-600' },
          { icon: MessageSquare, label: 'Msg da IA', value: iaMessages, color: 'text-cyan-600' },
          { icon: Calendar, label: 'Score Médio', value: `${avgScore}/10`, color: 'text-orange-600' },
        ].map(kpi => (
          <Card key={kpi.label}>
            <CardContent className="pt-4 pb-3">
              <kpi.icon className={`w-5 h-5 mb-2 ${kpi.color}`} />
              <div className="text-2xl font-bold text-foreground">{kpi.value}</div>
              <div className="text-[11px] text-muted-foreground mt-0.5">{kpi.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Últimos 7 dias */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">Últimos 7 dias</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-2 h-32">
              {last7.map(day => (
                <div key={day.label} className="flex-1 flex flex-col items-center gap-1">
                  <div className="w-full flex flex-col gap-0.5" style={{ height: '100px' }}>
                    <div
                      className="w-full bg-primary/20 rounded-t-sm mt-auto"
                      style={{ height: `${(day.convs / maxDay) * 100}%` }}
                      title={`${day.convs} conversas`}
                    />
                    <div
                      className="w-full bg-primary rounded-t-sm"
                      style={{ height: `${(day.leads / maxDay) * 100}%` }}
                      title={`${day.leads} leads`}
                    />
                  </div>
                  <span className="text-[10px] text-muted-foreground">{day.label}</span>
                </div>
              ))}
            </div>
            <div className="flex gap-4 mt-3 text-[11px] text-muted-foreground">
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-primary inline-block" /> Leads</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-primary/20 inline-block" /> Conversas</span>
            </div>
          </CardContent>
        </Card>

        {/* Funil por status */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">Funil de Vendas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {byStatus.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-8">Nenhum lead cadastrado</p>
            ) : byStatus.map(s => (
              <div key={s.key} className="flex items-center gap-3">
                <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full w-20 text-center flex-shrink-0 ${STATUS_COLORS[s.key] ?? ''}`}>{s.label}</span>
                <div className="flex-1 bg-muted rounded-full h-2">
                  <div className="bg-primary rounded-full h-2 transition-all" style={{ width: `${(s.count / maxStatus) * 100}%` }} />
                </div>
                <span className="text-xs font-semibold text-foreground w-6 text-right">{s.count}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Por origem */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold">Origem dos Leads</CardTitle>
        </CardHeader>
        <CardContent>
          {bySource.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-8">Nenhum dado disponível</p>
          ) : (
            <div className="flex flex-wrap gap-3">
              {bySource.map(s => (
                <div key={s.key} className="flex items-center gap-2 bg-muted rounded-lg px-3 py-2">
                  <span className="text-xs font-medium text-foreground">{s.label}</span>
                  <Badge variant="secondary" className="text-xs">{s.count}</Badge>
                  <span className="text-[10px] text-muted-foreground">
                    {total > 0 ? Math.round((s.count / total) * 100) : 0}%
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
