require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const app = express();
const PORT = process.env.PORT || 3001;

// ── Security Headers (A02) ─────────────────────────────────
app.use(helmet());

// ── CORS (A02) ─────────────────────────────────────────────
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  methods: ['GET', 'POST', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json({ limit: '50kb' })); // limitar tamanho do body

// ── Rate Limiting (A06) ────────────────────────────────────
const generalLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Muitas requisições. Tente novamente em breve.' },
});

const webhookLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
});

const n8nLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/', generalLimiter);
app.use('/api/whatsapp/incoming', webhookLimiter);
app.use('/api/n8n/', n8nLimiter);

// ── API Key Auth Middleware (A01/A07 — solução interina) ───
// Sprint 02: substituir por JWT completo
const requireApiKey = (req, res, next) => {
  const apiKey = process.env.INTERNAL_API_KEY;
  if (!apiKey) return next(); // sem key configurada = modo dev sem proteção

  const authHeader = req.headers['authorization'];
  if (!authHeader || authHeader !== `Bearer ${apiKey}`) {
    return res.status(401).json({ error: 'Não autorizado' });
  }
  next();
};

// ── Webhook Secret Validation (A06/A08) ───────────────────
const validateWebhookSecret = (req, res, next) => {
  const secret = process.env.ZAPI_WEBHOOK_SECRET;
  if (!secret) return next(); // sem secret configurado = aceita qualquer origem (dev)

  const receivedSecret = req.headers['x-zapi-secret'];
  if (receivedSecret !== secret) {
    return res.status(403).json({ error: 'Webhook não autorizado' });
  }
  next();
};

// ── In-Memory Store (substituir por banco de dados depois) ─
let leads = [
  {
    id: '1', name: 'Ana Silva', email: 'ana@empresa.com', phone: '(11) 99999-1234',
    company: 'TechCorp Brasil', position: 'Diretora de Marketing', source: 'whatsapp',
    status: 'qualificado', urgency: 'alta', score: 87, notes: 'Muito interessada no produto',
    tags: ['enterprise', 'marketing'], createdAt: new Date('2026-03-20').toISOString(),
    lastContact: new Date('2026-04-01').toISOString(), nextFollowUp: new Date('2026-04-03').toISOString(),
  },
  {
    id: '2', name: 'Carlos Mendes', email: 'carlos@startup.io', phone: '(21) 98888-5678',
    company: 'Startup.io', position: 'CEO', source: 'instagram',
    status: 'contatado', urgency: 'media', score: 65, notes: 'Pediu proposta',
    tags: ['startup', 'saas'], createdAt: new Date('2026-03-25').toISOString(),
    lastContact: new Date('2026-03-30').toISOString(), nextFollowUp: new Date('2026-04-02').toISOString(),
  },
  {
    id: '3', name: 'Fernanda Costa', email: 'fernanda@loja.com.br', phone: '(31) 97777-9012',
    company: 'MegaLoja', position: 'Gerente Comercial', source: 'google',
    status: 'novo', urgency: 'baixa', score: 42, notes: '',
    tags: ['ecommerce', 'retail'], createdAt: new Date('2026-04-01').toISOString(),
    lastContact: null, nextFollowUp: null,
  },
  {
    id: '4', name: 'Roberto Santos', email: 'roberto@industria.com', phone: '(41) 96666-3456',
    company: 'IndústriaTech', position: 'Diretor de Operações', source: 'indicacao',
    status: 'proposta', urgency: 'critica', score: 93, notes: 'Fechamento iminente',
    tags: ['industria', 'enterprise'], createdAt: new Date('2026-03-10').toISOString(),
    lastContact: new Date('2026-04-01').toISOString(), nextFollowUp: new Date('2026-04-02').toISOString(),
  },
  {
    id: '5', name: 'Juliana Pereira', email: 'juliana@agencia.com', phone: '(51) 95555-7890',
    company: 'Agência Digital', position: 'Sócia', source: 'site',
    status: 'contatado', urgency: 'media', score: 58, notes: 'Quer demo',
    tags: ['agencia', 'digital'], createdAt: new Date('2026-03-28').toISOString(),
    lastContact: new Date('2026-03-31').toISOString(), nextFollowUp: new Date('2026-04-04').toISOString(),
  },
  {
    id: '6', name: 'Marcos Oliveira', email: 'marcos@constru.com', phone: '(61) 94444-1122',
    company: 'ConstruMax', position: 'Diretor', source: 'whatsapp',
    status: 'fechado', urgency: 'alta', score: 100, notes: 'Cliente conquistado!',
    tags: ['construcao'], createdAt: new Date('2026-02-15').toISOString(),
    lastContact: new Date('2026-03-28').toISOString(), nextFollowUp: null,
  },
];

let conversations = [
  {
    id: 'c1', leadId: '1', leadName: 'Ana Silva', status: 'ativa',
    lastMessage: new Date('2026-04-01T14:30:00').toISOString(),
    messages: [
      { id: 'm1', content: 'Olá! Vi que vocês oferecem automação de vendas. Podem me contar mais?', sender: 'lead', timestamp: new Date('2026-04-01T14:00:00').toISOString(), leadId: '1' },
      { id: 'm2', content: 'Olá Ana! Claro! O SDR IA Humanizado automatiza todo o processo de prospecção e qualificação de leads, usando inteligência artificial para conversas naturais. Qual o tamanho da sua equipe de vendas?', sender: 'ia', timestamp: new Date('2026-04-01T14:05:00').toISOString(), leadId: '1' },
      { id: 'm3', content: 'Temos 8 vendedores. Nosso maior desafio é qualificar os leads antes de passar pra equipe.', sender: 'lead', timestamp: new Date('2026-04-01T14:15:00').toISOString(), leadId: '1' },
      { id: 'm4', content: 'Perfeito! É exatamente o que fazemos. A IA qualifica automaticamente e só passa leads prontos para comprar. Posso agendar uma demo para mostrar como funciona na prática?', sender: 'ia', timestamp: new Date('2026-04-01T14:20:00').toISOString(), leadId: '1' },
    ],
  },
  {
    id: 'c2', leadId: '2', leadName: 'Carlos Mendes', status: 'ativa',
    lastMessage: new Date('2026-03-30T10:00:00').toISOString(),
    messages: [
      { id: 'm5', content: 'Bom dia! Preciso de uma solução de SDR para minha startup.', sender: 'lead', timestamp: new Date('2026-03-30T09:30:00').toISOString(), leadId: '2' },
      { id: 'm6', content: 'Bom dia Carlos! Qual é o nicho da sua startup e quantos leads vocês recebem por mês atualmente?', sender: 'ia', timestamp: new Date('2026-03-30T09:35:00').toISOString(), leadId: '2' },
    ],
  },
];

let appointments = [
  { id: 'a1', title: 'Demo com Ana Silva', leadId: '1', leadName: 'Ana Silva', date: new Date().toISOString().split('T')[0], time: '10:00', type: 'demo' },
  { id: 'a2', title: 'Follow-up Carlos Mendes', leadId: '2', leadName: 'Carlos Mendes', date: new Date().toISOString().split('T')[0], time: '14:00', type: 'followup' },
];

let agentConfig = {
  agentName: 'Camila',
  companyName: '',
  services: '',
  businessHours: 'Segunda a sexta, 9h às 20h',
  address: '',
  humanWhatsApp: '',
  zapiInstanceId: process.env.ZAPI_INSTANCE_ID || '',
  zapiToken: process.env.ZAPI_TOKEN || '',
  zapiClientToken: process.env.ZAPI_CLIENT_TOKEN || '',
  n8nWebhookUrl: process.env.N8N_WEBHOOK_URL || '',
  active: false,
};

// ── Helpers ────────────────────────────────────────────────
const generateId = () => Date.now().toString(36) + Math.random().toString(36).slice(2);

// Campos permitidos por operação — previne mass assignment (A05)
const LEAD_CREATE_FIELDS = ['name', 'email', 'phone', 'company', 'position', 'source', 'urgency', 'notes', 'tags'];
const LEAD_UPDATE_FIELDS = ['name', 'email', 'phone', 'company', 'position', 'source', 'status', 'urgency', 'score', 'notes', 'tags', 'nextFollowUp', 'lastContact'];
const APPOINTMENT_FIELDS = ['title', 'leadId', 'leadName', 'date', 'time', 'type'];
const AGENT_CONFIG_FIELDS = ['agentName', 'companyName', 'services', 'businessHours', 'address', 'humanWhatsApp', 'active'];

const pick = (obj, fields) => fields.reduce((acc, key) => {
  if (obj[key] !== undefined) acc[key] = obj[key];
  return acc;
}, {});

// ── Health check (público, sem info sensível) ──────────────
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ── Webhook Z-API (público mas com secret opcional) ────────
app.post('/api/whatsapp/incoming', validateWebhookSecret, (req, res) => {
  const { body } = req;
  const phone = body.phone || body.body?.phone;
  const text = body.text?.message || body.body?.text?.message || body.message;

  if (!phone || !text) return res.status(200).json({ ok: true });

  const lead = leads.find(l => l.phone?.replace(/\D/g, '') === phone?.replace(/\D/g, ''));

  const message = {
    id: generateId(),
    content: text,
    sender: 'lead',
    timestamp: new Date().toISOString(),
    leadId: lead?.id || phone,
  };

  if (lead) {
    const conv = conversations.find(c => c.leadId === lead.id);
    if (conv) {
      conv.messages.push(message);
      conv.lastMessage = message.timestamp;
    } else {
      conversations.push({
        id: generateId(), leadId: lead.id, leadName: lead.name,
        status: 'ativa', lastMessage: message.timestamp, messages: [message],
      });
    }
  }

  if (agentConfig.n8nWebhookUrl && agentConfig.active) {
    // Repassa apenas campos necessários ao N8N — não o payload bruto completo (A04)
    fetch(agentConfig.n8nWebhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, text, leadId: lead?.id, leadName: lead?.name }),
    }).catch(err => console.error('[N8N forward error]', err.message));
  }

  res.status(200).json({ ok: true });
});

// ── Rotas protegidas por API Key ───────────────────────────
app.use('/api/', requireApiKey);

// ── Routes: Leads ──────────────────────────────────────────
app.get('/api/leads', (_req, res) => {
  res.json(leads);
});

app.get('/api/leads/stats', (_req, res) => {
  const total = leads.length;
  const byStatus = leads.reduce((acc, l) => {
    acc[l.status] = (acc[l.status] || 0) + 1;
    return acc;
  }, {});
  const avgScore = total > 0 ? Math.round(leads.reduce((s, l) => s + l.score, 0) / total) : 0;
  const closed = byStatus['fechado'] || 0;
  const conversionRate = total > 0 ? Math.round((closed / total) * 100) : 0;

  res.json({
    total,
    byStatus,
    avgScore,
    conversionRate,
    changes: { total: '+12%', qualified: '+8%', avgScore: '+5pts', conversionRate: '-2%' },
  });
});

app.get('/api/leads/:id', (req, res) => {
  const lead = leads.find(l => l.id === req.params.id);
  if (!lead) return res.status(404).json({ error: 'Lead não encontrado' });
  res.json(lead);
});

app.post('/api/leads', (req, res) => {
  // A05: apenas campos permitidos — sem mass assignment
  const data = pick(req.body, LEAD_CREATE_FIELDS);
  const lead = { id: generateId(), createdAt: new Date().toISOString(), score: 0, status: 'novo', ...data };
  leads.push(lead);

  if (lead.phone && agentConfig.n8nWebhookUrl && agentConfig.active) {
    fetch(agentConfig.n8nWebhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ leadId: lead.id, name: lead.name, phone: lead.phone, source: lead.source }),
    }).catch(err => console.error('[N8N trigger error]', err.message));
  }

  res.status(201).json(lead);
});

app.patch('/api/leads/:id', (req, res) => {
  const idx = leads.findIndex(l => l.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Lead não encontrado' });
  // A05: apenas campos permitidos — sem mass assignment
  const data = pick(req.body, LEAD_UPDATE_FIELDS);
  leads[idx] = { ...leads[idx], ...data };
  res.json(leads[idx]);
});

app.delete('/api/leads/:id', (req, res) => {
  leads = leads.filter(l => l.id !== req.params.id);
  res.status(204).send();
});

// ── Routes: Conversas ──────────────────────────────────────
app.get('/api/conversations', (_req, res) => {
  res.json(conversations);
});

app.get('/api/conversations/:leadId', (req, res) => {
  const conv = conversations.find(c => c.leadId === req.params.leadId);
  if (!conv) return res.status(404).json({ error: 'Conversa não encontrada' });
  res.json(conv);
});

app.post('/api/conversations/:leadId/messages', (req, res) => {
  const content = typeof req.body.content === 'string' ? req.body.content.slice(0, 4000) : '';
  if (!content) return res.status(400).json({ error: 'Conteúdo da mensagem é obrigatório' });

  const message = {
    id: generateId(),
    content,
    sender: 'sdr',
    timestamp: new Date().toISOString(),
    leadId: req.params.leadId,
  };

  const conv = conversations.find(c => c.leadId === req.params.leadId);
  if (conv) {
    conv.messages.push(message);
    conv.lastMessage = message.timestamp;
  } else {
    const lead = leads.find(l => l.id === req.params.leadId);
    conversations.push({
      id: generateId(),
      leadId: req.params.leadId,
      leadName: lead?.name || 'Lead',
      status: 'ativa',
      lastMessage: message.timestamp,
      messages: [message],
    });
  }

  if (agentConfig.zapiInstanceId && agentConfig.zapiToken && agentConfig.active) {
    const lead = leads.find(l => l.id === req.params.leadId);
    if (lead?.phone) {
      fetch(`https://api.z-api.io/instances/${agentConfig.zapiInstanceId}/token/${agentConfig.zapiToken}/send-text`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Client-Token': agentConfig.zapiClientToken },
        body: JSON.stringify({ phone: lead.phone.replace(/\D/g, ''), message: content }),
      }).catch(err => console.error('[Z-API send error]', err.message));
    }
  }

  res.status(201).json(message);
});

// ── Routes: WhatsApp trigger ───────────────────────────────
app.post('/api/whatsapp/trigger', (req, res) => {
  const { leadId, phone } = req.body;
  const lead = leads.find(l => l.id === leadId);
  if (!lead) return res.status(404).json({ error: 'Lead não encontrado' });

  if (agentConfig.n8nWebhookUrl && agentConfig.active) {
    fetch(agentConfig.n8nWebhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ leadId, name: lead.name, phone: phone || lead.phone, source: lead.source, trigger: 'manual' }),
    })
      .then(() => res.json({ success: true }))
      .catch(err => {
        console.error('[N8N trigger error]', err.message);
        res.status(500).json({ success: false, error: 'Erro ao disparar N8N' });
      });
  } else {
    res.json({ success: false, message: 'Agente inativo ou N8N não configurado' });
  }
});

app.get('/api/whatsapp/status/:leadId', (req, res) => {
  const conv = conversations.find(c => c.leadId === req.params.leadId);
  res.json({ status: conv?.status || 'sem_conversa' });
});

// ── Routes: Agenda ─────────────────────────────────────────
app.get('/api/appointments', (_req, res) => {
  res.json(appointments);
});

app.post('/api/appointments', (req, res) => {
  // A05: apenas campos permitidos
  const data = pick(req.body, APPOINTMENT_FIELDS);
  const appointment = { id: generateId(), ...data };
  appointments.push(appointment);
  res.status(201).json(appointment);
});

app.patch('/api/appointments/:id', (req, res) => {
  const idx = appointments.findIndex(a => a.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Agendamento não encontrado' });
  const data = pick(req.body, APPOINTMENT_FIELDS);
  appointments[idx] = { ...appointments[idx], ...data };
  res.json(appointments[idx]);
});

// ── Routes: Configuração do Agente ────────────────────────
app.get('/api/agent-config', (_req, res) => {
  const { zapiInstanceId, zapiToken, zapiClientToken, ...safe } = agentConfig;
  res.json({
    ...safe,
    zapiConfigured: !!(zapiInstanceId && zapiToken && zapiClientToken),
  });
});

app.patch('/api/agent-config', (req, res) => {
  // A05: apenas campos não-sensíveis pelo frontend — tokens vêm apenas do .env
  const data = pick(req.body, AGENT_CONFIG_FIELDS);
  agentConfig = { ...agentConfig, ...data };
  const { zapiInstanceId, zapiToken, zapiClientToken, ...safe } = agentConfig;
  res.json({
    ...safe,
    zapiConfigured: !!(zapiInstanceId && zapiToken && zapiClientToken),
  });
});

// ── Routes: N8N Callbacks ──────────────────────────────────
app.post('/api/n8n/message-sent', (req, res) => {
  const { leadId, message, direction } = req.body;
  if (leadId && typeof message === 'string') {
    const msg = {
      id: generateId(),
      content: message.slice(0, 4000),
      sender: direction === 'outbound' ? 'ia' : 'lead',
      timestamp: new Date().toISOString(),
      leadId,
    };
    const conv = conversations.find(c => c.leadId === leadId);
    if (conv) {
      conv.messages.push(msg);
      conv.lastMessage = msg.timestamp;
    }
  }
  res.json({ ok: true });
});

app.post('/api/n8n/score-update', (req, res) => {
  const { leadId, score, status } = req.body;
  const idx = leads.findIndex(l => l.id === leadId);
  if (idx !== -1) {
    // Validar tipos antes de atualizar (A05)
    if (typeof score === 'number' && score >= 0 && score <= 100) leads[idx].score = score;
    if (typeof status === 'string') leads[idx].status = status;
    leads[idx].lastContact = new Date().toISOString();
  }
  res.json({ ok: true });
});

// ── Global Error Handler (A10) ─────────────────────────────
// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  console.error('[Unhandled error]', err.message);
  res.status(500).json({ error: 'Erro interno do servidor' });
});

// ── Start ─────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`✅ SDR IA Backend rodando na porta ${PORT}`);
  console.log(`   Agente ativo: ${agentConfig.active}`);
  console.log(`   Z-API: ${agentConfig.zapiInstanceId ? '✅ configurado' : '⚠️ não configurado'}`);
  console.log(`   N8N:   ${agentConfig.n8nWebhookUrl ? '✅ configurado' : '⚠️ não configurado'}`);
});
