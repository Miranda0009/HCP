(() => {
  const THEME_KEY = 'hcp-theme';

  try {
    const savedTheme = localStorage.getItem(THEME_KEY);
    document.documentElement.dataset.theme = savedTheme === 'light' ? 'light' : 'dark';
  } catch {
    document.documentElement.dataset.theme = 'dark';
  }
})();
