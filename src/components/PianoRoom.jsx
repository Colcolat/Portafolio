import { useId } from 'react';
import './PianoRoom.css';

const repertoire = [
  { composer: 'Chopin', title: 'Nocturne Op. 72 No. 1 in E minor' },
  { composer: 'Liszt', title: 'Liebestraum No. 3 (Love Dream)' },
  { composer: 'Liszt', title: 'Hungarian Rhapsody No. 2' },
  { composer: 'Beethoven', title: 'Moonlight Sonata (1st Movement)' },
  { composer: 'Debussy', title: 'Clair de Lune' },
  { composer: 'Chopin', title: 'Nocturne in E Flat Major (Op. 9 No. 2)' },
];

function PianoScene() {
  const id = useId().replace(/:/g, '');
  return <svg className="piano-room__scene" viewBox="0 0 900 740" aria-hidden="true" focusable="false">
    <defs>
      <linearGradient id={`${id}-lacquer`} x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#48443d" /><stop offset=".4" stopColor="#252522" /><stop offset="1" stopColor="#101311" />
      </linearGradient>
      <linearGradient id={`${id}-lid`} x1="0" y1="0" x2="1" y2=".9">
        <stop offset="0" stopColor="#575047" /><stop offset=".4" stopColor="#262a27" /><stop offset="1" stopColor="#151916" />
      </linearGradient>
      <linearGradient id={`${id}-jacket`} x1="0" y1="0" x2="1" y2=".3">
        <stop offset="0" stopColor="#42443d" /><stop offset="1" stopColor="#20251f" />
      </linearGradient>
      <radialGradient id={`${id}-halo`}>
        <stop offset="0" stopColor="#e5d7b7" stopOpacity=".48" /><stop offset="1" stopColor="#faf9f5" stopOpacity="0" />
      </radialGradient>
      <radialGradient id={`${id}-floor`}>
        <stop offset="0" stopColor="#47483e" stopOpacity=".16" /><stop offset="1" stopColor="#47483e" stopOpacity="0" />
      </radialGradient>
    </defs>
    <ellipse className="piano-room__stage-light" cx="595" cy="338" rx="380" ry="334" fill={`url(#${id}-halo)`} />
    <path d="M421 0 299 635H650L715 0Z" fill="#fff" opacity=".36" />
    <path d="M623 0 784 635H884L780 0Z" fill="#fff" opacity=".38" />
    <ellipse cx="514" cy="650" rx="380" ry="50" fill={`url(#${id}-floor)`} />
    <path d="M148 651H875" stroke="#beb39e" strokeWidth=".8" opacity=".5" />
    <g className="piano-room__instrument">
      <path d="m429 457-11 180h17l27-176zm355-17 5 186h15l4-190z" fill="#252824" />
      <path d="m541 461 9 104 49 25 4-7-39-27-1-95" fill="#34362e" />
      <path d="m551 576-6 13 41 6 5-6zm17-2-2 14 43 6 4-6" fill="#9d8960" />
      <path d="M381 373c91-25 166-36 243-34 114 1 186 6 214 24 17 12 15 41-1 68-43 38-219 61-366 41l-90-39Z" fill={`url(#${id}-lacquer)`} />
      <path d="M386 377c128-37 346-51 450-14-124 23-281 47-450 34Z" fill="#766850" />
      <path d="M420 377c134-22 259-29 370-10" fill="none" stroke="#b09a6f" strokeWidth="2" opacity=".7" />
      <path d="m392 348 356-190c33 18 69 80 92 194-140 11-294 14-448-4Z" fill={`url(#${id}-lid)`} />
      <path d="m392 348 356-190c34 18 70 81 92 194" fill="none" stroke="#80735d" strokeWidth="2.5" />
      <path d="m408 346 336-176" stroke="#b4a387" strokeWidth=".8" opacity=".5" />
      <path d="m643 384 52-189" fill="none" stroke="#242820" strokeWidth="6" />
      <path d="m646 379 49-180" fill="none" stroke="#8d7c5c" strokeWidth="1.2" />
      <path d="M345 403c43 0 90 6 138 18l11 27-149-16Z" fill="#171d18" />
      <path d="m348 411 128 14 10 16-138-13Z" fill="#eae7db" />
      {Array.from({ length: 19 }, (_, index) => <path key={index} d={`m${354 + index * 6.6} ${411.5 + index * .74} 2 16`} stroke="#5d5d53" strokeWidth=".7" />)}
      {[0, 1, 3, 4, 5, 7, 8, 10, 11, 12, 14, 15, 17].map(index => <path key={index} d={`m${357 + index * 6.6} ${412 + index * .72} 2 8.4 3.5 .5-1.8-8.5Z`} fill="#20241e" />)}
      <path d="m342 432 151 15 1 9-152-16Z" fill="#2b3029" />
      <path d="M492 447c138 15 270-1 345-30" fill="none" stroke="#97835d" strokeWidth="1.4" />
      <path d="m422 637 12 1v8h-15zm365-12h17v8h-17z" fill="#8d7b56" />
      <path d="M522 393c68 2 150-2 196-9" stroke="#ede4d1" strokeWidth=".8" opacity=".22" />
    </g>
    <g className="piano-room__bench">
      <path d="m210 500-7 132h11l18-130zm99 2 10 125h11l-5-125z" fill="#2d3028" />
      <path d="M197 486q58-15 133 1v21q-67-9-132 1Z" fill="#22281f" />
      <path d="M200 486q67-12 129 2" stroke="#666654" strokeWidth="2" fill="none" />
    </g>
    <g className="piano-room__pianist-legs" fill="#292e26">
      <path d="M239 441c28-4 63 9 86 32 13 13 13 49 17 70l10 41-14 8-32-61-25-28-46-17Z" />
      <path d="M222 450c25 0 42 21 48 45l16 90-17 7-27-71-24-40Z" />
      <path d="m265 584 21-3 12 18 21 13c5 6 2 10-7 11l-41-8-10-15Z" fill="#20251e" />
      <path d="m335 583 19-5 14 19 24 9c8 5 7 10-3 13l-43-3-18-15Z" fill="#20251e" />
      <path d="m279 478 27 26 24 59" stroke="#525447" strokeWidth="1.2" fill="none" />
    </g>
    <g className="piano-room__pianist-body">
      <path d="m262 305-4 27 22 17 15-14-17-36Z" fill="#757164" />
      <path d="M230 332c12-10 27-12 35-5l18 7c13 17 14 44 10 67l-8 42 13 20c-29 15-61 10-84-2 3-34-11-90 16-129Z" fill={`url(#${id}-jacket)`} />
      <path d="m263 329 14 11 4 32-16-28Z" fill="#d8d2c2" />
      <path d="m251 326 7 27 9 9-6 52" fill="none" stroke="#696959" strokeWidth="1.2" />
      <path d="M250 263c-15 4-17 24-9 37 5 10 17 20 28 17 7-2 14-11 15-22l8-5-7-8c-1-16-18-27-35-19Z" fill="#747163" />
      <path d="M240 290c-9-13-7-27 2-33 15-11 39-9 45 7 3 7 0 14-3 19l-6-8c-5 5-13-2-18 2-8 3-4 15-9 16Z" fill="#292e25" />
      <path d="m279 296-5 7" stroke="#414739" strokeWidth="1.5" />
      <g className="piano-room__arm piano-room__arm--far">
        <path d="M278 341c17 2 25 14 38 29l37 27-8 14-51-23c-16-12-28-25-29-39Z" fill="#30362b" />
        <path d="m344 397 12 3 13 10 26 2 4 5-20 2-17-3-18-6Z" fill="#85806e" />
        <path d="m374 412 22 5m-24-3 19 5" stroke="#514f42" strokeWidth=".8" />
      </g>
      <g className="piano-room__arm piano-room__arm--near">
        <path d="M244 348c16 3 20 18 24 30l10 22 64 17-5 16c-26-2-61-8-80-18-15-21-30-55-13-67Z" fill={`url(#${id}-jacket)`} />
        <path d="m337 416 13 5 17-1 25 7-1 4-22-3-15 5-18-2Z" fill="#aaa18a" />
        <path d="m369 424 22 5m-24-2 18 5m-20-3 15 5" stroke="#696151" strokeWidth=".9" />
        <path d="m264 404 61 19" fill="none" stroke="#6f705b" strokeWidth="1.1" />
      </g>
    </g>
    <g className="piano-room__dust" fill="#a88b50">
      <circle cx="540" cy="160" r="1.2" /><circle cx="803" cy="286" r="1" />
      <circle cx="365" cy="235" r="1" /><circle cx="686" cy="109" r="1.3" />
      <circle cx="574" cy="295" r=".8" /><circle cx="813" cy="531" r="1.1" />
    </g>
  </svg>;
}

function PlaybackIcon({ playing }) {
  return <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true" focusable="false">
    {playing ? <path d="M4 3h3v10H4zm5 0h3v10H9z" /> : <path d="m5 2 9 6-9 6z" />}
  </svg>;
}

export default function PianoRoom({ t, onReturn, sound, onToggleSound, audioStatus = 'idle', onTogglePlayback, active = true }) {
  const playing = audioStatus === 'playing' || audioStatus === 'loading';
  const loading = audioStatus === 'loading';
  const statuses = {
    idle: 'Ready when you are.',
    loading: 'The melody is loading…',
    playing: 'Let the music stay a little longer.',
    paused: 'A moment of silence.',
    blocked: 'Press play to begin the melody.',
    error: 'The recording could not load. You can try playing it again.',
    muted: 'Sound is off. The room is still yours.',
  };
  const status = !sound && !['error', 'loading', 'blocked'].includes(audioStatus)
    ? statuses.muted : statuses[audioStatus] || statuses.idle;

  return <section id="piano-room" className={`piano-room${active ? ' is-active' : ''}`} aria-labelledby="piano-room-title">
    <div className="piano-room__inner">
      <header className="piano-room__masthead">
        <span className="piano-room__signature"><span aria-hidden="true">♮</span>{t('A piece of my soul')}</span>
        <button type="button" className="piano-room__return" onClick={onReturn}><span aria-hidden="true">↖</span>{t('Return to the little screen')}</button>
      </header>

      <div className="piano-room__hero">
        <PianoScene />
        <div className="piano-room__invitation">
          <p className="piano-room__eyebrow"><span aria-hidden="true" />{t('An intimate recital')}</p>
          <h2 id="piano-room-title" tabIndex={-1}>{t('I dedicate my favourite melody to you.')}</h2>
          <p className="piano-room__dedication">{t('Some things are easier to say with music.')}</p>
          <span className="piano-room__flourish" aria-hidden="true">𝄞</span>
        </div>
        <p className="piano-room__scene-caption"><span aria-hidden="true">01 — </span>{t('For you, wherever you are.')}</p>
      </div>

      <div className="piano-room__player" role="group" aria-label={t('Piano music controls')}>
        <div className={`piano-room__equalizer${playing && sound ? ' is-playing' : ''}`} aria-hidden="true"><i /><i /><i /><i /><i /></div>
        <div className="piano-room__track">
          <span className="piano-room__eyebrow">{t('Now playing')}</span>
          <strong>Chopin — Nocturne Op. 72 No. 1 in E minor</strong>
          <span className="piano-room__track-note">{t('A favourite piece from my repertoire.')}</span>
        </div>
        <div className="piano-room__audio-buttons">
          <button type="button" className="piano-room__play" onClick={onTogglePlayback} disabled={!sound} aria-label={t(playing ? 'Pause melody' : 'Play melody')}>
            <PlaybackIcon playing={playing} /><span>{t(loading ? 'Loading' : playing ? 'Pause' : 'Play')}</span>
          </button>
          <button type="button" className="piano-room__sound" onClick={onToggleSound} aria-pressed={!sound} aria-label={t(sound ? 'Mute piano music' : 'Unmute piano music')}>
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.3" aria-hidden="true" focusable="false"><path d="M8 4 4 7H2v4h2l4 3Z" />{sound ? <><path d="M11 6c2 1 2 5 0 6M13 3c4 3 4 9 0 12" /></> : <path d="m11 6 5 6m0-6-5 6" />}</svg>
          </button>
        </div>
        <p className="piano-room__audio-status" role="status" aria-live="polite">{t(status)}</p>
      </div>

      <div className="piano-room__programme">
        <section className="piano-room__story" aria-labelledby="piano-room-story-title">
          <p className="piano-room__eyebrow">{t('Behind the melody')}</p>
          <h3 id="piano-room-story-title">{t('It began when I was five.')}</h3>
          <p>{t('I have played the piano since I was five and have taken part in concerts.')}</p>
          <p>{t('My piano teacher was')} <strong>Irina Decheva</strong>.</p>
          <div className="piano-room__story-note"><span aria-hidden="true">♪</span><span>{t('This is another part of me. Thank you for finding it.')}</span></div>
        </section>
        <section className="piano-room__repertoire" aria-labelledby="piano-room-repertoire-title">
          <div className="piano-room__repertoire-heading"><h3 id="piano-room-repertoire-title">{t('Pieces I love to play')}</h3><span aria-hidden="true">I — VI</span></div>
          <ol>
            {repertoire.map(({ composer, title }, index) => <li key={title}>
              <span className="piano-room__piece-number" aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
              <div><span className="piano-room__composer">{composer}</span><h4>{title}</h4></div>
              {index === 0 && <span className="piano-room__piece-star" aria-label={t('My favourite melody')}>✧</span>}
            </li>)}
          </ol>
        </section>
      </div>

      <footer className="piano-room__footer"><span>{t('A hidden room. An open heart.')}</span><span aria-hidden="true">fin.</span><button type="button" onClick={onReturn}>{t('Back to the portfolio')}<span aria-hidden="true">↗</span></button></footer>
    </div>
  </section>;
}
