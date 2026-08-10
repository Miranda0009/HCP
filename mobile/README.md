# HCP para Android

Este módulo empacota o site atual com Capacitor 8.5, preservando o HTML, CSS e JavaScript originais.

## Gerar o APK de testes

1. Instale as dependências com `npm install` dentro de `mobile`.
2. Confirme que `ANDROID_HOME` aponta para um Android SDK válido.
3. Execute `npm run apk:debug`.
4. O arquivo final será criado em `mobile/releases/HCP-debug.apk`.

O script sempre sincroniza `css`, `html`, `imgs` e `js` antes da compilação. A pasta `www` é gerada e não deve ser editada manualmente.

## Autenticação

- Cadastro e login por e-mail usam o mesmo projeto Supabase do site.
- A opção “Manter conectado” usa armazenamento persistente quando marcada e armazenamento da sessão quando desmarcada.
- Para testar Google OAuth no aplicativo, inclua `https://localhost/**` na lista de URLs de redirecionamento permitidas em **Supabase → Authentication → URL Configuration**. Dependendo das regras atuais do projeto Google, o fluxo também pode exigir configuração específica para Android antes de uma publicação em loja.

## Uso do APK

`HCP-debug.apk` é uma versão de testes assinada automaticamente pelo Android. Ela pode ser instalada manualmente em um aparelho que permita aplicativos da fonte utilizada. Uma versão para Google Play exige assinatura de produção e deve manter a chave privada fora do Git.
