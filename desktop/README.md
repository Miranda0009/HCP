# HCP para Windows

Esta pasta empacota o site atual como aplicativo de Windows, mantendo a mesma interface, autenticação e dados do site e do APK.

## Arquivo para instalar

Após a compilação, o instalador fica em `releases/HCP-Setup.exe`.

O instalador usa o formato Squirrel.Windows: instala no perfil do usuário sem pedir acesso de administrador e cria o atalho do HCP.

## Login

- E-mail e senha funcionam dentro do aplicativo.
- O acesso com Google abre no navegador padrão do Windows e retorna ao HCP pelo endereço `com.hcp.oportunidades://auth/callback`.
- Esse mesmo endereço já é usado pelo APK e deve continuar cadastrado em **Supabase → Authentication → URL Configuration → Redirect URLs**.

## Atualizar o instalador

Na pasta `desktop`, instale as dependências uma vez e execute o script `installer`. Antes de cada compilação, o conteúdo de `css`, `html`, `imgs` e `js` é copiado novamente para o aplicativo.

O instalador atual não possui certificado de assinatura de código. Por isso, o Windows pode mostrar o aviso de editor desconhecido até a HCP adquirir e configurar um certificado próprio.
