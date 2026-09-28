(function exposeCrmStorage(root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.HCPCrmStorage = api;
})(typeof window !== 'undefined' ? window : globalThis, function createCrmStorage() {
  const BASE_KEY = 'hcp-crm-v1';

  function keyForUser(userId) {
    const id = String(userId || '').trim();
    if (!id) throw new Error('É necessário identificar o usuário antes de acessar o CRM.');
    return `${BASE_KEY}:${id}`;
  }

  function readForUser(storage, userId) {
    const raw = storage.getItem(keyForUser(userId));
    if (raw === null) return null;
    try { return JSON.parse(raw); } catch { return null; }
  }

  // Older HCP builds used one browser-wide key before account separation.
  // Keep it available only to an explicit, user-confirmed import flow.
  function readLegacy(storage, userId) {
    const scoped = readForUser(storage, userId);
    if (scoped && Array.isArray(scoped.areas)) return { state: scoped, unscoped: false };
    const raw = storage.getItem(BASE_KEY);
    if (raw === null) return null;
    try {
      const state = JSON.parse(raw);
      return state && Array.isArray(state.areas) ? { state, unscoped: true } : null;
    } catch { return null; }
  }

  function writeForUser(storage, userId, state) {
    storage.setItem(keyForUser(userId), JSON.stringify(state));
  }

  return { keyForUser, readForUser, readLegacy, writeForUser };
});
