(() => {
  'use strict';
  const form = document.querySelector('#rsvp-form');
  const status = document.querySelector('#rsvp-status');
  if (!form || !status) return;

  const button = form.querySelector('button[type="submit"]');
  const endpoint = window.Wedding?.config?.appsScriptUrl?.trim() || '';
  const showStatus = (message, isError = false) => {
    status.textContent = message;
    status.hidden = false;
    status.classList.toggle('is-error', isError);
  };

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!form.reportValidity()) return;

    const fields = new FormData(form);
    if (String(fields.get('website') || '').trim()) return;
    if (!endpoint) {
      showStatus('Estamos terminando de configurar el envío de respuestas. Estará disponible muy pronto.', true);
      return;
    }

    const payload = new URLSearchParams();
    ['guestName', 'companionName', 'children', 'busService', 'preWedding', 'dietary', 'website']
      .forEach((name) => payload.set(name, String(fields.get(name) || '').trim()));

    button.disabled = true;
    button.textContent = 'Enviando…';
    status.hidden = true;
    try {
      // Apps Script no permite leer la respuesta desde otro dominio; no-cors permite
      // enviar una petición simple sin exponer credenciales en la web.
      await fetch(endpoint, { method: 'POST', mode: 'no-cors', body: payload });
      form.reset();
      showStatus('¡Gracias! Hemos recibido vuestra respuesta.');
    } catch (_) {
      showStatus('No se ha podido enviar la respuesta. Comprueba tu conexión e inténtalo de nuevo.', true);
    } finally {
      button.disabled = false;
      button.textContent = 'Enviar confirmación';
    }
  });
})();
