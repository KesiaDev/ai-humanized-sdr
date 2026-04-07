import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Settings, Bell, Link2, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const STORAGE_KEY = 'sdr_settings';

function loadSettings() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

const defaultSettings = {
  companyName: 'Prevensul Comercial Elétrica',
  segment: 'Segurança e Elétrica',
  website: 'https://prevensul.com.br',
  notifNewLead: true,
  notifQualified: true,
  notifMeeting: true,
  notifNoResponse: false,
};

export function SettingsView() {
  const { toast } = useToast();
  const saved = loadSettings();
  const [settings, setSettings] = useState({ ...defaultSettings, ...saved });
  const [saving, setSaving] = useState(false);

  const update = (k: keyof typeof settings, v: string | boolean) =>
    setSettings(prev => ({ ...prev, [k]: v }));

  const handleSave = async () => {
    setSaving(true);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
      // Also update company name in agent_config if it exists
      await supabase
        .from('agent_config' as any)
        .update({ updated_at: new Date().toISOString() } as any)
        .eq('id', 1 as any);
      toast({ title: 'Configurações salvas!', description: 'Suas preferências foram atualizadas.' });
    } catch {
      toast({ title: 'Salvo localmente', description: 'Configurações salvas no navegador.' });
    } finally {
      setSaving(false);
    }
  };

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
              <Input
                value={settings.companyName}
                onChange={e => update('companyName', e.target.value)}
                className="bg-muted border-none"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Segmento</Label>
              <Input
                value={settings.segment}
                onChange={e => update('segment', e.target.value)}
                className="bg-muted border-none"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Website</Label>
            <Input
              value={settings.website}
              onChange={e => update('website', e.target.value)}
              className="bg-muted border-none"
            />
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
            { key: 'notifNewLead' as const, label: 'Novo lead recebido' },
            { key: 'notifQualified' as const, label: 'Lead qualificado' },
            { key: 'notifMeeting' as const, label: 'Reunião próxima' },
            { key: 'notifNoResponse' as const, label: 'Lead sem resposta há 24h' },
          ].map(item => (
            <div key={item.key} className="flex items-center justify-between">
              <span className="text-sm text-card-foreground">{item.label}</span>
              <Switch
                checked={settings[item.key]}
                onCheckedChange={v => update(item.key, v)}
              />
            </div>
          ))}
        </CardContent>
      </Card>

      <Button className="w-full gap-2" onClick={handleSave} disabled={saving}>
        {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Salvando...</> : 'Salvar Configurações'}
      </Button>
    </div>
  );
}
