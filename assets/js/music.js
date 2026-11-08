(() => {
  'use strict';

  const INITIAL_OFFSET = 15;
  const FADE_DURATION_MS = 3000;
  const MAX_VOLUME = 0.35;
  const seal = document.querySelector('.seal');
  const button = document.querySelector('.music-toggle');
  const audio = document.querySelector('#wedding-music');
  if (!seal || !button || !audio) return;

  let initialSeekDone = false;
  let fadeElapsed = 0;
  let fadeLastTick = 0;
  let fadeFrame = 0;
  let audioContext = null;
  let audioGain = null;

  function syncButton(isPlaying) {
    button.setAttribute('aria-pressed', String(isPlaying));
    button.setAttribute('aria-label', isPlaying ? 'Pausar música' : 'Reproducir música');
    button.firstChild.textContent = isPlaying ? 'Pausar música ' : 'Escuchar música ';
  }

  // Use native media playback on desktop/Android to avoid a suspended Web Audio
  // context silencing otherwise-playing media in Chrome.
  const needsWebAudio = /iPad|iPhone|iPod/.test(navigator.userAgent)
    || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

  // iOS Safari ignores HTMLAudioElement.volume, so use a Web Audio gain
  // for the 3-second fade. Create/resume the graph inside the user gesture.
  function prepareWebAudio() {
    if (!audio || audioGain || !needsWebAudio) return;
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;
    try {
      const context = new AudioContextClass();
      const source = context.createMediaElementSource(audio);
      const gain = context.createGain();
      gain.gain.setValueAtTime(0, context.currentTime);
      source.connect(gain);
      gain.connect(context.destination);
      audioContext = context;
      audioGain = gain;
      audio.volume = 1; // Web Audio owns the output level from now on.
    } catch (_) {
      // Fallback to volume control where supported.
    }
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
    if (audioGain && audioContext) {
      const now = audioContext.currentTime;
      const gain = audioGain.gain;
      if (typeof gain.cancelAndHoldAtTime === 'function') {
        gain.cancelAndHoldAtTime(now);
      } else {
        const level = gain.value;
        gain.cancelScheduledValues(now);
        gain.setValueAtTime(level, now);
      }
    }
  }

  function fadeTick(now) {
    if (audio.paused) {
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
    if (audioGain && audioContext) {
      const now = audioContext.currentTime;
      const gain = audioGain.gain;
      const level = Math.max(0, Math.min(MAX_VOLUME, gain.value));
      if (level >= MAX_VOLUME - 0.001) return;
      gain.cancelScheduledValues(now);
      gain.setValueAtTime(level, now);
      gain.linearRampToValueAtTime(
        MAX_VOLUME,
        now + (FADE_DURATION_MS / 1000) * (1 - level / MAX_VOLUME)
      );
      return;
    }
    // Desktop/older-browser fallback using HTMLAudioElement.volume.
    if (fadeElapsed >= FADE_DURATION_MS || fadeFrame) return;
    fadeLastTick = 0;
    fadeFrame = requestAnimationFrame(fadeTick);
  }


  function play() {
    prepareWebAudio();
    if (audioContext && audioContext.state !== 'running') {
      audioContext.resume().catch(() => syncButton(false));
    }
    seekFirstPlay();
    if (audio.error) audio.load();
    const request = audio.play();
    if (request) request.catch(() => syncButton(false));
  }

  audio.loop = true;
  audio.volume = 0;
  audio.addEventListener('loadedmetadata', seekFirstPlay);
  audio.addEventListener('playing', () => { syncButton(true); startFade(); });
  audio.addEventListener('pause', () => { stopFade(); syncButton(false); });
  audio.addEventListener('error', () => { stopFade(); syncButton(false); });

  seal.addEventListener('click', () => {
    button.hidden = false;
    play();
  }, { once: true });
  button.addEventListener('click', () => {
    if (audio.paused) play();
    else audio.pause();
  });
})();
