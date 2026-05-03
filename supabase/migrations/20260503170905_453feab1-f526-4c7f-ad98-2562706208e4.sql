-- Auth: add user_id to leads and conversations (multi-tenant)
alter table public.leads add column if not exists user_id uuid references auth.users(id) on delete cascade;
alter table public.conversations add column if not exists user_id uuid references auth.users(id) on delete cascade;
alter table public.schedule_events add column if not exists user_id uuid references auth.users(id) on delete cascade;
alter table public.agent_config add column if not exists user_id uuid references auth.users(id) on delete cascade;

-- Replace public RLS with user-scoped policies: leads
drop policy if exists "Public leads access" on public.leads;
drop policy if exists "Public read leads" on public.leads;
drop policy if exists "Public insert leads" on public.leads;
drop policy if exists "Public update leads" on public.leads;
create policy "Users manage own leads" on public.leads
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- conversations
drop policy if exists "Public conversations access" on public.conversations;
drop policy if exists "Public read conversations" on public.conversations;
drop policy if exists "Public insert conversations" on public.conversations;
drop policy if exists "Public update conversations" on public.conversations;
create policy "Users manage own conversations" on public.conversations
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- schedule_events
drop policy if exists "Public schedule_events access" on public.schedule_events;
drop policy if exists "Public read events" on public.schedule_events;
drop policy if exists "Public insert events" on public.schedule_events;
drop policy if exists "Public update events" on public.schedule_events;
create policy "Users manage own schedule_events" on public.schedule_events
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- agent_config
drop policy if exists "Public agent_config access" on public.agent_config;
drop policy if exists "Public read agent_config" on public.agent_config;
drop policy if exists "Public insert agent_config" on public.agent_config;
drop policy if exists "Public update agent_config" on public.agent_config;
create policy "Users manage own agent_config" on public.agent_config
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- messages: scope via parent conversation owner
drop policy if exists "Public read messages" on public.messages;
drop policy if exists "Public insert messages" on public.messages;
create policy "Users read messages of own conversations" on public.messages
  for select using (exists (select 1 from public.conversations c where c.id = conversation_id and c.user_id = auth.uid()));
create policy "Users insert messages in own conversations" on public.messages
  for insert with check (exists (select 1 from public.conversations c where c.id = conversation_id and c.user_id = auth.uid()));

-- Subscriptions
create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade unique not null,
  plan text not null default 'trial' check (plan in ('trial','silver','gold','black')),
  status text not null default 'trial' check (status in ('trial','active','overdue','suspended','cancelled')),
  leads_volume int not null default 500,
  agents int not null default 1,
  contract_type text not null default 'mensal' check (contract_type in ('mensal','semestral','anual')),
  monthly_amount numeric(10,2),
  asaas_customer_id text,
  asaas_subscription_id text,
  trial_ends_at timestamptz default (now() + interval '7 days'),
  current_period_start date,
  current_period_end date,
  next_due_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.subscriptions enable row level security;
drop policy if exists "Users see own subscription" on public.subscriptions;
create policy "Users see own subscription" on public.subscriptions
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create trigger update_subscriptions_updated_at
  before update on public.subscriptions
  for each row execute function public.update_updated_at_column();

-- Proposals (quote requests from landing page)
create table if not exists public.proposals (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  phone text not null,
  company text,
  plan text not null,
  leads_volume int not null,
  agents int not null default 1,
  contract_type text not null,
  monthly_total numeric(10,2),
  implementation_total numeric(10,2),
  grand_total numeric(10,2),
  status text not null default 'new' check (status in ('new','contacted','converted','lost')),
  notes text,
  created_at timestamptz not null default now()
);

alter table public.proposals enable row level security;
drop policy if exists "Anyone can insert proposals" on public.proposals;
create policy "Anyone can insert proposals" on public.proposals
  for insert with check (true);
drop policy if exists "Auth users can read proposals" on public.proposals;
create policy "Auth users can read proposals" on public.proposals
  for select using (auth.role() = 'authenticated');

-- Auto create trial subscription on signup
create or replace function public.create_trial_subscription()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.subscriptions (user_id)
  values (new.id)
  on conflict (user_id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.create_trial_subscription();