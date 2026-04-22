import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, Plus, Phone, Mail, Building2, Filter, Users } from 'lucide-react';
import { Lead } from '@/types/lead';
import { LeadAvatar } from '@/components/ui/lead-avatar';

interface LeadsViewProps {
  leads: Lead[];
  onSelectLead: (id: string) => void;
}

const statusColors: Record<string, string> = {
  novo: 'bg-info/10 text-info border-info/20',
  contatado: 'bg-warning/10 text-warning border-warning/20',
  qualificado: 'bg-primary/10 text-primary border-primary/20',
  proposta: 'bg-accent text-accent-foreground border-accent-foreground/20',
  fechado: 'bg-success/10 text-success border-success/20',
  perdido: 'bg-destructive/10 text-destructive border-destructive/20',
};

const statusLabels: Record<string, string> = {
  novo: 'Novo',
  contatado: 'Contatado',
  qualificado: 'Qualificado',
  proposta: 'Proposta',
  fechado: 'Fechado',
  perdido: 'Perdido',
};

export function LeadsView({ leads, onSelectLead }: LeadsViewProps) {
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<string | null>(null);

  const filtered = leads.filter(l => {
    const matchSearch = l.name.toLowerCase().includes(search.toLowerCase()) ||
      l.company.toLowerCase().includes(search.toLowerCase()) ||
      l.email.toLowerCase().includes(search.toLowerCase());
    const matchStatus = !filterStatus || l.status === filterStatus;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome, empresa, email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-card border-border"
          />
        </div>
        <div className="flex gap-2">
          <div className="flex gap-1 flex-wrap">
            <Button
              variant={filterStatus === null ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterStatus(null)}
              className="text-xs"
            >
              Todos
            </Button>
            {Object.keys(statusLabels).map(status => (
              <Button
                key={status}
                variant={filterStatus === status ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterStatus(status)}
                className="text-xs"
              >
                {statusLabels[status]}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Leads Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map((lead) => (
          <Card
            key={lead.id}
            className="shadow-card hover:shadow-elevated transition-all cursor-pointer group"
            onClick={() => onSelectLead(lead.id)}
          >
            <CardContent className="p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <LeadAvatar name={lead.name} size="md" />
                  <div>
                    <h3 className="font-display font-semibold text-sm text-card-foreground group-hover:text-primary transition-colors">
                      {lead.name}
                    </h3>
                    <p className="text-xs text-muted-foreground">{lead.position}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-display font-bold text-primary">{lead.score}</div>
                  <div className="text-[10px] text-muted-foreground uppercase">Score</div>
                </div>
              </div>

              <div className="space-y-1.5 mb-3">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Building2 className="w-3.5 h-3.5" />
                  <span>{lead.company}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Mail className="w-3.5 h-3.5" />
                  <span>{lead.email}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Phone className="w-3.5 h-3.5" />
                  <span>{lead.phone}</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <Badge variant="outline" className={`text-[11px] ${statusColors[lead.status]}`}>
                  {statusLabels[lead.status]}
                </Badge>
                <div className="flex gap-1">
                  {lead.tags.map(tag => (
                    <span key={tag} className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="font-medium">Nenhum lead encontrado</p>
          <p className="text-sm">Tente ajustar os filtros de busca</p>
        </div>
      )}
    </div>
  );
}
