document.addEventListener('DOMContentLoaded', () => {

  // Toggles liga/desliga (notificações, aparência, etc.)
  document.querySelectorAll('.toggle-switch').forEach((toggle) => {
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

  // Pills de filtro (ex: "Possui site", "Aberto agora") — seleção múltipla independente
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

  // Toggle de cobrança mensal/anual (assinatura.html)
  document.querySelectorAll('.billing-toggle button').forEach((btn) => {
    btn.addEventListener('click', () => {
      btn.parentElement.querySelectorAll('button').forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });

});