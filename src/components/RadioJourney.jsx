import { useCallback, useEffect, useRef, useState } from 'react';
import PianoRoom from './PianoRoom';
import { getRadioJourneyState } from '../hooks/radioJourney';
import './RadioJourney.css';

const particles = Array.from({ length: 26 }, (_, i) => ({
  left: `${(i * 37 + 11) % 100}%`, delay: `${-(i * 1.73)}s`, duration: `${9 + i % 7}s`, size: `${i % 4 === 0 ? 3 : 2}px`,
}));

export default function RadioJourney({ t, sound, onToggleSound, audioStatus, onTogglePlayback, onClose, onSceneChange, onMixChange, onPortfolioHidden, portfolioRef, startScroll }) {
  const journeyRef = useRef(null);
  const roomRef = useRef(null);
  const ticketTitleRef = useRef(null);
  const passageControlsRef = useRef(null);
  const [ticketHidden, setTicketHidden] = useState(false);
  const [scene, setScene] = useState('radio');
  const [tabHidden, setTabHidden] = useState(document.hidden);
  const sceneRef = useRef('radio');
  const statusText = { idle: 'Ready to listen', loading: 'Tuning in…', playing: 'Now playing', paused: 'Music paused', muted: 'Sound is off', blocked: 'Press play to begin the music.', error: 'The recording could not load. You can try again.' }[audioStatus];
  const playing = audioStatus === 'playing' || audioStatus === 'loading';

  useEffect(() => {
    const escape = event => { if (event.key === 'Escape' && !event.repeat) { event.preventDefault(); onClose(); } };
    const visibility = () => setTabHidden(document.hidden);
    window.addEventListener('keydown', escape);
    document.addEventListener('visibilitychange', visibility);
    return () => {
      window.removeEventListener('keydown', escape);
      document.removeEventListener('visibilitychange', visibility);
    };
  }, [onClose]);

  useEffect(() => {
    // Focus after React has removed inert from the incoming scene, not inside
    // the scroll callback before that scene has committed.
    const frame = requestAnimationFrame(() => {
      const target = scene === 'piano' ? roomRef.current?.querySelector('h2')
        : ticketHidden ? passageControlsRef.current : ticketTitleRef.current;
      target?.focus({ preventScroll: true });
    });
    return () => cancelAnimationFrame(frame);
  }, [scene, ticketHidden]);

  useEffect(() => {
    let frame = 0;
    let hidden = false;
    let cardHidden = false;
    const surface = portfolioRef.current;
    const update = () => {
      frame = 0;
      if (!roomRef.current || !journeyRef.current) return;
      const roomTop = roomRef.current.getBoundingClientRect().top + window.scrollY;
      const state = getRadioJourneyState({ scrollY: window.scrollY, startY: startScroll, roomTop, viewportHeight: window.innerHeight, previousScene: sceneRef.current });
      const style = journeyRef.current.style;
      style.setProperty('--room-reveal', state.reveal);
      style.setProperty('--ticket-opacity', state.ticketOpacity);
      style.setProperty('--daylight', state.daylight);
      style.setProperty('--dawn-strength', state.dawn);
      style.setProperty('--pulse-energy', state.pulse);
      journeyRef.current.dataset.daylight = state.daylight > 0.55;
      // Updating both scene gains before switching tracks prevents volume spikes.
      onMixChange({ radio: state.radioGain, piano: state.pianoGain });
      if (surface) surface.style.opacity = state.opacity;
      if (state.hidden !== hidden) { hidden = state.hidden; onPortfolioHidden(hidden); }
      if ((state.ticketOpacity <= 0.025) !== cardHidden) { cardHidden = state.ticketOpacity <= 0.025; setTicketHidden(cardHidden); }
      if (state.scene !== sceneRef.current) {
        sceneRef.current = state.scene;
        setScene(state.scene);
        onSceneChange(state.scene);
      }
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(update); };
    const observer = new ResizeObserver(schedule);
    if (surface) observer.observe(surface);
    observer.observe(roomRef.current);
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    update();
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      if (surface) surface.style.removeProperty('opacity');
    };
  }, [onPortfolioHidden, onSceneChange, onMixChange, portfolioRef, startScroll]);

  const enterRoom = useCallback(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    roomRef.current?.scrollIntoView({ behavior: reduce ? 'instant' : 'smooth', block: 'start' });
  }, []);

  return <div className="radio-journey" ref={journeyRef} data-scene={scene} data-paused={tabHidden} data-ticket-hidden={ticketHidden}>
    <div className="radio-atmosphere" aria-hidden="true">
      <div className="radio-night" />
      <div className="radio-pixel-dusk" />
      <div className="radio-horizon"><div className="radio-wave" /><div className="radio-wave radio-wave-second" /></div>
      <div className="radio-dust">{particles.map((particle, i) => <i key={i} style={{ '--left': particle.left, '--delay': particle.delay, '--duration': particle.duration, '--size': particle.size }} />)}</div>
      <div className="radio-daylight" />
      <div className="radio-whiteout" />
    </div>
    <aside className="radio-ticket" aria-labelledby="radio-ticket-title" inert={ticketHidden || scene === 'piano' ? '' : undefined} aria-hidden={ticketHidden || scene === 'piano' || undefined}>
      <span className="radio-ticket-label"><span className="radio-frequency" aria-hidden="true"><i /><i /><i /><i /></span>{t('A FREQUENCY JUST FOR YOU')}</span>
      <h2 id="radio-ticket-title" ref={ticketTitleRef} tabIndex={-1}>{t('Pocket radio')}</h2>
      <p className="radio-composer">BEETHOVEN <span>—</span> MOONLIGHT</p>
      <p className="radio-personal-note">{t('One of the pieces I play on the piano.')}</p>
      <p className="radio-soul-note">{t('Below, you’ll find a piece of my soul.')}</p>
      <button className="radio-enter" type="button" onClick={enterRoom}>{t('Follow the light')} <span aria-hidden="true">↓</span></button>
      <div className="radio-transport">
        <button type="button" onClick={onTogglePlayback} disabled={!sound} aria-label={t(playing ? 'Pause music' : 'Play music')}><span aria-hidden="true">{playing ? 'Ⅱ' : '▷'}</span>{t(playing ? 'Pause' : 'Play')}</button>
        <button type="button" onClick={onToggleSound} aria-pressed={sound}>{t(sound ? 'Mute sound' : 'Enable sound')}</button>
      </div>
      <p className="radio-status" role="status">{t(statusText)}</p>
      <button type="button" className="radio-return" onClick={onClose}>← {t('Back to the pocket world')}</button>
    </aside>
    {ticketHidden && scene !== 'piano' && <div className="radio-passage-controls" role="group" aria-label={t('Journey controls')} ref={passageControlsRef} tabIndex={-1}>
      <button type="button" onClick={onClose}>← {t('Back to the pocket world')}</button>
      <button type="button" onClick={onTogglePlayback} disabled={!sound} aria-label={t(playing ? 'Pause music' : 'Play music')}>{playing ? 'Ⅱ' : '▷'}</button>
      <button type="button" onClick={onToggleSound} aria-pressed={sound}>{t(sound ? 'Mute sound' : 'Enable sound')}</button>
      <button type="button" onClick={enterRoom} aria-label={t('Follow the light')}>↓</button>
    </div>}
    <div className="radio-threshold" aria-hidden="true"><span>{t('A little further, a little closer.')}</span><i>↓</i></div>
    <div className="piano-arrival" ref={roomRef} inert={scene !== 'piano' ? '' : undefined} aria-hidden={scene !== 'piano' || undefined}>
      <PianoRoom t={t} onReturn={onClose} sound={sound} onToggleSound={onToggleSound} audioStatus={audioStatus} onTogglePlayback={onTogglePlayback} active={scene === 'piano' && !tabHidden} />
    </div>
  </div>;
}
