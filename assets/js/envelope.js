(() => {
  'use strict';
  const intro = document.querySelector('.intro');
  const seal = document.querySelector('.seal');
  const invitation = document.querySelector('.invitation');
  const hint = document.querySelector('.seal-hint');
  const cue = document.querySelector('.scroll-cue');
  const nextSection = document.querySelector('.countdown-section');
  if (!intro || !seal || !invitation || !cue || !nextSection) return;
  let state = 'closed';
  let fallback;

  function complete() {
    if (state !== 'opening') return;
    state = 'open';
    clearTimeout(fallback);
    seal.hidden = true;
    invitation.removeAttribute('aria-hidden');
    cue.hidden = false;
    nextSection.hidden = false;
    const welcomeSection = document.querySelector('.welcome-section');
    if (welcomeSection) welcomeSection.hidden = false;
    document.body.classList.remove('is-locked');
    intro.classList.add('is-open');
    // Move keyboard focus only when it was on the disappearing seal.
    if (document.activeElement === seal || document.activeElement === document.body) {
      cue.focus({ preventScroll: true });
    }
    intro.dispatchEvent(new CustomEvent('intro:complete', { bubbles: true }));
  }

  seal.addEventListener('click', () => {
    if (state !== 'closed') return;
    state = 'opening';
    seal.setAttribute('aria-expanded', 'true');
    seal.setAttribute('aria-disabled', 'true');
    seal.tabIndex = -1;
    if (hint) hint.setAttribute('aria-hidden', 'true');
    intro.classList.add('is-opening');
    // Safety net if animationend is not delivered (e.g. a background tab).
    const duration = parseFloat(getComputedStyle(intro).getPropertyValue('--intro-duration')) * 1000;
    fallback = setTimeout(complete, duration + 150);
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) complete();
  });
  invitation.addEventListener('animationend', (event) => {
    if (event.animationName === 'reveal-card') complete();
  });
})();
