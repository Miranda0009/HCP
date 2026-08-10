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
- O Android recebe confirmações de cadastro, recuperação de senha e OAuth pelo deep link `com.hcp.oportunidades://auth/callback`.
- Adicione exatamente `com.hcp.oportunidades://auth/callback` em **Supabase → Authentication → URL Configuration → Redirect URLs**. Sem essa permissão, o Supabase volta para o `Site URL` padrão; o APK também reconhece o antigo `http://localhost:3000` como compatibilidade, mas o deep link próprio oferece o fluxo confiável.
- Dependendo das regras atuais do projeto Google, o OAuth pode exigir configuração específica para Android antes de uma publicação em loja.

## Uso do APK

`HCP-debug.apk` é uma versão de testes assinada automaticamente pelo Android. Ela pode ser instalada manualmente em um aparelho que permita aplicativos da fonte utilizada. Uma versão para Google Play exige assinatura de produção e deve manter a chave privada fora do Git.
