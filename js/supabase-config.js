(function configureSupabase() {
  const PROJECT_URL = 'https://euxpmahouesimyyffcio.supabase.co';
  const PUBLISHABLE_KEY = 'sb_publishable_W-g4RiypibxKOHm7Q-rQEw_xu_4cGV_';
  const REMEMBER_KEY = 'hcp-remember';

  if (!window.supabase?.createClient) {
    console.error('O cliente Supabase não foi carregado.');
    return;
  }

  const selectedStorage = () => {
    try {
      return localStorage.getItem(REMEMBER_KEY) === 'false' ? sessionStorage : localStorage;
    } catch {
      return sessionStorage;
    }
  };

  const authStorage = {
    getItem(key) {
      try {
        return selectedStorage().getItem(key) || localStorage.getItem(key) || sessionStorage.getItem(key);
      } catch {
        return null;
      }
    },
    setItem(key, value) {
      try {
        const storage = selectedStorage();
        const otherStorage = storage === localStorage ? sessionStorage : localStorage;
        storage.setItem(key, value);
        otherStorage.removeItem(key);
      } catch {
        // A sessão continuará ativa apenas enquanto a página permanecer aberta.
      }
    },
    removeItem(key) {
      try {
        localStorage.removeItem(key);
        sessionStorage.removeItem(key);
      } catch {
        // Não há sessão persistida para remover.
      }
    }
  };

  window.HCP_SUPABASE = Object.freeze({
    projectRef: 'euxpmahouesimyyffcio',
    url: PROJECT_URL
  });

  window.hcpSupabase = window.supabase.createClient(PROJECT_URL, PUBLISHABLE_KEY, {
    auth: {
      storage: authStorage,
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true
    }
  });
})();
