(() => {
  'use strict';
  const seal = document.querySelector('.seal');
  const section = document.querySelector('.spotify-section');
  const host = document.querySelector('#spotify-embed');
  if (!seal || !section || !host) return;
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
    section.hidden = false;
    // Best effort during the user gesture; Safari/Spotify can require Play.
    tryPlay();
  }, { once: true });
})();
