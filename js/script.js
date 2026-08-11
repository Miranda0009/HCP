const HCP_THEME_KEY = 'hcp-theme';
const HCP_LANGUAGE_KEY = 'hcp-language';
const HCP_BILLING_KEY = 'hcp-billing';

function readPreference(key, fallback) {
  try {
    return localStorage.getItem(key) || fallback;
  } catch {
    return fallback;
  }
}

function savePreference(key, value) {
  try {
    localStorage.setItem(key, value);
  } catch {
    // O site continua funcionando mesmo quando o armazenamento local está indisponível.
  }
}

const HCP_ENGLISH = Object.freeze({
  "Painel - HCP": "Dashboard - HCP",
  "Pesquisar empresas - HCP": "Search companies - HCP",
  "Segmentos inteligentes - HCP": "Smart segments - HCP",
  "Favoritos - HCP": "Favorites - HCP",
  "Histórico - HCP": "History - HCP",
  "Planos e limites - HCP": "Plans and limits - HCP",
  "Minha conta - HCP": "My account - HCP",
  "Preferências - HCP": "Preferences - HCP",
  "HCP - Login": "HCP - Sign in",
  "HCP, inteligência comercial": "HCP, sales intelligence",
  "INTELIGÊNCIA COMERCIAL": "SALES INTELLIGENCE",
  "Bem-vindo ao HCP,": "Welcome to HCP,",
  "seu gerenciador de oportunidades.": "your opportunity manager.",
  "Encontre as empresas certas, descubra oportunidades reais e transforme pesquisa em vendas.": "Find the right companies, uncover real opportunities, and turn research into sales.",
  "empresas analisadas": "companies analyzed",
  "leads exportados": "exported leads",
  "Resultados da plataforma": "Platform results",
  "© 2026 HCP. Todos os direitos reservados.": "© 2026 HCP. All rights reserved.",
  "ACESSO SEGURO": "SECURE ACCESS",
  "Bem-vindo de volta": "Welcome back",
  "Entre na sua conta para continuar.": "Sign in to your account to continue.",
  "Endereço de e-mail": "Email address",
  "Nome completo": "Full name",
  "Como devemos chamar você?": "What should we call you?",
  "nome@empresa.com": "name@company.com",
  "Digite sua senha": "Enter your password",
  "Entrar agora": "Sign in now",
  "Manter conectado": "Keep me signed in",
  "ou continue com": "or continue with",
  "Entrar com Google": "Continue with Google",
  "Crie uma conta": "Create an account",
  "ESPAÇO DE TRABALHO": "WORKSPACE",
  "CONTA": "ACCOUNT",
  "Painel": "Dashboard",
  "Pesquisar empresas": "Search companies",
  "Segmentos inteligentes": "Smart segments",
  "Favoritos": "Favorites",
  "Histórico": "History",
  "Planos e limites": "Plans and limits",
  "Minha conta": "My account",
  "Preferências": "Preferences",
  "Seu plano": "Your plan",
  "Pesquisas usadas": "Searches used",
  "Gerenciar": "Manage",
  "/mês": "/month",
  "Pesquisar leads": "Search leads",
  "Recolher menu": "Collapse menu",
  "Abrir menu": "Open menu",
  "Fechar menu": "Close menu",
  "Alternar modo escuro": "Toggle dark mode",
  "Idioma da interface": "Interface language",
  "Notificações": "Notifications",
  "Nova busca": "New search",
  "Novo segmento disponível": "New segment available",
  "BPO Financeiro foi adicionado aos": "Financial BPO was added to",
  "segmentos inteligentes.": "smart segments.",
  "Exportação concluída": "Export completed",
  "128.450 leads exportados com": "128,450 leads exported",
  "sucesso.": "successfully.",
  "Empresa favoritada atualizou nota": "Favorite company updated its rating",
  "Alimentos Membros agora tem": "Alimentos Membros now has",
  "4.7 estrelas.": "4.7 stars.",
  "Digite para pesquisar empresas, segmentos ou páginas": "Type to search companies, segments, or pages",
  "Ir para: Painel, Pesquisar empresas, Segmentos, Favoritos, Histórico": "Go to: Dashboard, Search companies, Segments, Favorites, History",
  "Bem-vindo de volta,": "Welcome back,",
  "Eis o que está acontecendo no seu espaço de trabalho de prospecção hoje.": "Here is what is happening in your prospecting workspace today.",
  "Pesquisas deste mês": "Searches this month",
  "Empresas descobertas": "Companies discovered",
  "Favoritos salvos": "Saved favorites",
  "Exportações correm": "Exports in progress",
  "Atividade": "Activity",
  "Pesquisas e exportações — últimos 7 dias": "Searches and exports — last 7 days",
  "Pesquisas": "Searches",
  "Exportações": "Exports",
  "Composição": "Breakdown",
  "Avaliações": "Ratings",
  "Principais categorias": "Top categories",
  "Marketing": "Marketing",
  "Varejo": "Retail",
  "Industrial": "Industrial",
  "Serviços": "Services",
  "Pesquisas recentes": "Recent searches",
  "Visualizar todos": "View all",
  "Todos": "View all",
  "Reabrir": "Reopen",
  "Há 2 horas": "2 hours ago",
  "Há 2 dias": "2 days ago",
  "Há 3 dias": "3 days ago",
  "Principais favoritos": "Top favorites",
  "Navegue todos": "Browse all",
  "Agências de Marketing": "Marketing Agencies",
  "🎯 Agências de Marketing": "🎯 Marketing Agencies",
  "📞 Consultorias Comerciais": "📞 Sales Consulting",
  "💰 BPO Financeiro": "💰 Financial BPO",
  "Seg": "Mon",
  "Ter": "Tue",
  "Qua": "Wed",
  "Qui": "Thu",
  "Sex": "Fri",
  "Sáb": "Sat",
  "Dom": "Sun",
  "Filtre por localização, categoria e sinais digitais.": "Filter by location, category, and digital signals.",
  "Localização": "Location",
  "Cidade": "City",
  "Estado": "State",
  "Categoria": "Category",
  "Categoria empresarial": "Business category",
  "Todos os estados": "All states",
  "Todos estados": "All states",
  "Todas as categorias": "All categories",
  "Possui site": "Has a website",
  "Nenhum site": "No website",
  "Nenhuma empresa encontrada com esses filtros.": "No companies were found with these filters.",
  "Aberto agora": "Open now",
  "Aberto no sábado": "Open on Saturday",
  "Avaliações mínimas — 0": "Minimum rating — 0",
  "Nota mínima do Google — 0,0": "Minimum Google rating — 0.0",
  "Raio — 25 mi": "Radius — 25 mi",
  "Pesquisa": "Search",
  "Buscando...": "Searching...",
  "Resultados": "Results",
  "↺ Redefinir": "↺ Reset",
  "Procurar": "Search",
  "Todos os segmentos inteligentes": "All smart segments",
  "Cada segmento aplica automaticamente os": "Each segment automatically applies the",
  "filtros ideais para essa vertical.": "ideal filters for that vertical.",
  "Pesquisas pré-construídas por lead, com curadoria de nossos especialistas em prospecção.": "Ready-to-use lead searches curated by our prospecting specialists.",
  "Agências de Marketing - Austin, TX": "Marketing Agencies - Austin, TX",
  "Restaurantes - Miami, FL": "Restaurants - Miami, FL",
  "Farms - Denver, CO - Sem site": "Farms - Denver, CO - No website",
  "Law Firms - Boston, MA": "Law Firms - Boston, MA",
  "Clínicas": "Clinics",
  "Restaurantes": "Restaurants",
  "🎯 Agências de Marketing – Principal cliente": "🎯 Marketing Agencies – Primary customer",
  "📞 Consultorias Comerciais / SDR / BDR": "📞 Sales Consulting / SDR / BDR",
  "💰 Empresas de BPO Financeiro": "💰 Financial BPO Companies",
  "Consultorias Comerciais / SDR / BDR": "Sales Consulting / SDR / BDR",
  "Empresas de BPO Financeiro": "Financial BPO Companies",
  "Agências com demanda constante por prospecção B2B, geração de oportunidades e novos contratos.": "Agencies with ongoing demand for B2B prospecting, opportunity generation, and new contracts.",
  "Times especializados em vendas consultivas, outbound e desenvolvimento de novos negócios.": "Teams specialized in consultative sales, outbound, and business development.",
  "Operações que terceirizam rotinas financeiras e atendem empresas em fase de crescimento.": "Operations that outsource financial routines and serve growing companies.",
  "Empresa": "Company",
  "Exportação": "Export",
  "Fazenda": "Farm",
  "Restaurante": "Restaurant",
  "Centros de Distribuição - Dallas, TX": "Distribution Centers - Dallas, TX",
  "Centro Distribuição": "Distribution Center",
  "Centro Distribuição · Fênix, AZ": "Distribution Center · Phoenix, AZ",
  "Armazém · Atlanta, GA": "Warehouse · Atlanta, GA",
  "Construção · Nashville, TN": "Construction · Nashville, TN",
  "Restaurante · Dallas, TX": "Restaurant · Dallas, TX",
  "Fazendas, cooperativas, comércios rurais e grandes galpões com potencial de cobertura.": "Farms, cooperatives, rural businesses, and large warehouses with coverage potential.",
  "Condomínios, centros de transporte, distribuição e fábricas que precisam de segurança.": "Condominiums, transportation hubs, distribution centers, and factories that need security.",
  "Classificação": "Rating",
  "Data": "Date",
  "Ações": "Actions",
  "Remover": "Remove",
  "Semana passada": "Last week",
  "Suas últimas 20 pesquisas realizadas.": "Your last 20 completed searches.",
  "Histórico de pesquisas": "Search history",
  "Histórico 7 dias": "7-day history",
  "Escolha o plano que escala com sua prospecção.": "Choose the plan that scales with your prospecting.",
  "Arranque": "Starter",
  "Negócios": "Business",
  "Pró · $89/mo": "Pro · $89/month",
  "Mensal": "Monthly",
  "Anual · economizar 20%": "Yearly · save 20%",
  "Mais popular": "Most popular",
  "Para garimpeiros solo começando.": "For solo prospectors getting started.",
  "Para as equipes de vendas em crescimento.": "For growing sales teams.",
  "Para organizações de alto volume.": "For high-volume organizations.",
  "Escolha Starter": "Choose Starter",
  "Escolha Pro": "Choose Pro",
  "Escolha Negócios": "Choose Business",
  "Buscas ilimitadas": "Unlimited searches",
  "Buscas e exportações ilimitadas": "Unlimited searches and exports",
  "Exportações limitadas (20/mo)": "Limited exports (20/mo)",
  "Filtros avançados": "Advanced filters",
  "Histórico de pesquisa completo": "Complete search history",
  "Favoritos e segmentos inteligentes": "Favorites and smart segments",
  "Espaços de trabalho da equipe": "Team workspaces",
  "Suporte prioritário e SSO": "Priority support and SSO",
  "Minha conta": "My account",
  "Dados pessoais, contato e segurança da": "Personal details, contact information, and account",
  "conta.": "security.",
  "Editar perfil e senha": "Edit profile and password",
  "Alterar senha": "Change password",
  "Atualizar senha": "Update password",
  "Atual": "Current",
  "Novo": "New",
  "Confirme": "Confirm",
  "Acesso rápido": "Quick access",
  "Inicie uma pesquisa completa em um clique": "Start a complete search in one click",
  "Visão geral da sua conta e espaço de trabalho.": "An overview of your account and workspace.",
  "Sua conta, assinatura e uso.": "Your account, plan, and usage.",
  "Atualize seus dados, foto e segurança da conta.": "Update your details, photo, and account security.",
  "Dados do perfil": "Profile details",
  "Estas informações aparecem na sua conta e no menu do HCP.": "This information appears in your account and the HCP menu.",
  "Nome completo": "Full name",
  "Empresa": "Company",
  "Telefone": "Phone",
  "E-mail de acesso": "Sign-in email",
  "Salvar alterações": "Save changes",
  "Alterar foto": "Change photo",
  "Remover foto": "Remove photo",
  "JPG, PNG ou WebP de até 2 MB.": "JPG, PNG, or WebP up to 2 MB.",
  "Telefone não informado": "Phone not provided",
  "Conta HCP · espaço de trabalho": "HCP Account · workspace",
  "Confirme sua senha atual e escolha uma nova senha com pelo menos 8 caracteres.": "Confirm your current password and choose a new password with at least 8 characters.",
  "Senha atual": "Current password",
  "Nova senha": "New password",
  "Confirmar nova senha": "Confirm new password",
  "Uso este mês": "Usage this month",
  "Veja onde você está assinado.": "See your current plan.",
  "Renova em 14 de março de 2026": "Renews on March 14, 2026",
  "Proprietário de espaço de trabalho · Acme Inc.": "Workspace owner · Acme Inc.",
  "Acme Inc. · Espaço de trabalho para 12 funcionários": "Acme Inc. · Workspace for 12 employees",
  "Assinatura e cobrança": "Plans and billing",
  "Veja seu plano atual e altere quando": "View your current plan and change it whenever",
  "quiser.": "you want.",
  "Aparência, idioma, notificações e": "Appearance, language, notifications, and",
  "segurança.": "security.",
  "Abrir": "Open",
  "Sair da conta": "Sign out",
  "Sair de todos os dispositivos": "Sign out on all devices",
  "Encerra sua sessão neste e em outros aparelhos": "Ends your session on this and other devices",
  "conectados.": "currently connected.",
  "Preferências, segurança e dispositivos conectados.": "Preferences, security, and connected devices.",
  "Aparência": "Appearance",
  "Modo escuro": "Dark mode",
  "Alterne entre a aparência escura e clara.": "Switch between dark and light appearance.",
  "Língua e região": "Language and region",
  "Idioma": "Language",
  "Português (BR)": "Portuguese (BR)",
  "English (US)": "English (US)",
  "Fuso horário": "Time zone",
  "Segurança": "Security",
  "Autenticação bi-fatorial": "Two-factor authentication",
  "Coloque uma camada extra de segurança.": "Add an extra layer of security.",
  "Habilitar": "Enable",
  "Desabilitar": "Disable",
  "Notificações e-mail": "Email notifications",
  "Digestão semanal de novas perspectivas": "Weekly digest of new prospects",
  "Exportar notificações prontas": "Export-ready notifications",
  "Percepções semanais": "Weekly insights",
  "Sons in-app": "In-app sounds",
  "Sessões ativas": "Active sessions",
  "Sessão": "Session",
  "Produto atualiza": "Product updates",
  "Ontem mesmo · 41 resultados": "Yesterday · 41 results",
  "Ontem, 16:45": "Yesterday, 16:45",
  "Negócios estabelecidos com site e presença digital prontos para escala.": "Established businesses with a website and digital presence, ready to scale.",
  "Negócios sem site, avaliações ruins ou poucas avaliações — preparados para serviços de marketing.": "Businesses without a website or with weak ratings — ready for marketing services.",
  "aparelhos": "devices",
  "Lembrar de mim": "Remember me",
  "Esqueceu a senha?": "Forgot your password?",
  "ENTRAR": "SIGN IN",
  "Ainda não tem uma conta?": "Do not have an account yet?",
  "Cadastre-se": "Sign up",
  "E-mail": "Email",
  "Senha": "Password",
  "ex. Campinas": "e.g. Campinas",
  "Exportação iniciada — você recebe o arquivo por e-mail em instantes.": "Export started — you will receive the file by email shortly.",
  "Preencha os três campos para atualizar sua senha.": "Complete all three fields to update your password.",
  "Senha atualizada com sucesso.": "Password updated successfully.",
  "Autenticação de dois fatores desabilitada.": "Two-factor authentication disabled.",
  "Autenticação de dois fatores habilitada.": "Two-factor authentication enabled.",
  "Sessão encerrada em todos os dispositivos.": "Session ended on all devices."
});

const originalTextNodes = new WeakMap();
const originalAttributes = new WeakMap();
const originalDocumentTitle = document.title;

function currentLanguage() {
  return readPreference(HCP_LANGUAGE_KEY, 'pt-BR');
}

function translateValue(value) {
  const normalizedValue = value.replace(/\s+/g, ' ').trim();
  if (HCP_ENGLISH[normalizedValue]) return HCP_ENGLISH[normalizedValue];

  const resultMatch = normalizedValue.match(/^(\d+) resultados$/);
  if (resultMatch) return `${resultMatch[1]} results`;

  const hoursMatch = normalizedValue.match(/^Há (\d+) horas? · (\d+) resultados$/);
  if (hoursMatch) return `${hoursMatch[1]} hours ago · ${hoursMatch[2]} results`;

  const daysMatch = normalizedValue.match(/^Há (\d+) dias? · (\d+) resultados$/);
  if (daysMatch) return `${daysMatch[1]} days ago · ${daysMatch[2]} results`;

  const leadsMatch = normalizedValue.match(/^~?([\d.]+) conduzências$/);
  if (leadsMatch) return `${leadsMatch[1].replace('.', ',')} leads`;

  const companiesMatch = normalizedValue.match(/^(\d+) empresas combinam com seus filtros$/);
  if (companiesMatch) return `${companiesMatch[1]} companies match your filters`;

  const companyMatch = normalizedValue.match(/^(\d+) empresa combina com seus filtros$/);
  if (companyMatch) return `${companyMatch[1]} company matches your filters`;

  const seatsMatch = normalizedValue.match(/^(\d+) assentos? (?:do usuário|para usuários)$/);
  if (seatsMatch) return `${seatsMatch[1]} user ${seatsMatch[1] === '1' ? 'seat' : 'seats'}`;

  const devicesMatch = normalizedValue.match(/^(\d+) aparelhos$/);
  if (devicesMatch) return `${devicesMatch[1]} devices`;

  const exportsMatch = normalizedValue.match(/^(\d+) exportações \/mês$/);
  if (exportsMatch) return `${exportsMatch[1]} exports /month`;

  const savedCompaniesMatch = normalizedValue.match(/^(\d+) empresas salvas$/);
  if (savedCompaniesMatch) return `${savedCompaniesMatch[1]} saved companies`;

  const planMatch = normalizedValue.match(/^Plano (.+) selecionado\. Redirecionando para o checkout\.\.\.$/);
  if (planMatch) return `${translateValue(planMatch[1])} plan selected. Redirecting to checkout...`;

  return value;
}

function translateTextNode(node, language) {
  if (!originalTextNodes.has(node)) originalTextNodes.set(node, node.nodeValue);
  const original = originalTextNodes.get(node);
  const trimmed = original.trim();
  if (!trimmed) return;
  const replacement = language === 'en-US' ? translateValue(trimmed) : trimmed;
  node.nodeValue = original.replace(trimmed, replacement);
}

function translateAttribute(element, attribute, language) {
  if (!element.hasAttribute(attribute)) return;
  if (!originalAttributes.has(element)) originalAttributes.set(element, {});
  const originals = originalAttributes.get(element);
  if (!(attribute in originals)) originals[attribute] = element.getAttribute(attribute);
  const original = originals[attribute];
  element.setAttribute(attribute, language === 'en-US' ? translateValue(original) : original);
}

function applyLanguage(language = currentLanguage()) {
  const supportedLanguage = language === 'en-US' ? 'en-US' : 'pt-BR';
  document.documentElement.lang = supportedLanguage;
  document.title = supportedLanguage === 'en-US' ? translateValue(originalDocumentTitle) : originalDocumentTitle;

  document.querySelectorAll('option').forEach((option) => {
    if (!option.hasAttribute('value')) option.setAttribute('value', option.textContent.trim());
  });

  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      const parent = node.parentElement;
      if (!parent || ['SCRIPT', 'STYLE'].includes(parent.tagName)) return NodeFilter.FILTER_REJECT;
      return node.nodeValue.trim() ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
    }
  });

  const textNodes = [];
  while (walker.nextNode()) textNodes.push(walker.currentNode);
  textNodes.forEach((node) => translateTextNode(node, supportedLanguage));

  document.querySelectorAll('[placeholder], [aria-label], [title]').forEach((element) => {
    ['placeholder', 'aria-label', 'title'].forEach((attribute) => translateAttribute(element, attribute, supportedLanguage));
  });

  const languageSelect = document.getElementById('languageSelect');
  if (languageSelect) languageSelect.value = supportedLanguage;
  savePreference(HCP_LANGUAGE_KEY, supportedLanguage);
}

function applyTheme(theme) {
  const supportedTheme = theme === 'light' ? 'light' : 'dark';
  document.documentElement.dataset.theme = supportedTheme;
  const themeToggle = document.getElementById('themeToggle');
  if (themeToggle) {
    const isDark = supportedTheme === 'dark';
    themeToggle.classList.toggle('on', isDark);
    themeToggle.setAttribute('aria-checked', String(isDark));
  }
  savePreference(HCP_THEME_KEY, supportedTheme);
}

applyTheme(readPreference(HCP_THEME_KEY, 'dark'));

document.addEventListener('DOMContentLoaded', () => {

  const app = document.querySelector('.app');
  const themeToggle = document.getElementById('themeToggle');
  const languageSelect = document.getElementById('languageSelect');

  applyTheme(readPreference(HCP_THEME_KEY, 'dark'));
  applyLanguage(currentLanguage());

  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const nextTheme = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
      applyTheme(nextTheme);
    });
  }

  if (languageSelect) {
    languageSelect.addEventListener('change', () => applyLanguage(languageSelect.value));
  }

  /* ---------- Sistema de toast (feedback visual) ---------- */
  let toastStack = document.querySelector('.toast-stack');
  if (!toastStack) {
    toastStack = document.createElement('div');
    toastStack.className = 'toast-stack';
    document.body.appendChild(toastStack);
  }
  function showToast(message) {
    const visibleMessage = currentLanguage() === 'en-US' ? translateValue(message) : message;
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML =
      '<div class="row-ico"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 6L9 17l-5-5"></path></svg></div>' +
      '<span>' + visibleMessage + '</span>';
    toastStack.appendChild(toast);
    requestAnimationFrame(() => toast.classList.add('show'));
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 250);
    }, 3200);
  }

  /* ---------- Navegação: hambúrguer no desktop e drawer no celular ---------- */
  const sidebar = document.querySelector('.sidebar');
  const topbar = document.querySelector('.topbar');
  const hamburgerBtn = document.getElementById('hamburgerBtn');

  document.querySelectorAll('.nav-item').forEach((item) => {
    const label = item.querySelector('.nav-label')?.textContent.trim();
    if (!label) return;
    item.dataset.navLabel = label;
    item.setAttribute('title', label);
    item.setAttribute('aria-label', label);
  });

  if (app && sidebar && topbar) {
    const mobileMedia = window.matchMedia('(max-width: 720px)');
    let savedSidebarState = false;
    try {
      savedSidebarState = localStorage.getItem('hcp-sidebar-collapsed') === 'true';
    } catch {
      // O menu continua funcionando mesmo sem acesso ao armazenamento local.
    }
    app.classList.toggle('sidebar-collapsed', savedSidebarState);

    const openMenuLabel = currentLanguage() === 'en-US' ? translateValue('Abrir menu') : 'Abrir menu';
    const closeMenuLabel = currentLanguage() === 'en-US' ? translateValue('Fechar menu') : 'Fechar menu';
    const mobileMenuBtn = document.createElement('button');
    mobileMenuBtn.className = 'mobile-menu-btn';
    mobileMenuBtn.type = 'button';
    mobileMenuBtn.setAttribute('aria-label', openMenuLabel);
    mobileMenuBtn.setAttribute('aria-controls', 'hcpSidebar');
    mobileMenuBtn.setAttribute('aria-expanded', 'false');
    mobileMenuBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M4 6h16M4 12h16M4 18h16"></path></svg>';
    topbar.prepend(mobileMenuBtn);

    sidebar.id = 'hcpSidebar';
    const backdrop = document.createElement('button');
    backdrop.className = 'mobile-sidebar-backdrop';
    backdrop.type = 'button';
    backdrop.tabIndex = -1;
    backdrop.setAttribute('aria-label', closeMenuLabel);
    document.body.appendChild(backdrop);

    const hamburgerIcon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M4 6h16M4 12h16M4 18h16"></path></svg>';
    const closeIcon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"></path></svg>';

    const syncHamburger = () => {
      if (!hamburgerBtn) return;
      if (mobileMedia.matches) {
        hamburgerBtn.innerHTML = closeIcon;
        hamburgerBtn.setAttribute('aria-label', closeMenuLabel);
        hamburgerBtn.setAttribute('title', closeMenuLabel);
        return;
      }

      const collapsed = app.classList.contains('sidebar-collapsed');
      const label = currentLanguage() === 'en-US'
        ? translateValue(collapsed ? 'Abrir menu' : 'Recolher menu')
        : (collapsed ? 'Abrir menu' : 'Recolher menu');
      hamburgerBtn.innerHTML = hamburgerIcon;
      hamburgerBtn.setAttribute('aria-label', label);
      hamburgerBtn.setAttribute('title', label);
      hamburgerBtn.setAttribute('aria-expanded', String(!collapsed));
    };

    const setDesktopSidebar = (collapsed) => {
      app.classList.toggle('sidebar-collapsed', Boolean(collapsed));
      try {
        localStorage.setItem('hcp-sidebar-collapsed', String(Boolean(collapsed)));
      } catch {
        // O estado apenas deixa de persistir entre as páginas.
      }
      syncHamburger();
    };

    const setMobileMenu = (open) => {
      const shouldOpen = Boolean(open) && mobileMedia.matches;
      app.classList.toggle('mobile-menu-open', shouldOpen);
      document.body.classList.toggle('mobile-menu-open', shouldOpen);
      mobileMenuBtn.setAttribute('aria-expanded', String(shouldOpen));
      if (shouldOpen) sidebar.querySelector('.nav-item')?.focus();
    };

    mobileMenuBtn.addEventListener('click', () => {
      setMobileMenu(!app.classList.contains('mobile-menu-open'));
    });
    hamburgerBtn?.addEventListener('click', () => {
      if (mobileMedia.matches) {
        setMobileMenu(false);
        return;
      }
      setDesktopSidebar(!app.classList.contains('sidebar-collapsed'));
    });
    backdrop.addEventListener('click', () => setMobileMenu(false));
    sidebar.querySelectorAll('.nav-item').forEach((item) => {
      item.addEventListener('click', () => setMobileMenu(false));
    });
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') setMobileMenu(false);
    });
    mobileMedia.addEventListener('change', () => {
      setMobileMenu(false);
      syncHamburger();
    });
    syncHamburger();
  }

  /* ---------- Notificações: dropdown ---------- */
  const notifBtn = document.getElementById('notifBtn');
  const notifDropdown = document.getElementById('notifDropdown');
  const notifDot = document.getElementById('notifDot');
  if (notifBtn && notifDropdown) {
    notifBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      notifDropdown.classList.toggle('open');
      if (notifDot) notifDot.classList.add('hidden');
    });
    document.addEventListener('click', (e) => {
      if (!notifDropdown.contains(e.target) && !notifBtn.contains(e.target)) {
        notifDropdown.classList.remove('open');
      }
    });
  }

  /* ---------- Paleta de comando: "Nova busca" + clique na busca + Alt+Espaço ---------- */
  const commandBackdrop = document.getElementById('commandBackdrop');
  const commandInput = document.getElementById('commandInput');
  const commandTrigger = document.getElementById('commandTrigger');
  const novaBuscaBtn = document.getElementById('novaBuscaBtn');

  const openCommand = () => {
    if (!commandBackdrop) return;
    commandBackdrop.classList.add('open');
    if (notifDropdown) notifDropdown.classList.remove('open');
    setTimeout(() => commandInput && commandInput.focus(), 50);
  };
  const closeCommand = () => {
    if (!commandBackdrop) return;
    commandBackdrop.classList.remove('open');
    if (commandInput) commandInput.value = '';
  };

  if (commandTrigger) commandTrigger.addEventListener('click', openCommand);
  if (novaBuscaBtn) novaBuscaBtn.addEventListener('click', openCommand);
  if (commandBackdrop) {
    commandBackdrop.addEventListener('click', (e) => {
      if (e.target === commandBackdrop) closeCommand();
    });
  }

  document.addEventListener('keydown', (e) => {
    // Alt + Espaço abre a paleta de comando
    if (e.altKey && e.code === 'Space') {
      e.preventDefault();
      if (commandBackdrop && commandBackdrop.classList.contains('open')) {
        closeCommand();
      } else {
        openCommand();
      }
    }
    // Esc fecha a paleta de comando
    if (e.key === 'Escape' && commandBackdrop && commandBackdrop.classList.contains('open')) {
      closeCommand();
    }
  });

  /* ---------- Toggles liga/desliga (notificações, aparência, etc.) ---------- */
  document.querySelectorAll('.toggle-switch').forEach((toggle) => {
    if (toggle.id === 'themeToggle') return;
    toggle.setAttribute('role', 'switch');
    toggle.setAttribute('tabindex', '0');
    toggle.setAttribute('aria-checked', toggle.classList.contains('on') ? 'true' : 'false');

    const flip = () => {
      toggle.classList.toggle('on');
      toggle.setAttribute('aria-checked', toggle.classList.contains('on') ? 'true' : 'false');
    };

    toggle.addEventListener('click', flip);
    toggle.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        flip();
      }
    });
  });

  /* ---------- Pills de filtro (ex: "Possui site", "Aberto agora") ---------- */
  document.querySelectorAll('.pill').forEach((pill) => {
    pill.setAttribute('tabindex', '0');
    pill.setAttribute('role', 'button');
    pill.setAttribute('aria-pressed', pill.classList.contains('selected') ? 'true' : 'false');

    const flip = () => {
      pill.classList.toggle('selected');
      pill.setAttribute('aria-pressed', pill.classList.contains('selected') ? 'true' : 'false');
    };

    pill.addEventListener('click', flip);
    pill.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        flip();
      }
    });
  });

  /* ---------- Toggle de cobrança mensal/anual (assinatura.html) ---------- */
  const billingButtons = document.querySelectorAll('.billing-toggle button[data-billing]');
  const priceValues = document.querySelectorAll('.price-value[data-monthly-price]');

  const updateBillingCycle = (billingCycle) => {
    const cycle = billingCycle === 'yearly' ? 'yearly' : 'monthly';
    const hasYearlyDiscount = cycle === 'yearly';

    billingButtons.forEach((button) => {
      const isActive = button.dataset.billing === cycle;
      button.classList.toggle('active', isActive);
      button.setAttribute('aria-pressed', String(isActive));
    });

    priceValues.forEach((priceValue) => {
      const monthlyPrice = Number(priceValue.dataset.monthlyPrice);
      if (!Number.isFinite(monthlyPrice)) return;

      const displayedPrice = hasYearlyDiscount ? monthlyPrice * 0.8 : monthlyPrice;
      const language = currentLanguage();
      const formattedPrice = displayedPrice.toLocaleString(language, {
        minimumFractionDigits: Number.isInteger(displayedPrice) ? 0 : 2,
        maximumFractionDigits: 2
      });
      const period = document.createElement('span');
      period.textContent = '/mês';
      priceValue.replaceChildren(document.createTextNode(`$${formattedPrice}`), period);
    });

    savePreference(HCP_BILLING_KEY, cycle);
    applyLanguage(currentLanguage());
  };

  billingButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      updateBillingCycle(btn.dataset.billing);
    });
  });

  if (billingButtons.length && priceValues.length) {
    updateBillingCycle(readPreference(HCP_BILLING_KEY, 'monthly'));
  }

  /* ---------- Busca em tabelas (Favoritos / Histórico) ---------- */
  document.querySelectorAll('.table-filter-input').forEach((input) => {
    const panel = input.closest('.panel');
    if (!panel) return;
    const rows = panel.querySelectorAll('table.data-table tbody tr');

    input.addEventListener('input', () => {
      const query = input.value.trim().toLowerCase();
      rows.forEach((row) => {
        const text = row.textContent.toLowerCase();
        row.style.display = text.includes(query) ? '' : 'none';
      });
    });
  });

  /* ---------- Pesquisar empresas: busca simulada ---------- */
  const searchBtn = document.getElementById('searchCompaniesBtn');
  if (searchBtn) {
    const COMPANIES = [
      { name: "Clínica Vitalis", cat: "Clínicas", city: "São Paulo", state: "SP", site: false, rating: 3.2 },
      { name: "Academia Fit+", cat: "Academias", city: "Curitiba", state: "PR", site: true, rating: 4.5 },
      { name: "Restaurante Sabor Real", cat: "Restaurantes", city: "Campinas", state: "SP", site: false, rating: 3.0 },
      { name: "Farmácia Bem Estar", cat: "Farmácias", city: "São Paulo", state: "SP", site: true, rating: 4.1 },
      { name: "Clínica Odonto Sorriso", cat: "Clínicas", city: "Santos", state: "SP", site: false, rating: 2.8 },
      { name: "Pet Shop Amigo Fiel", cat: "Pet Shops", city: "Curitiba", state: "PR", site: false, rating: 4.7 },
      { name: "Escritório Contábil Prime", cat: "Contabilidade", city: "Belo Horizonte", state: "MG", site: true, rating: 4.9 },
      { name: "Oficina Auto Center", cat: "Automotivo", city: "São Paulo", state: "SP", site: false, rating: 3.6 },
      { name: "Salão Bela Elegância", cat: "Beleza", city: "Rio de Janeiro", state: "RJ", site: false, rating: 3.9 },
      { name: "Loja Construforte", cat: "Materiais de construção", city: "Campinas", state: "SP", site: true, rating: 4.3 },
      { name: "Ágil Marketing Digital", cat: "Agências de Marketing", city: "São Paulo", state: "SP", site: false, rating: 3.4 },
      { name: "Marketing Nova Era", cat: "Agências de Marketing", city: "Curitiba", state: "PR", site: false, rating: 3.1 },
      { name: "Venda Norte Consultoria", cat: "Consultorias Comerciais / SDR / BDR", city: "Campinas", state: "SP", site: true, rating: 4.2 },
      { name: "Outbound Prime", cat: "Consultorias Comerciais / SDR / BDR", city: "Belo Horizonte", state: "MG", site: false, rating: 3.8 },
      { name: "Fluxo Certo BPO", cat: "Empresas de BPO Financeiro", city: "Rio de Janeiro", state: "RJ", site: true, rating: 4.4 },
      { name: "BPO Financeiro Ágil", cat: "Empresas de BPO Financeiro", city: "São Paulo", state: "SP", site: false, rating: 3.7 },
    ];

    const cidadeInput = document.getElementById('cidadeInput');
    const estadoSelect = document.getElementById('estadoSelect');
    const categoriaSelect = document.getElementById('categoriaSelect');
    const resultsCount = document.getElementById('resultsCount');
    const resultsContainer = document.getElementById('searchResults');

    // veio de um card de "Segmentos inteligentes"? pré-preenche a categoria
    const urlParams = new URLSearchParams(window.location.search);
    const categoriaParam = urlParams.get('categoria');
    if (categoriaParam && categoriaSelect) {
      const optionExists = Array.from(categoriaSelect.options).some((o) => o.value === categoriaParam || o.textContent === categoriaParam);
      if (optionExists) categoriaSelect.value = categoriaParam;
    }

    const runSearch = () => {
      const cidade = (cidadeInput && cidadeInput.value || '').trim().toLowerCase();
      const estado = (estadoSelect && estadoSelect.value) || 'Todos os estados';
      const categoria = (categoriaSelect && categoriaSelect.value) || 'Todas as categorias';
      const noSitePill = document.querySelector('.pill[data-filter="sem-site"]');
      const wantsNoSite = noSitePill && noSitePill.classList.contains('selected');

      const filtered = COMPANIES.filter((c) => {
        if (cidade && !c.city.toLowerCase().includes(cidade)) return false;
        if (estado !== 'Todos os estados' && c.state !== estado) return false;
        if (categoria !== 'Todas as categorias' && c.cat !== categoria) return false;
        if (wantsNoSite && c.site) return false;
        return true;
      });

      if (resultsCount) {
        resultsCount.textContent = filtered.length + (filtered.length === 1 ? ' empresa combina' : ' empresas combinam') + ' com seus filtros';
      }

      if (resultsContainer) {
        if (filtered.length === 0) {
          resultsContainer.innerHTML = '<p style="color:var(--gray); font-size:13px; padding:16px 0;">Nenhuma empresa encontrada com esses filtros.</p>';
        } else {
          resultsContainer.innerHTML = filtered.map((c) => (
            '<div class="list-row">' +
            '<div class="row-ico"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 21V9l8-6 8 6v12"></path><path d="M9 21v-6h6v6"></path></svg></div>' +
            '<div class="row-info"><strong>' + c.name + '</strong><span>' + c.cat + ' · ' + c.city + ', ' + c.state + (c.site ? '' : ' · sem site') + '</span></div>' +
            '<span class="star-val">★ ' + c.rating.toFixed(1) + '</span>' +
            '</div>'
          )).join('');
        }
      }

      if (currentLanguage() === 'en-US') applyLanguage('en-US');
    };

    searchBtn.addEventListener('click', runSearch);
    if (cidadeInput) cidadeInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') runSearch(); });

    // roda uma vez ao carregar pra já mostrar resultados
    runSearch();
  }

  /* ---------- Exportação (favoritos.html) ---------- */
  const exportBtn = document.getElementById('exportBtn');
  if (exportBtn) {
    exportBtn.addEventListener('click', () => {
      showToast('Exportação iniciada — você recebe o arquivo por e-mail em instantes.');
    });
  }

  /* ---------- Habilitar 2FA (configuracoes.html) ---------- */
  const enable2faBtn = document.getElementById('enable2faBtn');
  if (enable2faBtn) {
    enable2faBtn.dataset.enabled = String(enable2faBtn.textContent.trim() === 'Desabilitar');
    enable2faBtn.addEventListener('click', () => {
      const isOn = enable2faBtn.dataset.enabled === 'true';
      enable2faBtn.dataset.enabled = String(!isOn);
      const nextLabel = isOn ? 'Habilitar' : 'Desabilitar';
      enable2faBtn.textContent = nextLabel;
      if (currentLanguage() === 'en-US') applyLanguage('en-US');
      showToast(isOn ? 'Autenticação de dois fatores desabilitada.' : 'Autenticação de dois fatores habilitada.');
    });
  }

  /* ---------- Escolher plano (assinatura.html) ---------- */
  document.querySelectorAll('.price-cta').forEach((btn) => {
    btn.addEventListener('click', () => {
      const plan = btn.getAttribute('data-plan') || 'plano';
      showToast('Plano ' + plan + ' selecionado. Redirecionando para o checkout...');
    });
  });

  /* ---------- Sair da conta (conta.html) ---------- */
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
      logoutBtn.disabled = true;
      const { error } = window.hcpSupabase
        ? await window.hcpSupabase.auth.signOut({ scope: 'global' })
        : { error: null };

      if (error) {
        logoutBtn.disabled = false;
        showToast('Não foi possível encerrar a sessão. Tente novamente.');
        return;
      }

      showToast('Sessão encerrada em todos os dispositivos.');
      window.hcpProfileCache?.clear();
      window.location.replace('login.html');
    });
  }

});
