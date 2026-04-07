import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Settings, Globe, Bell, Palette, Link2 } from 'lucide-react';

export function SettingsView() {
  return (
    <div className="space-y-6 max-w-3xl">
      {/* General */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="font-display text-base flex items-center gap-2">
            <Settings className="w-5 h-5 text-primary" /> Geral
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-1.5">
              <Label className="text-xs">Nome da Empresa</Label>
              <Input defaultValue="Sua Empresa" className="bg-muted border-none" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Segmento</Label>
              <Input defaultValue="Tecnologia" className="bg-muted border-none" />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Website</Label>
            <Input defaultValue="https://suaempresa.com.br" className="bg-muted border-none" />
          </div>
        </CardContent>
      </Card>

      {/* Integrations */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="font-display text-base flex items-center gap-2">
            <Link2 className="w-5 h-5 text-primary" /> Integrações
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[
            { name: 'WhatsApp Business', desc: 'Conecte sua conta do WhatsApp para atendimento', connected: false },
            { name: 'CRM', desc: 'Sincronize leads com seu CRM favorito', connected: false },
            { name: 'Google Calendar', desc: 'Sincronize agenda de reuniões', connected: false },
            { name: 'E-mail', desc: 'Envie follow-ups por email automaticamente', connected: false },
          ].map(integration => (
            <div key={integration.name} className="flex items-center justify-between p-3 rounded-lg bg-muted">
              <div>
                <p className="text-sm font-medium text-card-foreground">{integration.name}</p>
                <p className="text-xs text-muted-foreground">{integration.desc}</p>
              </div>
              <Button variant="outline" size="sm" className="text-xs">
                Conectar
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="font-display text-base flex items-center gap-2">
            <Bell className="w-5 h-5 text-primary" /> Notificações
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[
            { label: 'Novo lead recebido', defaultChecked: true },
            { label: 'Lead qualificado', defaultChecked: true },
            { label: 'Reunião próxima', defaultChecked: true },
            { label: 'Lead sem resposta há 24h', defaultChecked: false },
          ].map(item => (
            <div key={item.label} className="flex items-center justify-between">
              <span className="text-sm text-card-foreground">{item.label}</span>
              <Switch defaultChecked={item.defaultChecked} />
            </div>
          ))}
        </CardContent>
      </Card>

      <Button className="w-full">Salvar Configurações</Button>
    </div>
  );
}
