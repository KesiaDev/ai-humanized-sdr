import { Lead, Conversation, Message } from '@/types/lead';

export const mockLeads: Lead[] = [
  {
    id: '1', name: 'Ana Silva', email: 'ana@empresa.com', phone: '(11) 99999-1234',
    company: 'TechCorp Brasil', position: 'Diretora de Marketing', source: 'whatsapp',
    status: 'qualificado', urgency: 'alta', score: 87, notes: 'Muito interessada no produto',
    tags: ['enterprise', 'marketing'], createdAt: new Date('2026-03-20'),
    lastContact: new Date('2026-04-01'), nextFollowUp: new Date('2026-04-03'),
  },
  {
    id: '2', name: 'Carlos Mendes', email: 'carlos@startup.io', phone: '(21) 98888-5678',
    company: 'Startup.io', position: 'CEO', source: 'instagram',
    status: 'contatado', urgency: 'media', score: 65, notes: 'Pediu proposta',
    tags: ['startup', 'saas'], createdAt: new Date('2026-03-25'),
    lastContact: new Date('2026-03-30'), nextFollowUp: new Date('2026-04-02'),
  },
  {
    id: '3', name: 'Fernanda Costa', email: 'fernanda@loja.com.br', phone: '(31) 97777-9012',
    company: 'MegaLoja', position: 'Gerente Comercial', source: 'google',
    status: 'novo', urgency: 'baixa', score: 42, notes: '',
    tags: ['ecommerce', 'retail'], createdAt: new Date('2026-04-01'),
    lastContact: null, nextFollowUp: null,
  },
  {
    id: '4', name: 'Roberto Santos', email: 'roberto@industria.com', phone: '(41) 96666-3456',
    company: 'IndústriaTech', position: 'Diretor de Operações', source: 'indicacao',
    status: 'proposta', urgency: 'critica', score: 93, notes: 'Fechamento iminente',
    tags: ['industria', 'enterprise'], createdAt: new Date('2026-03-10'),
    lastContact: new Date('2026-04-01'), nextFollowUp: new Date('2026-04-02'),
  },
  {
    id: '5', name: 'Juliana Pereira', email: 'juliana@agencia.com', phone: '(51) 95555-7890',
    company: 'Agência Digital', position: 'Sócia', source: 'site',
    status: 'contatado', urgency: 'media', score: 58, notes: 'Quer demo',
    tags: ['agencia', 'digital'], createdAt: new Date('2026-03-28'),
    lastContact: new Date('2026-03-31'), nextFollowUp: new Date('2026-04-04'),
  },
  {
    id: '6', name: 'Marcos Oliveira', email: 'marcos@constru.com', phone: '(61) 94444-1122',
    company: 'ConstruMax', position: 'Diretor', source: 'whatsapp',
    status: 'fechado', urgency: 'alta', score: 100, notes: 'Cliente conquistado!',
    tags: ['construcao'], createdAt: new Date('2026-02-15'),
    lastContact: new Date('2026-03-28'), nextFollowUp: null,
  },
];

export const mockConversations: Conversation[] = [
  {
    id: 'c1', leadId: '1', leadName: 'Ana Silva', status: 'ativa',
    lastMessage: new Date('2026-04-01T14:30:00'),
    messages: [
      { id: 'm1', content: 'Olá! Vi que vocês oferecem automação de vendas. Podem me contar mais?', sender: 'lead', timestamp: new Date('2026-04-01T14:00:00'), leadId: '1' },
      { id: 'm2', content: 'Olá Ana! Claro! O SDR IA Humanizado automatiza todo o processo de prospecção e qualificação de leads, usando inteligência artificial para conversas naturais. Qual o tamanho da sua equipe de vendas?', sender: 'ia', timestamp: new Date('2026-04-01T14:05:00'), leadId: '1' },
      { id: 'm3', content: 'Temos 8 vendedores. Nosso maior desafio é qualificar os leads antes de passar pra equipe.', sender: 'lead', timestamp: new Date('2026-04-01T14:15:00'), leadId: '1' },
      { id: 'm4', content: 'Perfeito! É exatamente o que fazemos. A IA qualifica automaticamente e só passa leads prontos para comprar. Posso agendar uma demo para mostrar como funciona na prática?', sender: 'ia', timestamp: new Date('2026-04-01T14:20:00'), leadId: '1' },
    ],
  },
  {
    id: 'c2', leadId: '2', leadName: 'Carlos Mendes', status: 'ativa',
    lastMessage: new Date('2026-03-30T10:00:00'),
    messages: [
      { id: 'm5', content: 'Bom dia! Preciso de uma solução de SDR para minha startup.', sender: 'lead', timestamp: new Date('2026-03-30T09:30:00'), leadId: '2' },
      { id: 'm6', content: 'Bom dia Carlos! Qual é o nicho da sua startup e quantos leads vocês recebem por mês atualmente?', sender: 'ia', timestamp: new Date('2026-03-30T09:35:00'), leadId: '2' },
    ],
  },
];
