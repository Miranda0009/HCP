# Supabase no HCP

Este diretório mantém a estrutura do banco versionada junto do repositório.

## Histórico de migrações e publicação

Os nomes em `migrations/` devem manter exatamente a versão registrada em
`supabase_migrations.schema_migrations`. Um arquivo já aplicado não deve ser
renumerado nem substituído por uma migração vazia.

Em 2026-10-01, o histórico foi reconciliado por consultas somente de leitura:

- `20260905031826_create_adi_flights.sql` foi recuperado dos comandos originais
  registrados no banco. Essa tabela de voos já existia no projeto Supabase; a
  recuperação preserva o histórico, não adiciona uma funcionalidade ao HCP.
- A migração de usuários e convites foi renomeada de `20260928232105` para a
  versão realmente aplicada, `20260928234314`, sem mudar seu SQL.
- Nenhum dado, esquema ou registro de histórico remoto foi apagado ou reparado.

O teste `node --test tests/migration-history.test.cjs` verifica as 12 migrações
do histórico consultado e compara o conteúdo dos dois arquivos recuperados com
os comandos do banco, normalizando apenas quebras de linha. É uma regressão
offline; a confirmação da publicação é o novo check **Supabase Preview** no
GitHub. Antes de mudanças futuras, compare também o histórico remoto atualizado.

O `schema.sql` é uma referência consolidada; esta correção de histórico não
comprova que a sequência de migrações possa inicializar um banco vazio. Não use
`db reset --linked` no projeto de produção para testar isso.

Referências oficiais:
[migrações e desenvolvimento local](https://supabase.com/docs/guides/local-development/cli-workflows)
e [diagnóstico de publicação](https://supabase.com/docs/guides/deployment/branching/troubleshooting).

## Estrutura do projeto

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

## CRM por empresa

A migração `migrations/20260928225232_create_private_and_shared_crm_boards.sql` cria `crm_boards` e `account_invitations`. Ela já foi aplicada ao projeto acima. Cada login continua com seu espaço de trabalho próprio até aceitar um convite para outra empresa; ter o mesmo domínio de e-mail ou informar a mesma empresa no cadastro **não** une contas automaticamente.

- Todo CRM novo é privado para quem o criou. Só o criador pode torná-lo visível para a equipe ou excluí-lo.
- Ao escolher **Compartilhar com equipe**, membros autenticados daquela empresa podem ver e editar cards, nome, tipo e etapas. Um membro não pode transformar um CRM de outra pessoa em privado nem excluí-lo.
- O proprietário ou administrador convida pelo e-mail da pessoa. O convite vale por 14 dias e só pode ser aceito pela conta cujo e-mail foi confirmado. O sistema **não envia e-mail** automaticamente: o convidado precisa entrar no CRM e aceitar o convite exibido na tela.
- A quantidade de usuários escolhida na montagem do plano é uma estimativa; ainda não limita convites nem substitui contratação/cobrança de assentos.
- As alterações usam revisão para detectar edição simultânea. Em conflito, a tela recarrega o CRM e pede que a alteração seja refeita, sem sobrescrever silenciosamente a edição de outra pessoa.
- **Baixar backup** exporta o CRM selecionado em JSON. **Restaurar backup** cria uma cópia privada; **Excluir CRM** é definitivo no aplicativo. O backup é manual, não um agendamento automático nem uma política de recuperação do banco.
- CRMs antigos que estejam apenas no navegador não são migrados automaticamente. Use **Importar dados locais** uma vez, na conta correta; a importação cria cópias privadas no banco e preserva os originais locais. Repetir a importação cria duplicatas.

### Caminho para um piloto com usuários reais

1. Definir quem será a empresa proprietária do piloto e quais pessoas serão convidadas. As contas atuais não foram unidas automaticamente.
2. Publicar o site em HTTPS e cadastrar a URL oficial de retorno no Supabase Auth. Abrir por `file://` não é um ambiente de piloto confiável.
3. Testar convite, aceite, edição compartilhada e isolamento entre duas empresas com contas de teste, antes de importar dados reais.
4. Selecionar e contratar uma fonte de dados de empresas/leads, verificar licença de uso e qualidade, e integrar a busca ao backend. As telas atuais de leads não comprovam que já exista uma base real licenciada.
5. Definir termos, privacidade, retenção e atendimento a solicitações de titulares antes de armazenar dados pessoais de leads. Revisar as regras de acesso e registrar responsáveis pela operação.
6. Configurar backup **automático do banco**, testar uma restauração e monitorar erros, custos e uso. O JSON manual do CRM é apenas uma salvaguarda adicional.
7. Rodar um piloto pequeno com autorização explícita dos participantes, medir qualidade dos dados, utilidade das listas e uso do funil; só depois ampliar assentos, cobrança e volume.

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
