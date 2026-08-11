(() => {
  const THEME_KEY = 'hcp-theme';
  const REMEMBER_KEY = 'hcp-remember';
  const PROFILE_CACHE_KEY = 'hcp-profile-cache';

  const sessionStorageForProfile = () => {
    try {
      return localStorage.getItem(REMEMBER_KEY) === 'false' ? sessionStorage : localStorage;
    } catch {
      return sessionStorage;
    }
  };

  const otherProfileStorage = (storage) => storage === localStorage ? sessionStorage : localStorage;

  const profileInitials = (name) => {
    const parts = String(name || '').trim().split(/\s+/).filter(Boolean);
    if (!parts.length) return '';
    const first = parts[0][0] || '';
    const last = parts.length > 1 ? parts[parts.length - 1][0] : (parts[0][1] || '');
    return `${first}${last}`.toUpperCase();
  };

  const profileCache = Object.freeze({
    read() {
      try {
        const cached = sessionStorageForProfile().getItem(PROFILE_CACHE_KEY);
        return cached ? JSON.parse(cached) : null;
      } catch {
        return null;
      }
    },
    write(profile) {
      try {
        const storage = sessionStorageForProfile();
        const normalized = {
          userId: String(profile?.id || profile?.userId || ''),
          fullName: String(profile?.full_name || profile?.fullName || ''),
          avatarUrl: String(profile?.avatar_url || profile?.avatarUrl || ''),
          companyName: String(profile?.company_name || profile?.companyName || '')
        };
        storage.setItem(PROFILE_CACHE_KEY, JSON.stringify(normalized));
        otherProfileStorage(storage).removeItem(PROFILE_CACHE_KEY);
        return normalized;
      } catch {
        return null;
      }
    },
    clear() {
      try {
        localStorage.removeItem(PROFILE_CACHE_KEY);
        sessionStorage.removeItem(PROFILE_CACHE_KEY);
      } catch {
        // NÃ£o hÃ¡ prÃ©-visualizaÃ§Ã£o de perfil para remover.
      }
    }
  });

  window.hcpProfileCache = profileCache;

  try {
    const savedTheme = localStorage.getItem(THEME_KEY);
    document.documentElement.dataset.theme = savedTheme === 'light' ? 'light' : 'dark';
  } catch {
    document.documentElement.dataset.theme = 'dark';
  }

  const pageName = window.location.pathname.split('/').pop()?.toLowerCase() || '';
  if (!['', 'index.html', 'login.html'].includes(pageName)) {
    const cachedProfile = profileCache.read();
    const initials = profileInitials(cachedProfile?.fullName);
    const fullName = String(cachedProfile?.fullName || '');
    const companyName = String(cachedProfile?.companyName || 'Conta HCP');
    document.documentElement.classList.add('profile-pending');
    document.documentElement.style.setProperty('--hcp-profile-initials', JSON.stringify(initials));
    document.documentElement.style.setProperty('--hcp-profile-name', JSON.stringify(fullName));
    document.documentElement.style.setProperty('--hcp-profile-company', JSON.stringify(companyName));
  }
})();
