-- Auth: add user_id to leads and conversations (multi-tenant)
alter table public.leads add column if not exists user_id uuid references auth.users(id) on delete cascade;
alter table public.conversations add column if not exists user_id uuid references auth.users(id) on delete cascade;
alter table public.schedule_events add column if not exists user_id uuid references auth.users(id) on delete cascade;
alter table public.agent_config add column if not exists user_id uuid references auth.users(id) on delete cascade;

-- Update RLS: leads
drop policy if exists "Public leads access" on public.leads;
create policy "Users manage own leads" on public.leads
  for all using (auth.uid() = user_id);

-- Update RLS: conversations
drop policy if exists "Public conversations access" on public.conversations;
create policy "Users manage own conversations" on public.conversations
  for all using (auth.uid() = user_id);

-- Update RLS: schedule_events
drop policy if exists "Public schedule_events access" on public.schedule_events;
create policy "Users manage own schedule_events" on public.schedule_events
  for all using (auth.uid() = user_id);

-- Update RLS: agent_config
drop policy if exists "Public agent_config access" on public.agent_config;
create policy "Users manage own agent_config" on public.agent_config
  for all using (auth.uid() = user_id);

-- Subscriptions table
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
create policy "Users see own subscription" on public.subscriptions
  for all using (auth.uid() = user_id);

-- Proposals table (quote requests from landing page)
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
-- Proposals are inserted by anonymous users (landing page), read only by auth users
create policy "Anyone can insert proposals" on public.proposals
  for insert with check (true);
create policy "Auth users can read proposals" on public.proposals
  for select using (auth.role() = 'authenticated');

-- Auto create trial subscription on signup
create or replace function public.create_trial_subscription()
returns trigger language plpgsql security definer as $$
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
