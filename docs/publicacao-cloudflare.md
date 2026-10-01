# Publicação do HCP na Cloudflare

Preparação em 30/09/2026. **Status: autorizada pelo usuário, ainda não publicada; aguardando autenticação da conta Cloudflare.**

## Escopo autorizado

Publicar o frontend atual no plano gratuito, sem comprar domínio, fazer upgrade, migrar banco ou configurar serviços pagos. A publicação usará o endereço fornecido pelo provedor. Antes de qualquer deploy autenticado, conferir a conta de destino e se já existe um Worker `hcp`; não sobrescrever outro aplicativo homônimo sem verificar sua identidade.

## Configuração local

- Arquivo: `wrangler.json`.
- Nome proposto: `hcp`.
- Build: `node scripts/build-static.cjs`.
- Assets: somente `public`, com `html`, `css`, `js`, `imgs` e entrada do site.
- `html_handling: none` mantém os endereços `.html` usados pela aplicação.
- `_redirects` encaminha `/` para `/html/login.html` com HTTP 302.
- `.assetsignore` exclui o marcador local de reconstrução e a própria lista de exclusão.
- Não foram configurados Worker de backend, bindings, rotas de domínio personalizado ou variáveis privadas.
- `.wrangler`, `.dev.vars*`, `.env*`, `.vercel` e a saída gerada são ignorados no Git.

O build substitui somente `public` gerado e marcado. Não apaga o código-fonte. Mudanças pendentes em páginas, scripts e testes anteriores foram preservadas.

Fontes técnicas: [Static Assets](https://developers.cloudflare.com/workers/static-assets/binding/), [endereços HTML](https://developers.cloudflare.com/workers/static-assets/routing/advanced/html-handling/), [redirecionamentos](https://developers.cloudflare.com/workers/static-assets/redirects/).

## Verificação realizada

Wrangler oficial versão `4.145.0`, obtido do registro npm. Telemetria desativada nos comandos desta execução. Autenticação solicitada por fluxo oficial de dispositivo, com escopos `account:read`, `user:read` e `workers:write`; esta última permissão permite gerenciar Workers, e não é restrita apenas ao projeto HCP. Cabe ao usuário aprovar esse acesso na Cloudflare. Não foram solicitadas permissões de cobrança, e-mail, banco ou DNS separadas.

Comandos executados dentro do projeto web, com o runtime Node disponível na máquina:

```text
node scripts/build-static.cjs
node --test tests/cloudflare-deploy.test.cjs tests/static-build.test.cjs tests/interface-regressions.test.cjs tests/leads.test.cjs
wrangler deploy --dry-run --outdir .wrangler/dry-run
```

Resultados: build concluído, **34 testes aprovados**, dry-run encerrado com código 0 e sem bindings. A saída local medida contém 36 arquivos, aproximadamente 2,05 MiB. A contagem informada pelo Wrangler inclui sua leitura própria do diretório; dry-run não confirma upload nem uma URL pública.

O teste novo inicialmente detectou a ausência de `_redirects`; depois da geração desse arquivo e da lista de exclusão, passou junto aos testes existentes. A skill de alterações de código orientou essa verificação incremental e a preservação de mudanças anteriores.

## Próximo passo após autenticação

1. Conferir identidade/conta Cloudflare e plano gratuito; inspecionar eventual Worker existente antes de publicar.
2. Executar `wrangler deploy` com a configuração aprovada, sem adicionar recursos pagos.
3. Registrar a URL e a versão efetivamente retornadas pela Cloudflare.
4. Verificar pelo navegador público o redirecionamento, logo, CSS, páginas e retorno ao login quando não autenticado.
5. Confirmar separadamente os retornos de autenticação e serviços centrais antes de usar dados reais. A publicação não equivale a validação de login, permissões entre empresas, CRM compartilhado ou backups.

O login foi aberto no navegador integrado para o usuário concluir pessoalmente. Se o código de dispositivo expirar, iniciar nova autorização oficial; não pedir senha/token no chat. Nenhum novo deploy, push, commit, compra ou alteração de DNS foi realizado até este registro.
