import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, FileSpreadsheet, FileJson, FileText } from 'lucide-react';
import { Lead } from '@/types/lead';

interface ExportViewProps {
  leads: Lead[];
}

export function ExportView({ leads }: ExportViewProps) {
  const handleExport = (format: string) => {
    let content = '';
    let filename = '';
    let mimeType = '';

    if (format === 'csv') {
      const headers = 'Nome,Email,Telefone,Empresa,Status,Score,Urgência\n';
      const rows = leads.map(l => `${l.name},${l.email},${l.phone},${l.company},${l.status},${l.score},${l.urgency}`).join('\n');
      content = headers + rows;
      filename = 'leads.csv';
      mimeType = 'text/csv';
    } else if (format === 'json') {
      content = JSON.stringify(leads, null, 2);
      filename = 'leads.json';
      mimeType = 'application/json';
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="font-display text-base flex items-center gap-2">
            <Download className="w-5 h-5 text-primary" /> Exportar Dados
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Exporte seus {leads.length} leads em diferentes formatos.
          </p>

          <div className="grid gap-3 md:grid-cols-2">
            <button
              onClick={() => handleExport('csv')}
              className="flex items-center gap-4 p-5 rounded-xl bg-muted hover:bg-accent transition-colors text-left group"
            >
              <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center">
                <FileSpreadsheet className="w-6 h-6 text-success" />
              </div>
              <div>
                <p className="font-display font-semibold text-sm text-card-foreground group-hover:text-primary transition-colors">CSV</p>
                <p className="text-xs text-muted-foreground">Compatível com Excel</p>
              </div>
            </button>

            <button
              onClick={() => handleExport('json')}
              className="flex items-center gap-4 p-5 rounded-xl bg-muted hover:bg-accent transition-colors text-left group"
            >
              <div className="w-12 h-12 rounded-xl bg-warning/10 flex items-center justify-center">
                <FileJson className="w-6 h-6 text-warning" />
              </div>
              <div>
                <p className="font-display font-semibold text-sm text-card-foreground group-hover:text-primary transition-colors">JSON</p>
                <p className="text-xs text-muted-foreground">Para integrações</p>
              </div>
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
