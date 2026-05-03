import { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bot, ArrowRight, CheckCircle, XCircle, ChevronDown, ChevronUp,
  Zap, Users, Calendar, BarChart3, MessageCircle, Star,
  Clock, Shield, TrendingUp, Phone, X, Plus, Minus,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

/* ─── Pricing data ─────────────────────────────────────────────────── */

const LEAD_VOLUMES = [500, 1000, 2000, 3000, 4000, 5000, 7500, 10000, 15000, 20000];

const PRICE_PER_LEAD = { silver: 1.497, gold: 1.997, black: 2.997 };

const PLANS_DATA = {
  silver: {
    label: "Silver", color: "slate", priceLabel: "1,49",
    desc: "Para empresas iniciando automação",
    features: [
      { ok: true,  text: "WhatsApp (Web + API Oficial)" },
      { ok: true,  text: "Qualificação de leads" },
      { ok: true,  text: "Agendamento automático" },
      { ok: false, text: "Integração com CRM" },
      { ok: true,  text: "Suporte 24h SLA" },
      { ok: false, text: "Direct do Instagram" },
      { ok: false, text: "Voz clonada (ElevenLabs)" },
      { ok: false, text: "Prospecção Outbound" },
    ],
  },
  gold: {
    label: "Gold", color: "yellow", priceLabel: "1,99",
    desc: "Para empresas em crescimento",
    features: [
      { ok: true,  text: "Tudo do Silver +" },
      { ok: true,  text: "Direct do Instagram" },
      { ok: true,  text: "Voz clonada (ElevenLabs)" },
      { ok: true,  text: "Prospecção Outbound" },
      { ok: true,  text: "Insights e scripts" },
      { ok: true,  text: "CS acompanhado" },
      { ok: false, text: "Telefonia por IA" },
      { ok: false, text: "Dashboard tempo real" },
    ],
  },
  black: {
    label: "Black", color: "white", priceLabel: "2,99",
    desc: "Para operações de alto volume",
    features: [
      { ok: true, text: "Tudo do Gold +" },
      { ok: true, text: "Telefonia por IA (+R$1,80/min)" },
      { ok: true, text: "Dashboard tempo real" },
      { ok: true, text: "SLA 4h/2h" },
      { ok: true, text: "Campanhas diárias" },
      { ok: true, text: "Customizações avançadas" },
      { ok: true, text: "Gerente dedicado" },
      { ok: true, text: "Treinamento exclusivo" },
    ],
  },
};

const CONTRACT_OPTS = [
  { id: "mensal",    label: "Mensal",    months: 1,  implementDiscount: 0 },
  { id: "semestral", label: "Semestral", months: 6,  implementDiscount: 0.20 },
  { id: "anual",     label: "Anual",     months: 12, implementDiscount: 0.50 },
];

const TOOLS_OPTS = {
  elevenlabs: {
    label: "ElevenLabs (Integração de Voz)",
    required: true,
    opts: [
      { label: "Não incluir", price: 0 },
      { label: "Starter — R$99/mês", price: 99 },
      { label: "Creator — R$199/mês", price: 199 },
      { label: "Pro — R$399/mês", price: 399 },
    ],
  },
  manychat: {
    label: "ManyChat (Automação)",
    required: true,
    opts: [
      { label: "Não incluir", price: 0 },
      { label: "500 contatos — R$149/mês", price: 149 },
      { label: "2.500 contatos — R$249/mês", price: 249 },
      { label: "5.000 contatos — R$449/mês", price: 449 },
    ],
  },
  zapi: {
    label: "Z-API (WhatsApp)",
    required: true,
    opts: [
      { label: "Não incluir", price: 0 },
      { label: "Z-API — R$89/mês", price: 89 },
    ],
  },
};

const FAQ_ITEMS = [
  { q: "Como o SDR IA Humanizado funciona?", a: "O SDR recebe leads de qualquer canal (WhatsApp, Instagram, site), qualifica com IA em segundos e agenda reuniões automaticamente no calendário do seu time — tudo sem intervenção humana." },
  { q: "O que significa 'humanizado'?", a: "Utilizamos 8 camadas de humanização: voz clonada, gatilhos emocionais, variação de ritmo de digitação, intenção contextual, emojis estratégicos e muito mais. O cliente não percebe que está falando com IA." },
  { q: "O que é um 'lead atendido'?", a: "Cada contato que o SDR recebe e processa (responde, qualifica ou agenda) conta como 1 lead atendido. O plano define o limite mensal." },
  { q: "Em quais canais o SDR atua?", a: "WhatsApp (Web e API Oficial), Direct do Instagram (planos Gold/Black) e pode ser integrado a qualquer canal via webhook/N8N." },
  { q: "Quanto tempo leva a implementação?", a: "A implementação padrão leva de 5 a 10 dias úteis. Inclui configuração do agente, integração com WhatsApp, treinamento do SDR com os dados do seu negócio e testes." },
  { q: "Posso mudar de plano?", a: "Sim! Você pode fazer upgrade a qualquer momento. O downgrade está disponível no próximo ciclo de renovação." },
  { q: "Como funciona o suporte?", a: "Todos os planos incluem suporte 24h por SLA. O plano Black inclui SLA de 4h/2h e gerente dedicado." },
  { q: "Preciso de equipe técnica para instalar?", a: "Não. A NandiDev cuida de toda a implementação técnica. Você só precisa fornecer acesso ao WhatsApp Business e às informações do seu negócio." },
];

/* ─── Helpers ──────────────────────────────────────────────────────── */

const fmt = (n: number) => n.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

type PlanKey = "silver" | "gold" | "black";

function planColor(plan: PlanKey) {
  if (plan === "gold") return { card: "border-yellow-500/40 bg-yellow-500/5", accent: "text-yellow-400", badge: "bg-yellow-500/20 text-yellow-300", btn: "bg-yellow-500 hover:bg-yellow-400 text-black" };
  if (plan === "black") return { card: "border-white/20 bg-white/5", accent: "text-white", badge: "bg-white/20 text-white", btn: "bg-white hover:bg-slate-100 text-black" };
  return { card: "border-white/10 bg-white/5", accent: "text-slate-300", badge: "bg-slate-500/20 text-slate-300", btn: "bg-slate-600 hover:bg-slate-500 text-white" };
}

/* ─── Budget Simulator Modal ───────────────────────────────────────── */

function SimulatorModal({ open, onClose, defaultPlan = "gold" }: { open: boolean; onClose: () => void; defaultPlan?: PlanKey }) {
  const [agents, setAgents] = useState(1);
  const [leads, setLeads] = useState(1000);
  const [plan, setPlan] = useState<PlanKey>(defaultPlan);
  const [contract, setContract] = useState("mensal");
  const [coupon, setCoupon] = useState("");
  const [elevenlabs, setElevenlabs] = useState(0);
  const [manychat, setManychat] = useState(0);
  const [zapi, setZapi] = useState(0);
  const [toolsOpen, setToolsOpen] = useState(true);

  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "", phone: "", company: "" });
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const contractOpt = CONTRACT_OPTS.find(c => c.id === contract)!;
  const monthly = Math.round(leads * PRICE_PER_LEAD[plan]);
  const toolsMonthly = elevenlabs + manychat + zapi;
  const totalMonthly = monthly + toolsMonthly;

  const implementBase = 3000 * agents;
  const implementDiscount = implementBase * contractOpt.implementDiscount;
  const implementTotal = implementBase - implementDiscount;

  const months = contractOpt.months;
  const grandTotal = totalMonthly * months + implementTotal;
  const installment = months > 1 ? grandTotal / months : null;

  const handleProposal = async () => {
    if (!formData.name || !formData.email || !formData.phone) {
      toast.error("Preencha nome, e-mail e telefone");
      return;
    }
    setSubmitting(true);
    try {
      await supabase.from("proposals" as any).insert({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        company: formData.company,
        plan,
        leads_volume: leads,
        agents,
        contract_type: contract,
        monthly_total: totalMonthly,
        implementation_total: implementTotal,
        grand_total: grandTotal,
      });
      setDone(true);
    } catch {
      toast.error("Erro ao enviar. Tente novamente.");
    }
    setSubmitting(false);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-8 overflow-y-auto">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-3xl bg-[#0c1a14] border border-emerald-500/20 rounded-2xl shadow-2xl z-10"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div>
            <h2 className="text-white font-bold text-lg">Simulador de Orçamento</h2>
            <p className="text-slate-400 text-sm">Configure e visualize o valor em tempo real</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {done ? (
          <div className="p-12 text-center">
            <CheckCircle className="w-14 h-14 text-emerald-400 mx-auto mb-4" />
            <h3 className="text-white text-xl font-bold mb-2">Proposta enviada!</h3>
            <p className="text-slate-400 mb-6">Nossa equipe vai entrar em contato em até 1 hora útil para confirmar os detalhes e iniciar a implementação.</p>
            <button onClick={onClose} className="bg-emerald-500 hover:bg-emerald-400 text-white font-semibold px-8 py-2.5 rounded-xl transition-colors">
              Fechar
            </button>
          </div>
        ) : showForm ? (
          <div className="p-6 space-y-4">
            <h3 className="text-white font-semibold">Seus dados para contato</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2 space-y-1.5">
                <label className="text-sm text-slate-300">Nome completo *</label>
                <input value={formData.name} onChange={e => setFormData(f => ({ ...f, name: e.target.value }))} placeholder="João Silva" className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm text-slate-300">E-mail *</label>
                <input type="email" value={formData.email} onChange={e => setFormData(f => ({ ...f, email: e.target.value }))} placeholder="seu@email.com" className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm text-slate-300">Telefone *</label>
                <input value={formData.phone} onChange={e => setFormData(f => ({ ...f, phone: e.target.value }))} placeholder="(11) 99999-9999" className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500" />
              </div>
              <div className="col-span-2 space-y-1.5">
                <label className="text-sm text-slate-300">Empresa</label>
                <input value={formData.company} onChange={e => setFormData(f => ({ ...f, company: e.target.value }))} placeholder="Nome da empresa" className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500" />
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={() => setShowForm(false)} className="flex-1 border border-white/20 text-slate-300 font-medium py-2.5 rounded-xl hover:border-white/40 transition-colors">Voltar</button>
              <button onClick={handleProposal} disabled={submitting} className="flex-1 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-60 text-white font-semibold py-2.5 rounded-xl transition-colors flex items-center justify-center gap-2">
                {submitting && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                Enviar proposta
              </button>
            </div>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-0">
            {/* Left — Config */}
            <div className="p-6 space-y-5 border-b md:border-b-0 md:border-r border-white/10">
              {/* Agents */}
              <div>
                <label className="text-sm text-slate-300 block mb-2">Quantidade de Agentes</label>
                <div className="flex items-center gap-3">
                  <button onClick={() => setAgents(a => Math.max(1, a - 1))} className="w-8 h-8 rounded-lg border border-white/20 flex items-center justify-center text-slate-300 hover:border-emerald-500 hover:text-emerald-400 transition-colors">
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="text-white font-bold text-lg w-6 text-center">{agents}</span>
                  <button onClick={() => setAgents(a => Math.min(20, a + 1))} className="w-8 h-8 rounded-lg border border-white/20 flex items-center justify-center text-slate-300 hover:border-emerald-500 hover:text-emerald-400 transition-colors">
                    <Plus className="w-3 h-3" />
                  </button>
                  <span className="text-xs text-slate-500">O plano de leads é compartilhado entre todos os agentes.</span>
                </div>
              </div>

              {/* Lead volume */}
              <div>
                <label className="text-sm text-slate-300 block mb-2">Plano de Leads (por mês)</label>
                <select value={leads} onChange={e => setLeads(Number(e.target.value))} className="w-full bg-[#0a1510] border border-white/10 rounded-lg px-3 py-2.5 text-white focus:outline-none focus:border-emerald-500 cursor-pointer">
                  {LEAD_VOLUMES.map(v => (
                    <option key={v} value={v}>{v.toLocaleString("pt-BR")} atendimentos</option>
                  ))}
                </select>
              </div>

              {/* Plan */}
              <div>
                <label className="text-sm text-slate-300 block mb-2">Plano</label>
                <div className="grid grid-cols-3 gap-2">
                  {(["silver", "gold", "black"] as PlanKey[]).map(p => (
                    <button
                      key={p}
                      onClick={() => setPlan(p)}
                      className={`py-2 rounded-lg border text-sm font-semibold transition-all ${
                        plan === p
                          ? p === "gold" ? "bg-yellow-500/20 border-yellow-500 text-yellow-400"
                          : p === "black" ? "bg-white/20 border-white text-white"
                          : "bg-emerald-500/20 border-emerald-500 text-emerald-400"
                          : "border-white/10 text-slate-400 hover:border-white/30"
                      }`}
                    >
                      {plan === p && <CheckCircle className="w-3 h-3 inline mr-1" />}
                      {PLANS_DATA[p].label}
                    </button>
                  ))}
                </div>
                <div className={`mt-2 text-center py-2 rounded-lg font-bold text-lg border ${
                  plan === "gold" ? "border-yellow-500/20 bg-yellow-500/10 text-yellow-400"
                  : plan === "black" ? "border-white/10 bg-white/5 text-white"
                  : "border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
                }`}>
                  R$ {PRICE_PER_LEAD[plan].toFixed(3).replace(".", ",")} <span className="text-sm font-normal text-slate-400">por lead</span>
                </div>
              </div>

              {/* Contract */}
              <div>
                <label className="text-sm text-slate-300 block mb-2">Tipo de Contrato</label>
                <div className="grid grid-cols-3 gap-2">
                  {CONTRACT_OPTS.map(c => (
                    <button
                      key={c.id}
                      onClick={() => setContract(c.id)}
                      className={`py-2 rounded-lg border text-sm font-medium transition-all ${
                        contract === c.id
                          ? "bg-emerald-500/20 border-emerald-500 text-emerald-400"
                          : "border-white/10 text-slate-400 hover:border-white/30"
                      }`}
                    >
                      {c.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Coupon */}
              <div>
                <label className="text-sm text-slate-300 block mb-2">Cupom de Desconto</label>
                <div className="flex gap-2">
                  <input value={coupon} onChange={e => setCoupon(e.target.value)} placeholder="Digite o código" className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white placeholder:text-slate-500 text-sm focus:outline-none focus:border-emerald-500" />
                  <button className="px-4 py-2 border border-white/20 rounded-lg text-slate-300 text-sm hover:border-emerald-500 hover:text-emerald-400 transition-colors">Aplicar</button>
                </div>
              </div>

              {/* Tools accordion */}
              <div className="border border-white/10 rounded-xl overflow-hidden">
                <button onClick={() => setToolsOpen(o => !o)} className="w-full flex items-center justify-between px-4 py-3 text-sm text-white hover:bg-white/5 transition-colors">
                  <span className="font-medium flex items-center gap-2">
                    🔧 Ferramentas Adicionais <span className="text-xs text-red-400 font-normal">(obrigatório)</span>
                  </span>
                  {toolsOpen ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                </button>
                {toolsOpen && (
                  <div className="border-t border-white/10 p-4 space-y-3">
                    {(Object.entries(TOOLS_OPTS) as [string, typeof TOOLS_OPTS[keyof typeof TOOLS_OPTS]][]).map(([key, tool]) => {
                      const val = key === "elevenlabs" ? elevenlabs : key === "manychat" ? manychat : zapi;
                      const setter = key === "elevenlabs" ? setElevenlabs : key === "manychat" ? setManychat : setZapi;
                      return (
                        <div key={key}>
                          <label className="text-xs text-slate-300 block mb-1.5">{tool.label} *</label>
                          <select
                            value={val}
                            onChange={e => setter(Number(e.target.value))}
                            className="w-full bg-[#0a1510] border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-emerald-500 cursor-pointer"
                          >
                            {tool.opts.map(opt => (
                              <option key={opt.label} value={opt.price}>{opt.label}</option>
                            ))}
                          </select>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Right — Breakdown */}
            <div className="p-6 space-y-4">
              {/* Implementation */}
              <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-2">
                <p className="text-white font-semibold text-sm mb-3">Implementação</p>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Valor base ({agents} agente{agents > 1 ? "s" : ""})</span>
                  <span className="text-white">R$ {fmt(implementBase)}</span>
                </div>
                {implementDiscount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-emerald-400">Desconto ({contractOpt.label.toLowerCase()})</span>
                    <span className="text-emerald-400">-R$ {fmt(implementDiscount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm font-semibold border-t border-white/10 pt-2 mt-2">
                  <span className="text-white">Total Implementação</span>
                  <span className="text-emerald-400">R$ {fmt(implementTotal)}</span>
                </div>
              </div>

              {/* Monthly */}
              <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-2">
                <p className="text-white font-semibold text-sm mb-3">Detalhamento da Mensalidade</p>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Plano {PLANS_DATA[plan].label} ({leads.toLocaleString("pt-BR")} leads)</span>
                  <span className="text-white">R$ {fmt(monthly)}</span>
                </div>
                {toolsMonthly > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Ferramentas</span>
                    <span className="text-white">R$ {fmt(toolsMonthly)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm font-semibold border-t border-white/10 pt-2 mt-2">
                  <span className="text-white">Total por Mês</span>
                  <span className="text-emerald-400">R$ {fmt(totalMonthly)}</span>
                </div>
              </div>

              {/* Summary */}
              <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4 space-y-2">
                <p className="text-white font-semibold text-sm mb-3">Resumo do Pagamento</p>
                {months > 1 ? (
                  <>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-300">Plano {contractOpt.label.toLowerCase()}</span>
                      <span className="text-white">{months}x de R$ {fmt(grandTotal / months)}</span>
                    </div>
                    <p className="text-xs text-slate-500">(Implementação + Mensalidades)</p>
                  </>
                ) : (
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-300">Pagamento mensal</span>
                    <span className="text-white">R$ {fmt(totalMonthly)} + R$ {fmt(implementTotal)} (impl.)</span>
                  </div>
                )}
                <div className="flex justify-between font-bold border-t border-emerald-500/20 pt-2 mt-2">
                  <span className="text-white">Total</span>
                  <span className="text-emerald-400 text-lg">R$ {fmt(grandTotal)}</span>
                </div>
                {implementDiscount > 0 && (
                  <p className="text-emerald-300 text-xs">💰 Economia de R$ {fmt(implementDiscount)} na implementação!</p>
                )}
              </div>

              <button
                onClick={() => setShowForm(true)}
                className="w-full bg-emerald-500 hover:bg-emerald-400 text-white font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                📄 Gerar Proposta
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}

/* ─── App Mockup ────────────────────────────────────────────────────── */

function AppMockup() {
  return (
    <div className="relative w-full max-w-lg mx-auto">
      <div className="bg-[#0c1a14] border border-emerald-500/20 rounded-2xl overflow-hidden shadow-2xl shadow-emerald-500/10">
        {/* Browser bar */}
        <div className="flex items-center gap-1.5 px-4 py-2.5 bg-[#071008] border-b border-white/5">
          <div className="w-3 h-3 rounded-full bg-red-500/60" />
          <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
          <div className="w-3 h-3 rounded-full bg-green-500/60" />
          <div className="flex-1 mx-3 bg-white/5 rounded px-3 py-0.5 text-xs text-slate-500">app.nandidev.com.br</div>
        </div>
        <div className="flex h-52">
          {/* Sidebar */}
          <div className="w-12 bg-[#071008] border-r border-white/5 flex flex-col items-center py-3 gap-3">
            {[Bot, Users, MessageCircle, Calendar, BarChart3].map((Icon, i) => (
              <div key={i} className={`w-7 h-7 rounded-lg flex items-center justify-center ${i === 2 ? "bg-emerald-500/20" : "hover:bg-white/5"}`}>
                <Icon className={`w-3.5 h-3.5 ${i === 2 ? "text-emerald-400" : "text-slate-500"}`} />
              </div>
            ))}
          </div>
          {/* Conversations list */}
          <div className="w-40 border-r border-white/5 p-2 space-y-1.5">
            <p className="text-xs text-slate-400 font-medium px-1 mb-2">Conversas <span className="text-emerald-400">401</span></p>
            {["Maria Silva", "João Souza", "Ana Costa", "Pedro Lima"].map((name, i) => (
              <div key={i} className={`flex items-center gap-2 p-1.5 rounded-lg ${i === 0 ? "bg-white/10" : ""}`}>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0 ${["bg-gradient-to-br from-emerald-400 to-cyan-500","bg-gradient-to-br from-purple-400 to-pink-500","bg-gradient-to-br from-amber-400 to-orange-500","bg-gradient-to-br from-blue-400 to-indigo-500"][i]}`}>
                  {name.split(" ").map(n => n[0]).join("")}
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-white font-medium truncate">{name}</p>
                  <p className="text-xs text-slate-500 truncate">Oi! Como posso...</p>
                </div>
              </div>
            ))}
          </div>
          {/* Chat area */}
          <div className="flex-1 p-3 space-y-2 flex flex-col justify-end">
            <div className="flex justify-end">
              <div className="bg-emerald-600 rounded-lg rounded-tr-sm px-3 py-1.5 max-w-[80%]">
                <p className="text-xs text-white">Oi! 👋 Como posso ajudar você hoje?</p>
              </div>
            </div>
            <div className="flex items-start gap-1.5">
              <div className="w-5 h-5 rounded-full bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center shrink-0">
                <span className="text-[8px] font-bold text-white">MS</span>
              </div>
              <div className="bg-white/10 rounded-lg rounded-tl-sm px-3 py-1.5 max-w-[80%]">
                <p className="text-xs text-white">Quero saber sobre os planos</p>
              </div>
            </div>
            <div className="flex justify-end">
              <div className="bg-emerald-600 rounded-lg rounded-tr-sm px-3 py-1.5 max-w-[90%]">
                <p className="text-xs text-white">Claro! Posso te apresentar nossas opções 🎯</p>
              </div>
            </div>
          </div>
        </div>
        <div className="px-3 py-2 bg-[#071008] border-t border-white/5 flex items-center justify-between">
          <span className="text-xs text-emerald-400">● SDR IA Humanizada</span>
          <span className="text-xs text-emerald-300 font-medium">● Ao vivo</span>
        </div>
      </div>
    </div>
  );
}

/* ─── Main Landing ──────────────────────────────────────────────────── */

export default function Landing() {
  const [simOpen, setSimOpen] = useState(false);
  const [simPlan, setSimPlan] = useState<PlanKey>("gold");
  const [volumeIdx, setVolumeIdx] = useState(1); // 1000 leads
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const selectedLeads = LEAD_VOLUMES[volumeIdx];

  const openSim = (plan: PlanKey = "gold") => {
    setSimPlan(plan);
    setSimOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#07100d] text-white overflow-x-hidden">
      <AnimatePresence>
        {simOpen && <SimulatorModal open={simOpen} onClose={() => setSimOpen(false)} defaultPlan={simPlan} />}
      </AnimatePresence>

      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-40 bg-[#07100d]/80 backdrop-blur-md border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-14">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-white">SDR IA Humanizada</span>
          </div>
          <div className="hidden md:flex items-center gap-6 text-sm text-slate-400">
            <a href="#como-funciona" className="hover:text-white transition-colors">Como funciona</a>
            <a href="#planos" className="hover:text-white transition-colors">Planos</a>
            <a href="#faq" className="hover:text-white transition-colors">FAQ</a>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login" className="text-sm text-slate-400 hover:text-white transition-colors">Entrar</Link>
            <button onClick={() => openSim("gold")} className="bg-emerald-500 hover:bg-emerald-400 text-white text-sm font-semibold px-4 py-1.5 rounded-lg transition-colors">
              Fazer orçamento
            </button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-28 pb-20 px-4">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-medium mb-6">
              <Bot className="w-4 h-4" /> SDR Humanizada
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black leading-tight mb-6">
              SDR com IA que<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">parece humano</span><br />
              — para qualquer segmento
            </h1>
            <p className="text-slate-300 text-lg mb-8 leading-relaxed max-w-xl">
              Agente SDR com IA ultra-humanizada que se adapta a qualquer empresa. Atende leads em segundos, qualifica com naturalidade, agenda automaticamente e nunca para — enquanto custa uma fração de um SDR humano.
            </p>
            <ul className="space-y-2.5 mb-10">
              {[
                "Responde em segundos, 24h por dia, 7 dias por semana",
                "8 camadas de humanização: Voz, Gatilhos, Prompts, Intenções e mais",
                "Se adapta ao tom e segmento de qualquer empresa",
                "Qualificação automática sem variação de qualidade",
                "Capacidade ilimitada — atende 1 ou 10.000 leads ao mesmo tempo",
                "Custo fixo: fração de R$ 4.000–6.000/mês de um SDR humano",
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-2.5 text-sm text-slate-300">
                  <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" /> {item}
                </li>
              ))}
            </ul>
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => openSim("gold")}
                className="flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-white font-bold py-3.5 px-7 rounded-xl transition-colors"
              >
                Quero um SDR com IA no meu negócio <ArrowRight className="w-4 h-4" />
              </button>
              <a href="#como-funciona" className="flex items-center justify-center gap-2 border border-white/20 hover:border-white/40 text-white font-medium py-3.5 px-7 rounded-xl transition-colors">
                ▶ Ver como funciona
              </a>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7, delay: 0.2 }}>
            <AppMockup />
          </motion.div>
        </div>

        {/* Stats */}
        <div className="max-w-4xl mx-auto mt-20 grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { value: "< 3s", label: "Tempo de resposta" },
            { value: "24/7", label: "Disponibilidade" },
            { value: "8x", label: "Camadas de humanização" },
            { value: "∞", label: "Capacidade simultânea" },
          ].map((s, i) => (
            <div key={i} className="text-center p-5 rounded-2xl border border-white/5 bg-white/2">
              <p className="text-3xl font-black text-emerald-400 mb-1">{s.value}</p>
              <p className="text-sm text-slate-400">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Como funciona */}
      <section id="como-funciona" className="py-20 px-4 bg-[#050c08]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <span className="text-xs font-semibold text-emerald-400 tracking-widest uppercase">Processo</span>
            <h2 className="text-3xl md:text-4xl font-bold text-white mt-2 mb-4">Como o SDR IA Humanizado funciona</h2>
            <p className="text-slate-400">Três etapas automáticas, do primeiro contato ao agendamento</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { step: "01", icon: MessageCircle, title: "Recebe o lead", desc: "O SDR identifica a intenção do lead em segundos, via WhatsApp, Instagram ou qualquer canal conectado." },
              { step: "02", icon: Bot, title: "Qualifica com IA", desc: "Faz perguntas estratégicas de forma natural, coleta informações de perfil e qualifica com score automático." },
              { step: "03", icon: Calendar, title: "Agenda automaticamente", desc: "Conecta ao calendário do time, verifica disponibilidade e agenda a reunião — sem envolver nenhum humano." },
            ].map((s, i) => (
              <div key={i} className="relative p-6 rounded-2xl border border-emerald-500/10 bg-emerald-500/5">
                <span className="text-5xl font-black text-emerald-500/20 absolute top-4 right-5">{s.step}</span>
                <div className="w-11 h-11 rounded-xl bg-emerald-500/15 flex items-center justify-center mb-4">
                  <s.icon className="w-5 h-5 text-emerald-400" />
                </div>
                <h3 className="text-white font-bold text-lg mb-2">{s.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* O que o SDR NÃO é */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">O que o SDR IA <span className="text-red-400">NÃO</span> é</h2>
            <p className="text-slate-400">Entenda as diferenças antes de contratar</p>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              { wrong: "Bot genérico com respostas prontas", right: "IA que aprende o tom e contexto do seu negócio" },
              { wrong: "Robô que deixa leads desconfortáveis", right: "SDR humanizado que gera conexão real" },
              { wrong: "Sistema que precisa de manutenção constante", right: "Agente autônomo que aprende e evolui" },
              { wrong: "Substituto do seu time de vendas", right: "Pré-vendas que entrega leads quentes prontos" },
            ].map((item, i) => (
              <div key={i} className="grid grid-cols-2 gap-0 rounded-xl overflow-hidden border border-white/10">
                <div className="p-4 bg-red-500/5 border-r border-white/10">
                  <div className="flex items-start gap-2">
                    <XCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                    <p className="text-sm text-slate-400">{item.wrong}</p>
                  </div>
                </div>
                <div className="p-4 bg-emerald-500/5">
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <p className="text-sm text-white">{item.right}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="planos" className="py-20 px-4 bg-[#050c08]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10">
            <span className="text-xs font-semibold text-emerald-400 tracking-widest uppercase">Planos</span>
            <h2 className="text-3xl md:text-4xl font-bold text-white mt-2 mb-4">Escolha o plano ideal para sua operação</h2>
            <p className="text-slate-400">Preço justo por lead atendido — sem surpresas</p>
          </div>

          {/* Volume selector */}
          <div className="mb-10">
            <p className="text-center text-white font-medium mb-5">Quantos leads você atende por mês?</p>
            <div className="flex flex-wrap justify-center gap-2">
              {LEAD_VOLUMES.map((v, i) => (
                <button
                  key={v}
                  onClick={() => setVolumeIdx(i)}
                  className={`px-4 py-2 rounded-full text-sm font-medium border transition-all ${
                    volumeIdx === i
                      ? "bg-emerald-500 border-emerald-500 text-white"
                      : "border-white/20 text-slate-400 hover:border-white/40 hover:text-white"
                  }`}
                >
                  {v === 20000 ? "20.000+" : v.toLocaleString("pt-BR")}
                </button>
              ))}
            </div>
          </div>

          {/* Plan cards */}
          <div className="grid md:grid-cols-3 gap-6">
            {(["silver", "gold", "black"] as PlanKey[]).map(key => {
              const p = PLANS_DATA[key];
              const c = planColor(key);
              const monthly = Math.round(selectedLeads * PRICE_PER_LEAD[key]);
              return (
                <div key={key} className={`relative rounded-2xl border p-6 ${c.card} ${key === "gold" ? "ring-1 ring-yellow-500/30" : ""}`}>
                  {key === "gold" && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <span className="bg-yellow-500 text-black text-xs font-bold px-3 py-1 rounded-full">Mais Popular</span>
                    </div>
                  )}
                  <h3 className={`text-2xl font-black mb-1 ${c.accent}`}>{p.label}</h3>
                  <p className="text-slate-400 text-sm mb-5">{p.desc}</p>

                  <div className="mb-1">
                    <span className={`text-xs text-slate-400`}>R$</span>
                    <span className={`text-4xl font-black mx-1 ${c.accent}`}>{p.priceLabel}</span>
                    <span className="text-slate-400 text-sm">/lead</span>
                  </div>
                  <p className="text-slate-400 text-sm mb-6">
                    R$ {monthly.toLocaleString("pt-BR")}/mês
                  </p>

                  <ul className="space-y-2.5 mb-8">
                    {p.features.map((f, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm">
                        {f.ok
                          ? <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                          : <XCircle className="w-4 h-4 text-slate-600 shrink-0" />}
                        <span className={f.ok ? "text-slate-200" : "text-slate-600"}>{f.text}</span>
                      </li>
                    ))}
                  </ul>

                  <button
                    onClick={() => openSim(key)}
                    className={`w-full py-3 rounded-xl font-bold text-sm transition-colors ${c.btn}`}
                  >
                    Fazer um orçamento
                  </button>
                  <button
                    onClick={() => openSim(key)}
                    className="w-full mt-2 text-xs text-slate-500 hover:text-slate-300 transition-colors py-1"
                  >
                    Ver todas as funcionalidades
                  </button>
                </div>
              );
            })}
          </div>

          <p className="text-center text-slate-500 text-sm mt-8">
            Precisa de uma solução personalizada?{" "}
            <button onClick={() => openSim("black")} className="text-emerald-400 hover:underline">Fale com a NandiDev →</button>
          </p>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-20 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Perguntas Frequentes</h2>
            <p className="text-slate-400">Tudo que você precisa saber antes de contratar</p>
          </div>
          <div className="space-y-3">
            {FAQ_ITEMS.map((item, i) => (
              <div key={i} className="border border-white/10 rounded-xl overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-white/5 transition-colors"
                >
                  <span className="text-white font-medium text-sm pr-4">{item.q}</span>
                  {openFaq === i ? <ChevronUp className="w-4 h-4 text-emerald-400 shrink-0" /> : <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />}
                </button>
                <AnimatePresence>
                  {openFaq === i && (
                    <motion.div
                      initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }}
                      transition={{ duration: 0.25 }} className="overflow-hidden"
                    >
                      <p className="px-5 pb-4 text-slate-400 text-sm leading-relaxed border-t border-white/5 pt-3">{item.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 px-4 bg-gradient-to-b from-[#050c08] to-[#07100d]">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Transforme sua operação comercial com o{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">SDR IA Humanizada</span>
          </h2>
          <p className="text-slate-400 mb-8">Comece agora e tenha seu SDR rodando em até 10 dias úteis</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button onClick={() => openSim("gold")} className="flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-white font-bold py-3.5 px-8 rounded-xl transition-colors">
              Fazer meu orçamento <ArrowRight className="w-4 h-4" />
            </button>
            <Link to="/login" className="flex items-center justify-center gap-2 border border-white/20 hover:border-white/40 text-white font-medium py-3.5 px-8 rounded-xl transition-colors">
              Já sou cliente — Entrar
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8 px-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-slate-500">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center">
              <Bot className="w-3 h-3 text-white" />
            </div>
            <span>SDR IA Humanizada — NandiDev</span>
          </div>
          <p>© 2026 NandiDev. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
}
