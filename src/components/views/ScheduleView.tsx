<<<<<<< HEAD
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Clock, User, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

const mockEvents = [
  { id: '1', title: 'Demo com Ana Silva', time: '10:00', date: '2026-04-02', lead: 'Ana Silva', type: 'demo' },
  { id: '2', title: 'Follow-up Carlos Mendes', time: '14:00', date: '2026-04-02', lead: 'Carlos Mendes', type: 'followup' },
  { id: '3', title: 'Reunião Roberto Santos', time: '09:30', date: '2026-04-03', lead: 'Roberto Santos', type: 'meeting' },
  { id: '4', title: 'Proposta Juliana Pereira', time: '16:00', date: '2026-04-03', lead: 'Juliana Pereira', type: 'proposal' },
  { id: '5', title: 'Onboarding Marcos Oliveira', time: '11:00', date: '2026-04-04', lead: 'Marcos Oliveira', type: 'onboarding' },
];
=======
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Clock, User, Plus, CalendarX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';

interface ScheduleEvent {
  id: string;
  title: string;
  event_date: string;
  event_time: string;
  type: string;
  lead_name: string | null;
}
>>>>>>> af8b612617ead079803111f0945c88896d7ac9c9

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
<<<<<<< HEAD
  const today = new Date().toISOString().split('T')[0];
  const todayEvents = mockEvents.filter(e => e.date === today);
  const futureEvents = mockEvents.filter(e => e.date > today);

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Today */}
=======
  const [events, setEvents] = useState<ScheduleEvent[]>([]);
  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    fetchEvents();
    const channel = supabase
      .channel('events-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'schedule_events' }, () => fetchEvents())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const fetchEvents = async () => {
    const { data } = await supabase.from('schedule_events').select('*').order('event_date').order('event_time');
    if (data) setEvents(data);
  };

  const todayEvents = events.filter(e => e.event_date === today);
  const futureEvents = events.filter(e => e.event_date > today);

  return (
    <div className="space-y-6 max-w-4xl">
>>>>>>> af8b612617ead079803111f0945c88896d7ac9c9
      <Card className="shadow-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="font-display text-base flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" />
<<<<<<< HEAD
              Hoje — {new Date(today).toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
=======
              Hoje — {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
>>>>>>> af8b612617ead079803111f0945c88896d7ac9c9
            </CardTitle>
            <Button size="sm" variant="outline" className="gap-1.5">
              <Plus className="w-3.5 h-3.5" /> Novo Evento
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {todayEvents.length > 0 ? (
            <div className="space-y-3">
              {todayEvents.map(event => (
<<<<<<< HEAD
                <div key={event.id} className={`p-4 rounded-lg border-l-4 ${typeColors[event.type]}`}>
=======
                <div key={event.id} className={`p-4 rounded-lg border-l-4 ${typeColors[event.type] || 'bg-muted'}`}>
>>>>>>> af8b612617ead079803111f0945c88896d7ac9c9
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-sm text-card-foreground">{event.title}</h4>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
<<<<<<< HEAD
                          <Clock className="w-3 h-3" /> {event.time}
                        </span>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <User className="w-3 h-3" /> {event.lead}
                        </span>
                      </div>
                    </div>
                    <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                      {typeLabels[event.type]}
=======
                          <Clock className="w-3 h-3" /> {event.event_time}
                        </span>
                        {event.lead_name && (
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <User className="w-3 h-3" /> {event.lead_name}
                          </span>
                        )}
                      </div>
                    </div>
                    <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                      {typeLabels[event.type] || event.type}
>>>>>>> af8b612617ead079803111f0945c88896d7ac9c9
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
<<<<<<< HEAD
            <p className="text-sm text-muted-foreground text-center py-6">Nenhum evento para hoje</p>
=======
            <div className="text-center py-12 text-muted-foreground">
              <CalendarX className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="font-medium">Nenhum evento agendado</p>
              <p className="text-sm">Os eventos aparecerão aqui quando forem criados pelo agente ou manualmente</p>
            </div>
>>>>>>> af8b612617ead079803111f0945c88896d7ac9c9
          )}
        </CardContent>
      </Card>

<<<<<<< HEAD
      {/* Upcoming */}
=======
>>>>>>> af8b612617ead079803111f0945c88896d7ac9c9
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="font-display text-base">Próximos Dias</CardTitle>
        </CardHeader>
        <CardContent>
<<<<<<< HEAD
          <div className="space-y-3">
            {futureEvents.map(event => (
              <div key={event.id} className={`p-4 rounded-lg border-l-4 ${typeColors[event.type]}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-sm text-card-foreground">{event.title}</h4>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Calendar className="w-3 h-3" /> {new Date(event.date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                      </span>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {event.time}
                      </span>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <User className="w-3 h-3" /> {event.lead}
                      </span>
                    </div>
                  </div>
                  <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                    {typeLabels[event.type]}
                  </span>
                </div>
              </div>
            ))}
          </div>
=======
          {futureEvents.length > 0 ? (
            <div className="space-y-3">
              {futureEvents.map(event => (
                <div key={event.id} className={`p-4 rounded-lg border-l-4 ${typeColors[event.type] || 'bg-muted'}`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-sm text-card-foreground">{event.title}</h4>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Calendar className="w-3 h-3" /> {new Date(event.event_date + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                        </span>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {event.event_time}
                        </span>
                        {event.lead_name && (
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <User className="w-3 h-3" /> {event.lead_name}
                          </span>
                        )}
                      </div>
                    </div>
                    <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                      {typeLabels[event.type] || event.type}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <p className="text-sm">Nenhum evento futuro agendado</p>
            </div>
          )}
>>>>>>> af8b612617ead079803111f0945c88896d7ac9c9
        </CardContent>
      </Card>
    </div>
  );
}
