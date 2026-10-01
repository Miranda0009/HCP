# Publicação do HCP na Vercel

Publicação e verificação em 30/09/2026. Não confundir deploy concluído com validação integral do produto.

## Estado atual — publicação concluída em 30/09/2026

Após nova autorização expressa do usuário, o frontend foi publicado no projeto existente `hcp`, sem recriar a pasta de teste, sem upgrade e sem commit/push.

- Produção: https://hcp-ten-delta.vercel.app/html/login.html.
- Deployment: `dpl_CsB8kTG4iu9rSpStGAxb2KyJHt31`, status `READY`, ambiente `production`, build de 3 segundos.
- URL imutável: https://hcp-q7ojs9yvt-cauans-projects-0280b0b5.vercel.app.
- Base Git local: `6de5d6e`, com alterações locais pendentes incluídas no frontend publicado. Não corresponde a um novo commit remoto.
- Root Directory remoto corrigido de `html` para a raiz do repositório web; framework Other, build `node scripts/build-static.cjs`, saída `public`.
- As quatro pastas `html`, `css`, `js` e `imgs` foram incluídas juntas. `.env`, documentos, testes, módulos desktop/mobile, backend e cache Cloudflare ficaram fora da publicação.
- A rota antiga `/login.html` e a raiz `/` redirecionam para `/html/login.html`.
- Primeira tentativa: erro porque o upload criou `public` vazia sem marcador. O script agora reutiliza diretório vazio, mas continua recusando substituir conteúdo desconhecido sem marcador; teste atualizado e aprovado.
- Verificação: 32 testes locais aprovados e os 32 arquivos web retornaram HTTP 200 no domínio público. `.env.local` e documento de publicação retornaram HTTP 404.
- Tela de login inspecionada no navegador com CSS e logo carregados. Captura no workspace geral: `Docs/Entregaveis/HCP_Vercel_corrigido_2026-09-30.jpg`.
- Observabilidade: consulta CLI de erros na última hora retornou `No logs found`; nenhum aviso/erro foi capturado na visita do navegador. Ausência de logs não comprova ausência de falhas em fluxos não exercitados. Drains e monitoramento contínuo não foram inspecionados/configurados.
- Na publicação inicial não foram executados login real, OAuth, convites, isolamento entre empresas ou operações no banco. A verificação posterior está registrada abaixo; a publicação do frontend não certifica essas funcionalidades por si só.

As seções abaixo registram o histórico anterior; referências a publicação pendente ou ausência de deploy descrevem aquela etapa, não o estado atual. A restrição de uso comercial do plano Hobby permanece: não houve mudança de plano nem validação de elegibilidade para operação comercial. O usuário autorizou o commit local dos arquivos de configuração, build e frontend; ainda é necessário enviá-los ao GitHub antes de depender de novos deploys pela integração Git.

## Verificação posterior ao deploy — 30/09/2026

### Ambientes e evidências

- Windows, Node 24; build estático e todos os 16 arquivos de testes executados: **97 testes aprovados, zero falhas**. Três testes novos exercitam o fluxo de senha com backend simulado: sucesso, credenciais inválidas e e-mail não confirmado; os erros não redirecionam e liberam nova tentativa.
- `node --check` aprovado nos 14 scripts web e no script de build; `git diff --check` aprovado. A suíte inclui verificações estáticas de SQL/RLS, não testes de autorização executados contra o banco publicado.
- O usuário realizou o login real no domínio publicado e confirmou o painel. A sessão autenticada foi observada no painel e no CRM, que carregou a empresa JM - Marketing e informou zero CRMs disponíveis. Botões que exigem um CRM selecionado ficaram corretamente desabilitados.
- As páginas Segmentos, Favoritos, Histórico, Planos, Perfil, Conta, Preferências e Gerar Leads renderizaram no domínio publicado, com títulos corretos e sem erros de console capturados na passagem. Isso é um smoke test de carregamento, não validação de todos os salvamentos remotos.
- Painel: abertura e avanço pelas quatro perguntas até a recomendação Pro para três usuários; fechamento sem contratar ou confirmar alterações de plano.
- Busca global: pesquisa por CRM encontrou o destino e Enter navegou para a página correta.
- Geração publicada: 50 registros sintéticos, seleção de todos e acionamento de CSV/XLSX sem erro capturado; a interface informou criação do Excel. O navegador integrado não confirmou o arquivo baixado, portanto entrega dos downloads permanece parcialmente verificada.
- Prévia local isolada em `127.0.0.1:4183`, com cliente Supabase simulado e CRM em `?preview`: criação de CRM e card fictícios, edição e mudança para Diagnóstico, visualizações Lista e Relatórios, busca sem resultados, renomeação, adição de etapa e persistência local após recarregar aprovadas.
- Restauração por arquivo JSON fictício criou outro CRM privado e seu card. Importar dados locais, sem legado na prévia, exibiu a orientação correta. Baixar backup exibiu sucesso, mas a captura do evento de download expirou e não foi encontrado arquivo correspondente em Downloads: não considerar comprovado o recebimento do backup.
- Tema claro persistiu após recarregar; troca para inglês traduziu a interface. As preferências de teste foram restauradas para português e tema escuro. Cliente foco exibiu salvamento com o backend simulado; não comprova persistência remota.
- Abas de favoritos alternaram; Gerar lista de um nicho preencheu o formulário. Layout do CRM observado em 1280×800 e 390×844; menu móvel fechou e a página não teve overflow horizontal global (clientWidth e scrollWidth de 375).
- Evidência visual fora do repositório: `Docs/Entregaveis/HCP_QA_CRM_2026-09-30.jpg`, CRM de prévia local com card restaurado. Não foram alterados CRMs, compartilhamentos ou convites da empresa real.

### Limitações encontradas e testes pendentes

1. **2FA não implementado:** o manipulador `enable2faBtn` em `js/script.js` apenas troca texto/estado visual e exibe toast; não faz enrollment, challenge ou verificação MFA. Não confiar na mensagem de 2FA habilitada.
2. **Histórico demonstrativo:** Reabrir aparece como `span`, e o clique não alterou a tela nem reabriu uma pesquisa.
3. **Checkout ausente:** o manipulador `.price-cta` somente exibe toast de seleção; não existe checkout nesse fluxo. Não houve contratação ou cobrança no teste.
4. Leads continuam sintéticos; APIs de prospecção real e condições de uso não foram validadas.
5. Pendentes: compartilhamento efetivo com outra conta, isolamento entre empresas executado no banco, gravação/restauração remota do CRM, recebimento dos arquivos exportados, exclusão definitiva, login Google completo, confirmação/recuperação por e-mail e logout global. Exigem contas e dados de teste aprovados ou execução pessoal do usuário para credenciais; não foram substituídos por resultados dos mocks.

Resultado: publicação e fluxos exercitados aprovados, mas **produto não certificado como totalmente funcional ou pronto para piloto comercial**. Não houve nova implantação ou push durante esta verificação. Os demais registros abaixo são históricos.

## Diagnóstico inicial pela integração

- O domínio informado é `hcp-three.vercel.app`.
- A consulta pela integração da Vercel retornou `Deployment not found` para esse endereço.
- A equipe acessível pela conexão é `miranda's`, slug `cauans-projects-0280b0b5`; não havia projetos listados nela durante a consulta.
- O painel aberto no navegador integrado solicitou login. A sessão do navegador do usuário pode pertencer a outra conta/equipe; não foi possível confirmar que o projeto original foi apagado.
- Uma tentativa de publicação foi rejeitada pela revisão automática por faltar identificação do projeto e do ambiente. Não houve deploy, promoção nem alteração de domínio.

O erro [DEPLOYMENT_NOT_FOUND](https://vercel.com/docs/errors/deployment_not_found) indica que a Vercel não encontrou a publicação solicitada. O nome da pasta ou um commit no GitHub não garantem que esse domínio tenha uma publicação associada.

## Fonte e saída corretas

- Repositório web local: `Docs/HCP - site` dentro da pasta HCP.
- Framework: Other / nenhum framework.
- Build: `node scripts/build-static.cjs`.
- Output Directory: `public`.
- Entrada do domínio: `/` redireciona para `/html/login.html`.
- Conteúdo publicado: `html`, `css`, `js`, `imgs` e entrada da raiz.
- Fora da publicação: documentos, SDK, módulos desktop/mobile, APKs, SQL de suporte, testes e arquivos de configuração secretos.

Se o repositório GitHub tiver essas pastas na raiz, o Root Directory na Vercel deve ser a raiz desse repositório — não o caminho local completo. Se estiver dentro de um monorepositório, selecionar a subpasta correspondente. Conferir a árvore do repositório remoto antes de configurar.

## Verificação local

Executar dentro do repositório web:

```powershell
node scripts/build-static.cjs
python -m http.server 4180 --bind 127.0.0.1 --directory public
```

Acessar `http://127.0.0.1:4180/`. O script só substitui a saída gerada `public` quando encontra seu marcador; recusa sobrescrever uma pasta homônima sem marcador. `public` é ignorado pelo Git e pode ser regenerado.

## Etapa pendente para recuperar a publicação

O usuário já confirmou a criação/vinculação e publicação na Vercel e realizou o login. A pendência inicial de autorização foi resolvida. A inspeção posterior pela CLI oficial encontrou o projeto existente; ver atualização abaixo. A pendência atual é escolher uma hospedagem compatível com uso comercial, pois o usuário não autorizou um plano pago e pediu avaliar alternativas gratuitas.

Se a publicação partir do GitHub, as configurações novas precisam estar no commit remoto selecionado. Alterações locais e commits ainda não enviados não estarão automaticamente no deploy Git.

Após publicar, verificar entrada, login, arquivos estáticos, CRM e URLs de retorno da autenticação. Publicar as páginas não configura automaticamente banco de dados, autenticação, e-mail, permissões ou backups; esses serviços precisam de validação própria antes de usuários reais.

## Resultado das verificações locais

- Build estático executado com sucesso.
- Três testes de publicação aprovados: conteúdo incluído/excluído, reconstrução e proteção de saída desconhecida; configuração de entrada; existência de links/assets dos HTML no pacote gerado.
- 29 testes existentes de regressão de interface e leads executados e aprovados. Não representam uma auditoria completa do sistema.
- Navegador: `/` abriu `/html/login.html`, com conteúdo e as duas imagens de logo carregadas; nenhum erro/aviso foi capturado no console dessa visita.
- Não foram testados login real, banco de produção, convites, e-mail, isolamento entre empresas nem o domínio público após deploy — não houve publicação nesta execução.

## Atualização após autorização e login — 30/09/2026

A integração continuou sem listar projetos e seu comando de deploy retornou ferramenta inexistente. A CLI oficial identificou o usuário `miranda0009`, vinculou o diretório local ao projeto `hcp` da equipe `miranda's` e mostrou os dados abaixo:

- Projeto: `prj_qqeIDJPTk8Q5itsKMZKPAJLXudJm`.
- Equipe: `team_1yuY8i3IiqCYNMuVp3IclKV1`, slug `cauans-projects-0280b0b5`.
- Criação indicada pela inspeção: 17/08/2026. Embora o comando de criação tenha informado sucesso, o projeto identificado tem data anterior; não afirmar criação do zero nesta execução.
- URL antiga de produção identificada: `https://hcp-ten-delta.vercel.app`.
- Root Directory remoto: `html`, que precisa ser substituído pela raiz do repositório web para incluir as pastas irmãs CSS/JS/imagens.
- Navegador da publicação antiga: `/login.html` abriu sem carregar CSS e as imagens de logo. Evidência em `Docs/Entregaveis/HCP_Vercel_publicacao_antiga.jpg` dentro do workspace geral.
- Plano da equipe: Hobby. [A Vercel restringe esse plano a uso pessoal e não comercial](https://vercel.com/docs/plans/hobby).

O usuário escolheu avaliar uma hospedagem gratuita para uso comercial. Não houve upgrade, novo deploy, alteração remota do Root Directory, alteração de domínio, push ou commit. A autenticação da CLI ficou fora do repositório; `.vercel` e `.env*` são ignorados, e variáveis privadas não são incluídas no pacote estático.

A recomendação documentada é Cloudflare Workers / Static Assets Free para o frontend. A comparação e o roteiro estão em `Docs/Entregaveis/Avaliacao_hospedagem_gratuita_HCP.md` no workspace geral. O usuário posteriormente autorizou essa publicação; a configuração Cloudflare passou em 34 testes e no dry-run, mas aguarda login/autorização da conta. Não houve novo deploy. Consultar [publicacao-cloudflare.md](publicacao-cloudflare.md).
