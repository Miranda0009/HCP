# Guia HCP: cadastro, chaves e integração de APIs

Versão 1.0 — agosto de 2026

Este guia explica como testar o cadastro do HCP e como conectar novas APIs sem expor senhas, chaves administrativas ou credenciais de terceiros.

## 1. O que já está configurado no HCP

- Supabase Auth para cadastro e login com e-mail e senha.
- Confirmação de e-mail e recuperação de senha.
- Redirecionamento para `html/painel.html` após o login.
- Tabela `public.profiles` protegida por RLS.
- Bucket público `avatars`, com upload limitado a JPG, PNG ou WebP de até 2 MB.
- Cada usuário só pode enviar, substituir ou remover o avatar da própria pasta.
- Edição de nome, empresa e telefone.
- Troca de senha com confirmação da senha atual.
- Registro protegido da qualidade das listas/APIs em `public.lead_source_feedback`.
- Consulta pública de CNPJ pela CNPJá na aba **Segmentos inteligentes → Troca de dados por tokens**.

## 2. Passo a passo para cadastrar uma conta por e-mail

### Preparar o projeto

1. Abra a pasta `HCP - site` no VS Code.
2. Instale ou use a extensão Live Server.
3. Abra `html/login.html` com o Live Server. Evite abrir o arquivo diretamente com `file://`.
4. No Supabase, abra **Authentication → URL Configuration**.
5. Cadastre a URL usada pelo Live Server, por exemplo:
   - `http://127.0.0.1:5500/html/login.html`
   - `http://localhost:5500/html/login.html`
6. Em produção, adicione também a URL definitiva do login.

### Criar e confirmar a conta

1. Na tela de login, clique em **Crie uma conta**.
2. Informe nome completo, e-mail e uma senha com pelo menos 8 caracteres.
3. Clique em **Criar conta**.
4. Abra a caixa de entrada do e-mail informado.
5. Clique no link de confirmação enviado pelo Supabase.
6. Volte ao login, informe e-mail e senha e clique em **Entrar agora**.
7. O usuário será levado automaticamente ao painel.

Se a confirmação não chegar, verifique spam, URLs de redirecionamento, logs de Auth e limites de envio. Para usuários reais, configure um SMTP próprio em **Authentication → Emails → SMTP Settings**. O SMTP padrão é apropriado apenas para testes limitados.

## 3. Perfil, foto e senha

### Editar a conta

1. Entre no HCP.
2. Abra **Minha conta**.
3. Edite nome completo, empresa e telefone.
4. Clique em **Salvar alterações**.

O e-mail aparece como somente leitura. Alterar o e-mail exige um fluxo separado de confirmação no Supabase.

### Alterar a foto

1. Clique em **Alterar foto**.
2. Escolha uma imagem JPG, PNG ou WebP de até 2 MB.
3. Aguarde a confirmação do upload.
4. Para voltar às iniciais, clique em **Remover foto**.

Sem uma foto escolhida, o HCP combina a primeira letra do primeiro e do último nome e mostra as duas iniciais sobre um fundo roxo sólido.

### Alterar a senha

1. Informe a senha atual.
2. Digite uma nova senha com pelo menos 8 caracteres.
3. Repita a nova senha.
4. Clique em **Atualizar senha**.

Se a conta foi criada somente pelo Google e ainda não possui senha, use **Esqueceu a senha?** na tela de login para criar uma.

## 4. Entenda quais chaves podem aparecer no frontend

| Tipo de credencial | Pode ir para o navegador? | Pode ir para o GitHub? | Onde guardar |
|---|---:|---:|---|
| Supabase publishable key | Sim | Sim | Configuração do cliente web |
| Supabase anon key legado | Sim, com RLS | Evite em projetos novos | Configuração do cliente web |
| Supabase secret key | Não | Não | Servidor ou segredo de Edge Function |
| Supabase service_role | Não | Não | Servidor confiável |
| API key secreta de terceiros | Não | Não | Servidor ou segredo de Edge Function |
| Chave pública de mapas ou analytics | Depende | Somente com restrições | Frontend, limitada por domínio e cota |

Regra prática: tudo que está em HTML, CSS ou JavaScript entregue ao navegador é público. Em um site estático, um arquivo `.env` não transforma uma chave secreta em privada se o valor terminar dentro do JavaScript publicado.

## 5. Como escolher a arquitetura de uma nova API

### Caso A — API pública, sem segredo

Use o frontend diretamente somente quando a documentação do provedor disser que a chave é publicável.

Checklist:

1. Restrinja a chave aos domínios do HCP.
2. Defina cotas e alertas de consumo.
3. Confirme que a API permite chamadas do navegador e possui CORS adequado.
4. Não conceda permissões administrativas.
5. Teste o comportamento quando a cota terminar.

### Caso B — API com chave secreta

Use uma Supabase Edge Function como intermediária:

`Navegador → Edge Function autenticada → API externa`

Passos:

1. Crie uma função com um nome específico, como `consultar-provedor`.
2. Mantenha a validação JWT habilitada.
3. Cadastre a chave secreta no painel do Supabase ou com a CLI:

   `supabase secrets set PROVIDER_API_KEY=valor-da-chave`

4. Leia a chave dentro da função com `Deno.env.get('PROVIDER_API_KEY')`.
5. Valide os campos recebidos e rejeite requisições inválidas.
6. Aplique timeout, limite de tamanho, tratamento de erros e rate limit.
7. Retorne ao navegador somente os dados necessários.
8. Chame a função pelo cliente Supabase:

   `supabase.functions.invoke('consultar-provedor', { body: { consulta } })`

Nunca envie a chave secreta no corpo da requisição, na URL, em mensagens de erro ou no console do navegador.

## 6. Banco de dados e RLS para integrações

Quando a API precisar salvar dados:

1. Crie uma tabela no schema `public` apenas se o frontend precisar acessá-la.
2. Adicione uma coluna `user_id` referenciando `auth.users(id)`.
3. Habilite RLS.
4. Crie políticas com `TO authenticated` e verificação de propriedade:

   `using ((select auth.uid()) = user_id)`

5. Para atualização, use `USING` e `WITH CHECK`.
6. Conceda somente `SELECT`, `INSERT`, `UPDATE` ou `DELETE` realmente necessários.
7. Rode os Security e Performance Advisors depois de mudanças no schema.

Nunca use `user_metadata` como autorização. Dados editáveis pelo próprio usuário servem para apresentação, não para decidir permissões.

## 7. Webhooks

Webhooks são chamadas feitas pelo provedor para o HCP. Eles precisam de uma função pública, mas autenticada pela assinatura do próprio provedor.

1. Crie uma Edge Function exclusiva para o webhook.
2. Guarde o segredo de assinatura como segredo da função.
3. Valide a assinatura antes de processar o corpo.
4. Registre um identificador único do evento para evitar processamento duplicado.
5. Responda rapidamente e processe tarefas demoradas de forma assíncrona.
6. Não registre tokens, senhas ou o corpo completo se houver dados sensíveis.

Desabilite a validação JWT da função somente quando o provedor não puder enviar o JWT do Supabase e a função validar corretamente a assinatura do webhook.

## 8. GitHub e controle de segredos

Arquivos que podem ser versionados:

- SQL de schema e políticas.
- Código de Edge Functions sem valores secretos.
- `.env.example` contendo apenas nomes e valores fictícios.
- Documentação de configuração.

Arquivos e valores que não devem ser versionados:

- `.env` real.
- Chaves `secret` ou `service_role`.
- Client Secret do Google.
- Tokens pessoais do GitHub.
- Segredos de webhook.

Antes de cada commit:

1. Rode `git diff` e confira se nenhuma chave real apareceu.
2. Procure termos como `service_role`, `secret`, `token` e `password`.
3. Confirme que arquivos `.env` reais estão no `.gitignore`.
4. Rode testes e os Advisors do Supabase.
5. Use uma mensagem de commit que explique a integração.

Se um segredo for enviado ao GitHub por engano, removê-lo do arquivo não basta: revogue ou rotacione a credencial imediatamente.

## 9. Google Sign-In

1. Crie um cliente OAuth Web no Google Cloud Console.
2. Use a callback autorizada:
   `https://euxpmahouesimyyffcio.supabase.co/auth/v1/callback`
3. No Supabase, abra **Authentication → Providers → Google**.
4. Ative o provedor e informe Client ID e Client Secret diretamente no painel.
5. Em **Authentication → URL Configuration**, adicione as URLs locais e de produção do login.
6. Nunca coloque o Client Secret no JavaScript ou no GitHub.

## 10. Checklist para qualquer nova API

- [ ] Li a documentação oficial e identifiquei o tipo de autenticação.
- [ ] Classifiquei a chave como pública ou secreta.
- [ ] Defini se a chamada será feita no frontend ou em Edge Function.
- [ ] Restrigi domínios, escopos, cotas e permissões.
- [ ] Configurei segredos fora do repositório.
- [ ] Validei entradas e tratei erros sem expor credenciais.
- [ ] Criei RLS quando há dados de usuário.
- [ ] Configurei assinatura e idempotência para webhooks.
- [ ] Testei sucesso, falha, timeout e limite de cota.
- [ ] Rodei Advisors e revisei `git diff`.
- [ ] Documentei como rotacionar e revogar as credenciais.

## 11. Links oficiais úteis

- Auth por senha: https://supabase.com/docs/guides/auth/passwords
- URLs de redirecionamento: https://supabase.com/docs/guides/auth/redirect-urls
- SMTP: https://supabase.com/docs/guides/auth/auth-smtp
- API keys: https://supabase.com/docs/guides/api/api-keys
- RLS: https://supabase.com/docs/guides/database/postgres/row-level-security
- Storage e políticas: https://supabase.com/docs/guides/storage/security/access-control
- Edge Functions e segredos: https://supabase.com/docs/guides/functions/secrets
- Google Auth: https://supabase.com/docs/guides/auth/social-login/auth-google
- Checklist de produção: https://supabase.com/docs/guides/deployment/going-into-prod

## 12. Integração CNPJá no HCP

O HCP usa a API pública oficial da CNPJá, sem chave secreta:

`GET https://open.cnpja.com/office/:cnpj`

O fluxo implementado:

1. Remove a pontuação e valida os dígitos verificadores do CNPJ.
2. Consulta a CNPJá e preenche razão social, situação, cidade, atividade principal e telefone.
3. O cliente confirma a origem da lista/API, nicho, telefone, número de usuários e nota de utilidade.
4. O Supabase salva a contribuição com RLS, associada ao usuário autenticado.
5. Cada contribuição válida registra 25 tokens para criação de listas.

A API pública não exige autenticação, mas possui limite oficial de 5 consultas por minuto por IP. Para volume maior ou pesquisa avançada, migre para a API comercial e mantenha o token em uma Edge Function autenticada — nunca no JavaScript ou no APK.

Documentação oficial: https://cnpja.com/api/open
