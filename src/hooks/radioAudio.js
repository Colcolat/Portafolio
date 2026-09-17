export const radioTracks = Object.freeze({
  radio: 'audio/pocket-moonlight.mp3',
  piano: 'audio/piano-chopin.mp3',
});

export function radioTrackUrl(scene, baseURL = '/') {
  return `${String(baseURL || '/').replace(/\/?$/, '/')}${radioTracks[scene] || radioTracks.radio}`;
}

function browserAudioContext() {
  const Context = globalThis.AudioContext || globalThis.webkitAudioContext;
  return Context ? new Context() : null;
}

const clampGain = value => Number.isFinite(value) ? Math.max(0, Math.min(1, value)) : 0;

// Audio is deliberately created only after a listener explicitly starts the radio.
export function createRadioAudioController({
  baseURL = '/',
  createAudio = () => new Audio(),
  createAudioContext = browserAudioContext,
  onStatus = () => {},
  sound = true,
  scene = 'radio',
  hidden = false,
} = {}) {
  scene = scene === 'piano' ? 'piano' : 'radio';
  let audio = null;
  let loadedScene = null;
  let active = false;
  let desired = false;
  let disposed = false;
  let generation = 0;
  let status = 'idle';
  let mix = { radio: 1, piano: 0 };
  let context = null;
  let analyser = null;
  let source = null;
  let stream = null;
  let capturedTrack = null;
  let frequencyData = null;
  let analysisGeneration = 0;
  const spectrum = new Float32Array(16);

  const emit = next => {
    if (status === next || disposed) return;
    status = next;
    onStatus(next);
  };
  const canPlay = () => active && desired && sound && !hidden && !disposed;
  const applyVolume = () => {
    if (audio) audio.volume = 0.4 * mix[loadedScene || scene];
  };
  const disconnectCapture = () => {
    try { source?.disconnect(); } catch { /* Optional analysis must never affect music. */ }
    source = null;
    capturedTrack = null;
    if (stream) {
      stream.removeEventListener('addtrack', connectCapture);
      stream.removeEventListener('removetrack', connectCapture);
      for (const track of stream.getTracks()) track.stop();
    }
    stream = null;
    spectrum.fill(0);
  };
  function connectCapture() {
    if (!active || disposed || !stream || !analyser || context?.state !== 'running') return;
    const track = stream.getAudioTracks().find(candidate => candidate.readyState !== 'ended');
    if (track === capturedTrack) return;
    try {
      source?.disconnect();
      source = null;
      capturedTrack = null;
      if (!track) return;
      source = context.createMediaStreamSource(stream);
      source.connect(analyser);
      capturedTrack = track;
      // Deliberately do not connect to destination: the native element is audible.
    } catch {
      source = null;
      capturedTrack = null;
    }
  }
  const refreshCapture = () => {
    if (!active || disposed || !analyser || context?.state !== 'running' || !audio) return;
    disconnectCapture();
    const capture = audio.captureStream || audio.mozCaptureStream;
    if (typeof capture !== 'function') return;
    try {
      // This captures only our own music element, never a microphone/device.
      stream = capture.call(audio);
      stream.addEventListener('addtrack', connectCapture);
      stream.addEventListener('removetrack', connectCapture);
      connectCapture();
    } catch { disconnectCapture(); }
  };
  const disposeAnalysis = () => {
    analysisGeneration += 1;
    disconnectCapture();
    try { analyser?.disconnect(); } catch { /* Analysis is optional. */ }
    const previous = context;
    context = null;
    analyser = null;
    frequencyData = null;
    try { Promise.resolve(previous?.close()).catch(() => {}); } catch { /* Already closed. */ }
  };
  const prepareAnalysisFromGesture = () => {
    if (!canPlay() || !audio || typeof (audio.captureStream || audio.mozCaptureStream) !== 'function') return;
    try {
      if (!context || context.state === 'closed') context = createAudioContext?.() || null;
      if (!context) return;
      const current = context;
      const request = analysisGeneration;
      const ready = () => {
        if (current !== context || request !== analysisGeneration || !active || disposed || current.state !== 'running') return;
        try {
          if (!analyser) {
            analyser = current.createAnalyser();
            analyser.fftSize = 1024;
            analyser.smoothingTimeConstant = 0.78;
            frequencyData = new Uint8Array(analyser.frequencyBinCount);
          }
          refreshCapture();
        } catch { disposeAnalysis(); }
      };
      if (current.state === 'running') ready();
      else Promise.resolve(current.resume()).then(ready).catch(() => {});
    } catch { disposeAnalysis(); }
  };
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
      applyVolume();
      audio.addEventListener('error', playbackError);
      audio.addEventListener('loadedmetadata', refreshCapture);
      audio.addEventListener('playing', refreshCapture);
    }
    if (loadedScene !== scene || audio.error) {
      pauseElement();
      audio.src = radioTrackUrl(scene, baseURL);
      loadedScene = scene;
      applyVolume();
      audio.load();
      refreshCapture();
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
    // Only an explicit gesture creates or resumes an analysis context.
    prepareAnalysisFromGesture();
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
    disposeAnalysis();
    if (audio) {
      audio.removeAttribute('src');
      audio.load();
    }
    loadedScene = null;
    mix = { radio: 1, piano: 0 };
    applyVolume();
    emit('idle');
  };
  const setSound = next => {
    if (sound === Boolean(next)) return;
    sound = Boolean(next);
    pauseElement();
    settle();
  };

  return {
    getStatus: () => status,
    start,
    pause,
    stop,
    setMix(next = {}) {
      if (disposed) return;
      next = next || {};
      mix = {
        radio: next.radio === undefined ? mix.radio : clampGain(next.radio),
        piano: next.piano === undefined ? mix.piano : clampGain(next.piano),
      };
      applyVolume();
    },
    readSpectrum() {
      spectrum.fill(0);
      if (!canPlay() || status !== 'playing' || audio?.paused || !source || !analyser || !frequencyData || context?.state !== 'running') return spectrum;
      try {
        analyser.getByteFrequencyData(frequencyData);
        const lastBin = Math.max(2, Math.min(frequencyData.length - 1, Math.round(12000 * analyser.fftSize / (context.sampleRate || 48000))));
        const gain = mix[loadedScene || scene];
        for (let band = 0; band < spectrum.length; band += 1) {
          const first = Math.max(1, Math.floor(lastBin ** (band / spectrum.length)));
          const end = Math.min(frequencyData.length, Math.max(first + 1, Math.ceil(lastBin ** ((band + 1) / spectrum.length))));
          let peak = 0;
          for (let bin = first; bin < end; bin += 1) peak = Math.max(peak, frequencyData[bin]);
          spectrum[band] = clampGain(peak / 255 * gain);
        }
      } catch { spectrum.fill(0); }
      return spectrum;
    },
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
    setSound,
    setSoundFromGesture(next) {
      setSound(next);
      if (next) prepareAnalysisFromGesture();
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
      audio?.removeEventListener('loadedmetadata', refreshCapture);
      audio?.removeEventListener('playing', refreshCapture);
      audio = null;
    },
  };
}
