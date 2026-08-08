# Recomendação de arquitetura e escala — HCP

**Decisão técnica | Agosto de 2026**

## Resumo executivo

A recomendação para o HCP é migrar gradualmente o front-end para **Next.js + React + TypeScript**, manter o **Supabase** como plataforma de autenticação, armazenamento e banco de dados, usar **Supabase Edge Functions** para integrações seguras no curto prazo e introduzir **NestJS + TypeScript** apenas quando as regras de negócio e os processos assíncronos justificarem uma API própria.

O HTML, o CSS e o JavaScript atuais não serão desperdiçados. HTML e CSS continuam sendo a base entregue ao navegador, e o JavaScript será migrado progressivamente para TypeScript. A mudança principal é organizar a interface em componentes reutilizáveis, rotas, estados e testes.

> **Decisão recomendada:** React/Next.js/TypeScript no front-end, Supabase/PostgreSQL no núcleo de dados e uma migração incremental, página por página, sem reescrever todo o sistema de uma vez.

## 1. Situação atual do HCP

Na análise realizada, o projeto possuía 11 páginas HTML e aproximadamente 7.400 linhas distribuídas entre HTML, CSS e JavaScript. A solução já demonstra bem o produto, mas a repetição de cabeçalho, menu lateral, cartões, formulários e scripts aumenta o custo de manutenção conforme novas funcionalidades são adicionadas.

### Pontos positivos

- Interface já estruturada e identidade visual definida.
- Supabase já utilizado para autenticação e dados.
- Páginas e jornadas principais já servem como especificação visual da futura aplicação.
- HTML, CSS e JavaScript existentes podem ser reaproveitados durante a migração.

### Limitações para a próxima fase

- Componentes visuais repetidos em vários arquivos.
- Alterações globais exigem editar diversas páginas.
- Estado da interface e autenticação são coordenados por scripts globais.
- Ausência de TypeScript, build padronizado e testes automatizados.
- Crescimento de integrações pode expor regras demais no navegador se não houver uma camada segura no servidor.

## 2. É possível continuar somente com HTML, CSS e JavaScript?

Sim, tecnicamente é possível. O navegador sempre executará HTML, CSS e JavaScript. O problema não é capacidade; é o custo de organização e manutenção quando o produto cresce.

Para um protótipo ou site pequeno, a estrutura atual é simples e eficiente. Para um SaaS com autenticação, preferências, pesquisas, favoritos, histórico, planos, permissões, integrações e possíveis equipes, a duplicação começa a produzir inconsistências, regressões e desenvolvimento mais lento.

Portanto, a recomendação não é abandonar essas tecnologias. É continuar usando-as dentro de uma arquitetura que ofereça componentes, tipagem, rotas, carregamento de dados e testes.

## 3. Comparação das opções de front-end

| Opção | Pontos fortes | Limitações | Adequação ao HCP |
|---|---|---|---|
| HTML + CSS + JavaScript | Simplicidade, ausência de dependências e baixo custo inicial | Duplicação, scripts globais e manutenção crescente | Boa para protótipo; fraca para a escala prevista |
| Vue + TypeScript | Aprendizado amigável, templates próximos do HTML e migração confortável | Ecossistema e disponibilidade de profissionais menores que React em alguns mercados | Excelente segunda opção |
| React + TypeScript | Ecossistema amplo, componentes, bibliotecas maduras e grande oferta de profissionais | Exige decisões de arquitetura e disciplina de projeto | Melhor equilíbrio geral para o HCP |
| Angular | Framework completo, convenções fortes e recursos para equipes grandes | Maior complexidade, peso e curva de aprendizado | Mais robusto do que o necessário nesta fase |

### Recomendação de front-end

Usar **Next.js + React + TypeScript**.

- **React** organiza menus, cartões, formulários, tabelas e modais em componentes reutilizáveis.
- **Next.js** fornece roteamento, layouts, renderização no servidor quando útil, rotas de API e uma estrutura de aplicação consistente.
- **TypeScript** detecta erros de tipos, contratos e propriedades antes que cheguem ao usuário.
- **CSS Modules** permite reaproveitar o CSS atual e reduzir conflitos de estilos gradualmente.

### Bibliotecas sugeridas

- React Hook Form para formulários.
- Zod para validação de dados.
- TanStack Query para busca, cache e atualização de dados no cliente.
- Vitest para testes unitários.
- Playwright para testes completos de cadastro, login, pesquisa e preferências.

## 4. Recomendação de backend

### Curto prazo: Supabase e Edge Functions

O Supabase atende bem a fase atual. A aplicação pode continuar usando:

- Supabase Auth para cadastro, login, Google OAuth e recuperação de senha.
- PostgreSQL com Row Level Security para dados e permissões.
- Supabase Storage para fotos de perfil e arquivos.
- Supabase Edge Functions para chamadas que usam chaves secretas, webhooks, e-mails e integrações externas.

Chaves secretas nunca devem ser colocadas no JavaScript do navegador. O front-end chama uma função segura; a função usa a chave no servidor e devolve apenas o resultado necessário.

### Médio e longo prazo: API própria quando necessário

Introduzir **NestJS + TypeScript** quando o HCP tiver regras de negócio mais complexas, muitos provedores externos, tarefas assíncronas, filas, processamento demorado ou uma API para parceiros.

Sinais que justificam essa camada:

- Diversas integrações precisam compartilhar regras e auditoria.
- Processos precisam continuar mesmo após o usuário fechar a página.
- Há filas de importação, enriquecimento, exportação ou cobrança.
- A mesma regra de negócio é consumida por web, aplicativo e parceiros.
- Controle de rate limit, cache e observabilidade se torna relevante.

Não é necessário criar esse servidor antecipadamente. Até esses sinais surgirem, as Edge Functions reduzem custo operacional e complexidade.

## 5. Banco de dados recomendado

Manter **PostgreSQL por meio do Supabase**. O domínio do HCP é relacional: usuários pertencem a espaços de trabalho, espaços têm empresas e leads, pesquisas geram resultados, usuários salvam favoritos e planos controlam limites.

### Estrutura futura sugerida

- `profiles`: dados públicos e preferências do usuário.
- `workspaces`: empresas ou contas clientes.
- `workspace_members`: vínculo, função e permissões de cada usuário.
- `companies`: empresas descobertas e seus atributos.
- `leads`: contatos relacionados às empresas.
- `searches`: parâmetros e histórico de pesquisas.
- `favorites`: itens salvos por usuário ou equipe.
- `exports`: arquivos e estado das exportações.
- `subscriptions`: plano, ciclo e estado de cobrança.
- `usage_events`: consumo de buscas, leads e exportações.
- `api_integrations`: metadados de integrações, sem expor segredos ao cliente.

### Regras essenciais

- Incluir `workspace_id` nas entidades compartilhadas por equipe.
- Criar índices para colunas usadas em filtros, relacionamentos e ordenação.
- Aplicar Row Level Security em todas as tabelas acessíveis pelo cliente.
- Separar permissões de leitura, inserção, edição e exclusão.
- Armazenar segredos apenas em variáveis de ambiente ou cofres de segredo.
- Registrar eventos críticos para auditoria.

O Supabase anunciou uma mudança para outubro de 2026: novas tabelas não serão expostas automaticamente às APIs de dados. As permissões de novas tabelas deverão ser concedidas de forma explícita, o que deve fazer parte do processo de criação do schema.

## 6. Arquitetura-alvo

1. O navegador executa a interface Next.js/React.
2. O Supabase Auth mantém a sessão do usuário.
3. Operações simples e autorizadas acessam o PostgreSQL sob políticas RLS.
4. Integrações e operações com segredo passam por Edge Functions.
5. No futuro, processos complexos podem passar por uma API NestJS e filas de trabalho.
6. PostgreSQL permanece como fonte principal dos dados do produto.

Essa divisão evita colocar segredos no front-end, mantém o início simples e permite adicionar infraestrutura apenas quando houver necessidade real.

## 7. Plano de migração incremental

1. Criar uma branch exclusiva para a migração.
2. Inicializar Next.js com TypeScript em modo estrito.
3. Transferir cores, tipografia, espaçamentos e estilos base.
4. Criar componentes compartilhados: layout, menu lateral, cabeçalho, cartões, botões, campos e modais.
5. Migrar primeiro páginas mais isoladas, como segmentos, planos e preferências.
6. Migrar favoritos, histórico e conta.
7. Migrar painel e pesquisa por último, pois concentram mais estados e dados.
8. Adicionar testes de cadastro, login, tema, idioma e permissões do Supabase.
9. Manter a versão atual disponível até a nova versão atingir paridade funcional.

### Princípio de segurança da migração

Cada etapa deve entregar uma parte utilizável e reversível. Uma reescrita total cria um período longo sem entregas, dificulta comparar comportamentos e aumenta o risco de perder detalhes já resolvidos no projeto atual.

## 8. Estrutura de projeto sugerida

```text
hcp/
├─ src/
│  ├─ app/                 # rotas e layouts do Next.js
│  ├─ components/          # componentes reutilizáveis
│  ├─ features/            # conta, pesquisa, favoritos, planos
│  ├─ lib/                 # Supabase, validações e utilitários
│  ├─ styles/              # tokens, tema e estilos globais
│  └─ types/               # contratos TypeScript
├─ supabase/
│  ├─ functions/           # Edge Functions
│  └─ migrations/          # alterações versionadas do banco
├─ tests/                  # testes de integração e ponta a ponta
└─ public/                 # imagens e arquivos públicos
```

## 9. Sequência recomendada de decisões

### Agora

- Continuar evoluindo a versão atual enquanto a migração é planejada.
- Padronizar schema, RLS e migrações do Supabase.
- Adicionar Edge Functions para toda integração que use segredo.
- Iniciar Next.js/React/TypeScript por componentes compartilhados.

### Quando o produto ganhar mais usuários

- Adicionar testes completos e monitoramento de erros.
- Medir consultas lentas e criar índices guiados por uso real.
- Implementar limites e eventos de consumo de maneira transacional.
- Introduzir filas para importações, exportações e enriquecimento.

### Quando houver múltiplos canais ou parceiros

- Avaliar NestJS como API de domínio.
- Versionar contratos de API.
- Centralizar auditoria, rate limiting e observabilidade.
- Separar serviços somente quando houver ganhos claros de escala ou autonomia.

## 10. Conclusão

O melhor equilíbrio para o HCP é **React + Next.js + TypeScript no front-end, Supabase + PostgreSQL como núcleo atual e NestJS apenas como evolução futura**. Vue é uma boa alternativa se a prioridade absoluta for uma transição mais próxima do HTML, mas React oferece a combinação mais favorável de ecossistema, contratação, bibliotecas e capacidade de longo prazo para este produto.

A prioridade não deve ser trocar tecnologias por moda, e sim reduzir duplicação, proteger dados e segredos, permitir testes e criar uma base em que novas funcionalidades possam ser adicionadas com segurança.

## Fontes oficiais consultadas

- React — Creating a React App: https://react.dev/learn/creating-a-react-app
- React — Add React to an Existing Project: https://react.dev/learn/add-react-to-an-existing-project
- Next.js — Documentation: https://nextjs.org/docs
- TypeScript Handbook: https://www.typescriptlang.org/docs/handbook/intro.html
- Vue — Introduction: https://vuejs.org/guide/introduction.html
- Angular — Overview: https://angular.dev/overview
- Supabase — Edge Functions: https://supabase.com/docs/guides/functions
- Supabase — Database Overview: https://supabase.com/docs/guides/database/overview
- Supabase — Mudança de exposição de tabelas em outubro de 2026: https://supabase.com/changelog/45329-breaking-change-tables-not-exposed-to-data-and-graphql-api-automatically
- GitHub Octoverse — crescimento do TypeScript: https://github.blog/news-insights/octoverse/octoverse-a-new-developer-joins-github-every-second-as-ai-leads-typescript-to-1/
