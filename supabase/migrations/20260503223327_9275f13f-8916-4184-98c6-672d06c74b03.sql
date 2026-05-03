
DELETE FROM public.agent_config WHERE user_id IS NULL;

ALTER TABLE public.agent_config DROP CONSTRAINT IF EXISTS agent_config_pkey;
ALTER TABLE public.agent_config ALTER COLUMN id DROP NOT NULL;
ALTER TABLE public.agent_config ALTER COLUMN user_id SET NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS agent_config_user_id_key ON public.agent_config(user_id);

DROP POLICY IF EXISTS "Users manage own agent_config" ON public.agent_config;

CREATE POLICY "Users select own agent_config"
ON public.agent_config FOR SELECT TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users insert own agent_config"
ON public.agent_config FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own agent_config"
ON public.agent_config FOR UPDATE TO authenticated
USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users delete own agent_config"
ON public.agent_config FOR DELETE TO authenticated
USING (auth.uid() = user_id);
