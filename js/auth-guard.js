(async function protectAuthenticatedPage() {
  const client = window.hcpSupabase;
  const loginUrl = () => new URL('login.html', window.location.href).href;

  if (!client) {
    window.location.replace(loginUrl());
    return;
  }

  const { data, error } = await client.auth.getSession();
  const session = data?.session;
  if (error || !session) {
    window.location.replace(loginUrl());
    return;
  }

  window.hcpCurrentUser = session.user;

  let profile = null;
  const profileResult = await client
    .from('profiles')
    .select('full_name, avatar_url, company_name')
    .eq('id', session.user.id)
    .maybeSingle();

  if (!profileResult.error) profile = profileResult.data;

  const metadata = session.user.user_metadata || {};
  const fullName = profile?.full_name || metadata.full_name || metadata.name || session.user.email?.split('@')[0] || 'Usuário HCP';
  const companyName = profile?.company_name || 'Conta HCP';
  const avatarUrl = profile?.avatar_url || metadata.avatar_url || metadata.picture;

  document.querySelectorAll('.user-name').forEach((element) => {
    element.textContent = fullName;
  });
  document.querySelectorAll('.user-role').forEach((element) => {
    element.textContent = companyName;
  });
  document.querySelectorAll('.user-chip img').forEach((image) => {
    if (avatarUrl) image.src = avatarUrl;
    image.alt = `Foto de perfil de ${fullName}`;
  });

  client.auth.onAuthStateChange((event) => {
    if (event === 'SIGNED_OUT') window.location.replace(loginUrl());
  });
})();
