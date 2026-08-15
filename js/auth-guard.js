window.hcpProfileReady = (async function protectAuthenticatedPage() {
  const client = window.hcpSupabase;
  const loginUrl = () => new URL('login.html', window.location.href).href;

  if (!client) {
    window.hcpProfileCache?.clear();
    window.location.replace(loginUrl());
    return null;
  }

  const { data, error } = await client.auth.getUser();
  const user = data?.user;
  if (error || !user) {
    window.hcpProfileCache?.clear();
    window.location.replace(loginUrl());
    return null;
  }

  window.hcpCurrentUser = user;

  function isEnglish() {
    try {
      return localStorage.getItem('hcp-language') === 'en-US';
    } catch {
      return false;
    }
  }

  const copy = (pt, en) => isEnglish() ? en : pt;

  function profileInitials(name) {
    const parts = String(name || '').trim().split(/\s+/).filter(Boolean);
    if (!parts.length) return 'HC';
    const first = parts[0][0] || '';
    const last = parts.length > 1 ? parts[parts.length - 1][0] : (parts[0][1] || '');
    return `${first}${last}`.toUpperCase();
  }

  function safeAvatarUrl(value) {
    if (!value) return '';
    try {
      const url = new URL(value, window.location.href);
      return ['http:', 'https:'].includes(url.protocol) ? url.href : '';
    } catch {
      return '';
    }
  }

  function renderAvatar(element, avatarUrl, fullName) {
    const safeUrl = safeAvatarUrl(avatarUrl);
    element.replaceChildren();
    if (safeUrl) {
      const image = document.createElement('img');
      image.src = safeUrl;
      image.alt = `Foto de perfil de ${fullName}`;
      element.appendChild(image);
      element.classList.add('has-image');
      return;
    }

    element.textContent = profileInitials(fullName);
    element.classList.remove('has-image');
  }

  function renderProfile(profileData = {}) {
    const metadata = user.user_metadata || {};
    const fullName = String(profileData.full_name || metadata.full_name || metadata.name || user.email?.split('@')[0] || copy('Usuário HCP', 'HCP User')).trim();
    const companyName = String(profileData.company_name || 'Conta HCP').trim();
    const displayCompanyName = companyName === 'Conta HCP' ? copy('Conta HCP', 'HCP Account') : companyName;
    const phone = String(profileData.phone || '').trim();
    const avatarUrl = String(profileData.avatar_url || '').trim();
    const email = user.email || '';

    const normalizedProfile = {
      id: user.id,
      full_name: fullName,
      company_name: companyName,
      phone,
      avatar_url: avatarUrl,
      email
    };

    window.hcpProfile = normalizedProfile;
    window.hcpProfileCache?.write(normalizedProfile);

    const profileFullNameField = document.getElementById('profileFullName');
    const profileCompanyField = document.getElementById('profileCompany');
    const profilePhoneField = document.getElementById('profilePhone');
    const profileEmailField = document.getElementById('profileEmail');
    if (profileFullNameField) profileFullNameField.value = fullName;
    if (profileCompanyField) profileCompanyField.value = companyName === 'Conta HCP' ? '' : companyName;
    if (profilePhoneField) profilePhoneField.value = phone;
    if (profileEmailField) profileEmailField.value = email;

    document.querySelectorAll('.user-name, [data-profile-name]').forEach((element) => {
      element.textContent = fullName;
    });
    document.querySelectorAll('[data-profile-greeting]').forEach((element) => {
      element.textContent = fullName;
    });
    document.querySelectorAll('.user-role').forEach((element) => {
      element.textContent = displayCompanyName;
    });
    document.querySelectorAll('[data-profile-sub]').forEach((element) => {
      element.textContent = copy(
        `Proprietário do espaço de trabalho · ${displayCompanyName}`,
        `Workspace owner · ${displayCompanyName}`
      );
    });
    document.querySelectorAll('[data-profile-email]').forEach((element) => {
      element.textContent = email;
    });
    document.querySelectorAll('[data-profile-phone]').forEach((element) => {
      element.textContent = phone || copy('Telefone não informado', 'Phone not provided');
    });
    document.querySelectorAll('[data-profile-company]').forEach((element) => {
      element.textContent = copy(
        `${displayCompanyName} · espaço de trabalho`,
        `${displayCompanyName} · workspace`
      );
    });
    document.querySelectorAll('[data-user-avatar], [data-profile-avatar]').forEach((element) => {
      renderAvatar(element, avatarUrl, fullName);
    });

    return normalizedProfile;
  }

  window.hcpRenderProfile = renderProfile;

  const profileResult = await client
    .from('profiles')
    .select('full_name, avatar_url, company_name, phone')
    .eq('id', user.id)
    .maybeSingle();

  const profile = profileResult.error ? {} : (profileResult.data || {});
  const renderedProfile = renderProfile(profile);
  document.documentElement.classList.remove('profile-pending');
  document.documentElement.style.removeProperty('--hcp-profile-initials');
  document.documentElement.style.removeProperty('--hcp-profile-name');
  document.documentElement.style.removeProperty('--hcp-profile-company');

  client.auth.onAuthStateChange((event) => {
    if (event === 'SIGNED_OUT') {
      window.hcpProfileCache?.clear();
      window.location.replace(loginUrl());
    }
  });

  return renderedProfile;
})();
