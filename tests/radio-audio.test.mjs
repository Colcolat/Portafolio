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
      instances.push(audio);
      return audio;
    },
    ...options,
  });
  return { controller, instances, statuses };
}

const flush = async () => { await Promise.resolve(); await Promise.resolve(); };

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
