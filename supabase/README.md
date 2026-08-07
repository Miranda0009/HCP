# Supabase no HCP

Este diretório mantém a estrutura do banco versionada junto do repositório.

- Projeto: `euxpmahouesimyyffcio`
- Schema inicial: `schema.sql`
- Cliente web: `../js/supabase-config.js`
- Autenticação: `../js/auth.js` e `../js/auth-guard.js`
- Perfil, avatar e senha: `../js/profile.js`

O navegador usa somente a chave **publishable**, que foi criada para uso público no frontend. Nunca adicione uma chave `secret` ou `service_role` ao repositório.

O schema também cria o bucket público `avatars`, limitado a JPG, PNG ou WebP de até 2 MB. As políticas de escrita restringem cada usuário à pasta identificada pelo próprio UUID.

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
