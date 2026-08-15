-- Mantém os valores já registrados, mas novos envios não precisam informar quantidade de usuários.
alter table if exists public.lead_source_feedback
  alter column user_count drop not null;
