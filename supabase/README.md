# Supabase no HCP

Este diretório mantém a estrutura do banco versionada junto do repositório.

- Projeto: `euxpmahouesimyyffcio`
- Schema inicial: `schema.sql`
- Cliente web: `../js/supabase-config.js`
- Autenticação: `../js/auth.js` e `../js/auth-guard.js`
- Perfil, avatar e senha: `../js/profile.js`
- Qualidade das fontes e tokens: tabela `public.lead_source_feedback`
- Cliente foco para criação de listas: tabela `public.client_focus_profiles`
- Integração pública CNPJá: `../js/cnpja.js` e `../js/segmentos.js`

O navegador usa somente a chave **publishable**, que foi criada para uso público no frontend. Nunca adicione uma chave `secret` ou `service_role` ao repositório.

O schema também cria o bucket público `avatars`, limitado a JPG, PNG ou WebP de até 2 MB. As políticas de escrita restringem cada usuário à pasta identificada pelo próprio UUID.

A tabela `lead_source_feedback` aceita somente leitura e inserção do próprio usuário autenticado. Cada contribuição válida registra 25 tokens, a origem da lista/API, nicho, telefone, CNPJ e nota de utilidade.

A tabela `client_focus_profiles` mantém uma única preferência por usuário: nicho desejado, porte das empresas-alvo e principal sinal de oportunidade. As políticas permitem somente leitura, criação e atualização do próprio registro.

No cadastro, o HCP interpreta o retorno protegido do Supabase Auth: uma resposta ofuscada sem identidades indica que o e-mail já pertence a uma conta, evitando exibir a confirmação de criação incorretamente.

## Desenvolvimento local

Abra `html/login.html` por um servidor HTTP, por exemplo a extensão Live Server do VS Code. O fluxo do Google não funciona abrindo o HTML diretamente com `file://`.

URLs locais sugeridas para a lista de redirecionamentos do Supabase:

- `http://127.0.0.1:5500/html/login.html`
- `http://localhost:5500/html/login.html`

## Ativar o Google

1. No Google Cloud Console, crie um cliente OAuth para aplicação Web.
2. Adicione esta URI de callback autorizada:
   `https://euxpmahouesimyyffcio.supabase.co/auth/v1/callback`
3. No Supabase, abra **Authentication → Providers → Google**, ative o provedor e informe o Client ID e o Client Secret diretamente no painel.
4. Em **Authentication → URL Configuration**, inclua as URLs locais acima e a URL de produção do login quando o site for publicado.

O Client Secret do Google deve permanecer somente no painel do Supabase.
