(() => {
  'use strict';
  const intro = document.querySelector('.intro');
  const replay = document.querySelector('.replay');
  if (!intro || !replay) return;

  // CSS controls the complete four-second sequence, including the seal and flap.
  function openEnvelope() {
    intro.classList.remove('is-opening');
    void intro.offsetWidth;
    intro.classList.add('is-opening');
  }

  replay.addEventListener('click', openEnvelope);
  // Integration hook for the next section of the wedding website.
  intro.addEventListener('animationend', (event) => {
    if (event.animationName === 'reveal-card') {
      intro.dispatchEvent(new CustomEvent('intro:complete', { bubbles: true }));
    }
  });
  openEnvelope();
})();
