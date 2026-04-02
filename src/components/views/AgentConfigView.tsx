import { useState } from 'react';
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
  ChevronDown, ChevronUp, HelpCircle
} from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

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
];

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

function ConfiguracoesSection() {
  const [agentActive, setAgentActive] = useState(true);
  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-lg font-semibold text-foreground">Status do Agente</h2>
        <div className="flex gap-3 mt-3">
          <Button
            variant={agentActive ? 'default' : 'outline'}
            onClick={() => setAgentActive(true)}
            className="gap-2"
          >
            <Power className="w-4 h-4" /> ATIVO
          </Button>
          <Button
            variant={!agentActive ? 'destructive' : 'outline'}
            onClick={() => setAgentActive(false)}
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
                <Input defaultValue="Agente Padrão" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm font-medium">Descrição do Agente</Label>
                <Textarea defaultValue="Configuração inicial do agente" className="min-h-[100px]" />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium">Cargo / Função</Label>
                  <Input defaultValue="Consultora de Vendas" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium">Nome da Empresa</Label>
                  <Input defaultValue="Sua Empresa" />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm font-medium">Idioma Principal</Label>
                <Select defaultValue="pt-br">
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
                <Switch defaultChecked />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium">Início do Expediente</Label>
                  <Input type="time" defaultValue="08:00" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium">Fim do Expediente</Label>
                  <Input type="time" defaultValue="18:00" />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm font-medium">Mensagem fora do horário</Label>
                <Textarea defaultValue="Obrigado pelo contato! Nosso horário de atendimento é de 08h às 18h. Retornaremos assim que possível." />
              </div>
            </TabsContent>

            <TabsContent value="canais" className="space-y-4">
              {['WhatsApp', 'Instagram', 'Facebook Messenger', 'Chat do Site', 'Email'].map(ch => (
                <div key={ch} className="flex items-center justify-between p-3 rounded-lg bg-muted">
                  <p className="text-sm font-medium">{ch}</p>
                  <Switch defaultChecked={ch === 'WhatsApp' || ch === 'Chat do Site'} />
                </div>
              ))}
            </TabsContent>

            <TabsContent value="credenciais" className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-sm font-medium">API Key (opcional)</Label>
                <Input type="password" placeholder="sk-..." />
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm font-medium">Webhook URL</Label>
                <Input placeholder="https://..." />
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

function ComunicacaoSection() {
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
                      <Input type="number" defaultValue="10" className="w-24" />
                      <span className="text-sm text-muted-foreground">seg</span>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-sm font-medium flex items-center gap-1.5">
                      Tempo entre <InfoTooltip text="Intervalo entre mensagens consecutivas" />
                    </Label>
                    <div className="flex items-center gap-2">
                      <Input type="number" defaultValue="3" className="w-24" />
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
                <Textarea defaultValue="Desculpa, não entendi. Pode por favor enviar a mensagem de outra forma?" className="min-h-[80px]" />
              </div>
            </TabsContent>

            <TabsContent value="linguagem" className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-sm font-medium">Tom de comunicação</Label>
                <Select defaultValue="amigavel">
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="formal">Formal</SelectItem>
                    <SelectItem value="amigavel">Amigável</SelectItem>
                    <SelectItem value="casual">Casual</SelectItem>
                    <SelectItem value="tecnico">Técnico</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm font-medium">Usar emojis</Label>
                <Switch defaultChecked />
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm font-medium">Tamanho máximo da resposta</Label>
                <div className="flex items-center gap-2">
                  <Input type="number" defaultValue="500" className="w-28" />
                  <span className="text-sm text-muted-foreground">caracteres</span>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="humanizacao-texto" className="space-y-4">
              {[
                { label: 'Simular erros de digitação', desc: 'Adiciona pequenos erros naturais ocasionalmente' },
                { label: 'Variação de saudações', desc: 'Alterna entre diferentes formas de cumprimento' },
                { label: 'Pausas naturais', desc: 'Simula tempo de leitura e digitação' },
                { label: 'Gírias regionais', desc: 'Usa expressões comuns da região configurada' },
              ].map(item => (
                <div key={item.label} className="flex items-center justify-between p-3 rounded-lg bg-muted">
                  <div>
                    <p className="text-sm font-medium">{item.label}</p>
                    <p className="text-xs text-muted-foreground">{item.desc}</p>
                  </div>
                  <Switch />
                </div>
              ))}
            </TabsContent>

            <TabsContent value="config-voz" className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-sm font-medium">Voz padrão</Label>
                <Select defaultValue="feminina-1">
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
                <Select defaultValue="normal">
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

function HumanizacaoSection() {
  return (
    <div className="space-y-6">
      <h2 className="font-display text-lg font-semibold text-foreground">Humanização</h2>
      <Card>
        <CardContent className="pt-6 space-y-4">
          <p className="text-sm text-muted-foreground">Configure como o agente simula comportamento humano nas conversas.</p>
          {[
            { label: 'Digitação simulada', desc: 'Mostra "digitando..." com tempo proporcional à mensagem', on: true },
            { label: 'Variação de vocabulário', desc: 'Evita repetir as mesmas palavras e expressões', on: true },
            { label: 'Memória de contexto', desc: 'Lembra detalhes mencionados na conversa', on: true },
            { label: 'Respostas parciais', desc: 'Divide respostas longas em mensagens menores', on: false },
            { label: 'Respostas com áudio', desc: 'Envia áudios simulados em momentos estratégicos', on: false },
            { label: 'Reações naturais', desc: 'Usa interjeições e reações como "Que legal!" e "Entendi!"', on: true },
          ].map(item => (
            <div key={item.label} className="flex items-center justify-between p-3 rounded-lg bg-muted">
              <div>
                <p className="text-sm font-medium">{item.label}</p>
                <p className="text-xs text-muted-foreground">{item.desc}</p>
              </div>
              <Switch defaultChecked={item.on} />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

function VozSection() {
  return (
    <div className="space-y-6">
      <h2 className="font-display text-lg font-semibold text-foreground">Voz</h2>
      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="space-y-1.5">
            <Label className="text-sm font-medium">Motor de voz</Label>
            <Select defaultValue="elevenlabs">
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
            <Select defaultValue="sofia">
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
            <Switch />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function GatilhosSection() {
  const [keywords, setKeywords] = useState<string[]>(['Quero saber mais']);
  const [triggers, setTriggers] = useState([
    { id: '1', title: 'Central de Atendimento WhatsApp', desc: 'Ative o agente quando o lead enviar mensagens específicas', open: true },
    { id: '2', title: 'Disparador API Oficial WhatsApp', desc: 'Ativo o agente via API oficial do WhatsApp', open: false },
  ]);

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
              <TabsTrigger value="intencoes-tab" disabled>
                <Target className="w-3.5 h-3.5 mr-1" /> Intenções <Badge variant="outline" className="ml-1 text-[10px]">em breve</Badge>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="nativo" className="space-y-4">
              {triggers.map(t => (
                <div key={t.id} className="border border-border rounded-lg">
                  <button
                    className="w-full flex items-center justify-between p-4 text-left"
                    onClick={() => setTriggers(triggers.map(x => x.id === t.id ? { ...x, open: !x.open } : x))}
                  >
                    <div>
                      <h4 className="font-display font-semibold text-sm">{t.title}</h4>
                      <p className="text-xs text-muted-foreground">{t.desc}</p>
                    </div>
                    {t.open ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                  {t.open && (
                    <div className="px-4 pb-4 space-y-4 border-t border-border pt-4">
                      <div className="space-y-1.5">
                        <Label className="text-sm font-medium">Mensagem de Ativação</Label>
                        <Select defaultValue="especifica">
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="qualquer">Qualquer Mensagem</SelectItem>
                            <SelectItem value="especifica">Mensagem Específica</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-sm font-medium">Tipo de lag</Label>
                        <Select defaultValue="igual">
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
                        <KeywordInput keywords={keywords} onChange={setKeywords} />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </TabsContent>

            <TabsContent value="mensagem" className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-sm font-medium">Mensagem de boas-vindas</Label>
                <Textarea defaultValue="Olá! 👋 Seja bem-vindo(a)! Como posso ajudá-lo(a) hoje?" className="min-h-[80px]" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm font-medium">Mensagem de encerramento</Label>
                <Textarea defaultValue="Foi um prazer ajudá-lo(a)! Se precisar de algo mais, estou por aqui. 😊" className="min-h-[80px]" />
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

function InstrucoesSection() {
  return (
    <div className="space-y-6">
      <h2 className="font-display text-lg font-semibold text-foreground">Instruções</h2>
      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="space-y-1.5">
            <Label className="text-sm font-medium">Prompt do Sistema</Label>
            <p className="text-xs text-muted-foreground">Instruções gerais de comportamento da IA</p>
            <Textarea
              defaultValue="Você é uma assistente de vendas profissional e empática. Seu objetivo é qualificar leads e agendar reuniões. Seja amigável, use linguagem simples e direta. Faça perguntas para entender a necessidade do cliente antes de apresentar soluções."
              className="min-h-[150px] font-mono text-sm"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-sm font-medium">Descrição do produto/serviço</Label>
            <Textarea
              defaultValue="Descreva aqui o que sua empresa oferece para que a IA possa responder com precisão."
              className="min-h-[100px]"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-sm font-medium">Tópicos proibidos</Label>
            <p className="text-xs text-muted-foreground">Assuntos que a IA NÃO deve abordar</p>
            <Textarea
              defaultValue="Preços específicos sem aprovação, descontos não autorizados, informações de concorrentes, dados internos da empresa"
              className="min-h-[80px]"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-sm font-medium">Perguntas de qualificação</Label>
            <Textarea
              defaultValue="1. Qual é o seu principal desafio atualmente?&#10;2. Qual o tamanho da sua equipe?&#10;3. Já utiliza alguma solução semelhante?&#10;4. Qual o prazo para implementação?"
              className="min-h-[120px]"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function BaseConhecimentoSection() {
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
              <Input placeholder="https://seusite.com.br/faq" className="flex-1" />
              <Button variant="outline"><Plus className="w-4 h-4" /></Button>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-sm font-medium">FAQ manual</Label>
            <Textarea placeholder="Pergunta: Como funciona o serviço?&#10;Resposta: ..." className="min-h-[120px]" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function SeguirSection() {
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
            <Switch defaultChecked />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Primeiro follow-up após</Label>
              <div className="flex items-center gap-2">
                <Input type="number" defaultValue="2" className="w-20" />
                <span className="text-sm text-muted-foreground">horas</span>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Máximo de tentativas</Label>
              <Input type="number" defaultValue="3" className="w-20" />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-sm font-medium">Mensagem de follow-up</Label>
            <Textarea defaultValue="Oi! Vi que não conseguimos conversar ainda. Posso ajudar com alguma dúvida? 😊" className="min-h-[80px]" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-sm font-medium">Mensagem de última tentativa</Label>
            <Textarea defaultValue="Olá! Só passando para avisar que estou por aqui caso precise. Sem compromisso! 🙂" className="min-h-[80px]" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function AgendaSection() {
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
            <Switch defaultChecked />
          </div>
          <div className="space-y-1.5">
            <Label className="text-sm font-medium">Integração com calendário</Label>
            <Select defaultValue="google">
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
              <Select defaultValue="30">
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
              <Select defaultValue="15">
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
            <Input placeholder="https://meet.google.com/..." />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function IntencoesSection() {
  return (
    <div className="space-y-6">
      <h2 className="font-display text-lg font-semibold text-foreground">Intenções</h2>
      <Card>
        <CardContent className="pt-6 space-y-4">
          <p className="text-sm text-muted-foreground">Configure as intenções que o agente deve identificar durante a conversa.</p>
          {[
            { intent: 'Interesse em comprar', action: 'Apresentar produto e agendar demo', active: true },
            { intent: 'Pedido de preço', action: 'Coletar info e encaminhar para vendedor', active: true },
            { intent: 'Suporte técnico', action: 'Redirecionar para equipe de suporte', active: true },
            { intent: 'Reclamação', action: 'Registrar e escalar para gerência', active: false },
            { intent: 'Cancelamento', action: 'Oferecer retenção e encaminhar para CS', active: false },
          ].map(item => (
            <div key={item.intent} className="flex items-center justify-between p-3 rounded-lg bg-muted">
              <div>
                <p className="text-sm font-medium">{item.intent}</p>
                <p className="text-xs text-muted-foreground">Ação: {item.action}</p>
              </div>
              <Switch defaultChecked={item.active} />
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

// --- Main Component ---

export function AgentConfigView() {
  const [activeSection, setActiveSection] = useState('configuracoes');

  const renderSection = () => {
    switch (activeSection) {
      case 'configuracoes': return <ConfiguracoesSection />;
      case 'comunicacao': return <ComunicacaoSection />;
      case 'humanizacao': return <HumanizacaoSection />;
      case 'voz': return <VozSection />;
      case 'gatilhos': return <GatilhosSection />;
      case 'instrucoes': return <InstrucoesSection />;
      case 'base-conhecimento': return <BaseConhecimentoSection />;
      case 'seguir': return <SeguirSection />;
      case 'agenda': return <AgendaSection />;
      case 'intencoes': return <IntencoesSection />;
      default: return <ConfiguracoesSection />;
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
          <h1 className="font-display text-xl font-bold text-foreground">Configuração do Agente</h1>
          <Button className="gap-2">
            <Save className="w-4 h-4" /> Salvar configurações
          </Button>
        </div>
        {renderSection()}
      </div>
    </div>
  );
}
