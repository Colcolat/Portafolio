import test from 'node:test';
import assert from 'node:assert/strict';
import { createRadioAudioController, radioTrackUrl } from '../src/hooks/radioAudio.js';

function deferred() {
  let resolve;
  let reject;
  const promise = new Promise((yes, no) => { resolve = yes; reject = no; });
  return { promise, resolve, reject };
}

function setup(options = {}) {
  const { configureAudio, ...controllerOptions } = options;
  const instances = [];
  const statuses = [];
  const controller = createRadioAudioController({
    baseURL: '/Portafolio/',
    onStatus: status => statuses.push(status),
    createAudio: () => {
      const audio = {
        src: '',
        paused: true,
        error: null,
        requests: [],
        loads: [],
        events: new Map(),
        play() {
          const request = deferred();
          this.paused = false;
          this.requests.push(request);
          return request.promise;
        },
        pause() { this.paused = true; },
        load() { this.error = null; this.loads.push(this.src); },
        removeAttribute(name) { if (name === 'src') this.src = ''; },
        addEventListener(name, listener) { this.events.set(name, listener); },
        removeEventListener(name, listener) { if (this.events.get(name) === listener) this.events.delete(name); },
      };
      configureAudio?.(audio);
      instances.push(audio);
      return audio;
    },
    ...controllerOptions,
  });
  return { controller, instances, statuses };
}

const flush = async () => { await Promise.resolve(); await Promise.resolve(); };

function analysisSetup({ contextState = 'running', resumeFailure = false, resumePending = null, initiallyEmpty = false, ...options } = {}) {
  const contexts = [];
  const captures = [];
  const createContext = () => {
    const context = {
      state: contextState,
      sampleRate: 48000,
      resumeCalls: 0,
      closeCalls: 0,
      sources: [],
      analysers: [],
      resume() {
        this.resumeCalls += 1;
        if (resumeFailure) return Promise.reject(new Error('browser suspended analysis'));
        if (resumePending) return resumePending.promise.then(() => { this.state = 'running'; });
        this.state = 'running';
        return Promise.resolve();
      },
      close() { this.closeCalls += 1; this.state = 'closed'; return Promise.resolve(); },
      createAnalyser() {
        const analyser = {
          frequencyBinCount: 512,
          value: 128,
          reads: 0,
          disconnected: false,
          getByteFrequencyData(buffer) { this.reads += 1; buffer.fill(this.value); },
          disconnect() { this.disconnected = true; },
        };
        this.analysers.push(analyser);
        return analyser;
      },
      createMediaStreamSource(stream) {
        const node = { stream, connected: null, disconnected: false, connect(target) { this.connected = target; }, disconnect() { this.disconnected = true; } };
        this.sources.push(node);
        return node;
      },
    };
    contexts.push(context);
    return context;
  };
  const result = setup({
    configureAudio: audio => {
      audio.captureStream = () => {
        const track = { readyState: 'live', stopped: false, stop() { this.readyState = 'ended'; this.stopped = true; } };
        const capture = {
          tracks: initiallyEmpty ? [] : [track],
          track,
          events: new Map(),
          getTracks() { return this.tracks; },
          getAudioTracks() { return this.tracks; },
          addEventListener(name, callback) { this.events.set(name, callback); },
          removeEventListener(name, callback) { if (this.events.get(name) === callback) this.events.delete(name); },
        };
        captures.push(capture);
        return capture;
      };
    },
    createAudioContext: createContext,
    ...options,
  });
  return { ...result, contexts, captures };
}

test('radio assets honor the deployment base, with safe scene fallback', () => {
  assert.equal(radioTrackUrl('radio', '/Portafolio/'), '/Portafolio/audio/pocket-moonlight.mp3');
  assert.equal(radioTrackUrl('piano', '/Portafolio'), '/Portafolio/audio/piano-chopin.mp3');
  assert.equal(radioTrackUrl('unknown'), '/audio/pocket-moonlight.mp3');
});

test('props alone create no audio or requests before the explicit start gesture', async () => {
  const { controller, instances } = setup();
  controller.setActive(true);
  controller.setScene('piano');
  controller.setSound(false);
  controller.setSound(true);
  controller.setHidden(true);
  controller.setHidden(false);
  assert.equal(instances.length, 0);
  assert.equal(controller.getStatus(), 'idle');
  controller.setScene('radio');
  controller.start();
  assert.equal(instances.length, 1);
  assert.equal(instances[0].src, '/Portafolio/audio/pocket-moonlight.mp3');
  assert.equal(instances[0].preload, 'none');
  assert.equal(instances[0].loop, true);
  assert.equal(instances[0].volume, 0.4);
  assert.equal(instances[0].requests.length, 1);
  assert.equal(controller.getStatus(), 'loading');
  instances[0].requests[0].resolve();
  await flush();
  assert.equal(controller.getStatus(), 'playing');
});

test('a muted start does not load a file, and enabling sound honors playback intent', async () => {
  const { controller, instances } = setup({ sound: false });
  controller.start();
  assert.equal(instances.length, 0);
  assert.equal(controller.getStatus(), 'muted');
  controller.setSound(true);
  assert.equal(instances.length, 1);
  instances[0].requests[0].resolve();
  await flush();
  assert.equal(controller.getStatus(), 'playing');
  controller.setSound(false);
  assert.equal(instances[0].paused, true);
  assert.equal(controller.getStatus(), 'muted');
});

test('scene changes reuse one element and invalidate old play results', async () => {
  const { controller, instances } = setup();
  controller.start();
  const audio = instances[0];
  controller.setScene('piano');
  assert.equal(instances.length, 1);
  assert.equal(audio.src, '/Portafolio/audio/piano-chopin.mp3');
  assert.equal(audio.requests.length, 2);
  audio.requests[0].reject(Object.assign(new Error('old source'), { name: 'AbortError' }));
  await flush();
  assert.equal(controller.getStatus(), 'loading');
  audio.requests[1].resolve();
  await flush();
  assert.equal(controller.getStatus(), 'playing');
  controller.setScene('radio');
  assert.equal(audio.src, '/Portafolio/audio/pocket-moonlight.mp3');
  assert.equal(audio.requests.length, 3);
});

test('an explicit pause survives scene, mute and visibility changes', async () => {
  const { controller, instances } = setup();
  controller.start();
  const audio = instances[0];
  audio.requests[0].resolve();
  await flush();
  controller.togglePlayback();
  assert.equal(controller.getStatus(), 'paused');
  controller.setScene('piano');
  controller.setSound(false);
  controller.setSound(true);
  controller.setHidden(true);
  controller.setHidden(false);
  assert.equal(audio.requests.length, 1);
  assert.equal(audio.paused, true);
  assert.equal(controller.getStatus(), 'paused');
  controller.togglePlayback();
  assert.equal(audio.src, '/Portafolio/audio/piano-chopin.mp3');
  assert.equal(audio.requests.length, 2);
});

test('autoplay blocking is caught and an explicit retry can recover', async () => {
  const { controller, instances } = setup();
  controller.start();
  const audio = instances[0];
  audio.requests[0].reject(Object.assign(new Error('gesture needed'), { name: 'NotAllowedError' }));
  await flush();
  assert.equal(controller.getStatus(), 'blocked');
  assert.equal(audio.paused, true);
  controller.togglePlayback();
  audio.requests[1].resolve();
  await flush();
  assert.equal(controller.getStatus(), 'playing');
});

test('mute and stop invalidate pending playback and release the source', async () => {
  const { controller, instances } = setup();
  controller.start();
  const audio = instances[0];
  controller.setSound(false);
  audio.requests[0].resolve();
  await flush();
  assert.equal(controller.getStatus(), 'muted');
  assert.equal(audio.paused, true);
  controller.setSound(true);
  controller.stop();
  audio.requests[1].resolve();
  await flush();
  assert.equal(controller.getStatus(), 'idle');
  assert.equal(audio.paused, true);
  assert.equal(audio.src, '');
  controller.setSound(false);
  controller.setSound(true);
  controller.setScene('piano');
  assert.equal(audio.requests.length, 2);
});

test('visibility pauses desired music and resumes only that intent', async () => {
  const { controller, instances } = setup();
  controller.start();
  const audio = instances[0];
  audio.requests[0].resolve();
  await flush();
  controller.setHidden(true);
  assert.equal(audio.paused, true);
  assert.equal(controller.getStatus(), 'paused');
  controller.setHidden(false);
  assert.equal(audio.requests.length, 2);
  audio.requests[1].resolve();
  await flush();
  assert.equal(controller.getStatus(), 'playing');
});

test('media failures report error, dispose removes listeners and prevents late updates', async () => {
  const { controller, instances, statuses } = setup();
  controller.start();
  const audio = instances[0];
  audio.error = { code: 3 };
  audio.events.get('error')();
  assert.equal(controller.getStatus(), 'error');
  assert.equal(audio.paused, true);
  controller.togglePlayback();
  assert.equal(audio.error, null);
  assert.equal(audio.loads.length, 2);
  controller.dispose();
  const lastLength = statuses.length;
  assert.equal(audio.src, '');
  assert.equal(audio.events.size, 0);
  audio.requests[0].resolve();
  audio.requests[1].reject(new Error('late network failure'));
  await flush();
  controller.start();
  assert.equal(statuses.length, lastLength);
  assert.equal(instances.length, 1);
});

test('synchronous Audio or play failures are contained', () => {
  const missingAudio = setup({ createAudio: () => { throw new Error('no media support'); } });
  missingAudio.controller.start();
  assert.equal(missingAudio.controller.getStatus(), 'error');
  const blocked = setup();
  blocked.controller.start();
  blocked.controller.pause();
  blocked.instances[0].play = () => { throw Object.assign(new Error('blocked'), { name: 'NotAllowedError' }); };
  blocked.controller.start();
  assert.equal(blocked.controller.getStatus(), 'blocked');
});

test('a previous successful play cannot overwrite a newer blocked scene', async () => {
  const { controller, instances } = setup();
  controller.start();
  const audio = instances[0];
  controller.setScene('piano');
  audio.requests[1].reject(Object.assign(new Error('blocked'), { name: 'NotAllowedError' }));
  await flush();
  audio.requests[0].resolve();
  await flush();
  assert.equal(controller.getStatus(), 'blocked');
  assert.equal(audio.paused, true);
});

test('turning the experience off releases the file without losing lazy restart', async () => {
  const { controller, instances } = setup();
  controller.start();
  const audio = instances[0];
  controller.setActive(false);
  audio.requests[0].resolve();
  await flush();
  assert.equal(controller.getStatus(), 'idle');
  assert.equal(audio.src, '');
  assert.equal(audio.paused, true);
  controller.setActive(true);
  assert.equal(audio.requests.length, 1);
  controller.start();
  assert.equal(audio.src, '/Portafolio/audio/pocket-moonlight.mp3');
  assert.equal(audio.requests.length, 2);
});

test('mix and spectrum reads are lazy and never create audio or an analysis context', () => {
  const { controller, instances, contexts, captures } = analysisSetup();
  controller.setMix({ radio: 0.3, piano: 0.8 });
  const spectrum = controller.readSpectrum();
  assert.equal(spectrum.length, 16);
  assert.ok(spectrum.every(value => value === 0));
  assert.strictEqual(controller.readSpectrum(), spectrum, 'reads reuse the same buffer');
  controller.setScene('piano');
  controller.setSound(false);
  controller.setSound(true);
  assert.equal(instances.length, 0);
  assert.equal(contexts.length, 0);
  assert.equal(captures.length, 0);
});

test('scene-specific mixes fade the current track and apply before a new track plays', () => {
  const { controller, instances } = setup();
  controller.setMix({ radio: 0.75, piano: 0.2 });
  controller.start();
  const audio = instances[0];
  assert.ok(Math.abs(audio.volume - 0.3) < 0.00001);
  controller.setMix({ radio: 0, piano: 0.15 });
  assert.equal(audio.volume, 0, 'previous track is silent before the scene update');
  const nativePlay = audio.play;
  audio.play = function () {
    assert.equal(this.volume, 0.06, 'the new gain is applied before playback');
    return nativePlay.call(this);
  };
  controller.setScene('piano');
  assert.equal(audio.volume, 0.06);
  controller.setMix({ radio: 0, piano: 1 });
  assert.equal(audio.volume, 0.4);
  controller.pause();
  controller.setMix({ piano: 0.5 });
  assert.equal(audio.volume, 0.2);
  assert.equal(audio.paused, true);
  assert.equal(audio.requests.length, 2, 'mixing never resumes or recreates a track');
});

test('mixes clamp invalid gains, survive mute, and reset on stop', () => {
  const { controller, instances } = setup();
  controller.start();
  const audio = instances[0];
  controller.setMix({ radio: 3 });
  assert.equal(audio.volume, 0.4);
  controller.setMix({ radio: -2 });
  assert.equal(audio.volume, 0);
  controller.setMix({ radio: NaN });
  assert.equal(audio.volume, 0);
  controller.setMix(null);
  controller.setSound(false);
  controller.setMix({ radio: 0.5 });
  assert.equal(audio.paused, true);
  assert.equal(audio.volume, 0.2);
  controller.setSound(true);
  assert.equal(audio.volume, 0.2);
  controller.stop();
  controller.start();
  assert.equal(audio.volume, 0.4);
  assert.equal(instances.length, 1);
});

test('spectrum samples the real captured stream in 16 bounded bands without a destination', async () => {
  const { controller, contexts, instances, captures } = analysisSetup();
  controller.start();
  const audio = instances[0];
  audio.requests[0].resolve();
  await flush();
  assert.equal(contexts.length, 1);
  const context = contexts[0];
  assert.equal(context.sources.length, 1);
  assert.equal(context.sources[0].stream, captures[0]);
  assert.equal(context.sources[0].connected, context.analysers[0]);
  const spectrum = controller.readSpectrum();
  assert.ok(spectrum.every(value => Math.abs(value - 128 / 255) < 0.00001));
  controller.setMix({ radio: 0.5 });
  assert.ok(controller.readSpectrum().every(value => Math.abs(value - 64 / 255) < 0.00001));
  context.analysers[0].value = 255;
  controller.setMix({ radio: 1 });
  assert.ok(controller.readSpectrum().every(value => value === 1));
  context.analysers[0].value = 0;
  assert.ok(controller.readSpectrum().every(value => value === 0));
});

test('paused, muted, hidden or suspended analysis returns still bars without resuming anything', async () => {
  const { controller, contexts, instances } = analysisSetup();
  controller.start();
  const audio = instances[0];
  audio.requests[0].resolve();
  await flush();
  const context = contexts[0];
  controller.pause();
  assert.ok(controller.readSpectrum().every(value => value === 0));
  controller.start();
  audio.requests[1].resolve();
  await flush();
  controller.setSound(false);
  assert.ok(controller.readSpectrum().every(value => value === 0));
  controller.setSound(true);
  audio.requests[2].resolve();
  await flush();
  controller.setHidden(true);
  assert.ok(controller.readSpectrum().every(value => value === 0));
  controller.setHidden(false);
  audio.requests[3].resolve();
  await flush();
  context.state = 'suspended';
  assert.ok(controller.readSpectrum().every(value => value === 0));
  assert.equal(context.resumeCalls, 0, 'passive updates never resume a context');
  assert.equal(audio.paused, false, 'the native playback path never depends on context state');
});

test('unavailable, throwing and blocked analysis leave native playback working', async () => {
  for (const createAudioContext of [() => null, () => { throw new Error('not supported'); }]) {
    const { controller, instances } = analysisSetup({ createAudioContext });
    controller.start();
    instances[0].requests[0].resolve();
    await flush();
    assert.equal(controller.getStatus(), 'playing');
    assert.equal(instances[0].paused, false);
    assert.ok(controller.readSpectrum().every(value => value === 0));
  }
  const blocked = analysisSetup({ contextState: 'suspended', resumeFailure: true });
  blocked.controller.start();
  blocked.instances[0].requests[0].resolve();
  await flush();
  assert.equal(blocked.controller.getStatus(), 'playing');
  assert.equal(blocked.contexts[0].resumeCalls, 1);
  assert.equal(blocked.contexts[0].sources.length, 0);
  assert.ok(blocked.controller.readSpectrum().every(value => value === 0));
});

test('a capture that has no track before metadata binds when its real audio track arrives', async () => {
  const { controller, contexts, captures, instances } = analysisSetup({ initiallyEmpty: true });
  controller.start();
  assert.equal(contexts[0].sources.length, 0);
  const capture = captures[0];
  capture.tracks.push(capture.track);
  capture.events.get('addtrack')();
  assert.equal(contexts[0].sources.length, 1);
  instances[0].requests[0].resolve();
  await flush();
  assert.ok(controller.readSpectrum().some(value => value > 0));
});

test('source switches stop captured tracks and dispose releases nodes, listeners and context', async () => {
  const { controller, contexts, captures, instances } = analysisSetup();
  controller.start();
  const firstCapture = captures[0];
  const firstSource = contexts[0].sources[0];
  controller.setMix({ radio: 0, piano: 1 });
  controller.setScene('piano');
  assert.equal(firstCapture.track.stopped, true);
  assert.equal(firstCapture.events.size, 0);
  assert.equal(firstSource.disconnected, true);
  assert.equal(contexts.length, 1);
  assert.equal(instances.length, 1);
  const activeCapture = captures.at(-1);
  const activeSource = contexts[0].sources.at(-1);
  controller.dispose();
  assert.equal(activeCapture.track.stopped, true);
  assert.equal(activeCapture.events.size, 0);
  assert.equal(activeSource.disconnected, true);
  assert.equal(contexts[0].closeCalls, 1);
  assert.equal(contexts[0].analysers[0].disconnected, true);
  assert.equal(instances[0].events.size, 0);
  assert.ok(controller.readSpectrum().every(value => value === 0));
});

test('a late context resume cannot recreate captures after stop', async () => {
  const pending = deferred();
  const { controller, contexts, captures } = analysisSetup({ contextState: 'suspended', resumePending: pending });
  controller.start();
  controller.stop();
  pending.resolve();
  await flush();
  assert.equal(contexts[0].closeCalls, 1);
  assert.equal(contexts[0].sources.length, 0);
  assert.equal(captures.length, 0);
  assert.equal(controller.getStatus(), 'idle');
});

test('unmuting from a gesture after a muted start enables the real visualizer', async () => {
  const { controller, instances, contexts } = analysisSetup({ sound: false });
  controller.start();
  assert.equal(instances.length, 0);
  assert.equal(contexts.length, 0);
  controller.setSoundFromGesture(true);
  assert.equal(instances.length, 1);
  assert.equal(contexts.length, 1);
  assert.equal(instances[0].requests.length, 1);
  controller.setSound(true); // The following hook effect observes the same value.
  assert.equal(instances[0].requests.length, 1);
  instances[0].requests[0].resolve();
  await flush();
  assert.equal(controller.getStatus(), 'playing');
  assert.ok(controller.readSpectrum().some(value => value > 0));
});

test('passive unmute never creates analysis, while an explicit gesture may enable it later', async () => {
  const { controller, instances, contexts } = analysisSetup({ sound: false });
  controller.start();
  controller.setSound(true);
  assert.equal(instances.length, 1);
  assert.equal(contexts.length, 0);
  instances[0].requests[0].resolve();
  await flush();
  assert.ok(controller.readSpectrum().every(value => value === 0));
  controller.setSoundFromGesture(true);
  assert.equal(contexts.length, 1);
  assert.equal(instances[0].requests.length, 1, 'enabling analysis does not restart the music');
  assert.ok(controller.readSpectrum().some(value => value > 0));
});

test('sound gestures alone never grant playback intent or undo an explicit pause', async () => {
  const { controller, instances, contexts } = analysisSetup({ sound: false });
  controller.setSoundFromGesture(true);
  assert.equal(instances.length, 0);
  assert.equal(contexts.length, 0);
  controller.start();
  instances[0].requests[0].resolve();
  await flush();
  controller.pause();
  controller.setSoundFromGesture(false);
  controller.setSoundFromGesture(true);
  assert.equal(controller.getStatus(), 'paused');
  assert.equal(instances[0].requests.length, 1);
  assert.equal(instances[0].paused, true);
  assert.ok(controller.readSpectrum().every(value => value === 0));
});
