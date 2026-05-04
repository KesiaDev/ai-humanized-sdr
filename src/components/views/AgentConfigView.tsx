import { useState, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Settings, MessageSquare, Sparkles, Mic, Zap, FileText, BookOpen,
  RefreshCw, Calendar, Target, Bot, Power, PowerOff, Save, Plus, X,
  ChevronDown, ChevronUp, HelpCircle, Loader2, CheckCircle, Layout,
} from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useToast } from '@/hooks/use-toast';
import { getAgentConfig, updateAgentConfig, DEFAULT_AGENT_CONFIG, type FullAgentConfig } from '@/lib/api';

const agentSections = [
  { id: 'configuracoes', label: 'Configurações', icon: Settings },
  { id: 'comunicacao', label: 'Comunicação', icon: MessageSquare },
  { id: 'humanizacao', label: 'Humanização', icon: Sparkles },
  { id: 'voz', label: 'Voz', icon: Mic },
  { id: 'gatilhos', label: 'Gatilhos', icon: Zap },
  { id: 'instrucoes', label: 'Instruções', icon: FileText },
  { id: 'base-conhecimento', label: 'Base de Conhecimento', icon: BookOpen },
  { id: 'seguir', label: 'Seguir', icon: RefreshCw },
  { id: 'agenda', label: 'Agenda', icon: Calendar },
  { id: 'intencoes', label: 'Intenções', icon: Target },
  { id: 'templates', label: 'Templates', icon: Layout },
];

type SectionProps = {
  config: FullAgentConfig;
  onChange: (p: Partial<FullAgentConfig>) => void;
};

function InfoTooltip({ text }: { text: string }) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <HelpCircle className="w-3.5 h-3.5 text-muted-foreground cursor-help" />
        </TooltipTrigger>
        <TooltipContent className="max-w-[250px] text-xs">{text}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

function KeywordInput({ keywords, onChange }: { keywords: string[]; onChange: (k: string[]) => void }) {
  const [input, setInput] = useState('');
  const add = () => {
    const trimmed = input.trim();
    if (trimmed && !keywords.includes(trimmed)) {
      onChange([...keywords, trimmed]);
      setInput('');
    }
  };
  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2 min-h-[36px] p-2 rounded-lg bg-muted border border-border">
        {keywords.map(k => (
          <Badge key={k} variant="secondary" className="bg-primary/15 text-primary gap-1 px-2 py-1">
            {k}
            <button onClick={() => onChange(keywords.filter(x => x !== k))}><X className="w-3 h-3" /></button>
          </Badge>
        ))}
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), add())}
          placeholder="Digite e pressione Enter"
          className="bg-transparent outline-none text-sm flex-1 min-w-[120px] text-foreground placeholder:text-muted-foreground"
        />
      </div>
      <Button type="button" variant="outline" size="sm" onClick={add}>Adicionar</Button>
    </div>
  );
}

// --- Section Components ---

function ConfiguracoesSection({ config, onChange }: SectionProps) {
  const channels = [
    { key: 'channelWhatsApp' as const, label: 'WhatsApp' },
    { key: 'channelInstagram' as const, label: 'Instagram' },
    { key: 'channelFacebook' as const, label: 'Facebook Messenger' },
    { key: 'channelSiteChat' as const, label: 'Chat do Site' },
    { key: 'channelEmail' as const, label: 'Email' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-lg font-semibold text-foreground">Status do Agente</h2>
        <div className="flex gap-3 mt-3">
          <Button
            variant={config.active ? 'default' : 'outline'}
            onClick={() => onChange({ active: true })}
            className="gap-2"
          >
            <Power className="w-4 h-4" /> ATIVO
          </Button>
          <Button
            variant={!config.active ? 'destructive' : 'outline'}
            onClick={() => onChange({ active: false })}
            className="gap-2"
          >
            <PowerOff className="w-4 h-4" /> DESLIGAR
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="pt-6">
          <Tabs defaultValue="info-basicas">
            <TabsList className="w-full justify-start bg-muted/50 mb-6">
              <TabsTrigger value="info-basicas">Informações Básicas</TabsTrigger>
              <TabsTrigger value="horario">Horário de Funcionamento</TabsTrigger>
              <TabsTrigger value="canais">Canais de Comunicação</TabsTrigger>
              <TabsTrigger value="credenciais">Credenciais Avançadas</TabsTrigger>
            </TabsList>

            <TabsContent value="info-basicas" className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-sm font-medium">Nome do Agente</Label>
                <Input value={config.agentName} onChange={e => onChange({ agentName: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm font-medium">Descrição do Agente</Label>
                <Textarea value={config.agentDescription} onChange={e => onChange({ agentDescription: e.target.value })} className="min-h-[100px]" />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium">Cargo / Função</Label>
                  <Input value={config.role} onChange={e => onChange({ role: e.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium">Nome da Empresa</Label>
                  <Input value={config.companyName} onChange={e => onChange({ companyName: e.target.value })} />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm font-medium">Idioma Principal</Label>
                <Select value={config.language} onValueChange={v => onChange({ language: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pt-br">Português (Brasil)</SelectItem>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="es">Español</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </TabsContent>

            <TabsContent value="horario" className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted">
                <div>
                  <p className="text-sm font-medium">Responder 24/7</p>
                  <p className="text-xs text-muted-foreground">O agente responde a qualquer hora</p>
                </div>
                <Switch checked={config.alwaysOn} onCheckedChange={v => onChange({ alwaysOn: v })} />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium">Início do Expediente</Label>
                  <Input type="time" value={config.startTime} onChange={e => onChange({ startTime: e.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium">Fim do Expediente</Label>
                  <Input type="time" value={config.endTime} onChange={e => onChange({ endTime: e.target.value })} />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm font-medium">Mensagem fora do horário</Label>
                <Textarea value={config.offHoursMsg} onChange={e => onChange({ offHoursMsg: e.target.value })} />
              </div>
            </TabsContent>

            <TabsContent value="canais" className="space-y-4">
              {channels.map(ch => (
                <div key={ch.key} className="flex items-center justify-between p-3 rounded-lg bg-muted">
                  <p className="text-sm font-medium">{ch.label}</p>
                  <Switch
                    checked={config[ch.key]}
                    onCheckedChange={v => onChange({ [ch.key]: v })}
                  />
                </div>
              ))}
            </TabsContent>

            <TabsContent value="credenciais" className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-sm font-medium">API Key (opcional)</Label>
                <Input type="password" value={config.apiKey} onChange={e => onChange({ apiKey: e.target.value })} placeholder="sk-..." />
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm font-medium">Webhook URL</Label>
                <Input value={config.webhookUrl} onChange={e => onChange({ webhookUrl: e.target.value })} placeholder="https://..." />
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

function ComunicacaoSection({ config, onChange }: SectionProps) {
  return (
    <div className="space-y-6">
      <h2 className="font-display text-lg font-semibold text-foreground">Comunicação</h2>
      <Card>
        <CardContent className="pt-6">
          <Tabs defaultValue="comunicacao-geral">
            <TabsList className="w-full justify-start bg-muted/50 mb-6">
              <TabsTrigger value="comunicacao-geral">+ de Comunicação</TabsTrigger>
              <TabsTrigger value="linguagem">Linguagem e Estilo</TabsTrigger>
              <TabsTrigger value="humanizacao-texto">Humanização do Texto</TabsTrigger>
              <TabsTrigger value="modelos" disabled>Modelos <Badge variant="outline" className="ml-1 text-[10px]">em breve</Badge></TabsTrigger>
              <TabsTrigger value="config-voz">Configuração de Voz</TabsTrigger>
            </TabsList>

            <TabsContent value="comunicacao-geral" className="space-y-6">
              <div>
                <h3 className="font-display font-semibold text-base mb-4">Ritmo de Resposta</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label className="text-sm font-medium flex items-center gap-1.5">
                      Buffer (latência) <InfoTooltip text="Tempo em segundos que o agente aguarda antes de responder" />
                    </Label>
                    <div className="flex items-center gap-2">
                      <Input type="number" value={config.bufferSec} onChange={e => onChange({ bufferSec: Number(e.target.value) })} className="w-24" />
                      <span className="text-sm text-muted-foreground">seg</span>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-sm font-medium flex items-center gap-1.5">
                      Tempo entre <InfoTooltip text="Intervalo entre mensagens consecutivas" />
                    </Label>
                    <div className="flex items-center gap-2">
                      <Input type="number" value={config.timeBetweenSec} onChange={e => onChange({ timeBetweenSec: Number(e.target.value) })} className="w-24" />
                      <span className="text-sm text-muted-foreground">seg</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm font-medium flex items-center gap-1.5">
                  Resposta de erro <InfoTooltip text="Texto que a IA responderá em caso de erro no processamento" />
                </Label>
                <p className="text-xs text-muted-foreground">Digite o texto que a IA responderá em caso de erro no processamento</p>
                <Textarea value={config.errorResponse} onChange={e => onChange({ errorResponse: e.target.value })} className="min-h-[80px]" />
              </div>
            </TabsContent>

            <TabsContent value="linguagem" className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-sm font-medium">Tom de comunicação</Label>
                <Select value={config.tone} onValueChange={v => onChange({ tone: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="formal">Formal</SelectItem>
                    <SelectItem value="amigavel">Amigável</SelectItem>
                    <SelectItem value="casual">Casual</SelectItem>
                    <SelectItem value="tecnico">Técnico</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted">
                <Label className="text-sm font-medium">Usar emojis</Label>
                <Switch checked={config.useEmojis} onCheckedChange={v => onChange({ useEmojis: v })} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm font-medium">Tamanho máximo da resposta</Label>
                <div className="flex items-center gap-2">
                  <Input type="number" value={config.maxResponseLength} onChange={e => onChange({ maxResponseLength: Number(e.target.value) })} className="w-28" />
                  <span className="text-sm text-muted-foreground">caracteres</span>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="humanizacao-texto" className="space-y-4">
              {[
                { key: 'simulateTyping' as const, label: 'Simular erros de digitação', desc: 'Adiciona pequenos erros naturais ocasionalmente' },
                { key: 'vocabularyVariation' as const, label: 'Variação de saudações', desc: 'Alterna entre diferentes formas de cumprimento' },
                { key: 'contextMemory' as const, label: 'Pausas naturais', desc: 'Simula tempo de leitura e digitação' },
                { key: 'naturalReactions' as const, label: 'Gírias regionais', desc: 'Usa expressões comuns da região configurada' },
              ].map(item => (
                <div key={item.key} className="flex items-center justify-between p-3 rounded-lg bg-muted">
                  <div>
                    <p className="text-sm font-medium">{item.label}</p>
                    <p className="text-xs text-muted-foreground">{item.desc}</p>
                  </div>
                  <Switch checked={config[item.key] as boolean} onCheckedChange={v => onChange({ [item.key]: v })} />
                </div>
              ))}
            </TabsContent>

            <TabsContent value="config-voz" className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-sm font-medium">Voz padrão</Label>
                <Select value={config.voiceSelected} onValueChange={v => onChange({ voiceSelected: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="feminina-1">Feminina Natural 1</SelectItem>
                    <SelectItem value="feminina-2">Feminina Natural 2</SelectItem>
                    <SelectItem value="masculina-1">Masculina Natural 1</SelectItem>
                    <SelectItem value="masculina-2">Masculina Natural 2</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm font-medium">Velocidade da fala</Label>
                <Select value={config.voiceSpeed} onValueChange={v => onChange({ voiceSpeed: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="lenta">Lenta</SelectItem>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="rapida">Rápida</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

function HumanizacaoSection({ config, onChange }: SectionProps) {
  const items = [
    { key: 'simulateTyping' as const, label: 'Digitação simulada', desc: 'Mostra "digitando..." com tempo proporcional à mensagem' },
    { key: 'vocabularyVariation' as const, label: 'Variação de vocabulário', desc: 'Evita repetir as mesmas palavras e expressões' },
    { key: 'contextMemory' as const, label: 'Memória de contexto', desc: 'Lembra detalhes mencionados na conversa' },
    { key: 'splitMessages' as const, label: 'Respostas parciais', desc: 'Divide respostas longas em mensagens menores' },
    { key: 'audioResponses' as const, label: 'Respostas com áudio', desc: 'Envia áudios simulados em momentos estratégicos' },
    { key: 'naturalReactions' as const, label: 'Reações naturais', desc: 'Usa interjeições e reações como "Que legal!" e "Entendi!"' },
  ];

  return (
    <div className="space-y-6">
      <h2 className="font-display text-lg font-semibold text-foreground">Humanização</h2>
      <Card>
        <CardContent className="pt-6 space-y-4">
          <p className="text-sm text-muted-foreground">Configure como o agente simula comportamento humano nas conversas.</p>
          {items.map(item => (
            <div key={item.key} className="flex items-center justify-between p-3 rounded-lg bg-muted">
              <div>
                <p className="text-sm font-medium">{item.label}</p>
                <p className="text-xs text-muted-foreground">{item.desc}</p>
              </div>
              <Switch checked={config[item.key] as boolean} onCheckedChange={v => onChange({ [item.key]: v })} />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

function VozSection({ config, onChange }: SectionProps) {
  return (
    <div className="space-y-6">
      <h2 className="font-display text-lg font-semibold text-foreground">Voz</h2>
      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="space-y-1.5">
            <Label className="text-sm font-medium">Motor de voz</Label>
            <Select value={config.voiceEngine} onValueChange={v => onChange({ voiceEngine: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="elevenlabs">ElevenLabs</SelectItem>
                <SelectItem value="google">Google TTS</SelectItem>
                <SelectItem value="azure">Azure Speech</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-sm font-medium">Voz selecionada</Label>
            <Select value={config.voiceSelected} onValueChange={v => onChange({ voiceSelected: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="sofia">Sofia - Feminina Natural</SelectItem>
                <SelectItem value="pedro">Pedro - Masculina Natural</SelectItem>
                <SelectItem value="ana">Ana - Feminina Suave</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center justify-between p-3 rounded-lg bg-muted">
            <div>
              <p className="text-sm font-medium">Enviar áudios automaticamente</p>
              <p className="text-xs text-muted-foreground">Em momentos estratégicos, o agente envia áudio ao invés de texto</p>
            </div>
            <Switch checked={config.autoAudio} onCheckedChange={v => onChange({ autoAudio: v })} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function GatilhosSection({ config, onChange }: SectionProps) {
  const [openTriggers, setOpenTriggers] = useState([true, false]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-lg font-semibold text-foreground flex items-center gap-2">
          Gatilhos <Badge className="bg-primary/15 text-primary text-[10px]">i</Badge>
        </h2>
        <p className="text-sm text-muted-foreground">Configurar gatilhos automáticos para o seu agente</p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <Tabs defaultValue="nativo">
            <TabsList className="w-full justify-start bg-muted/50 mb-6">
              <TabsTrigger value="nativo" className="gap-1.5"><FileText className="w-3.5 h-3.5" /> Nativo</TabsTrigger>
              <TabsTrigger value="mensagem" className="gap-1.5"><MessageSquare className="w-3.5 h-3.5" /> Mensagem</TabsTrigger>
              <TabsTrigger value="externos" disabled>
                <RefreshCw className="w-3.5 h-3.5 mr-1" /> Externos <Badge variant="outline" className="ml-1 text-[10px]">em breve</Badge>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="nativo" className="space-y-4">
              {['Central de Atendimento WhatsApp', 'Disparador API Oficial WhatsApp'].map((title, i) => (
                <div key={title} className="border border-border rounded-lg">
                  <button
                    className="w-full flex items-center justify-between p-4 text-left"
                    onClick={() => setOpenTriggers(prev => prev.map((v, idx) => idx === i ? !v : v))}
                  >
                    <div>
                      <h4 className="font-display font-semibold text-sm">{title}</h4>
                      <p className="text-xs text-muted-foreground">Configure palavras-chave para ativar o agente</p>
                    </div>
                    {openTriggers[i] ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                  {openTriggers[i] && (
                    <div className="px-4 pb-4 space-y-4 border-t border-border pt-4">
                      <div className="space-y-1.5">
                        <Label className="text-sm font-medium">Mensagem de Ativação</Label>
                        <Select value={config.triggerMode} onValueChange={v => onChange({ triggerMode: v })}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="qualquer">Qualquer Mensagem</SelectItem>
                            <SelectItem value="especifica">Mensagem Específica</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-sm font-medium">Tipo de lag</Label>
                        <Select value={config.triggerMatchType} onValueChange={v => onChange({ triggerMatchType: v })}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="igual">Igual a (exato)</SelectItem>
                            <SelectItem value="contem">Contém</SelectItem>
                            <SelectItem value="comeca">Começa com</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-sm font-medium">Palavras-chave</Label>
                        <KeywordInput
                          keywords={config.keywords}
                          onChange={kw => onChange({ keywords: kw })}
                        />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </TabsContent>

            <TabsContent value="mensagem" className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-sm font-medium">Mensagem de boas-vindas</Label>
                <Textarea value={config.welcomeMsg} onChange={e => onChange({ welcomeMsg: e.target.value })} className="min-h-[80px]" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm font-medium">Mensagem de encerramento</Label>
                <Textarea value={config.closingMsg} onChange={e => onChange({ closingMsg: e.target.value })} className="min-h-[80px]" />
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

function InstrucoesSection({ config, onChange }: SectionProps) {
  return (
    <div className="space-y-6">
      <h2 className="font-display text-lg font-semibold text-foreground">Instruções</h2>
      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="space-y-1.5">
            <Label className="text-sm font-medium">Prompt do Sistema</Label>
            <p className="text-xs text-muted-foreground">Instruções gerais de comportamento da IA</p>
            <Textarea
              value={config.systemPrompt}
              onChange={e => onChange({ systemPrompt: e.target.value })}
              className="min-h-[150px] font-mono text-sm"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-sm font-medium">Descrição do produto/serviço</Label>
            <Textarea
              value={config.productDescription}
              onChange={e => onChange({ productDescription: e.target.value })}
              className="min-h-[100px]"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-sm font-medium">Tópicos proibidos</Label>
            <p className="text-xs text-muted-foreground">Assuntos que a IA NÃO deve abordar</p>
            <Textarea
              value={config.forbiddenTopics}
              onChange={e => onChange({ forbiddenTopics: e.target.value })}
              className="min-h-[80px]"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-sm font-medium">Perguntas de qualificação</Label>
            <Textarea
              value={config.qualificationQuestions}
              onChange={e => onChange({ qualificationQuestions: e.target.value })}
              className="min-h-[120px]"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function BaseConhecimentoSection({ config, onChange }: SectionProps) {
  return (
    <div className="space-y-6">
      <h2 className="font-display text-lg font-semibold text-foreground">Base de Conhecimento</h2>
      <Card>
        <CardContent className="pt-6 space-y-4">
          <p className="text-sm text-muted-foreground">Adicione documentos e informações para que a IA possa consultar durante as conversas.</p>
          <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
            <BookOpen className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm font-medium">Arraste arquivos ou clique para enviar</p>
            <p className="text-xs text-muted-foreground mt-1">PDF, DOCX, TXT — máx. 10MB</p>
            <Button variant="outline" className="mt-4">
              <Plus className="w-4 h-4 mr-1" /> Enviar Documento
            </Button>
          </div>
          <div className="space-y-1.5">
            <Label className="text-sm font-medium">URL para consulta</Label>
            <div className="flex gap-2">
              <Input
                value={config.knowledgeUrl}
                onChange={e => onChange({ knowledgeUrl: e.target.value })}
                placeholder="https://seusite.com.br/faq"
                className="flex-1"
              />
              <Button variant="outline"><Plus className="w-4 h-4" /></Button>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-sm font-medium">FAQ manual</Label>
            <Textarea
              value={config.faqContent}
              onChange={e => onChange({ faqContent: e.target.value })}
              placeholder="Pergunta: Como funciona o serviço?&#10;Resposta: ..."
              className="min-h-[120px]"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function SeguirSection({ config, onChange }: SectionProps) {
  return (
    <div className="space-y-6">
      <h2 className="font-display text-lg font-semibold text-foreground">Follow-up (Seguir)</h2>
      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="flex items-center justify-between p-3 rounded-lg bg-muted">
            <div>
              <p className="text-sm font-medium">Follow-up automático</p>
              <p className="text-xs text-muted-foreground">Enviar mensagens de acompanhamento quando não há resposta</p>
            </div>
            <Switch checked={config.followUpEnabled} onCheckedChange={v => onChange({ followUpEnabled: v })} />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Primeiro follow-up após</Label>
              <div className="flex items-center gap-2">
                <Input type="number" value={config.followUpDelayHours} onChange={e => onChange({ followUpDelayHours: Number(e.target.value) })} className="w-20" />
                <span className="text-sm text-muted-foreground">horas</span>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Máximo de tentativas</Label>
              <Input type="number" value={config.maxAttempts} onChange={e => onChange({ maxAttempts: Number(e.target.value) })} className="w-20" />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-sm font-medium">Mensagem de follow-up</Label>
            <Textarea value={config.followUpMsg} onChange={e => onChange({ followUpMsg: e.target.value })} className="min-h-[80px]" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-sm font-medium">Mensagem de última tentativa</Label>
            <Textarea value={config.finalMsg} onChange={e => onChange({ finalMsg: e.target.value })} className="min-h-[80px]" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function AgendaSection({ config, onChange }: SectionProps) {
  return (
    <div className="space-y-6">
      <h2 className="font-display text-lg font-semibold text-foreground">Agenda</h2>
      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="flex items-center justify-between p-3 rounded-lg bg-muted">
            <div>
              <p className="text-sm font-medium">Agendamento automático</p>
              <p className="text-xs text-muted-foreground">Oferecer horários disponíveis para reunião</p>
            </div>
            <Switch checked={config.autoSchedule} onCheckedChange={v => onChange({ autoSchedule: v })} />
          </div>
          <div className="space-y-1.5">
            <Label className="text-sm font-medium">Integração com calendário</Label>
            <Select value={config.calendarIntegration} onValueChange={v => onChange({ calendarIntegration: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="google">Google Calendar</SelectItem>
                <SelectItem value="outlook">Outlook</SelectItem>
                <SelectItem value="calendly">Calendly</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Duração padrão da reunião</Label>
              <Select value={config.meetingDuration} onValueChange={v => onChange({ meetingDuration: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="15">15 minutos</SelectItem>
                  <SelectItem value="30">30 minutos</SelectItem>
                  <SelectItem value="45">45 minutos</SelectItem>
                  <SelectItem value="60">1 hora</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Intervalo entre reuniões</Label>
              <Select value={config.meetingInterval} onValueChange={v => onChange({ meetingInterval: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5 minutos</SelectItem>
                  <SelectItem value="10">10 minutos</SelectItem>
                  <SelectItem value="15">15 minutos</SelectItem>
                  <SelectItem value="30">30 minutos</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-sm font-medium">Link da reunião (padrão)</Label>
            <Input value={config.meetingLink} onChange={e => onChange({ meetingLink: e.target.value })} placeholder="https://meet.google.com/..." />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function IntencoesSection({ config, onChange }: SectionProps) {
  const toggleIntent = (idx: number, active: boolean) => {
    const updated = config.intents.map((it, i) => i === idx ? { ...it, active } : it);
    onChange({ intents: updated });
  };

  return (
    <div className="space-y-6">
      <h2 className="font-display text-lg font-semibold text-foreground">Intenções</h2>
      <Card>
        <CardContent className="pt-6 space-y-4">
          <p className="text-sm text-muted-foreground">Configure as intenções que o agente deve identificar durante a conversa.</p>
          {config.intents.map((item, idx) => (
            <div key={item.intent} className="flex items-center justify-between p-3 rounded-lg bg-muted">
              <div>
                <p className="text-sm font-medium">{item.intent}</p>
                <p className="text-xs text-muted-foreground">Ação: {item.action}</p>
              </div>
              <Switch checked={item.active} onCheckedChange={v => toggleIntent(idx, v)} />
            </div>
          ))}
          <Button variant="outline" className="w-full gap-2">
            <Plus className="w-4 h-4" /> Adicionar Intenção
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

function TemplatesSection({ config, onChange }: SectionProps) {
  const [newTemplate, setNewTemplate] = useState({ category: 'qualificacao', name: '', content: '' });
  const [showForm, setShowForm] = useState(false);

  const templates = config.templates ?? [];

  const categoryLabels: Record<string, string> = {
    qualificacao: 'Qualificação',
    followup: 'Follow-up',
    proposta: 'Proposta',
    boasvindas: 'Boas-vindas',
    encerramento: 'Encerramento',
    agendamento: 'Agendamento',
    objecao: 'Objeção',
    outro: 'Outro',
  };

  const addTemplate = () => {
    if (!newTemplate.name.trim() || !newTemplate.content.trim()) return;
    const t = { ...newTemplate, id: crypto.randomUUID() };
    onChange({ templates: [...templates, t] });
    setNewTemplate({ category: 'qualificacao', name: '', content: '' });
    setShowForm(false);
  };

  const removeTemplate = (id: string) => {
    onChange({ templates: templates.filter(t => t.id !== id) });
  };

  const CATEGORY_COLORS: Record<string, string> = {
    qualificacao: 'bg-blue-100 text-blue-700',
    followup: 'bg-yellow-100 text-yellow-700',
    proposta: 'bg-green-100 text-green-700',
    boasvindas: 'bg-purple-100 text-purple-700',
    encerramento: 'bg-red-100 text-red-700',
    agendamento: 'bg-cyan-100 text-cyan-700',
    objecao: 'bg-orange-100 text-orange-700',
    outro: 'bg-gray-100 text-gray-700',
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-foreground">Templates de Mensagens</h2>
          <p className="text-xs text-muted-foreground mt-0.5">Crie mensagens prontas para cada situação da conversa</p>
        </div>
        <Button size="sm" className="gap-1.5" onClick={() => setShowForm(true)}>
          <Plus className="w-3.5 h-3.5" /> Novo template
        </Button>
      </div>

      {showForm && (
        <Card className="border-primary/30 bg-primary/5">
          <CardContent className="pt-4 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Categoria</Label>
                <Select value={newTemplate.category} onValueChange={v => setNewTemplate(p => ({ ...p, category: v }))}>
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(categoryLabels).map(([v, l]) => (
                      <SelectItem key={v} value={v} className="text-xs">{l}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Nome do template</Label>
                <Input
                  className="h-8 text-xs"
                  placeholder="Ex: Primeira abordagem"
                  value={newTemplate.name}
                  onChange={e => setNewTemplate(p => ({ ...p, name: e.target.value }))}
                />
              </div>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Conteúdo</Label>
              <Textarea
                rows={4}
                className="text-xs resize-none"
                placeholder="Digite a mensagem. Use {nome}, {empresa} para variáveis dinâmicas."
                value={newTemplate.content}
                onChange={e => setNewTemplate(p => ({ ...p, content: e.target.value }))}
              />
              <p className="text-[10px] text-muted-foreground">Variáveis disponíveis: {'{nome}'}, {'{empresa}'}, {'{produto}'}, {'{data}'}</p>
            </div>
            <div className="flex gap-2">
              <Button size="sm" className="text-xs" onClick={addTemplate}>Salvar template</Button>
              <Button size="sm" variant="ghost" className="text-xs" onClick={() => setShowForm(false)}>Cancelar</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {templates.length === 0 && !showForm ? (
        <div className="text-center py-12 border-2 border-dashed rounded-xl text-muted-foreground">
          <Layout className="w-8 h-8 mx-auto mb-2 opacity-40" />
          <p className="text-sm font-medium">Nenhum template criado</p>
          <p className="text-xs mt-1">Crie templates para agilizar as respostas da IA</p>
        </div>
      ) : (
        <div className="space-y-2">
          {templates.map(t => (
            <Card key={t.id} className="hover:border-primary/30 transition-colors">
              <CardContent className="pt-3 pb-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${CATEGORY_COLORS[t.category] ?? 'bg-gray-100 text-gray-700'}`}>
                        {categoryLabels[t.category] ?? t.category}
                      </span>
                      <span className="text-xs font-medium text-foreground">{t.name}</span>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2">{t.content}</p>
                  </div>
                  <button
                    onClick={() => removeTemplate(t.id)}
                    className="text-muted-foreground hover:text-destructive transition-colors flex-shrink-0 mt-0.5"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

// --- Main Component ---

export function AgentConfigView() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeSection, setActiveSection] = useState('configuracoes');
  const [config, setConfig] = useState<FullAgentConfig>({ ...DEFAULT_AGENT_CONFIG });

  const { data: savedConfig, isLoading } = useQuery({
    queryKey: ['agent-config'],
    queryFn: getAgentConfig,
  });

  useEffect(() => {
    if (savedConfig) setConfig(savedConfig);
  }, [savedConfig]);

  const { mutate: saveConfig, isPending } = useMutation({
    mutationFn: updateAgentConfig,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agent-config'] });
      toast({ title: 'Configurações salvas!', description: 'Agente atualizado com sucesso.' });
    },
    onError: (err: Error) => {
      toast({ title: 'Erro ao salvar', description: err.message, variant: 'destructive' });
    },
  });

  const onChange = (partial: Partial<FullAgentConfig>) =>
    setConfig(prev => ({ ...prev, ...partial }));

  const sectionProps: SectionProps = { config, onChange };

  const renderSection = () => {
    switch (activeSection) {
      case 'configuracoes': return <ConfiguracoesSection {...sectionProps} />;
      case 'comunicacao': return <ComunicacaoSection {...sectionProps} />;
      case 'humanizacao': return <HumanizacaoSection {...sectionProps} />;
      case 'voz': return <VozSection {...sectionProps} />;
      case 'gatilhos': return <GatilhosSection {...sectionProps} />;
      case 'instrucoes': return <InstrucoesSection {...sectionProps} />;
      case 'base-conhecimento': return <BaseConhecimentoSection {...sectionProps} />;
      case 'seguir': return <SeguirSection {...sectionProps} />;
      case 'agenda': return <AgendaSection {...sectionProps} />;
      case 'intencoes': return <IntencoesSection {...sectionProps} />;
      case 'templates': return <TemplatesSection {...sectionProps} />;
      default: return <ConfiguracoesSection {...sectionProps} />;
    }
  };

  return (
    <div className="flex gap-6 max-w-6xl">
      {/* Sub-navigation sidebar */}
      <div className="w-[220px] flex-shrink-0 space-y-4">
        <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider px-3">
          AGENTES (1/1)
        </div>
        <div className="flex items-center gap-2 p-2.5 rounded-lg bg-muted mb-2">
          <div className="w-7 h-7 rounded-md gradient-primary flex items-center justify-center">
            <Bot className="w-4 h-4 text-primary-foreground" />
          </div>
          <span className="text-sm font-medium text-foreground">Agente</span>
          <ChevronDown className="w-4 h-4 text-muted-foreground ml-auto" />
        </div>
        <nav className="space-y-0.5">
          {agentSections.map(s => {
            const isActive = activeSection === s.id;
            return (
              <button
                key={s.id}
                onClick={() => setActiveSection(s.id)}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${
                  isActive
                    ? 'bg-primary/10 text-primary font-medium'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                <s.icon className="w-4 h-4" />
                {s.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Content area */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-display text-xl font-bold text-foreground">Configuração do Agente</h1>
            {isLoading && <p className="text-xs text-muted-foreground mt-0.5">Carregando configurações...</p>}
          </div>
          <Button className="gap-2" onClick={() => saveConfig(config)} disabled={isPending}>
            {isPending ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Salvando...</>
            ) : (
              <><Save className="w-4 h-4" /> Salvar configurações</>
            )}
          </Button>
        </div>
        {renderSection()}
      </div>
    </div>
  );
}
