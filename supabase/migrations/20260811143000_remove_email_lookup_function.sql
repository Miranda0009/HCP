-- Remove a consulta administrativa de e-mail; o cliente interpreta o retorno protegido do Supabase Auth.
drop function if exists public.hcp_email_exists(text);

