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
  "INTELIGÊNCIA COMERCIAL": "COMMERCIAL INTELLIGENCE",
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
  "Gerar Lista de Leads": "Generate Lead List",
  "Gerar Lista de Leads - HCP": "Generate Lead List - HCP",
  "Crie, selecione e exporte leads": "Create, select, and export leads",
  "Visão geral do HCP": "HCP overview",
  "Filtros e lista de leads": "Filters and lead list",
  "Empresas salvas": "Saved companies",
  "Pesquisas realizadas": "Completed searches",
  "Assinatura e consumo": "Subscription and usage",
  "Perfil e segurança": "Profile and security",
  "Tema, idioma e notificações": "Theme, language, and notifications",
  "Defina seu público, confira o consumo de créditos e gere uma lista pronta para seleção e exportação.": "Define your audience, review credit usage, and generate a list ready for selection and export.",
  "Pesquisar empresas": "Search companies",
  "Segmentos inteligentes": "Smart segments",
  "Favoritos": "Favorites",
  "Histórico": "History",
  "Planos e limites": "Plans and limits",
  "Minha conta": "My account",
  "Preferências": "Preferences",
  "Usuários do HCP": "HCP users",
  "Selecione uma sugestão ou digite seu nicho": "Select a suggestion or enter your niche",
  "Agência de Marketing": "Marketing Agency",
  "Consultoria Comercial / SDR / BDR": "Sales Consulting / SDR / BDR",
  "BPO Financeiro": "Financial BPO",
  "Tecnologia / SaaS": "Technology / SaaS",
  "Serviços profissionais": "Professional services",
  "Como deseja escolher seu plano?": "How would you like to choose your plan?",
  "Para começar": "To get started",
  "Para equipes": "For teams",
  "Alto volume": "High volume",
  "Selecionar depois": "Select later",
  "Cadastre-se sem plano": "Sign up without a plan",
  "Monte seu Plano": "Build Your Plan",
  "Você poderá escolher ou alterar seu plano depois.": "You can choose or change your plan later.",
  "Seu plano": "Your plan",
  "Pesquisas usadas": "Searches used",
  "Gerenciar": "Manage",
  "/mês": "/month",
  "Pesquisar leads": "Search leads",
  "Pesquisar empresas, segmentos, cidades...": "Search companies, segments, cities...",
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
  "Critérios da lista": "List criteria",
  "Escolha uma sugestão ou escreva livremente o nicho desejado.": "Choose a suggestion or freely enter the desired niche.",
  "Nicho ou segmento": "Niche or segment",
  "Você pode selecionar uma sugestão ou digitar um nicho próprio.": "You can select a suggestion or enter your own niche.",
  "Estado (UF)": "State",
  "Todas as cidades": "All cities",
  "Deixe em branco para pesquisar em todo o estado selecionado.": "Leave blank to search the entire selected state.",
  "Quantidade de leads": "Lead quantity",
  "Filtros básicos": "Basic filters",
  "Os filtros são opcionais e ajudam a deixar a lista mais próxima do seu cliente foco.": "Filters are optional and help align the list with your target customer.",
  "Porte da empresa": "Company size",
  "Situação cadastral": "Registration status",
  "Tipo de empresa": "Company type",
  "Presença digital": "Digital presence",
  "Qualquer porte": "Any size",
  "Microempresa": "Micro business",
  "Pequena": "Small",
  "Média": "Medium",
  "Grande": "Large",
  "Ativa": "Active",
  "Inativa": "Inactive",
  "Qualquer situação": "Any status",
  "Qualquer tipo": "Any type",
  "Com ou sem site": "With or without a website",
  "Não possui site": "No website",
  "Limpar": "Clear",
  "Resumo de créditos": "Credit summary",
  "Cada lead gerado utiliza 1 crédito do saldo da sua conta.": "Each generated lead uses 1 credit from your account balance.",
  "Saldo disponível": "Available balance",
  "Custo desta lista": "This list cost",
  "Saldo após gerar": "Balance after generation",
  "O débito é registrado de forma segura e não é repetido ao tentar novamente a mesma solicitação.": "The debit is recorded securely and is not repeated when retrying the same request.",
  "As listas ficam separadas neste navegador ou aplicativo. Para usá-las em outro ambiente, exporte o arquivo.": "Lists are stored separately in this browser or app. Export the file to use them elsewhere.",
  "Gere uma lista para visualizar e selecionar os leads.": "Generate a list to view and select leads.",
  "Nome da lista": "List name",
  "Salvar lista": "Save list",
  "Exportar Excel (.XLSX)": "Export Excel (.XLSX)",
  "Listas salvas neste dispositivo": "Lists saved on this device",
  "As listas locais ficam disponíveis no site e no aplicativo deste dispositivo.": "Local lists are available on the website and app on this device.",
  "Nenhuma lista salva.": "No saved lists.",
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
  "Organize os nichos que acompanha e as listas de leads que deseja reutilizar.": "Organize the niches you follow and the lead lists you want to reuse.",
  "Gerar nova lista": "Generate new list",
  "Tipos de favoritos": "Favorite types",
  "Nichos Favoritos": "Favorite Niches",
  "Listas Favoritas": "Favorite Lists",
  "Acesse rapidamente os públicos de maior interesse.": "Quickly access your highest-priority audiences.",
  "Principal cliente · prospecção B2B": "Primary customer · B2B prospecting",
  "Vendas consultivas e outbound": "Consultative sales and outbound",
  "Operações financeiras terceirizadas": "Outsourced financial operations",
  "Gerar lista": "Generate list",
  "Nenhum nicho favorito. Você pode adicioná-los durante uma pesquisa.": "No favorite niches. You can add them during a search.",
  "Listas salvas ficam disponíveis para revisar e exportar novamente.": "Saved lists remain available for review and export.",
  "Empresas favoritas": "Favorite companies",
  "Lista preservada dos seus favoritos anteriores": "List preserved from your previous favorites",
  "Ver empresas": "View companies",
  "Ocultar empresas": "Hide companies",
  "Exportar CSV": "Export CSV",
  "Lista sem nome": "Untitled list",
  "Lista pronta para revisar": "List ready for review",
  "Lista salva": "Saved list",
  "Esta lista ainda não possui leads para exportar.": "This list does not have leads to export yet.",
  "Lista exportada em CSV.": "List exported as CSV.",
  "Favorito removido.": "Favorite removed.",
  "Nenhuma lista favorita. Gere uma lista e marque-a como favorita.": "No favorite lists. Generate a list and save it as a favorite.",
  "Semana passada": "Last week",
  "Suas últimas 20 pesquisas realizadas.": "Your last 20 completed searches.",
  "Histórico de pesquisas": "Search history",
  "Histórico 7 dias": "7-day history",
  "Escolha o plano que escala com sua prospecção.": "Choose the plan that scales with your prospecting.",
  "ALTERNATIVA PERSONALIZADA": "CUSTOM ALTERNATIVE",
  "CONFIGURAÇÃO SOB MEDIDA": "TAILORED CONFIGURATION",
  "Responda quatro etapas rápidas e veja qual configuração combina com o volume, a equipe e os recursos da sua operação.": "Complete four quick steps to see which configuration fits your volume, team, and operation needs.",
  "Começar configuração": "Start configuration",
  "Defina usuários, listas, leads e funcionalidades. O HCP explica como cada resposta influencia a recomendação antes de você confirmar.": "Define users, lists, leads, and features. HCP explains how each answer influences the recommendation before you confirm.",
  "Montar configuração": "Build configuration",
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
  "Pesquisas pré-construídas por lead, com curadoria de nossos especialistas em prospecção.": "Prebuilt lead searches curated by our prospecting specialists.",
  "Compartilhe quais fontes entregam os dados mais úteis e receba tokens para criar novas listas.": "Share which sources provide the most useful data and receive tokens to create new lists.",
  "Defina seu cliente foco e compartilhe quais fontes entregam os dados mais úteis para suas listas.": "Define your target customer and share which sources provide the most useful data for your lists.",
  "3 perguntas": "3 questions",
  "Qual é o seu cliente foco?": "Who is your target customer?",
  "Conte ao HCP quem você quer encontrar. Suas respostas ficarão salvas na conta e orientarão as próximas listas.": "Tell HCP who you want to find. Your answers will be saved to your account and guide your next lists.",
  "Ainda não definido": "Not defined yet",
  "Perfil definido": "Profile defined",
  "Qual nicho você quer alcançar?": "Which niche do you want to reach?",
  "Escolha uma sugestão ou escreva o nicho desejado.": "Choose a suggestion or enter the desired niche.",
  "Ex.: clínicas odontológicas": "E.g.: dental clinics",
  "Qual porte de empresa combina mais com sua oferta?": "Which company size best fits your offer?",
  "Este é o porte dos clientes que você deseja prospectar.": "This is the size of the customers you want to prospect.",
  "Selecione o porte": "Select the company size",
  "Microempresa (1–9 funcionários)": "Micro company (1–9 employees)",
  "Pequena empresa (10–49)": "Small company (10–49)",
  "Média empresa (50–249)": "Mid-sized company (50–249)",
  "Grande empresa (250+)": "Large company (250+)",
  "Qualquer porte": "Any company size",
  "Qual sinal indica uma boa oportunidade?": "Which signal indicates a good opportunity?",
  "Escolha o fator mais importante para priorizar um lead.": "Choose the most important factor for prioritizing a lead.",
  "Selecione o principal sinal": "Select the main signal",
  "Empresa sem site": "Company without a website",
  "Avaliação baixa no Google": "Low Google rating",
  "Crescimento ou novas contratações": "Growth or new hires",
  "Empresa aberta recentemente": "Recently opened company",
  "Necessidade de estrutura comercial": "Need for a sales structure",
  "Qualquer oportunidade": "Any opportunity",
  "Você poderá atualizar estas respostas quando o seu público mudar.": "You can update these answers when your audience changes.",
  "Salvar cliente foco": "Save target customer",
  "Segmentos prontos": "Ready-made segments",
  "Troca de dados por tokens": "Data exchange for tokens",
  "Áreas de segmentos inteligentes": "Smart segment areas",
  "Compartilhe a qualidade da sua lista": "Share your list quality",
  "Informe de onde vieram os leads e quais dados foram realmente úteis para sua operação.": "Tell us where the leads came from and which data was truly useful to your operation.",
  "Seus tokens": "Your tokens",
  "CNPJ da empresa": "Company CNPJ",
  "Consultar CNPJá": "Search CNPJá",
  "API ou origem dos dados": "Data API or source",
  "Nome ou origem da lista": "List name or origin",
  "Nicho da empresa": "Company niche",
  "Telefone para contato": "Contact phone",
  "Qualidade das informações": "Information quality",
  "Observações opcionais": "Optional notes",
  "Os dados serão usados para comparar a qualidade das APIs e sugerir o plano mais adequado.": "The data will be used to compare API quality and recommend the most suitable plan.",
  "Enviar e receber 25 tokens": "Submit and receive 25 tokens",
  "COMO FUNCIONA": "HOW IT WORKS",
  "Informação útil vira crédito": "Useful information becomes credit",
  "Consulte o CNPJ e confirme os dados da empresa.": "Look up the CNPJ and confirm the company data.",
  "Informe a origem da lista, o nicho e o telefone para contato.": "Provide the list source, niche, and contact phone.",
  "Avalie a qualidade da fonte e receba 25 tokens.": "Rate the source quality and receive 25 tokens.",
  "Por que coletamos isso?": "Why do we collect this?",
  "As respostas mostram quais APIs entregam dados mais certeiros e ajudam o HCP a indicar o melhor plano.": "The responses show which APIs deliver more accurate data and help HCP recommend the best plan.",
  "API pública CNPJá: até 5 consultas por minuto.": "CNPJá public API: up to 5 requests per minute.",
  "5 — Muito certeiras": "5 — Very accurate",
  "4 — Boas": "4 — Good",
  "3 — Razoáveis": "3 — Fair",
  "2 — Pouco úteis": "2 — Not very useful",
  "1 — Não ajudaram": "1 — Not useful",
  "Ex.: Lista outbound de agosto": "E.g. August outbound list",
  "Ex.: Agência de marketing B2B": "E.g. B2B marketing agency",
  "Ex.: 5": "E.g. 5",
  "Quais campos ajudaram mais?": "Which fields helped the most?",
  "Lista própria": "Own list",
  "Outra API": "Other API",
  "Visão geral da sua conta e espaço de trabalho.": "An overview of your account and workspace.",
  "Sua conta, assinatura e uso.": "Your account, plan, and usage.",
  "Atualize seus dados, foto e segurança da conta.": "Update your details, photo, and account security.",
  "Dados do perfil": "Profile details",
  "Estas informações aparecem na sua conta e no menu do HCP.": "This information appears in your account and the HCP menu.",
  "Nome completo": "Full name",
  "Empresa": "Company",
  "Telefone": "Phone",
  "Usuários previstos no HCP": "Expected HCP users",
  "Selecione ou digite seu nicho": "Select or enter your niche",
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

const HCP_COMPANIES = Object.freeze([
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
  { name: "Soluções Inteligentes", cat: "Consultorias Comerciais / SDR / BDR", city: "São Paulo", state: "SP", site: true, rating: 4.8 }
]);

function normalizeSearchTerm(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

function companyAnchor(name) {
  return `empresa-${normalizeSearchTerm(name).replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')}`;
}

function companySearchHref(name) {
  return `pesquisar.html?empresa=${encodeURIComponent(name)}#${companyAnchor(name)}`;
}

const HCP_COMMAND_ENTRIES = Object.freeze([
  { name: 'Painel', type: 'Página', meta: 'Visão geral do HCP', href: 'painel.html' },
  { name: 'Gerar Lista de Leads', type: 'Página', meta: 'Crie, selecione e exporte leads', href: 'gerar-leads.html' },
  { name: 'Pesquisar empresas', type: 'Página', meta: 'Filtros e lista de leads', href: 'pesquisar.html' },
  { name: 'Segmentos inteligentes', type: 'Página', meta: 'Troca de dados por tokens', href: 'segmentos.html' },
  { name: 'Favoritos', type: 'Página', meta: 'Empresas salvas', href: 'favoritos.html' },
  { name: 'Histórico', type: 'Página', meta: 'Pesquisas realizadas', href: 'historico.html' },
  { name: 'Planos e limites', type: 'Página', meta: 'Assinatura e consumo', href: 'assinatura.html' },
  { name: 'Minha conta', type: 'Página', meta: 'Perfil e segurança', href: 'perfil.html' },
  { name: 'Preferências', type: 'Página', meta: 'Tema, idioma e notificações', href: 'configuracoes.html' },
  { name: 'Alimentos Membros', type: 'Empresa', meta: 'Centro Distribuição · Fênix, AZ', href: 'painel.html#empresa-alimentos-membros' },
  { name: 'Cascata Funciona', type: 'Empresa', meta: 'Armazém · Atlanta, GA', href: 'painel.html#empresa-cascata-funciona' },
  { name: 'Atlas Alimentos', type: 'Empresa', meta: 'Construção · Nashville, TN', href: 'painel.html#empresa-atlas-alimentos' },
  { name: 'Soluções Pioneiras', type: 'Empresa', meta: 'Restaurante · Dallas, TX', href: 'painel.html#empresa-solucoes-pioneiras' },
  ...HCP_COMPANIES.map((company) => ({
    name: company.name,
    type: 'Empresa',
    meta: `${company.cat} · ${company.city}, ${company.state}`,
    href: companySearchHref(company.name)
  }))
]);

function localizedCommandEntry(entry, language = currentLanguage()) {
  if (language !== 'en-US') return entry;
  return {
    ...entry,
    name: translateValue(entry.name),
    meta: translateValue(entry.meta),
    type: entry.type === 'Empresa' ? 'Company' : 'Page'
  };
}

function findCommandEntries(value, limit = 7, language = currentLanguage()) {
  const query = normalizeSearchTerm(value);
  if (!query) return [];

  return HCP_COMMAND_ENTRIES
    .map((entry) => {
      const localizedEntry = localizedCommandEntry(entry, language);
      const originalName = normalizeSearchTerm(entry.name);
      const localizedName = normalizeSearchTerm(localizedEntry.name);
      const originalMeta = normalizeSearchTerm(`${entry.type} ${entry.meta}`);
      const localizedMeta = normalizeSearchTerm(`${localizedEntry.type} ${localizedEntry.meta}`);
      const startsWithQuery = originalName.startsWith(query) || localizedName.startsWith(query);
      const includesQuery = originalName.includes(query) || localizedName.includes(query);
      const metaIncludesQuery = originalMeta.includes(query) || localizedMeta.includes(query);
      const score = startsWithQuery ? 0 : (includesQuery ? 1 : (metaIncludesQuery ? 2 : 99));
      return { entry: localizedEntry, score };
    })
    .filter((result) => result.score < 99)
    .sort((a, b) => a.score - b.score || a.entry.name.localeCompare(b.entry.name, 'pt-BR'))
    .slice(0, limit)
    .map((result) => result.entry);
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

  const savedOnMatch = normalizedValue.match(/^Salva em (.+)$/);
  if (savedOnMatch) return `Saved on ${savedOnMatch[1]}`;

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
  document.querySelectorAll('datalist[data-translate-values] option[value]').forEach((option) => {
    translateAttribute(option, 'value', supportedLanguage);
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
  document.dispatchEvent(new CustomEvent('hcp:languagechange', {
    detail: { language: supportedLanguage }
  }));
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

  /* ---------- Estrutura global aditiva: marca e Gerar Lista de Leads ---------- */
  const logoLabel = document.querySelector('.logo .logo-text');
  if (logoLabel && !logoLabel.querySelector('.brand-title')) {
    logoLabel.replaceChildren();
    const title = document.createElement('strong');
    const subtitle = document.createElement('small');
    title.className = 'brand-title';
    subtitle.className = 'brand-subtitle';
    title.textContent = 'HCP';
    subtitle.textContent = 'INTELIGÊNCIA COMERCIAL';
    logoLabel.append(title, subtitle);
  }

  const sidebarPanelLink = document.querySelector('.sidebar .nav-item[href="painel.html"]');
  const existingLeadGeneratorLink = document.querySelector('.sidebar .nav-item[href="gerar-leads.html"]');
  if (sidebarPanelLink && !existingLeadGeneratorLink) {
    const leadLink = document.createElement('a');
    const isLeadPage = /(?:^|\/)gerar-leads\.html$/i.test(window.location.pathname);
    leadLink.className = `nav-item${isLeadPage ? ' active' : ''}`;
    leadLink.href = 'gerar-leads.html';
    leadLink.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M4 5h16M4 12h10M4 19h7"></path><path d="M18 15v6M15 18h6"></path></svg><span class="nav-label">Gerar Lista de Leads</span>';
    if (isLeadPage) sidebarPanelLink.classList.remove('active');
    sidebarPanelLink.insertAdjacentElement('afterend', leadLink);
  }

  // A marca e a nova rota são inseridas depois da primeira tradução da página.
  // Aplicar novamente mantém o primeiro carregamento e futuras trocas de idioma coerentes.
  applyLanguage(currentLanguage());

  const commandTriggerIcon = document.getElementById('commandTrigger');
  if (commandTriggerIcon) {
    const label = currentLanguage() === 'en-US' ? 'Open search' : 'Abrir pesquisa';
    commandTriggerIcon.setAttribute('role', 'button');
    commandTriggerIcon.setAttribute('tabindex', '0');
    commandTriggerIcon.setAttribute('aria-label', label);
    commandTriggerIcon.setAttribute('title', label);
  }

  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let glowFrame = 0;
  if (app && finePointer.matches && !reducedMotion.matches) {
    window.addEventListener('pointermove', (event) => {
      if (glowFrame) return;
      glowFrame = requestAnimationFrame(() => {
        app.style.setProperty('--cursor-x', `${event.clientX}px`);
        app.style.setProperty('--cursor-y', `${event.clientY}px`);
        glowFrame = 0;
      });
    }, { passive: true });
  }

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
  toastStack.setAttribute('aria-live', 'polite');
  toastStack.setAttribute('aria-atomic', 'false');
  toastStack.setAttribute('aria-relevant', 'additions');
  function showToast(message) {
    const visibleMessage = currentLanguage() === 'en-US' ? translateValue(message) : message;
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.setAttribute('role', 'status');
    toast.setAttribute('aria-live', 'polite');
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

  if (document.querySelector('[data-hcp-plan-builder], [data-plan-builder]')) {
    window.addEventListener('hcp:plan-selected', (event) => {
      const recommendation = event.detail?.recommendation;
      if (!recommendation) return;
      const english = currentLanguage() === 'en-US';
      const planName = recommendation.isCustom
        ? (english ? 'Custom configuration' : 'Configuração personalizada')
        : recommendation.planName;
      showToast(english
        ? `Configuration confirmed. Recommendation: ${planName}.`
        : `Configuração confirmada. Recomendação: ${planName}.`);
    });
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
    const sidebarTop = sidebar.querySelector('.sidebar-top');
    const topbarProfile = topbar.querySelector('.user-chip');
    let mobileSidebarProfile = null;

    if (sidebarTop && topbarProfile) {
      mobileSidebarProfile = topbarProfile.cloneNode(true);
      mobileSidebarProfile.className = 'mobile-sidebar-profile';
      mobileSidebarProfile.setAttribute(
        'aria-label',
        currentLanguage() === 'en-US' ? translateValue('Minha conta') : 'Minha conta'
      );
      mobileSidebarProfile.querySelector('div')?.classList.add('mobile-sidebar-profile-copy');
      mobileSidebarProfile.insertAdjacentHTML(
        'beforeend',
        '<svg class="mobile-sidebar-profile-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M9 5l7 7-7 7"></path></svg>'
      );
      sidebarTop.insertAdjacentElement('afterend', mobileSidebarProfile);

      Promise.resolve(window.hcpProfileReady).then((profile) => {
        if (profile && window.hcpRenderProfile) window.hcpRenderProfile(profile);
      });
    }

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
    mobileSidebarProfile?.addEventListener('click', () => setMobileMenu(false));
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
  const commandModal = commandBackdrop?.querySelector('.command-modal');
  const commandHint = commandBackdrop?.querySelector('.command-hint');
  const commandResults = document.createElement('div');
  let visibleCommandEntries = [];
  let activeCommandIndex = -1;
  let commandPreviousFocus = null;

  const commandDialogTitle = commandModal ? document.createElement('h2') : null;
  if (commandModal && commandDialogTitle) {
    commandDialogTitle.id = 'hcpCommandDialogTitle';
    commandDialogTitle.textContent = currentLanguage() === 'en-US' ? 'Global search' : 'Pesquisa global';
    Object.assign(commandDialogTitle.style, {
      position: 'absolute',
      width: '1px',
      height: '1px',
      padding: '0',
      margin: '-1px',
      overflow: 'hidden',
      clip: 'rect(0, 0, 0, 0)',
      whiteSpace: 'nowrap',
      border: '0'
    });
    commandModal.prepend(commandDialogTitle);
    commandModal.setAttribute('role', 'dialog');
    commandModal.setAttribute('aria-modal', 'true');
    commandModal.setAttribute('aria-labelledby', commandDialogTitle.id);
  }
  commandBackdrop?.setAttribute('aria-hidden', 'true');

  commandResults.className = 'command-results';
  commandResults.id = 'commandResults';
  commandResults.setAttribute('role', 'listbox');
  commandResults.hidden = true;
  commandHint?.insertAdjacentElement('afterend', commandResults);

  if (commandInput) {
    commandInput.setAttribute('role', 'combobox');
    commandInput.setAttribute('aria-autocomplete', 'list');
    commandInput.setAttribute('aria-controls', 'commandResults');
    commandInput.setAttribute('aria-expanded', 'false');
    commandInput.setAttribute('aria-label', currentLanguage() === 'en-US' ? 'Search companies and pages' : 'Pesquisar empresas e páginas');
  }

  const resetCommandSuggestions = () => {
    visibleCommandEntries = [];
    activeCommandIndex = -1;
    commandResults.replaceChildren();
    commandResults.hidden = true;
    if (commandHint) commandHint.hidden = false;
    if (commandInput) {
      commandInput.setAttribute('aria-expanded', 'false');
      commandInput.removeAttribute('aria-activedescendant');
    }
  };

  const syncActiveCommand = () => {
    const options = Array.from(commandResults.querySelectorAll('.command-result'));
    options.forEach((option, index) => {
      const active = index === activeCommandIndex;
      option.classList.toggle('active', active);
      option.setAttribute('aria-selected', String(active));
      if (active) {
        commandInput?.setAttribute('aria-activedescendant', option.id);
        option.scrollIntoView({ block: 'nearest' });
      }
    });
  };

  const navigateFromCommand = (entry) => {
    if (!entry?.href) return;
    window.location.href = entry.href;
  };

  const renderCommandSuggestions = () => {
    const query = normalizeSearchTerm(commandInput?.value);
    if (!query) {
      resetCommandSuggestions();
      return;
    }

    visibleCommandEntries = findCommandEntries(query);

    activeCommandIndex = visibleCommandEntries.length ? 0 : -1;
    commandResults.replaceChildren();
    commandResults.hidden = false;
    if (commandHint) commandHint.hidden = true;
    commandInput?.setAttribute('aria-expanded', 'true');

    if (!visibleCommandEntries.length) {
      const empty = document.createElement('p');
      empty.className = 'command-empty';
      empty.textContent = currentLanguage() === 'en-US'
        ? 'No company or page found.'
        : 'Nenhuma empresa ou página encontrada.';
      commandResults.appendChild(empty);
      return;
    }

    visibleCommandEntries.forEach((entry, index) => {
      const option = document.createElement('button');
      const icon = document.createElement('span');
      const content = document.createElement('span');
      const title = document.createElement('strong');
      const meta = document.createElement('small');
      const type = document.createElement('span');

      option.type = 'button';
      option.className = 'command-result';
      option.id = `command-option-${index}`;
      option.setAttribute('role', 'option');
      option.setAttribute('aria-selected', String(index === activeCommandIndex));
      icon.className = 'command-result-icon';
      const isCompanyEntry = entry.type === 'Empresa' || entry.type === 'Company';
      icon.textContent = isCompanyEntry ? '↗' : '⌘';
      content.className = 'command-result-content';
      title.textContent = entry.name;
      meta.textContent = entry.meta;
      type.className = 'command-result-type';
      type.textContent = entry.type;

      content.append(title, meta);
      option.append(icon, content, type);
      option.addEventListener('mousemove', () => {
        activeCommandIndex = index;
        syncActiveCommand();
      });
      option.addEventListener('click', () => navigateFromCommand(entry));
      commandResults.appendChild(option);
    });

    syncActiveCommand();
  };

  const openCommand = () => {
    if (!commandBackdrop) return;
    commandPreviousFocus = document.activeElement;
    commandBackdrop.classList.add('open');
    commandBackdrop.setAttribute('aria-hidden', 'false');
    if (notifDropdown) notifDropdown.classList.remove('open');
    renderCommandSuggestions();
    setTimeout(() => commandInput && commandInput.focus(), 50);
  };
  const closeCommand = () => {
    if (!commandBackdrop) return;
    commandBackdrop.classList.remove('open');
    commandBackdrop.setAttribute('aria-hidden', 'true');
    if (commandInput) commandInput.value = '';
    resetCommandSuggestions();
    commandPreviousFocus?.focus?.();
    commandPreviousFocus = null;
  };

  commandModal?.addEventListener('keydown', (event) => {
    if (event.key !== 'Tab' || !commandBackdrop?.classList.contains('open')) return;
    const focusable = Array.from(commandModal.querySelectorAll(
      'button:not([disabled]):not([hidden]), input:not([disabled]):not([hidden]), [href], [tabindex]:not([tabindex="-1"])'
    )).filter((element) => element.getClientRects().length > 0);
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });

  document.addEventListener('hcp:languagechange', () => {
    const english = currentLanguage() === 'en-US';
    if (commandDialogTitle) commandDialogTitle.textContent = english ? 'Global search' : 'Pesquisa global';
    commandInput?.setAttribute('aria-label', english ? 'Search companies and pages' : 'Pesquisar empresas e páginas');
    if (commandTrigger) {
      const triggerLabel = english ? 'Open search' : 'Abrir pesquisa';
      commandTrigger.setAttribute('aria-label', triggerLabel);
      commandTrigger.setAttribute('title', triggerLabel);
    }
    if (commandBackdrop?.classList.contains('open')) renderCommandSuggestions();
  });

  commandInput?.addEventListener('input', renderCommandSuggestions);
  commandInput?.addEventListener('keydown', (event) => {
    if (!visibleCommandEntries.length) return;
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      activeCommandIndex = (activeCommandIndex + 1) % visibleCommandEntries.length;
      syncActiveCommand();
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      activeCommandIndex = (activeCommandIndex - 1 + visibleCommandEntries.length) % visibleCommandEntries.length;
      syncActiveCommand();
    } else if (event.key === 'Enter' && activeCommandIndex >= 0) {
      event.preventDefault();
      navigateFromCommand(visibleCommandEntries[activeCommandIndex]);
    }
  });

  if (commandTrigger) {
    commandTrigger.addEventListener('click', openCommand);
    commandTrigger.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        openCommand();
      }
    });
  }
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

    const scopedSettingKey = () => {
      const setting = toggle.dataset.settingKey;
      const userId = window.hcpCurrentUser?.id || window.hcpProfile?.id;
      return setting && userId ? `hcp-user-setting:${userId}:${setting}` : '';
    };

    const restoreSetting = () => {
      const storageKey = scopedSettingKey();
      if (!storageKey) return;
      const stored = readPreference(storageKey, '');
      if (!['true', 'false'].includes(stored)) return;
      const enabled = stored === 'true';
      toggle.classList.toggle('on', enabled);
      toggle.setAttribute('aria-checked', String(enabled));
    };

    if (toggle.dataset.settingKey) {
      Promise.resolve(window.hcpProfileReady).then(restoreSetting).catch(() => {});
    }

    const flip = () => {
      toggle.classList.toggle('on');
      const enabled = toggle.classList.contains('on');
      toggle.setAttribute('aria-checked', enabled ? 'true' : 'false');
      const storageKey = scopedSettingKey();
      if (storageKey) savePreference(storageKey, String(enabled));
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

  const updateBillingCycle = (billingCycle, options = {}) => {
    const persist = options.persist !== false;
    const syncLanguage = options.syncLanguage !== false;
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
      period.textContent = language === 'en-US' ? '/month' : '/mês';
      priceValue.replaceChildren(document.createTextNode(`$${formattedPrice}`), period);

      const priceCard = priceValue.closest('.price-card');
      let breakdown = priceCard?.querySelector('.annual-breakdown');
      if (!breakdown && priceCard) {
        breakdown = document.createElement('div');
        breakdown.className = 'annual-breakdown';
        priceValue.insertAdjacentElement('afterend', breakdown);
      }
      if (breakdown) {
        breakdown.hidden = !hasYearlyDiscount;
        if (hasYearlyDiscount) {
          const annualTotal = displayedPrice * 12;
          const annualSavings = (monthlyPrice * 12) - annualTotal;
          const formatMoney = (value) => value.toLocaleString(language, {
            minimumFractionDigits: Number.isInteger(value) ? 0 : 2,
            maximumFractionDigits: 2
          });
          breakdown.innerHTML = language === 'en-US'
            ? `<span>Monthly equivalent <strong>$${formatMoney(displayedPrice)}/month</strong></span><span>Annual total upfront <strong>$${formatMoney(annualTotal)}</strong></span><span class="annual-saving">You save <strong>$${formatMoney(annualSavings)}</strong> versus monthly</span>`
            : `<span>Equivalente mensal <strong>$${formatMoney(displayedPrice)}/mês</strong></span><span>Total anual à vista <strong>$${formatMoney(annualTotal)}</strong></span><span class="annual-saving">Você economiza <strong>$${formatMoney(annualSavings)}</strong> comparado ao mensal</span>`;
        }
      }
    });

    if (persist) savePreference(HCP_BILLING_KEY, cycle);
    if (syncLanguage) applyLanguage(currentLanguage());
  };

  billingButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      updateBillingCycle(btn.dataset.billing);
    });
  });

  document.addEventListener('hcp:languagechange', () => {
    const activeCycle = Array.from(billingButtons).find((button) => button.classList.contains('active'))?.dataset.billing;
    if (activeCycle) updateBillingCycle(activeCycle, { persist: false, syncLanguage: false });
  });

  if (billingButtons.length && priceValues.length) {
    updateBillingCycle(readPreference(HCP_BILLING_KEY, 'monthly'));
  }

  /* ---------- Favoritos organizados por nichos e listas ---------- */
  const favoriteTabs = document.querySelectorAll('[data-favorite-tab]');
  const favoriteNichesPanel = document.getElementById('favoriteNichesPanel');
  const favoriteListsPanel = document.getElementById('favoriteListsPanel');
  const favoriteNichesGrid = document.getElementById('favoriteNichesGrid');
  const favoriteListsGrid = document.getElementById('favoriteListsGrid');
  const favoriteNichesEmpty = document.getElementById('favoriteNichesEmpty');
  const favoriteListsEmpty = document.getElementById('favoriteListsEmpty');
  const favoriteListStorageBaseKey = 'hcp-favorite-lead-lists';
  const hiddenNichesStorageBaseKey = 'hcp-hidden-favorite-niches';
  const hiddenDefaultListStorageBaseKey = 'hcp-hide-default-favorite-list';
  let favoriteListStorageKey = favoriteListStorageBaseKey;
  let hiddenNichesStorageKey = hiddenNichesStorageBaseKey;
  let hiddenDefaultListStorageKey = hiddenDefaultListStorageBaseKey;
  const favoriteCopy = (pt, en) => currentLanguage() === 'en-US' ? en : pt;

  const formatFavoriteSavedDate = (value) => {
    if (!value) return favoriteCopy('Lista salva', 'Saved list');
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return favoriteCopy('Lista salva', 'Saved list');
    return `${favoriteCopy('Salva em', 'Saved on')} ${date.toLocaleDateString(currentLanguage())}`;
  };

  const migrateFavoriteStorage = (userId) => {
    if (!userId) return false;
    favoriteListStorageKey = `${favoriteListStorageBaseKey}:${userId}`;
    hiddenNichesStorageKey = `${hiddenNichesStorageBaseKey}:${userId}`;
    hiddenDefaultListStorageKey = `${hiddenDefaultListStorageBaseKey}:${userId}`;

    try {
      const legacyLists = JSON.parse(localStorage.getItem(favoriteListStorageBaseKey) || '[]');
      const scopedLists = JSON.parse(localStorage.getItem(favoriteListStorageKey) || '[]');
      if (Array.isArray(legacyLists) && legacyLists.length) {
        const merged = new Map();
        [...(Array.isArray(scopedLists) ? scopedLists : []), ...legacyLists].forEach((list) => {
          const key = list?.id || JSON.stringify(list);
          if (key) merged.set(key, list);
        });
        localStorage.setItem(favoriteListStorageKey, JSON.stringify(Array.from(merged.values())));
      }
      localStorage.removeItem(favoriteListStorageBaseKey);

      const legacyNiches = JSON.parse(localStorage.getItem(hiddenNichesStorageBaseKey) || '[]');
      const scopedNiches = JSON.parse(localStorage.getItem(hiddenNichesStorageKey) || '[]');
      if (Array.isArray(legacyNiches) && legacyNiches.length) {
        localStorage.setItem(hiddenNichesStorageKey, JSON.stringify(Array.from(new Set([
          ...(Array.isArray(scopedNiches) ? scopedNiches : []),
          ...legacyNiches
        ]))));
      }
      localStorage.removeItem(hiddenNichesStorageBaseKey);

      const legacyDefault = localStorage.getItem(hiddenDefaultListStorageBaseKey);
      const scopedDefault = localStorage.getItem(hiddenDefaultListStorageKey);
      if (legacyDefault !== null) {
        localStorage.setItem(hiddenDefaultListStorageKey, String(legacyDefault === 'true' || scopedDefault === 'true'));
      }
      localStorage.removeItem(hiddenDefaultListStorageBaseKey);
      return true;
    } catch {
      return false;
    }
  };

  const csvEscape = (value) => {
    const text = String(value ?? '');
    return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
  };

  const downloadCsv = (fileName, leads) => {
    const columns = ['Empresa', 'Nicho', 'Cidade', 'UF', 'CNPJ', 'Telefone'];
    const lines = leads.map((lead) => [
      lead.name || lead.company || '',
      lead.niche || lead.cat || '',
      lead.city || '',
      lead.state || '',
      lead.cnpj || '',
      lead.phone || ''
    ].map(csvEscape).join(','));
    const blob = new Blob([`\uFEFF${[columns.join(','), ...lines].join('\r\n')}`], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${fileName.replace(/[^a-z0-9-_]+/gi, '-').replace(/(^-|-$)/g, '') || 'lista-hcp'}.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 0);
  };

  const readFavoriteLists = () => {
    try {
      const parsed = JSON.parse(localStorage.getItem(favoriteListStorageKey) || '[]');
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  };

  const saveFavoriteLists = (lists) => {
    try { localStorage.setItem(favoriteListStorageKey, JSON.stringify(lists)); } catch { /* sessão sem armazenamento */ }
  };

  const defaultFavoriteLeads = [
    { name: 'Alimentos Membros', niche: 'Centro Distribuição', city: 'Fênix', state: 'AZ' },
    { name: 'Soluções Pioneiras', niche: 'Restaurante', city: 'Dallas', state: 'TX' },
    { name: 'Tecnologia Harbor', niche: 'Fazenda', city: 'Brooklyn', state: 'NY' }
  ];

  const syncFavoriteEmptyStates = () => {
    if (favoriteNichesEmpty && favoriteNichesGrid) favoriteNichesEmpty.hidden = favoriteNichesGrid.children.length > 0;
    if (favoriteListsEmpty && favoriteListsGrid) favoriteListsEmpty.hidden = favoriteListsGrid.children.length > 0;
  };

  const attachFavoriteCardActions = (card, listRecord = null) => {
    const openButton = card.querySelector('.favorite-list-open');
    const exportButton = card.querySelector('.favorite-list-export');
    const removeButton = card.querySelector('.favorite-remove');
    const leads = listRecord?.leads || (card.matches('[data-default-favorite-list]') ? defaultFavoriteLeads : []);

    openButton?.addEventListener('click', () => {
      let details = card.querySelector('.favorite-list-details');
      if (!details) {
        details = document.createElement('ol');
        details.className = 'favorite-list-details';
        leads.forEach((lead) => {
          const item = document.createElement('li');
          item.textContent = `${lead.name || lead.company || 'Empresa'} · ${lead.city || 'Cidade'}, ${lead.state || 'UF'}`;
          details.appendChild(item);
        });
        card.appendChild(details);
      } else {
        details.hidden = !details.hidden;
      }
      openButton.textContent = details.hidden
        ? favoriteCopy('Ver empresas', 'View companies')
        : favoriteCopy('Ocultar empresas', 'Hide companies');
    });

    exportButton?.addEventListener('click', () => {
      if (!leads.length) {
        showToast(favoriteCopy(
          'Esta lista ainda não possui leads para exportar.',
          'This list does not have leads to export yet.'
        ));
        return;
      }
      downloadCsv(listRecord?.name || 'empresas-favoritas', leads);
      showToast(favoriteCopy('Lista exportada em CSV.', 'List exported as CSV.'));
    });

    removeButton?.addEventListener('click', () => {
      if (card.dataset.favoriteNiche) {
        let hiddenNiches = [];
        try { hiddenNiches = JSON.parse(localStorage.getItem(hiddenNichesStorageKey) || '[]'); } catch { hiddenNiches = []; }
        const next = Array.from(new Set([...hiddenNiches, card.dataset.favoriteNiche]));
        try { localStorage.setItem(hiddenNichesStorageKey, JSON.stringify(next)); } catch { /* sem persistência */ }
      } else if (listRecord?.id) {
        saveFavoriteLists(readFavoriteLists().filter((list) => list.id !== listRecord.id));
      } else if (card.matches('[data-default-favorite-list]')) {
        try { localStorage.setItem(hiddenDefaultListStorageKey, 'true'); } catch { /* sem persistência */ }
      }
      card.remove();
      syncFavoriteEmptyStates();
      showToast(favoriteCopy('Favorito removido.', 'Favorite removed.'));
    });
  };

  const syncFavoriteDynamicLanguage = () => {
    favoriteListsGrid?.querySelectorAll('[data-favorite-created-at]').forEach((date) => {
      date.textContent = formatFavoriteSavedDate(date.dataset.favoriteCreatedAt);
    });
    favoriteListsGrid?.querySelectorAll('.favorite-list-open').forEach((button) => {
      const details = button.closest('.favorite-list-card')?.querySelector('.favorite-list-details');
      button.textContent = details && !details.hidden
        ? favoriteCopy('Ocultar empresas', 'Hide companies')
        : favoriteCopy('Ver empresas', 'View companies');
    });
  };

  const initializeFavorites = async () => {
    if (!favoriteTabs.length) return;
    try {
      await Promise.resolve(window.hcpProfileReady);
    } catch {
      return;
    }
    const favoriteUserId = window.hcpCurrentUser?.id || window.hcpProfile?.id;
    if (!favoriteUserId) return;
    migrateFavoriteStorage(favoriteUserId);

    favoriteTabs.forEach((tab) => {
      tab.addEventListener('click', () => {
        const showLists = tab.dataset.favoriteTab === 'lists';
        favoriteTabs.forEach((item) => {
          const active = item === tab;
          item.classList.toggle('active', active);
          item.setAttribute('aria-selected', String(active));
        });
        if (favoriteNichesPanel) favoriteNichesPanel.hidden = showLists;
        if (favoriteListsPanel) favoriteListsPanel.hidden = !showLists;
      });
    });

    let hiddenNiches = [];
    try { hiddenNiches = JSON.parse(localStorage.getItem(hiddenNichesStorageKey) || '[]'); } catch { hiddenNiches = []; }
    favoriteNichesGrid?.querySelectorAll('[data-favorite-niche]').forEach((card) => {
      if (hiddenNiches.includes(card.dataset.favoriteNiche)) card.remove();
      else attachFavoriteCardActions(card);
    });

    const defaultList = favoriteListsGrid?.querySelector('[data-default-favorite-list]');
    let hideDefaultList = false;
    try { hideDefaultList = localStorage.getItem(hiddenDefaultListStorageKey) === 'true'; } catch { hideDefaultList = false; }
    if (defaultList && hideDefaultList) defaultList.remove();
    else if (defaultList) attachFavoriteCardActions(defaultList);

    readFavoriteLists().forEach((list) => {
      if (!favoriteListsGrid || !Array.isArray(list.leads)) return;
      const card = document.createElement('article');
      card.className = 'favorite-list-card';
      const content = document.createElement('div');
      const badge = document.createElement('span');
      const title = document.createElement('h3');
      const description = document.createElement('p');
      const date = document.createElement('small');
      const actions = document.createElement('div');
      badge.className = 'favorite-list-badge';
      badge.textContent = `${list.leads.length} leads`;
      title.textContent = list.name || 'Lista sem nome';
      description.textContent = list.leads.slice(0, 3).map((lead) => lead.name || lead.company).filter(Boolean).join(' · ') || 'Lista pronta para revisar';
      date.dataset.favoriteCreatedAt = list.createdAt || '';
      date.textContent = formatFavoriteSavedDate(list.createdAt);
      actions.className = 'favorite-card-actions';
      actions.innerHTML = '<button class="chip-btn favorite-list-open" type="button">Ver empresas</button><button class="chip-btn favorite-list-export" type="button">Exportar CSV</button><button class="chip-btn favorite-remove" type="button">Remover</button>';
      content.append(badge, title, description, date);
      card.append(content, actions);
      favoriteListsGrid.appendChild(card);
      attachFavoriteCardActions(card, list);
    });
    syncFavoriteEmptyStates();
    applyLanguage(currentLanguage());
    syncFavoriteDynamicLanguage();
    document.addEventListener('hcp:languagechange', syncFavoriteDynamicLanguage);
  };
  initializeFavorites();

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
    const cidadeInput = document.getElementById('cidadeInput');
    const estadoSelect = document.getElementById('estadoSelect');
    const categoriaSelect = document.getElementById('categoriaSelect');
    const resultsCount = document.getElementById('resultsCount');
    const resultsContainer = document.getElementById('searchResults');

    // veio de um card de "Segmentos inteligentes"? pré-preenche a categoria
    const urlParams = new URLSearchParams(window.location.search);
    const categoriaParam = urlParams.get('categoria');
    const empresaParam = urlParams.get('empresa');
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

      const filtered = HCP_COMPANIES.filter((c) => {
        if (empresaParam) return normalizeSearchTerm(c.name) === normalizeSearchTerm(empresaParam);
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
            '<div class="list-row" id="' + companyAnchor(c.name) + '">' +
            '<div class="row-ico"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 21V9l8-6 8 6v12"></path><path d="M9 21v-6h6v6"></path></svg></div>' +
            '<div class="row-info"><strong>' + c.name + '</strong><span>' + c.cat + ' · ' + c.city + ', ' + c.state + (c.site ? '' : ' · sem site') + '</span></div>' +
            '<span class="star-val">★ ' + c.rating.toFixed(1) + '</span>' +
            '</div>'
          )).join('');
        }
      }

      if (currentLanguage() === 'en-US') applyLanguage('en-US');
      if (empresaParam) {
        requestAnimationFrame(() => {
          const target = document.getElementById(companyAnchor(empresaParam));
          target?.scrollIntoView({ behavior: 'smooth', block: 'center' });
          target?.classList.add('company-search-target');
        });
      }
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
