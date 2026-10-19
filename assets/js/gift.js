(() => {
  'use strict';
  const button = document.querySelector('[data-copy-iban]');
  const account = document.querySelector('#gift-iban');
  const status = document.querySelector('#gift-copy-status');
  if (!button || !account || !status) return;

  button.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(account.dataset.iban);
      status.textContent = 'Número de cuenta copiado.';
      button.textContent = 'Copiado';
      window.setTimeout(() => { button.textContent = 'Copiar número de cuenta'; }, 1800);
    } catch (_) {
      status.textContent = 'No se ha podido copiar. Mantén pulsado el número para seleccionarlo.';
    }
  });
})();
