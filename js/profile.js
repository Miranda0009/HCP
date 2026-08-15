(function initializeProfilePage() {
  const profileForm = document.getElementById('profileForm');
  if (!profileForm) return;

  const client = window.hcpSupabase;
  const fullNameInput = document.getElementById('profileFullName');
  const companyInput = document.getElementById('profileCompany');
  const phoneInput = document.getElementById('profilePhone');
  const companyNicheInput = document.getElementById('profileCompanyNiche');
  const userCountInput = document.getElementById('profileUserCount');
  const emailInput = document.getElementById('profileEmail');
  const saveProfileButton = document.getElementById('saveProfileBtn');
  const profileFeedback = document.getElementById('profileFeedback');
  const photoInput = document.getElementById('profilePhotoInput');
  const removePhotoButton = document.getElementById('removePhotoBtn');
  const passwordForm = document.getElementById('passwordForm');
  const currentPasswordInput = document.getElementById('currentPassword');
  const newPasswordInput = document.getElementById('newPassword');
  const confirmPasswordInput = document.getElementById('confirmPassword');
  const updatePasswordButton = document.getElementById('updatePasswordBtn');
  const passwordFeedback = document.getElementById('passwordFeedback');
  const AVATAR_PATH_SUFFIX = 'avatar';
  const MAX_AVATAR_SIZE = 2 * 1024 * 1024;
  const ALLOWED_AVATAR_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);

  const isEnglish = () => {
    try {
      return localStorage.getItem('hcp-language') === 'en-US';
    } catch {
      return false;
    }
  };
  const copy = (pt, en) => isEnglish() ? en : pt;

  function showFeedback(element, message, type = 'info') {
    element.textContent = message;
    element.className = `form-feedback${type === 'info' ? '' : ` is-${type}`}`;
    element.hidden = !message;
  }

  function setBusy(button, busy, waitingLabel, normalLabel) {
    button.disabled = busy;
    button.textContent = busy ? waitingLabel : normalLabel;
  }

  function friendlyError(error) {
    const message = error?.message || '';
    if (message === 'Invalid login credentials') {
      return copy(
        'A senha atual está incorreta. Se você entrou pelo Google, use a recuperação de senha na tela de login.',
        'The current password is incorrect. If you signed in with Google, use password recovery on the login page.'
      );
    }
    if (message.toLowerCase().includes('password')) {
      return copy('Não foi possível atualizar a senha. Verifique os requisitos e tente novamente.', 'Could not update the password. Check the requirements and try again.');
    }
    return message || copy('Não foi possível concluir a alteração.', 'Could not complete the change.');
  }

  async function getAuthenticatedUser() {
    const { data, error } = await client.auth.getUser();
    if (error || !data.user) throw error || new Error(copy('Sessão não encontrada.', 'Session not found.'));
    return data.user;
  }

  async function getAccountMembership(userId) {
    const { data: memberships, error } = await client
      .from('account_memberships')
      .select('account_id, role, created_at')
      .eq('user_id', userId);

    if (error) throw error;
    const rolePriority = { owner: 0, admin: 1, member: 2 };
    const membership = (memberships || []).slice().sort((first, second) => {
      const roleDifference = (rolePriority[first.role] ?? 3) - (rolePriority[second.role] ?? 3);
      if (roleDifference) return roleDifference;
      return String(first.created_at || '').localeCompare(String(second.created_at || ''));
    })[0];
    if (!membership?.account_id) {
      throw new Error(copy(
        'Não encontramos uma conta HCP vinculada ao seu usuário.',
        'We could not find an HCP account linked to your user.'
      ));
    }
    return membership;
  }

  function fillForm(profile) {
    if (!profile) return;
    if (Object.hasOwn(profile, 'full_name')) fullNameInput.value = profile.full_name || '';
    if (Object.hasOwn(profile, 'company_name')) {
      companyInput.value = profile.company_name === 'Conta HCP' ? '' : (profile.company_name || '');
    }
    if (Object.hasOwn(profile, 'phone')) phoneInput.value = profile.phone || '';
    if (Object.hasOwn(profile, 'email')) emailInput.value = profile.email || '';
    if (companyNicheInput && Object.hasOwn(profile, 'company_niche')) {
      companyNicheInput.value = profile.company_niche || '';
    }
    if (userCountInput && Object.hasOwn(profile, 'expected_user_count')) {
      userCountInput.value = profile.expected_user_count || '';
    }
    if (Object.hasOwn(profile, 'avatar_url')) removePhotoButton.hidden = !profile.avatar_url;
  }

  profileForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!profileForm.checkValidity()) {
      profileForm.reportValidity();
      return;
    }

    const fullName = fullNameInput.value.trim();
    if (fullName.length < 2) {
      showFeedback(profileFeedback, copy('Informe seu nome completo.', 'Enter your full name.'), 'error');
      return;
    }
    const expectedUserCount = Number(userCountInput?.value || 0);
    if (!Number.isInteger(expectedUserCount) || expectedUserCount < 1 || expectedUserCount > 10000) {
      showFeedback(profileFeedback, copy('Informe uma quantidade válida de usuários.', 'Enter a valid number of users.'), 'error');
      userCountInput?.focus();
      return;
    }

    setBusy(saveProfileButton, true, copy('Salvando...', 'Saving...'), copy('Salvar alterações', 'Save changes'));
    showFeedback(profileFeedback, '');

    try {
      const user = await getAuthenticatedUser();
      const membership = await getAccountMembership(user.id);
      const updates = {
        id: user.id,
        full_name: fullName,
        company_name: companyInput.value.trim() || null,
        phone: phoneInput.value.trim() || null
      };

      const { data, error } = await client
        .from('profiles')
        .upsert(updates, { onConflict: 'id' })
        .select('full_name, avatar_url, company_name, phone')
        .single();
      if (error) throw error;

      const { data: account, error: accountError } = await client
        .from('accounts')
        .update({
          company_name: companyInput.value.trim() || null,
          phone: phoneInput.value.trim() || null,
          company_niche: companyNicheInput?.value.trim() || null,
          expected_user_count: expectedUserCount
        })
        .eq('id', membership.account_id)
        .select('company_niche, expected_user_count')
        .maybeSingle();
      if (accountError) throw accountError;
      if (!account) {
        throw new Error(copy(
          'Sua conta não permite alterar os dados empresariais. Peça ajuda ao proprietário do espaço de trabalho.',
          'Your account cannot change company details. Ask the workspace owner for help.'
        ));
      }

      const { error: authError } = await client.auth.updateUser({ data: { full_name: fullName } });
      if (authError) throw authError;
      const combined = { ...data, ...(account || {}), email: user.email };
      const rendered = window.hcpRenderProfile?.(combined);
      fillForm(rendered || combined);
      showFeedback(profileFeedback, copy('Perfil atualizado com sucesso.', 'Profile updated successfully.'), 'success');
    } catch (error) {
      showFeedback(profileFeedback, friendlyError(error), 'error');
    } finally {
      setBusy(saveProfileButton, false, '', copy('Salvar alterações', 'Save changes'));
    }
  });

  photoInput.addEventListener('change', async () => {
    const file = photoInput.files?.[0];
    if (!file) return;

    if (!ALLOWED_AVATAR_TYPES.has(file.type) || file.size > MAX_AVATAR_SIZE) {
      showFeedback(
        profileFeedback,
        copy('Escolha uma imagem JPG, PNG ou WebP de até 2 MB.', 'Choose a JPG, PNG, or WebP image up to 2 MB.'),
        'error'
      );
      photoInput.value = '';
      return;
    }

    const originalLabel = document.querySelector('.avatar-upload-btn')?.textContent || copy('Alterar foto', 'Change photo');
    const uploadLabel = document.querySelector('.avatar-upload-btn');
    if (uploadLabel) uploadLabel.textContent = copy('Enviando...', 'Uploading...');
    photoInput.disabled = true;
    showFeedback(profileFeedback, '');

    try {
      const user = await getAuthenticatedUser();
      const avatarPath = `${user.id}/${AVATAR_PATH_SUFFIX}`;
      const { error: uploadError } = await client.storage
        .from('avatars')
        .upload(avatarPath, file, {
          upsert: true,
          contentType: file.type,
          cacheControl: '3600'
        });
      if (uploadError) throw uploadError;

      const { data: publicData } = client.storage.from('avatars').getPublicUrl(avatarPath);
      const avatarUrl = `${publicData.publicUrl}?v=${Date.now()}`;
      const { data, error } = await client
        .from('profiles')
        .update({ avatar_url: avatarUrl })
        .eq('id', user.id)
        .select('full_name, avatar_url, company_name, phone')
        .single();
      if (error) throw error;

      const rendered = window.hcpRenderProfile?.({ ...data, email: user.email });
      fillForm(rendered || { ...data, email: user.email });
      showFeedback(profileFeedback, copy('Foto de perfil atualizada.', 'Profile photo updated.'), 'success');
    } catch (error) {
      showFeedback(profileFeedback, friendlyError(error), 'error');
    } finally {
      photoInput.disabled = false;
      photoInput.value = '';
      if (uploadLabel) uploadLabel.textContent = originalLabel;
    }
  });

  removePhotoButton.addEventListener('click', async () => {
    removePhotoButton.disabled = true;
    showFeedback(profileFeedback, '');
    try {
      const user = await getAuthenticatedUser();
      const avatarPath = `${user.id}/${AVATAR_PATH_SUFFIX}`;
      const { error: removeError } = await client.storage.from('avatars').remove([avatarPath]);
      if (removeError) throw removeError;

      const { data, error } = await client
        .from('profiles')
        .update({ avatar_url: null })
        .eq('id', user.id)
        .select('full_name, avatar_url, company_name, phone')
        .single();
      if (error) throw error;

      const rendered = window.hcpRenderProfile?.({ ...data, email: user.email });
      fillForm(rendered || { ...data, email: user.email });
      showFeedback(profileFeedback, copy('Foto removida. Suas iniciais voltaram a ser exibidas.', 'Photo removed. Your initials are displayed again.'), 'success');
    } catch (error) {
      showFeedback(profileFeedback, friendlyError(error), 'error');
    } finally {
      removePhotoButton.disabled = false;
    }
  });

  passwordForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!passwordForm.checkValidity()) {
      passwordForm.reportValidity();
      return;
    }

    const currentPassword = currentPasswordInput.value;
    const newPassword = newPasswordInput.value;
    const confirmation = confirmPasswordInput.value;

    if (newPassword !== confirmation) {
      showFeedback(passwordFeedback, copy('A nova senha e a confirmação não são iguais.', 'The new password and confirmation do not match.'), 'error');
      return;
    }
    if (newPassword === currentPassword) {
      showFeedback(passwordFeedback, copy('A nova senha precisa ser diferente da atual.', 'The new password must be different from the current password.'), 'error');
      return;
    }

    setBusy(updatePasswordButton, true, copy('Atualizando...', 'Updating...'), copy('Atualizar senha', 'Update password'));
    showFeedback(passwordFeedback, '');

    try {
      const user = await getAuthenticatedUser();
      const { error: signInError } = await client.auth.signInWithPassword({
        email: user.email,
        password: currentPassword
      });
      if (signInError) throw signInError;

      const { error } = await client.auth.updateUser({ password: newPassword });
      if (error) throw error;

      passwordForm.reset();
      showFeedback(passwordFeedback, copy('Senha atualizada com sucesso.', 'Password updated successfully.'), 'success');
    } catch (error) {
      showFeedback(passwordFeedback, friendlyError(error), 'error');
    } finally {
      setBusy(updatePasswordButton, false, '', copy('Atualizar senha', 'Update password'));
    }
  });

  document.querySelectorAll('.account-accordion').forEach((section) => {
    const trigger = section.querySelector('.account-accordion-trigger');
    const body = section.querySelector('.account-accordion-body');
    if (!trigger || !body) return;
    trigger.addEventListener('click', () => {
      const shouldOpen = !section.classList.contains('is-open');
      section.classList.toggle('is-open', shouldOpen);
      trigger.setAttribute('aria-expanded', String(shouldOpen));
      body.hidden = !shouldOpen;
    });
  });

  async function loadAccountDetails() {
    try {
      const user = await getAuthenticatedUser();
      emailInput.value = user.email || '';
      const membership = await getAccountMembership(user.id);
      const { data, error } = await client
        .from('accounts')
        .select('company_name, phone, company_niche, expected_user_count')
        .eq('id', membership.account_id)
        .maybeSingle();
      if (error) throw error;
      fillForm(data || {});
      const accountName = String(data?.company_name || 'Conta HCP').trim();
      const roleLabel = membership.role === 'admin'
        ? copy('Administrador do espaço de trabalho', 'Workspace administrator')
        : membership.role === 'member'
          ? copy('Membro do espaço de trabalho', 'Workspace member')
          : copy('Proprietário do espaço de trabalho', 'Workspace owner');
      document.querySelectorAll('[data-profile-sub]').forEach((element) => {
        element.textContent = `${roleLabel} · ${accountName}`;
      });
    } catch (error) {
      // Os campos pessoais continuam disponíveis mesmo em contas legadas.
      console.warn('Não foi possível carregar os dados empresariais da conta.', error);
    }
  }

  Promise.resolve(window.hcpProfileReady)
    .then(async (profile) => {
      fillForm(profile);
      await loadAccountDetails();
    })
    .catch((error) => showFeedback(profileFeedback, friendlyError(error), 'error'));
})();
