CREATE TABLE IF NOT EXISTS public.agent_config (
  id INT PRIMARY KEY,
  config JSONB NOT NULL DEFAULT '{}',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.agent_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read agent_config" ON public.agent_config FOR SELECT TO public USING (true);
CREATE POLICY "Public insert agent_config" ON public.agent_config FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Public update agent_config" ON public.agent_config FOR UPDATE TO public USING (true);

INSERT INTO public.agent_config (id, config) VALUES (1, '{}') ON CONFLICT (id) DO NOTHING;