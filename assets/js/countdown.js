(() => {
  'use strict';
  const target = Date.parse(window.Wedding.config.date);
  const fields = document.querySelectorAll('[data-countdown]');
  const message = document.querySelector('.countdown-message');
  let timer;

  function remainingTime(now) {
    const total = Math.max(0, Math.floor((target - now) / 1000));
    return {
      days: Math.floor(total / 86400),
      hours: Math.floor(total / 3600) % 24,
      minutes: Math.floor(total / 60) % 60,
      seconds: total % 60
    };
  }

  function update() {
    const now = Date.now();
    const remaining = remainingTime(now);
    fields.forEach((field) => {
      field.textContent = String(remaining[field.dataset.countdown]).padStart(2, '0');
    });
    if (now >= target) {
      clearInterval(timer);
      if (message) message.hidden = false;
    }
  }

  // Exposed for reuse in future sections, without a build step or dependencies.
  window.Wedding.remainingTime = remainingTime;
  if (Date.now() < target) timer = setInterval(update, 1000);
  update();
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) update();
  });
})();
