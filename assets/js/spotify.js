(() => {
  'use strict';
  // Spotify owns the audio stream; never bypass its player or browser autoplay policy.
  const TRACK_URI = 'spotify:track:1HNkqx9Ahdgi1Ixy2xkKkL';
  const START_SECONDS = 14;
  const seal = document.querySelector('.seal');
  const section = document.querySelector('.spotify-section');
  const host = document.querySelector('#spotify-embed');
  const button = document.querySelector('.music-toggle');
  if (!seal || !section || !host || !button) return;

  let controller = null;
  let ready = false;
  let requestedPlay = false;
  let playing = false;
  let prepared = false;
  let sought = false;
  let loopArmed = false;
  let loopPending = false;
  let lastPlayingPosition = 0;

  function syncButton(isPlaying) {
    playing = isPlaying;
    button.setAttribute('aria-pressed', String(isPlaying));
    button.setAttribute('aria-label', isPlaying ? 'Pausar Photograph de Ed Sheeran' : 'Reproducir Photograph de Ed Sheeran');
    button.firstChild.textContent = isPlaying ? 'Pausar música ' : 'Escuchar música ';
  }

  function play() {
    requestedPlay = true;
    if (!ready || !controller) return;
    try {
      const action = controller.play();
      if (action && typeof action.catch === 'function') {
        action.catch(() => syncButton(false));
      }
    } catch (_) {
      syncButton(false);
    }
  }

  // The callback is registered before Spotify's deferred iframe API script runs.
  window.onSpotifyIframeApiReady = (api) => {
    api.createController(host, { uri: TRACK_URI, width: '100%', height: 152 }, (embed) => {
      controller = embed;
      embed.addListener('ready', () => {
        ready = true;
        if (!prepared) {
          prepared = true;
          // The documented startAt parameter asks Spotify to start at 00:14.
          embed.loadEntity(TRACK_URI, false, START_SECONDS);
        }
        if (requestedPlay) play();
      });
      embed.addListener('playback_update', (event) => {
        if (!event || !event.data) return;
        const state = event.data;
        const position = Number(state.position);
        const duration = Number(state.duration);
        syncButton(!state.isPaused);

        // Only the very first playback begins at 00:14. Replays must start at 00:00.
        if (!sought && !state.isPaused && position < 10000) {
          sought = true;
          try { embed.seek(START_SECONDS); } catch (_) { /* Unsupported by this client. */ }
        }

        if (!state.isPaused && position > 14000) {
          loopArmed = true;
          lastPlayingPosition = position;
        }

        // Spotify has no dedicated "ended" event. Detect completion via its
        // playback position and restart (not loadEntity(startAt=14)).
        const finishedAtEnd = Number.isFinite(duration) && duration > 0
          && Number.isFinite(position) && position >= duration - 1200;
        const resetAfterEnd = state.isPaused && duration > 0 && position < 1500
          && lastPlayingPosition >= duration - 2000;
        if (requestedPlay && loopArmed && state.isPaused && !loopPending
            && (finishedAtEnd || resetAfterEnd)) {
          loopPending = true;
          loopArmed = false;
          lastPlayingPosition = 0;
          try {
            embed.restart(); // Spotify iFrame API restarts from 00:00.
            embed.play();
          } catch (_) {
            syncButton(false); // Spotify/browser policy may require the Play button.
          }
        }
        if (!state.isPaused && position > 1000) loopPending = false;
      });
    });
  };

  // Clicking the envelope seal is a direct user gesture on desktop and mobile.
  seal.addEventListener('click', () => {
    section.hidden = false;
    button.hidden = false;
    play();
  }, { once: true });

  // If the browser blocks the programmatic playback, this explicit button and
  // Spotify's own visible Play button at the bottom remain available.
  button.addEventListener('click', () => {
    if (playing && controller) {
      requestedPlay = false;
      loopArmed = false;
      try { controller.pause(); } catch (_) { syncButton(false); }
    } else {
      play();
    }
  });
})();
