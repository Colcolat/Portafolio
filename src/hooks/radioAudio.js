export const radioTracks = Object.freeze({
  radio: 'audio/pocket-moonlight.mp3',
  piano: 'audio/piano-chopin.mp3',
});

export function radioTrackUrl(scene, baseURL = '/') {
  return `${String(baseURL || '/').replace(/\/?$/, '/')}${radioTracks[scene] || radioTracks.radio}`;
}

// Audio is deliberately created only after a listener explicitly starts the radio.
export function createRadioAudioController({
  baseURL = '/',
  createAudio = () => new Audio(),
  onStatus = () => {},
  sound = true,
  scene = 'radio',
  hidden = false,
} = {}) {
  let audio = null;
  let loadedScene = null;
  let active = false;
  let desired = false;
  let disposed = false;
  let generation = 0;
  let status = 'idle';

  const emit = next => {
    if (status === next || disposed) return;
    status = next;
    onStatus(next);
  };
  const canPlay = () => active && desired && sound && !hidden && !disposed;
  const pauseElement = () => {
    generation += 1;
    audio?.pause();
  };
  const playbackError = () => {
    // Changing src clears audio.error; ignore error events queued by an old source.
    if (!audio?.error || !canPlay()) return;
    pauseElement();
    emit('error');
  };
  const loadScene = () => {
    if (!audio) {
      audio = createAudio();
      audio.preload = 'none';
      audio.loop = true;
      audio.volume = 0.4;
      audio.addEventListener('error', playbackError);
    }
    if (loadedScene !== scene || audio.error) {
      pauseElement();
      audio.src = radioTrackUrl(scene, baseURL);
      loadedScene = scene;
      audio.load();
    }
  };
  const play = () => {
    if (!canPlay()) return;
    generation += 1;
    try {
      loadScene();
      // loadScene may invalidate the preceding source's pending play request.
      const currentRequest = generation;
      emit('loading');
      const result = audio.play();
      Promise.resolve(result).then(() => {
        if (currentRequest !== generation || !canPlay()) {
          if (!canPlay()) audio?.pause();
          return;
        }
        emit('playing');
      }).catch(error => {
        if (currentRequest !== generation || !canPlay()) return;
        audio.pause();
        emit(error?.name === 'NotAllowedError' ? 'blocked' : 'error');
      });
    } catch (error) {
      if (!canPlay()) return;
      audio?.pause();
      emit(error?.name === 'NotAllowedError' ? 'blocked' : 'error');
    }
  };
  const settle = () => {
    if (!active) return;
    if (!sound) emit('muted');
    else if (!desired || hidden) emit('paused');
    else play();
  };
  const start = () => {
    if (disposed) return;
    active = true;
    desired = true;
    settle();
  };
  const pause = () => {
    desired = false;
    pauseElement();
    if (active) emit(sound ? 'paused' : 'muted');
  };
  const stop = () => {
    active = false;
    desired = false;
    pauseElement();
    if (audio) {
      audio.removeAttribute('src');
      audio.load();
    }
    loadedScene = null;
    emit('idle');
  };

  return {
    getStatus: () => status,
    start,
    pause,
    stop,
    togglePlayback() {
      if (desired && !['blocked', 'error'].includes(status)) pause();
      else start();
    },
    setActive(next) {
      if (!next) stop();
      // A prop alone never grants playback intent or starts a download.
    },
    setScene(next) {
      const normalized = next === 'piano' ? 'piano' : 'radio';
      if (scene === normalized) return;
      scene = normalized;
      pauseElement();
      // Preserve a user's pause, and defer loading the next source until needed.
      settle();
    },
    setSound(next) {
      if (sound === Boolean(next)) return;
      sound = Boolean(next);
      pauseElement();
      settle();
    },
    setHidden(next) {
      if (hidden === Boolean(next)) return;
      hidden = Boolean(next);
      pauseElement();
      settle();
    },
    dispose() {
      disposed = true;
      stop();
      status = 'idle';
      audio?.removeEventListener('error', playbackError);
      audio = null;
    },
  };
}
