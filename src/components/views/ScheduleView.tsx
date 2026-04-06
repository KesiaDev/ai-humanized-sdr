import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Clock, User, Plus, CalendarX } from 'lucide-react';
import { Button } from '@/components/ui/button';

const typeColors: Record<string, string> = {
  demo: 'bg-info/10 text-info border-l-info',
  followup: 'bg-warning/10 text-warning border-l-warning',
  meeting: 'bg-primary/10 text-primary border-l-primary',
  proposal: 'bg-accent text-accent-foreground border-l-accent-foreground',
  onboarding: 'bg-success/10 text-success border-l-success',
};

const typeLabels: Record<string, string> = {
  demo: 'Demo', followup: 'Follow-up', meeting: 'Reunião', proposal: 'Proposta', onboarding: 'Onboarding',
};

export function ScheduleView() {
  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="space-y-6 max-w-4xl">
      <Card className="shadow-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="font-display text-base flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" />
              Hoje — {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
            </CardTitle>
            <Button size="sm" variant="outline" className="gap-1.5">
              <Plus className="w-3.5 h-3.5" /> Novo Evento
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-muted-foreground">
            <CalendarX className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="font-medium">Nenhum evento agendado</p>
            <p className="text-sm">Os eventos aparecerão aqui quando forem criados pelo agente ou manualmente</p>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="font-display text-base">Próximos Dias</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <p className="text-sm">Nenhum evento futuro agendado</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
