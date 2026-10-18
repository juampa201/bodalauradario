(() => {
  'use strict';
  const audio = document.querySelector('#wedding-music');
  const button = document.querySelector('.music-toggle');
  const seal = document.querySelector('.seal');
  const config = window.Wedding.config;
  if (!audio || !button || !seal || !config.musicSrc) return;
  audio.src = config.musicSrc;
  audio.volume = Math.max(0, Math.min(1, Number(config.musicVolume) || 0.35));
  function sync() {
    button.setAttribute('aria-pressed', String(!audio.paused));
    button.setAttribute('aria-label', audio.paused ? 'Reproducir música' : 'Pausar música');
    button.firstChild.textContent = audio.paused ? 'Escuchar ' : 'Pausar ';
  }
  function play() {
    // Called directly from a user gesture, including the first tap on mobile.
    const request = audio.play();
    if (request) request.catch(sync);
  }
  seal.addEventListener('click', () => { button.hidden = false; play(); }, { once: true });
  button.addEventListener('click', () => { if (audio.paused) play(); else audio.pause(); });
  audio.addEventListener('play', sync);
  audio.addEventListener('pause', sync);
  audio.addEventListener('error', () => { button.hidden = true; });
})();
