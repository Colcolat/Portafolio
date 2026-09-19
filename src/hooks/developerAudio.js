export function developerTrackUrl(baseURL = '/') {
  return `${String(baseURL || '/').replace(/\/?$/, '/')}audio/developer-room.mp3`;
}

// A room visit, not a saved discovery or a render, grants playback intent.
export function createDeveloperAudioController({
  baseURL = '/', createAudio = () => new Audio(), onStatus = () => {},
  sound = true, hidden = false,
} = {}) {
  let audio = null;
  let loaded = false;
  let active = false;
  let desired = false;
  let disposed = false;
  let generation = 0;
  let status = 'idle';
  const canPlay = () => active && desired && sound && !hidden && !disposed;
  const emit = next => {
    if (disposed || status === next) return;
    status = next;
    onStatus(next);
  };
  const pauseElement = () => { generation += 1; audio?.pause(); };
  const playbackError = () => {
    if (!audio?.error || !canPlay()) return;
    pauseElement();
    emit('error');
  };
  const play = () => {
    if (!canPlay()) return;
    const request = ++generation;
    try {
      if (!audio) {
        audio = createAudio();
        audio.preload = 'none';
        audio.loop = true;
        audio.volume = 0.28;
        audio.addEventListener('error', playbackError);
      }
      if (!loaded || audio.error) {
        audio.src = developerTrackUrl(baseURL);
        loaded = true;
        audio.load();
      }
      emit('loading');
      Promise.resolve(audio.play()).then(() => {
        if (request !== generation || !canPlay()) {
          if (!canPlay()) audio?.pause();
          return;
        }
        emit('playing');
      }).catch(error => {
        if (request !== generation || !canPlay()) return;
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
    if (!active || disposed) return;
    if (!sound) emit('muted');
    else if (!desired || hidden) emit('paused');
    else play();
  };
  const start = () => {
    if (disposed) return;
    if (canPlay() && ['playing', 'loading'].includes(status)) return;
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
    if (audio && loaded) { audio.removeAttribute('src'); audio.load(); }
    loaded = false;
    emit('idle');
  };
  const setSound = next => {
    if (sound === Boolean(next) || disposed) return;
    sound = Boolean(next);
    pauseElement();
    settle();
  };
  return {
    getStatus: () => status,
    start, pause, stop, setSound,
    setSoundFromGesture: setSound,
    setActive(next) { if (!next) stop(); },
    togglePlayback() {
      if (desired && !['blocked', 'error'].includes(status)) pause();
      else start();
    },
    setHidden(next) {
      if (hidden === Boolean(next) || disposed) return;
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
