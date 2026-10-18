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
  let openedWithKeyboard = false;

  function complete() {
    if (state !== 'opening') return;
    state = 'open';
    clearTimeout(fallback);
    seal.hidden = true;
    invitation.removeAttribute('aria-hidden');
    cue.hidden = false;
    nextSection.hidden = false;
    const monasterySection = document.querySelector('.monastery-section');
    if (monasterySection) monasterySection.hidden = false;
    const welcomeSection = document.querySelector('.welcome-section');
    if (welcomeSection) welcomeSection.hidden = false;
    document.body.classList.remove('is-locked');
    intro.classList.add('is-open');
    // The invitation can be taller than a phone screen: keep the hint in view
    // until the visitor starts scrolling, then remove it from view and tab order.
    function updateScrollCue() {
      cue.hidden = window.scrollY > 64;
    }
    window.addEventListener('scroll', updateScrollCue, { passive: true });
    updateScrollCue();
    // Transfer focus after keyboard activation; pointer activation needs no focus ring.
    if (openedWithKeyboard && (document.activeElement === seal || document.activeElement === document.body)) {
      cue.focus({ preventScroll: true });
    }
    intro.dispatchEvent(new CustomEvent('intro:complete', { bubbles: true }));
  }

  seal.addEventListener('click', (event) => {
    if (state !== 'closed') return;
    openedWithKeyboard = event.detail === 0;
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
