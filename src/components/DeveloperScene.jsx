import { useEffect, useRef, useState } from 'react';
import { profile } from '../data/portfolio';
import { developerRoomScene } from '../data/developerRoom';
import './DeveloperScene.css';

const dust = Array.from({ length: 28 }, (_, i) => ({
  left: `${29 + (i * 19 % 68)}%`, top: `${i * 17 % 91}%`,
  '--drift': `${-24 - (i * 13 % 58)}px`,
  '--fall-time': `${10 + i % 9}s`, '--fall-delay': `${-i * 1.37}s`,
}));
const statusText = {
  idle: 'Ready to listen', loading: 'Tuning in…', playing: 'Now playing',
  paused: 'Music paused', muted: 'Sound is off',
  blocked: 'Press play to begin the music.',
  error: 'The recording could not load. You can try again.',
};

export default function DeveloperScene({ t, theme = 'light', sound, audioStatus, onToggleTheme, onToggleSound, onTogglePlayback, onClose }) {
  const dialogRef = useRef(null);
  const titleRef = useRef(null);
  const artwork = developerRoomScene(theme, import.meta.env.BASE_URL);
  const [imageResult, setImageResult] = useState(null);
  const imageState = imageResult?.theme === artwork.theme ? imageResult.status : 'loading';
  const [effects, setEffects] = useState(true);
  const [hidden, setHidden] = useState(false);
  const playing = sound && ['playing', 'loading'].includes(audioStatus);

  useEffect(() => {
    const dialog = dialogRef.current;
    const previousFocus = document.activeElement;
    const overflow = document.body.style.overflow;
    dialog.showModal();
    document.body.style.overflow = 'hidden';
    titleRef.current?.focus();
    const visibility = () => setHidden(document.hidden);
    visibility();
    document.addEventListener('visibilitychange', visibility);
    return () => {
      document.removeEventListener('visibilitychange', visibility);
      dialog.close();
      document.body.style.overflow = overflow;
      queueMicrotask(() => {
        const target = previousFocus?.isConnected && !previousFocus.closest('[inert]') && previousFocus !== document.body
          ? previousFocus : document.getElementById('secrets-found');
        target?.focus({ preventScroll: true });
      });
    };
  }, []);

  return <dialog ref={dialogRef} className="developer-scene" aria-labelledby="developer-scene-title"
    aria-describedby="developer-scene-welcome" data-effects={effects && !hidden} data-room-theme={artwork.theme}
    onCancel={event => { event.preventDefault(); onClose(); }}>
    <div className="developer-scene__shell">
      <header className="developer-scene__header">
        <div><p className="developer-scene__eyebrow">{t('SECRET FOUND')} / 01</p>
          <h2 ref={titleRef} id="developer-scene-title" tabIndex={-1}>{t('The developer room')}</h2></div>
        <div className="developer-scene__navigation">
          <button type="button" className="developer-scene__theme" onClick={onToggleTheme} aria-pressed={artwork.theme === 'dark'}
            aria-label={t(artwork.theme === 'dark' ? 'Enable light mode' : 'Enable dark mode')} title={t(artwork.theme === 'dark' ? 'Enable light mode' : 'Enable dark mode')}>
            <span aria-hidden="true">{artwork.theme === 'dark' ? '☾' : '☼'}</span>
          </button>
          <button type="button" className="developer-scene__exit" onClick={onClose}>
            <span aria-hidden="true">↖</span> {t('Back to the pocket world')} <kbd>ESC</kbd>
          </button>
        </div>
      </header>

      <figure className="developer-scene__view" data-image={imageState}>
        <div className="developer-scene__picture">
          <img key={artwork.theme} src={artwork.src} width={artwork.width} height={artwork.height}
            alt={t('My desk in pixel art: a white computer tower, monitor, keyboard, microphone and headphones beside the window blinds.')}
            onLoad={() => setImageResult({ theme: artwork.theme, status: 'ready' })} onError={() => setImageResult({ theme: artwork.theme, status: 'error' })} />
          {imageState !== 'ready' && <p className="developer-scene__image-status" role="status">
            {t(imageState === 'loading' ? 'Entering the room…' : 'The room image could not load. You can still listen to the music.')}
          </p>}
          <div className="developer-scene__light" data-light={artwork.light} aria-hidden="true" />
          <div className="developer-scene__dust" aria-hidden="true">{dust.map((style, i) => <i key={i} style={style} />)}</div>
          <div className="developer-scene__crt" aria-hidden="true" />
        </div>
        <figcaption><span>{t('PLAYER 01 / WORKSPACE')}</span><span>{t(artwork.caption)}</span></figcaption>
      </figure>

      <footer className="developer-scene__footer">
        <div className="developer-scene__story">
          <p id="developer-scene-welcome">{t('You found the room behind the pixels.')}</p>
          <details><summary>{t('Meet the person behind the desk')}</summary>
            <div className="developer-scene__biography"><strong>{profile.name}</strong><span>{t(profile.role)}</span>
              <blockquote>“{t(profile.quote)}”</blockquote><span>C# / .NET / PostgreSQL</span>
            </div>
          </details>
        </div>
        <div className="developer-scene__player">
          <p className="developer-scene__track"><span aria-hidden="true">♫</span> Title Screen <span> / Please, don’t touch anything OST</span></p>
          <div className="developer-scene__controls" role="group" aria-label={t('Room controls')}>
            <button type="button" onClick={onTogglePlayback} disabled={!sound}
              aria-label={t(playing ? 'Pause music' : 'Play music')}><span aria-hidden="true">{playing ? 'Ⅱ' : '▷'}</span> {t(playing ? 'Pause' : 'Play')}</button>
            <button type="button" onClick={onToggleSound} aria-pressed={sound}>{t(sound ? 'Mute sound' : 'Enable sound')}</button>
            <button type="button" onClick={() => setEffects(value => !value)} aria-pressed={effects}>{t(effects ? 'Pause room effects' : 'Resume room effects')}</button>
          </div>
          <p className="developer-scene__audio-status" role="status">{t(statusText[audioStatus] || statusText.idle)}</p>
        </div>
      </footer>
    </div>
  </dialog>;
}
