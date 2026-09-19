import test from 'node:test';
import assert from 'node:assert/strict';
import { createDeveloperAudioController, developerTrackUrl } from '../src/hooks/developerAudio.js';

function deferred() {
  let resolve;
  let reject;
  const promise = new Promise((yes, no) => { resolve = yes; reject = no; });
  return { promise, resolve, reject };
}

function setup(options = {}) {
  const instances = [];
  const statuses = [];
  const controller = createDeveloperAudioController({
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

test('developer room music honors root and GitHub Pages deployment paths', () => {
  assert.equal(developerTrackUrl(), '/audio/developer-room.mp3');
  assert.equal(developerTrackUrl('/Portafolio/'), '/Portafolio/audio/developer-room.mp3');
  assert.equal(developerTrackUrl('/Portafolio'), '/Portafolio/audio/developer-room.mp3');
  assert.equal(developerTrackUrl(''), '/audio/developer-room.mp3');
});

test('construction, discovery props and sound toggles never load before an explicit start', () => {
  const { controller, instances } = setup();
  controller.setActive(true);
  controller.setSound(false);
  controller.setSoundFromGesture(true);
  controller.setHidden(true);
  controller.setHidden(false);
  assert.equal(instances.length, 0);
  assert.equal(controller.getStatus(), 'idle');
});

test('start loads one looping quiet track and ignores duplicate start gestures', async () => {
  const { controller, instances } = setup();
  controller.start();
  const audio = instances[0];
  assert.equal(audio.src, '/Portafolio/audio/developer-room.mp3');
  assert.equal(audio.preload, 'none');
  assert.equal(audio.loop, true);
  assert.equal(audio.volume, 0.28);
  assert.equal(controller.getStatus(), 'loading');
  controller.start();
  assert.equal(audio.requests.length, 1);
  audio.requests[0].resolve();
  await flush();
  assert.equal(controller.getStatus(), 'playing');
  controller.start();
  assert.equal(audio.requests.length, 1);
});

test('muted entry is lazy and a gesture unmute honors the current playback intent', async () => {
  const { controller, instances } = setup({ sound: false });
  controller.start();
  assert.equal(controller.getStatus(), 'muted');
  assert.equal(instances.length, 0);
  controller.setSoundFromGesture(true);
  controller.setSound(true);
  const audio = instances[0];
  assert.equal(audio.requests.length, 1);
  audio.requests[0].resolve();
  await flush();
  assert.equal(controller.getStatus(), 'playing');
  controller.setSound(false);
  assert.equal(controller.getStatus(), 'muted');
  assert.equal(audio.paused, true);
});

test('manual pause survives global mute and visibility changes until explicit play', async () => {
  const { controller, instances } = setup();
  controller.start();
  const audio = instances[0];
  audio.requests[0].resolve();
  await flush();
  controller.togglePlayback();
  controller.setSound(false);
  controller.setHidden(true);
  controller.setSoundFromGesture(true);
  controller.setHidden(false);
  assert.equal(controller.getStatus(), 'paused');
  assert.equal(audio.paused, true);
  assert.equal(audio.requests.length, 1);
  controller.togglePlayback();
  audio.requests[1].resolve();
  await flush();
  assert.equal(controller.getStatus(), 'playing');
});

test('tab visibility pauses and resumes only a desired track, including hidden entry', async () => {
  const { controller, instances } = setup({ hidden: true });
  controller.start();
  assert.equal(controller.getStatus(), 'paused');
  assert.equal(instances.length, 0);
  controller.setHidden(false);
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

test('browser blocking is caught and the play control retries from the next gesture', async () => {
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

test('media errors pause the track and reload its source on an explicit retry', async () => {
  const { controller, instances } = setup();
  controller.start();
  const audio = instances[0];
  audio.error = { code: 3 };
  audio.events.get('error')();
  assert.equal(controller.getStatus(), 'error');
  assert.equal(audio.paused, true);
  controller.togglePlayback();
  assert.equal(audio.error, null);
  assert.equal(audio.loads.length, 2);
  audio.requests[0].reject(new Error('obsolete request'));
  audio.requests[1].resolve();
  await flush();
  assert.equal(controller.getStatus(), 'playing');
});

test('mute and exit invalidate pending play completion and release the source', async () => {
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
  assert.equal(audio.src, '');
  assert.equal(audio.paused, true);
  controller.setSound(false);
  controller.setSound(true);
  controller.setHidden(true);
  controller.setHidden(false);
  assert.equal(audio.requests.length, 2);
});

test('re-entering reuses the audio element but not playback authorization from props', async () => {
  const { controller, instances } = setup();
  controller.start();
  const audio = instances[0];
  controller.setActive(false);
  controller.setActive(true);
  assert.equal(audio.requests.length, 1);
  assert.equal(audio.src, '');
  controller.start();
  assert.equal(instances.length, 1);
  assert.equal(audio.src, '/Portafolio/audio/developer-room.mp3');
  audio.requests[1].resolve();
  await flush();
  audio.requests[0].reject(new Error('late rejection from previous visit'));
  await flush();
  assert.equal(controller.getStatus(), 'playing');
  assert.equal(audio.paused, false);
});

test('an older successful request cannot overwrite a newer blocked request', async () => {
  const { controller, instances } = setup();
  controller.start();
  const audio = instances[0];
  controller.pause();
  controller.start();
  audio.requests[1].reject(Object.assign(new Error('blocked'), { name: 'NotAllowedError' }));
  await flush();
  audio.requests[0].resolve();
  await flush();
  assert.equal(controller.getStatus(), 'blocked');
  assert.equal(audio.paused, true);
});

test('disposal releases listeners and ignores late promises and future controls', async () => {
  const { controller, instances, statuses } = setup();
  controller.start();
  const audio = instances[0];
  controller.dispose();
  const statusCount = statuses.length;
  assert.equal(audio.events.size, 0);
  assert.equal(audio.src, '');
  audio.requests[0].resolve();
  await flush();
  controller.start();
  controller.togglePlayback();
  controller.setSoundFromGesture(false);
  controller.setSoundFromGesture(true);
  controller.setHidden(false);
  assert.equal(controller.getStatus(), 'idle');
  assert.equal(instances.length, 1);
  assert.equal(audio.paused, true);
  assert.equal(statuses.length, statusCount);
});

test('synchronous audio and playback failures do not escape the controller', () => {
  const missingAudio = setup({ createAudio: () => { throw new Error('no audio support'); } });
  missingAudio.controller.start();
  assert.equal(missingAudio.controller.getStatus(), 'error');
  const { controller, instances } = setup();
  controller.start();
  controller.pause();
  instances[0].play = () => { throw Object.assign(new Error('blocked'), { name: 'NotAllowedError' }); };
  controller.start();
  assert.equal(controller.getStatus(), 'blocked');
});
