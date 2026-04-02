import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Bot, MessageSquare, Zap, Shield, Sparkles } from 'lucide-react';

export function AgentConfigView() {
  return (
    <div className="space-y-6 max-w-4xl">
      <Card className="shadow-card">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
              <Bot className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <CardTitle className="font-display text-base">Configuração do Agente IA</CardTitle>
              <p className="text-xs text-muted-foreground">Personalize como a IA interage com seus leads</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Identity */}
          <div className="space-y-3">
            <h3 className="font-display font-semibold text-sm flex items-center gap-2 text-card-foreground">
              <Sparkles className="w-4 h-4 text-primary" /> Identidade
            </h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-1.5">
                <Label className="text-xs">Nome do Agente</Label>
                <Input defaultValue="Sofia" className="bg-muted border-none" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Cargo / Função</Label>
                <Input defaultValue="Consultora de Vendas" className="bg-muted border-none" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Nome da Empresa</Label>
              <Input defaultValue="Sua Empresa" className="bg-muted border-none" />
            </div>
          </div>

          {/* Personality */}
          <div className="space-y-3">
            <h3 className="font-display font-semibold text-sm flex items-center gap-2 text-card-foreground">
              <MessageSquare className="w-4 h-4 text-primary" /> Personalidade & Tom
            </h3>
            <div className="space-y-1.5">
              <Label className="text-xs">Instruções de comportamento</Label>
              <Textarea
                defaultValue="Seja amigável, profissional e empática. Use linguagem simples e direta. Faça perguntas para entender a necessidade do cliente antes de apresentar soluções. Sempre demonstre interesse genuíno."
                className="bg-muted border-none min-h-[100px]"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Descrição do produto/serviço</Label>
              <Textarea
                defaultValue="Descreva aqui o que sua empresa oferece para que a IA possa responder com precisão."
                className="bg-muted border-none min-h-[80px]"
              />
            </div>
          </div>

          {/* Automation */}
          <div className="space-y-3">
            <h3 className="font-display font-semibold text-sm flex items-center gap-2 text-card-foreground">
              <Zap className="w-4 h-4 text-primary" /> Automação
            </h3>
            <div className="space-y-4">
              {[
                { label: 'Responder automaticamente', desc: 'IA responde leads automaticamente ao primeiro contato', defaultChecked: true },
                { label: 'Qualificação automática', desc: 'Classificar leads por score baseado na conversa', defaultChecked: true },
                { label: 'Follow-up automático', desc: 'Enviar mensagens de acompanhamento quando não há resposta', defaultChecked: false },
                { label: 'Agendamento automático', desc: 'Oferecer horários disponíveis para reunião', defaultChecked: true },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between p-3 rounded-lg bg-muted">
                  <div>
                    <p className="text-sm font-medium text-card-foreground">{item.label}</p>
                    <p className="text-xs text-muted-foreground">{item.desc}</p>
                  </div>
                  <Switch defaultChecked={item.defaultChecked} />
                </div>
              ))}
            </div>
          </div>

          {/* Guardrails */}
          <div className="space-y-3">
            <h3 className="font-display font-semibold text-sm flex items-center gap-2 text-card-foreground">
              <Shield className="w-4 h-4 text-primary" /> Limites & Segurança
            </h3>
            <div className="space-y-1.5">
              <Label className="text-xs">Tópicos que a IA NÃO deve abordar</Label>
              <Textarea
                defaultValue="Preços específicos sem aprovação, descontos não autorizados, informações de concorrentes"
                className="bg-muted border-none min-h-[60px]"
              />
            </div>
          </div>

          <Button className="w-full">Salvar Configurações</Button>
        </CardContent>
      </Card>
    </div>
  );
}
