(() => {
  'use strict';

  // The supplied, locally hosted recording takes priority over Spotify.
  // On the first play: begin at 00:10 and fade in over 3 seconds.
  // After the track ends, the native audio loop restarts at 00:00 at normal volume.
  const INITIAL_OFFSET = 10;
  const FADE_DURATION_MS = 3000;
  const MAX_VOLUME = 0.35;
  const TRACK_URI = 'spotify:track:1HNkqx9Ahdgi1Ixy2xkKkL';

  const seal = document.querySelector('.seal');
  const spotifySection = document.querySelector('.spotify-section');
  const spotifyHost = document.querySelector('#spotify-embed');
  const button = document.querySelector('.music-toggle');
  const audio = document.querySelector('#wedding-music');
  if (!seal || !button || !spotifySection || !spotifyHost) return;

  let opened = false;
  let requestedPlay = false;
  let mode = null;
  let localFailed = !audio;
  let initialSeekDone = false;
  let fadeElapsed = 0;
  let fadeLastTick = 0;
  let fadeFrame = 0;

  let controller = null;
  let spotifyReady = false;
  let spotifyPlaying = false;
  let spotifyLoopArmed = false;
  let spotifyLoopPending = false;
  let lastSpotifyPosition = 0;

  function syncButton(isPlaying) {
    button.setAttribute('aria-pressed', String(isPlaying));
    button.setAttribute('aria-label', isPlaying
      ? 'Pausar Photograph de Ed Sheeran'
      : 'Reproducir Photograph de Ed Sheeran');
    button.firstChild.textContent = isPlaying ? 'Pausar música ' : 'Escuchar música ';
  }

  function seekFirstPlay() {
    if (!audio || initialSeekDone || audio.readyState < HTMLMediaElement.HAVE_METADATA) return;
    try {
      audio.currentTime = Math.min(INITIAL_OFFSET, Math.max(0, audio.duration - 0.25));
      initialSeekDone = true;
    } catch (_) {
      // Re-attempt on loadedmetadata if the browser cannot seek yet.
    }
  }

  function stopFade() {
    if (fadeFrame) cancelAnimationFrame(fadeFrame);
    fadeFrame = 0;
    fadeLastTick = 0;
  }

  function fadeTick(now) {
    if (!audio || mode !== 'local' || audio.paused) {
      stopFade();
      return;
    }
    if (fadeLastTick) fadeElapsed += Math.min(250, now - fadeLastTick);
    fadeLastTick = now;
    audio.volume = MAX_VOLUME * Math.min(1, fadeElapsed / FADE_DURATION_MS);
    if (fadeElapsed < FADE_DURATION_MS) {
      fadeFrame = requestAnimationFrame(fadeTick);
    } else {
      audio.volume = MAX_VOLUME;
      fadeFrame = 0;
      fadeLastTick = 0;
    }
  }

  function startFade() {
    if (fadeElapsed >= FADE_DURATION_MS || fadeFrame) return;
    fadeLastTick = 0;
    fadeFrame = requestAnimationFrame(fadeTick);
  }

  function playSpotify() {
    if (!spotifyReady || !controller) return;
    try {
      const result = controller.play();
      if (result && typeof result.catch === 'function') result.catch(() => syncButton(false));
    } catch (_) {
      syncButton(false);
    }
  }

  function useSpotifyFallback() {
    mode = 'spotify';
    spotifySection.hidden = false;
    if (requestedPlay) playSpotify();
  }

  function playLocal() {
    mode = 'local';
    seekFirstPlay();
    const result = audio.play(); // Must run synchronously inside the seal/button gesture.
    if (result && typeof result.catch === 'function') {
      result.catch((error) => {
        if (mode !== 'local') return;
        if (error && error.name === 'NotAllowedError') {
          syncButton(false); // The next direct button click can retry audio.
        } else {
          localFailed = true;
          useSpotifyFallback();
        }
      });
    }
  }

  function requestPlayback() {
    requestedPlay = true;
    if (localFailed) {
      useSpotifyFallback();
    } else {
      playLocal();
    }
  }

  if (audio) {
    audio.loop = true;
    audio.volume = 0;
    audio.addEventListener('loadedmetadata', seekFirstPlay);
    audio.addEventListener('playing', () => {
      mode = 'local';
      spotifySection.hidden = true;
      syncButton(true);
      startFade();
    });
    audio.addEventListener('pause', () => {
      stopFade();
      if (mode === 'local') syncButton(false);
    });
    audio.addEventListener('error', () => {
      localFailed = true;
      if (opened && requestedPlay && mode !== 'spotify') useSpotifyFallback();
    });
  }

  // Keep the original Spotify player as an explicit fallback until the
  // licensed local MP3 is uploaded to assets/audio/photograph.mp3.
  window.onSpotifyIframeApiReady = (api) => {
    api.createController(spotifyHost, { uri: TRACK_URI, width: '100%', height: 152 }, (embed) => {
      controller = embed;
      embed.addListener('ready', () => {
        spotifyReady = true;
        if (requestedPlay && mode === 'spotify') playSpotify();
      });
      embed.addListener('playback_update', (event) => {
        if (!event || !event.data || mode !== 'spotify') return;
        const state = event.data;
        const position = Number(state.position);
        const duration = Number(state.duration);
        spotifyPlaying = !state.isPaused;
        syncButton(spotifyPlaying);
        if (spotifyPlaying && position > 1000) {
          spotifyLoopArmed = true;
          lastSpotifyPosition = position;
          spotifyLoopPending = false;
        }
        const atEnd = duration > 0 && position >= duration - 1200;
        const resetAfterEnd = state.isPaused && position < 1500
          && lastSpotifyPosition >= duration - 2000;
        if (requestedPlay && spotifyLoopArmed && state.isPaused
            && !spotifyLoopPending && (atEnd || resetAfterEnd)) {
          spotifyLoopPending = true;
          spotifyLoopArmed = false;
          lastSpotifyPosition = 0;
          try {
            embed.restart();
            embed.play();
          } catch (_) {
            syncButton(false);
          }
        }
      });
    });
  };

  seal.addEventListener('click', () => {
    opened = true;
    button.hidden = false;
    requestPlayback();
  }, { once: true });

  button.addEventListener('click', () => {
    if (mode === 'local' && audio && !audio.paused) {
      requestedPlay = false;
      audio.pause();
    } else if (mode === 'spotify' && spotifyPlaying && controller) {
      requestedPlay = false;
      try { controller.pause(); } catch (_) { syncButton(false); }
    } else {
      requestPlayback();
    }
  });
})();
