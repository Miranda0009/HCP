(function initializeProfilePage() {
  const profileForm = document.getElementById('profileForm');
  if (!profileForm) return;

  const client = window.hcpSupabase;
  const fullNameInput = document.getElementById('profileFullName');
  const companyInput = document.getElementById('profileCompany');
  const phoneInput = document.getElementById('profilePhone');
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

  function fillForm(profile) {
    if (!profile) return;
    fullNameInput.value = profile.full_name || '';
    companyInput.value = profile.company_name === 'Conta HCP' ? '' : (profile.company_name || '');
    phoneInput.value = profile.phone || '';
    emailInput.value = profile.email || '';
    removePhotoButton.hidden = !profile.avatar_url;
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

    setBusy(saveProfileButton, true, copy('Salvando...', 'Saving...'), copy('Salvar alterações', 'Save changes'));
    showFeedback(profileFeedback, '');

    try {
      const user = await getAuthenticatedUser();
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

      await client.auth.updateUser({ data: { full_name: fullName } });
      const rendered = window.hcpRenderProfile?.({ ...data, email: user.email });
      fillForm(rendered || { ...data, email: user.email });
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

  Promise.resolve(window.hcpProfileReady)
    .then(fillForm)
    .catch((error) => showFeedback(profileFeedback, friendlyError(error), 'error'));
})();
