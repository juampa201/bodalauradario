(() => {
  'use strict';
  const seal = document.querySelector('.seal');
  const toggle = document.querySelector('.spotify-toggle');
  const panel = document.querySelector('.spotify-panel');
  const close = document.querySelector('.spotify-close');
  const host = document.querySelector('#spotify-embed');
  if (!seal || !toggle || !panel || !close || !host) return;
  let controller;
  let ready = false;
  function tryPlay() {
    if (!ready) return;
    try {
      const result = controller.play();
      if (result && result.catch) result.catch(() => {});
    } catch (_) {
      // The iframe's Play button remains usable if browser policy blocks this.
    }
  }
  function setPanel(open) {
    panel.hidden = !open;
    toggle.setAttribute('aria-expanded', String(open));
  }
  window.onSpotifyIframeApiReady = (api) => {
    api.createController(host, {
      uri: 'spotify:track:2NR99tTHkakE63qMMnkgZV',
      width: '100%',
      height: 152
    }, (embed) => {
      controller = embed;
      embed.addListener('ready', () => { ready = true; });
    });
  };
  seal.addEventListener('click', () => {
    toggle.hidden = false;
    // Best effort during the user gesture; Safari/Spotify can require Play.
    tryPlay();
  }, { once: true });
  toggle.addEventListener('click', () => {
    const opening = panel.hidden;
    setPanel(opening);
    if (opening) tryPlay();
  });
  close.addEventListener('click', () => { setPanel(false); toggle.focus(); });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && !panel.hidden) {
      setPanel(false);
      toggle.focus();
    }
  });
})();
