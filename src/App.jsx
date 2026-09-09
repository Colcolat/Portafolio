import { lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react';
import { profile, projects, certificates, skillGroups } from './data/portfolio';
import PixelArt from './components/PixelArt';
import useByteGame from './hooks/useByteGame';
import usePreferences from './hooks/usePreferences';
import { useConsoleTilt } from './hooks/useConsoleTilt';
import { translate } from './data/translations';
import useSecrets from './hooks/useSecrets';
import { createKonamiMatcher, keyboardKonamiToken, isSecretInputBlocked } from './hooks/konamiCode';
import { secretCatalog } from './data/secrets';
import SecretsDialog from './components/SecretsDialog';
import { DeveloperRoomArt } from './components/DeveloperRoom';

// Keep the working CSS console if the optional 3D chunk cannot be loaded.
const ConsoleModel = lazy(() => import('./components/ConsoleModel').catch(() => ({ default: () => null })));

const sections = [
  { id: 'projects', label: 'Selected work', icon: 'vault' },
  { id: 'about', label: 'Meet the maker', icon: 'smile' },
  { id: 'skills', label: 'My toolkit', icon: 'tools' },
  { id: 'certificates', label: 'Collected badges', icon: 'badge' },
  { id: 'contact', label: 'Say hello', icon: 'mail' },
  { id: 'gallery', label: 'Activity gallery', icon: 'sprout' },
  { id: 'game', label: 'A little side quest', icon: 'bolt' },
];
const projectIcons = ['vault', 'bolt', 'console'];
const wrap = (number, length) => (number + length) % length;
const pad = (number) => String(number).padStart(2, '0');

function Icon({ name, size = 20, ...props }) {
  const paths = {
    arrow: <path d="M5 19 19 5M5 5h14v14" />,
    close: <path d="m6 6 12 12M6 18 18 6" />,
    sound: <><path d="m11 5-6 4H2v6h3l6 4V5Z" /><path d="M15 8a6 6 0 0 1 0 8m3-11a10 10 0 0 1 0 14" /></>,
    mute: <><path d="m11 5-6 4H2v6h3l6 4V5Z" /><path d="m16 9 6 6m-6 0 6-6" /></>,
    game: <><path d="M6 7h12c3 0 4 10 3 12s-3 0-5-3H8c-2 3-4 5-5 3S3 7 6 7Z" /><path d="M8 9v6m-3-3h6m5-1h.01m2 3h.01" /></>,
    download: <><path d="M12 3v12m-5-5 5 5 5-5M4 17v4h16v-4" /></>,
    plus: <path d="M12 4v16M4 12h16" />,
    moon: <path d="M20.5 13A8.5 8.5 0 0 1 11 3.5 8.5 8.5 0 1 0 20.5 13Z" />,
    sun: <><circle cx="12" cy="12" r="4" /><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5" /></>,
    book: <><path d="M12 5v15M3 3l9 2 9-2v15l-9 2-9-2V3Z" /></>,
  };
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>{paths[name] || paths.arrow}</svg>;
}

function ExternalLink({ href, children, className = '' }) {
  return <a className={`text-link ${className}`} href={href} target="_blank" rel="noreferrer">{children}<Icon name="arrow" size={15} /></a>;
}

function ContactPane({ t }) {
  const [copied, setCopied] = useState(false);
  const [copyFailed, setCopyFailed] = useState(false);
  const copyEmail = async () => {
    try { await navigator.clipboard.writeText(profile.email); setCopied(true); setCopyFailed(false); }
    catch { setCopyFailed(true); }
  };
  const send = (event) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const subject = encodeURIComponent(t('Portfolio enquiry from {name}', { name: data.get('name') }));
    const body = encodeURIComponent(`${data.get('message')}\n\n${t('From: {name}', { name: data.get('name') })}\n${t('Email: {email}', { email: data.get('email') })}`);
    window.location.href = `mailto:${profile.email}?subject=${subject}&body=${body}`;
  };
  return <div className="contact-pane">
    <p className="reader-intro">{t("Have something in mind?")}<br />{t("Let’s build it together.")}</p>
    <div className="email-line"><a href={`mailto:${profile.email}`}>{profile.email}</a><button className="small-button" onClick={copyEmail}>{t(copied ? 'Copied ✓' : 'Copy')}</button></div>
    <p className={copyFailed ? 'copy-feedback' : 'sr-only'} role="status">{t(copied ? 'Email address copied.' : copyFailed ? 'Copy unavailable. Select the email address to copy it.' : '')}</p>
    <form className="contact-form" onSubmit={send}>
      <label>{t("Your name")}<input name="name" required autoComplete="name" placeholder={t("How should I call you?")} /></label>
      <label>{t("Your email")}<input name="email" type="email" required autoComplete="email" placeholder={t("you@example.com")} /></label>
      <label className="form-message">{t("Your message")}<textarea name="message" required rows={4} placeholder={t("An idea, a question, or just a hello…")} /></label>
      <button className="solid-button" type="submit">{t("Write a message")} <Icon name="arrow" size={16} /></button>
      <span className="form-note">{t("Opens a draft in your email app.")}</span>
    </form>
    <div className="reader-links"><ExternalLink href={profile.github}>GitHub</ExternalLink><ExternalLink href={profile.linkedin}>LinkedIn</ExternalLink></div>
  </div>;
}

function GalleryPane({ t }) {
  const [items, setItems] = useState([]);
  const [status, setStatus] = useState('loading');
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      const url = import.meta.env.VITE_SUPABASE_URL;
      const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
      if (!url || !key) { setStatus('empty'); return; }
      try {
        const { createClient } = await import('@supabase/supabase-js');
        const { data, error } = await createClient(url, key).from('gallery').select('*').order('date', { ascending: false });
        if (error) throw error;
        if (!cancelled) { setItems(data || []); setStatus(data?.length ? 'ready' : 'empty'); }
      } catch { if (!cancelled) setStatus('unavailable'); }
    };
    load();
    return () => { cancelled = true; };
  }, []);
  return status === 'ready' ? <div className="gallery-grid">{items.map(item => <article key={item.id}>
    {(item.media_urls?.length ? item.media_urls : [item.media_url || item.src]).filter(Boolean).map((src, i) => item.type === 'video' || /\.(mp4|webm|ogg)$/i.test(src) ? <video key={src} controls preload="metadata" src={src} aria-label={`${item.title} ${i + 1}`} /> : <img key={src} loading="lazy" src={src} alt={`${item.title} ${i + 1}`} />)}
    <span className="eyebrow">{item.date}</span><h3>{item.title}</h3><p>{item.description}</p>
  </article>)}</div> : <div className="empty-gallery"><PixelArt name="sprout" /><h3>{t(status === 'loading' ? 'Loading the little moments…' : status === 'unavailable' ? 'The gallery is taking a break.' : 'A little room for what’s next.')}</h3><p>{t(status === 'loading' ? 'One moment.' : status === 'unavailable' ? 'Please try visiting again later.' : 'No activities to show just yet.')}</p></div>;
}

function Reader({ reader, setReader, onClose, t }) {
  const dialogRef = useRef(null);
  const returnFocusRef = useRef(document.activeElement);
  const { section, index = 0 } = reader;
  const project = projects[wrap(index, projects.length)];
  const certificate = certificates[wrap(index, certificates.length)];
  useEffect(() => {
    const focused = returnFocusRef.current;
    const previous = document.body.style.overflow;
    const dialog = dialogRef.current;
    dialog.showModal();
    document.body.style.overflow = 'hidden';
    return () => {
      dialog.close();
      document.body.style.overflow = previous;
      queueMicrotask(() => { if (focused?.isConnected) focused.focus(); });
    };
  }, []);
  const tabNames = { about: 'The maker', projects: 'Work', certificates: 'Badges', skills: 'Toolkit', contact: 'Contact', gallery: 'Gallery' };
  return <dialog className="reader" ref={dialogRef} aria-labelledby="reader-title" onCancel={(event) => { event.preventDefault(); onClose(); }} onClick={(event) => { if (event.target === event.currentTarget) onClose(); }}>
    <div className="reader-shell">
      <header className="reader-header"><span className="eyebrow">{t('POCKET ARCHIVE')} / {t(tabNames[section]).toUpperCase()}</span><button className="close-reader" aria-label={t("Close portfolio")} onClick={onClose}><span>{t("BACK TO PLAY")}</span><Icon name="close" /></button></header>
      <nav className="reader-tabs" aria-label={t("Portfolio sections")}>{Object.entries(tabNames).map(([id, name]) => <button key={id} className={section === id ? 'selected' : ''} aria-current={section === id ? 'page' : undefined} onClick={() => setReader({ section: id, index: 0 })} >{t(name)}{id === 'projects' && <sup>{pad(projects.length)}</sup>}{id === 'certificates' && <sup>{pad(certificates.length)}</sup>}</button>)}</nav>
      <div className="reader-content">
        <h2 id="reader-title" className="reader-title">{t({about: 'A little about me.', projects: 'Things I’ve built.', certificates: 'Always a student.', skills: 'Tools of the trade.', contact: 'Good things start with hello.', gallery: 'Life, in little frames.'}[section])}</h2>
        {section === 'about' && <div className="about-pane"><div className="maker-stamp"><PixelArt name="smile" /><span>{t("PLAYER 01")}</span></div><div><span className="eyebrow">{t(profile.role)}</span><h3>{profile.name}</h3><p>{t(profile.summary)}</p><p>{t(profile.about)}</p><blockquote>“{t(profile.quote)}”</blockquote><div className="reader-links"><a className="solid-button" href={profile.cvEn} download>{t("CV in English")} <Icon name="download" size={16} /></a><a className="outline-button" href={profile.cvEs} download>CV en español <Icon name="download" size={16} /></a></div><div className="reader-links"><ExternalLink href={profile.github}>GitHub</ExternalLink><ExternalLink href={profile.linkedin}>LinkedIn</ExternalLink></div></div></div>}
        {section === 'projects' && <><div className="project-picker" aria-label={t("Choose a project")}>{projects.map((item, i) => <button className={i === index ? 'selected' : ''} key={item.id} onClick={() => setReader({ section, index: i })}><span>{pad(i + 1)}</span>{item.title}</button>)}</div><article className="project-detail" key={project.id}><div className="project-image"><img src={project.image} alt={t('Original screenshot of {title}', { title: project.title })} /></div><div className="project-copy"><span className="eyebrow">{t('SELECTED WORK')} / {pad(index + 1)}</span><h3>{project.title}</h3><p>{t(project.description)}</p><div className="tech-tags">{project.tech.map(tech => <span key={tech}>{tech}</span>)}</div><div className="reader-links"><ExternalLink className="solid-button" href={project.githubLink}>{t("Source code")}</ExternalLink>{project.liveLink && <ExternalLink className="outline-button" href={project.liveLink}>{t(project.liveDemoText || 'Live project')}</ExternalLink>}</div>{project.id === 'portfolio' && <p className="archive-note">{t("From the original portfolio archive. You’re exploring the new pocket edition.")}</p>}</div></article></>}
        {section === 'certificates' && <><label className="certificate-select">{t('EXPLORE ALL {count} CREDENTIALS', { count: certificates.length })}<select value={index} onChange={event => setReader({ section, index: Number(event.target.value) })}>{certificates.map((item, i) => <option key={item.id} value={i}>{pad(i + 1)} — {item.title}</option>)}</select></label><article className="certificate-detail"><div className="certificate-image"><img key={certificate.id} src={certificate.image} alt={t('{title} certificate', { title: certificate.title })} /></div><div><span className="eyebrow">{t('BADGE {number} / {total}', { number: pad(index + 1), total: pad(certificates.length) })}</span><h3>{certificate.title}</h3><p>{certificate.issuer}</p><p className="credential-date">{certificate.date}</p><div className="reader-links">{certificate.link && certificate.link !== '#' && <ExternalLink className="solid-button" href={certificate.link}>{t("Verify credential")}</ExternalLink>}<a className="outline-button" href={certificate.image} download>{t("Download image")} <Icon name="download" size={16} /></a></div></div></article><div className="archive-pagination"><button className="small-button" onClick={() => setReader({section, index: wrap(index - 1, certificates.length)})}>{t("← Previous badge")}</button><span>{pad(index + 1)} / {pad(certificates.length)}</span><button className="small-button" onClick={() => setReader({section, index: wrap(index + 1, certificates.length)})}>{t("Next badge →")}</button></div></>}
        {section === 'skills' && <div className="skill-grid">{skillGroups.map((group, i) => <section key={group.title}><span className="eyebrow">{t('MODULE {number}', { number: pad(i + 1) })}</span><h3>{t(group.title)}</h3><ul>{group.skills.map(skill => <li key={skill}>{t(skill)}</li>)}</ul></section>)}</div>}
        {section === 'contact' && <ContactPane t={t} />}
        {section === 'gallery' && <GalleryPane t={t} />}
      </div>
      <footer className="reader-footer"><span>{profile.name}</span><span>{t("BUILT WITH PURPOSE & LOGIC.")}</span></footer>
    </div>
  </dialog>;
}

export default function App() {
  const [section, setSection] = useState('projects');
  const [selection, setSelection] = useState(0);
  const [index, setIndex] = useState(0);
  const [reader, setReader] = useState(null);
  const [secretsView, setSecretsView] = useState(null);
  const { foundIds, unlock } = useSecrets();
  const codeRef = useRef(null);
  if (!codeRef.current) codeRef.current = createKonamiMatcher();
  const [powered, setPowered] = useState(true);
  const { sound, setSound, language, setLanguage, theme, setTheme } = usePreferences();
  const t = useCallback((text, values) => translate(text, language, values), [language]);
  const [pressed, setPressed] = useState('');
  const pressTimer = useRef(null);
  const audioRef = useRef(null);
  const swipeStart = useRef(null);
  const consoleMotionRef = useRef(null);
  const consoleResetRef = useRef(null);
  useConsoleTilt(consoleMotionRef);
  const game = useByteGame({ enabled: powered && section === 'game' && !reader && !secretsView });
  const { turn: turnSnake, primary: controlSnake } = game;

  useEffect(() => () => { clearTimeout(pressTimer.current); audioRef.current?.close(); }, []);
  const beep = useCallback((frequency = 440) => {
    if (!sound) return;
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      if (!audioRef.current || audioRef.current.state === 'closed') audioRef.current = new AudioContext();
      const context = audioRef.current;
      if (context.state === 'suspended') context.resume().catch(() => {});
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      oscillator.type = 'square'; oscillator.frequency.value = frequency;
      gain.gain.setValueAtTime(0.018, context.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + 0.07);
      oscillator.connect(gain); gain.connect(context.destination);
      oscillator.start(); oscillator.stop(context.currentTime + 0.08);
    } catch { /* Sound is optional. */ }
  }, [sound]);
  const flash = useCallback((button) => {
    setPressed(button); clearTimeout(pressTimer.current);
    pressTimer.current = setTimeout(() => setPressed(''), 130);
  }, []);
  const acceptSecretInput = useCallback(token => {
    if (!powered || reader || secretsView || section === 'game' || section === 'secret') return false;
    if (!codeRef.current.push(token)) return false;
    unlock('developer-room');
    setSection('secret'); setIndex(0);
    consoleResetRef.current?.();
    flash('a'); beep(880);
    return true;
  }, [powered, reader, secretsView, section, unlock, flash, beep]);
  useEffect(() => {
    if (!powered || reader || secretsView || section === 'game' || section === 'secret') codeRef.current.reset();
  }, [powered, reader, secretsView, section]);
  useEffect(() => {
    if (section !== 'secret') return;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    consoleMotionRef.current?.scrollIntoView({ block: 'center', behavior: reduceMotion ? 'instant' : 'smooth' });
  }, [section]);
  useEffect(() => {
    const reset = () => codeRef.current.reset();
    const visibility = () => { if (document.hidden) reset(); };
    window.addEventListener('blur', reset);
    document.addEventListener('visibilitychange', visibility);
    return () => { window.removeEventListener('blur', reset); document.removeEventListener('visibilitychange', visibility); };
  }, []);
  const chooseSection = useCallback((next) => {
    setSection(next); setIndex(0); setPowered(true);
    setSelection(Math.max(0, sections.findIndex(item => item.id === next)));
  }, []);
  const home = useCallback(() => { setSection('menu'); setIndex(0); }, []);
  const direction = useCallback((dir, registerSecret = true) => {
    if (!powered || reader || secretsView) return;
    if (registerSecret && acceptSecretInput(dir)) return;
    flash(dir); beep(320);
    if (section === 'game') { turnSnake(dir); return; }
    const delta = dir === 'left' || dir === 'up' ? -1 : 1;
    if (section === 'menu') { setSelection(value => wrap(value + delta, sections.length)); return; }
    const length = section === 'projects' ? projects.length : section === 'certificates' ? certificates.length : section === 'skills' ? skillGroups.length : 1;
    if (length > 1) setIndex(value => wrap(value + delta, length));
    else home();
  }, [powered, reader, secretsView, acceptSecretInput, section, flash, beep, turnSnake, home]);
  const primary = useCallback(() => {
    if (!powered || reader || secretsView) return;
    if (acceptSecretInput('a')) return;
    flash('a'); beep(660);
    if (section === 'menu') chooseSection(sections[selection].id);
    else if (section === 'game') controlSnake();
    else if (section === 'secret') setSecretsView('room');
    else setReader({ section, index });
  }, [powered, reader, secretsView, acceptSecretInput, flash, beep, section, selection, chooseSection, controlSnake, index]);
  const secondary = useCallback((registerSecret = true) => {
    if (!powered || reader || secretsView) return;
    if (registerSecret && acceptSecretInput('b')) return;
    flash('b'); beep(240); home();
  }, [powered, reader, secretsView, acceptSecretInput, flash, beep, home]);
  const start = useCallback(() => {
    codeRef.current.reset();
    setPowered(true); flash('start'); beep(520); home();
  }, [flash, beep, home]);
  const select = () => {
    codeRef.current.reset();
    if (!powered) return;
    flash('select'); beep(380);
    const next = wrap(sections.findIndex(item => item.id === section) + 1, sections.length);
    chooseSection(sections[next].id);
  };
  useEffect(() => {
    const handleKey = (event) => {
      if (reader || secretsView || isSecretInputBlocked(event)) { codeRef.current.reset(); return; }
      const key = event.key.toLowerCase();
      const token = keyboardKonamiToken(event);
      const arrows = { arrowup: 'up', arrowdown: 'down', arrowleft: 'left', arrowright: 'right' };
      if (arrows[key]) { event.preventDefault(); direction(arrows[key], !event.repeat); }
      else if (key === 'a' || key === 'b') { if (token && acceptSecretInput(token)) event.preventDefault(); }
      else if (key === 'z') { event.preventDefault(); if (!event.repeat) primary(); }
      else if (key === 'x') { event.preventDefault(); if (!event.repeat) secondary(); }
      else if (key === 'escape') { codeRef.current.reset(); event.preventDefault(); if (!event.repeat) secondary(false); }
      else if (key === 'enter' && (!event.target.closest('button, a') || event.target.closest('.handheld'))) { event.preventDefault(); if (!event.repeat) start(); }
      else if (!event.repeat) codeRef.current.reset();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [reader, secretsView, acceptSecretInput, direction, primary, secondary, start]);
  const openReader = (next = 'about', nextIndex = 0) => setReader({ section: next, index: nextIndex });
  const closeReader = useCallback(() => setReader(null), []);
  const selected = sections.find(item => item.id === section);
  const count = section === 'projects' ? projects.length : section === 'certificates' ? certificates.length : section === 'skills' ? skillGroups.length : 1;
  const currentProject = projects[index % projects.length];
  const currentCertificate = certificates[index % certificates.length];
  const currentSkills = skillGroups[index % skillGroups.length];
  const screenTitle = section === 'menu' ? t('YOUR LITTLE WORLD') : section === 'secret' ? t('SECRET ROOM') : section === 'game' ? 'BYTE SNAKE' : t(selected?.label).toUpperCase();
  const announcement = !powered ? t('Console powered off') : section === 'secret' ? t('Secret found: the developer room.') : section === 'menu' ? t('Menu: {section}', { section: t(sections[selection].label) }) : section === 'projects' ? t('Project {number}: {title}', { number: index + 1, title: currentProject.title }) : section === 'certificates' ? t('Certificate {number}: {title}', { number: index + 1, title: currentCertificate.title }) : section === 'skills' ? t(currentSkills.title) : section === 'game' ? t('Byte Snake. {status}. Score {score}', { status: t(game.status), score: game.score }) : t(selected?.label);

  return <div className="portfolio-page">
    <a className="skip-link" href="#full-portfolio" onClick={event => { event.preventDefault(); openReader(); }}>{t("Skip to full portfolio")}</a>
    <header className="site-header">
      <button className="wordmark" onClick={start} aria-label={t("Pocketfolio home")}><span className="wordmark-icon"><i /><b /><em /></span>pocketfolio<span className="wordmark-dot">.</span></button>
      <span className="header-caption eyebrow">{t("AN INTERACTIVE PORTFOLIO")}</span>
      <div className="header-actions">
        <div className="header-preferences" role="group" aria-label={t('Display preferences')}>
          <button className="preference-button sound-toggle" onClick={() => setSound(value => !value)} aria-pressed={sound} aria-label={t(sound ? 'Mute sound' : 'Enable sound')} title={t(sound ? 'Mute sound' : 'Enable sound')}><Icon name={sound ? 'sound' : 'mute'} size={17} /><span>{t(sound ? 'SOUND ON' : 'SOUND OFF')}</span></button>
          <button className="preference-button language-toggle" onClick={() => setLanguage(value => value === 'en' ? 'es' : 'en')} aria-label={t(language === 'en' ? 'Switch to Spanish' : 'Switch to English')} title={t(language === 'en' ? 'Switch to Spanish' : 'Switch to English')}><span lang={language === 'en' ? 'es' : 'en'}>{language === 'en' ? 'ES' : 'EN'}</span></button>
          <button className="preference-button theme-toggle" onClick={() => setTheme(value => value === 'light' ? 'dark' : 'light')} aria-pressed={theme === 'dark'} aria-label={t(theme === 'light' ? 'Enable dark mode' : 'Enable light mode')} title={t(theme === 'light' ? 'Enable dark mode' : 'Enable light mode')}><Icon name={theme === 'light' ? 'moon' : 'sun'} size={18} /></button>
        </div>
        <button className="full-portfolio-link" id="full-portfolio" onClick={() => openReader()}>{t('FULL PORTFOLIO')} <Icon name="arrow" size={14} /></button>
      </div>
    </header>

    <main className="main-layout">
      <section className="introduction" aria-label={t("Introduction")}>
        <div className="edition-label eyebrow"><span className="edition-symbol">01</span> {t("THE POCKET EDITION")}</div>
        <h1>{t("Small screen.")}<br /><em>{t("Big ideas.")}</em></h1>
        <p className="intro-description">{t('A software engineer.')}<br />{' '}{t('A backend builder.')}<br />{t('A little world of things I’ve made.')}</p>
        <div className="maker-name"><span className="maker-rule" /><div><Icon name="plus" size={15} /><button onClick={() => openReader('about')}><strong>JUAN JOSE ZAPATA BUENFIL</strong><span>{t("SOFTWARE & BACKEND DEVELOPMENT")}</span></button></div></div>
        <div className="handwritten">{t("Made to be explored.")}<svg viewBox="0 0 150 62" aria-hidden="true"><path d="M5 8c31 52 103 42 126-1m-19 10 20-13 3 24" /></svg></div>
      </section>

      <section className="console-stage" aria-label={t("Interactive pocket portfolio")}>
        <p className="stage-caption eyebrow"><span /> {t("LESS SCROLL. MORE PLAY.")}</p>
        <div className="console-motion" ref={consoleMotionRef}>
        <Suspense fallback={null}><ConsoleModel hostRef={consoleMotionRef} resetRef={consoleResetRef} powered={powered} pressed={pressed} theme={theme} /></Suspense>
        <div className={`handheld ${!powered ? 'powered-off' : ''}`}>
          <div className="case-seam" /><div className="side-ridges"><i /><i /><i /><i /><i /></div>
          <button className="power-switch" role="switch" aria-checked={powered} aria-label={t("Console power")} onClick={() => { setPowered(value => !value); beep(300); }}><span>OFF</span><i /><span>ON</span><b>◂</b></button>
          <div className="screen-bezel">
            <div className="bezel-heading"><span /><b>{t("DOT MATRIX WITH PERSONALITY")}</b><span /></div>
            <div className="battery-light"><i /><span>{t("BATTERY")}</span></div>
            <div className="lcd-shell">
              <div className={`lcd ${section === 'game' ? 'game-lcd' : ''}`} aria-label={t("Console screen")} onTouchStart={event => { swipeStart.current = { x: event.touches[0].clientX, y: event.touches[0].clientY }; }} onTouchEnd={event => { if (!swipeStart.current) return; const dx = event.changedTouches[0].clientX - swipeStart.current.x; const dy = event.changedTouches[0].clientY - swipeStart.current.y; if (Math.max(Math.abs(dx), Math.abs(dy)) > 25) direction(Math.abs(dx) > Math.abs(dy) ? dx > 0 ? 'right' : 'left' : dy > 0 ? 'down' : 'up'); swipeStart.current = null; }}>
                {powered ? <div className="screen-content" key={section}>
                  <div className="lcd-topline"><span>{screenTitle}</span><span>{section === 'menu' ? '01' : section === 'game' ? pad(game.score) : `${index + 1}/${count}`}</span></div>
                  {section === 'secret' ? <div className="secret-lcd"><span className="secret-unlocked">✦ {t('SECRET UNLOCKED')} ✦</span><DeveloperRoomArt /><h2>{t('The developer room')}</h2><button className="lcd-open" onClick={primary}>{t('A: ENTER THE ROOM')}<span>↗</span></button></div> : <>
                  {section === 'menu' ? <div className="screen-menu">{sections.map((item, i) => <button key={item.id} className={selection === i ? 'active' : ''} aria-current={selection === i ? 'true' : undefined} onMouseEnter={() => setSelection(i)} onClick={() => chooseSection(item.id)}><span>{selection === i ? '▶' : ' '}</span>{t(item.label)}<small>{pad(i + 1)}</small></button>)}</div> : section === 'game' ? <div className="game-area"><svg className="snake-board" viewBox="0 0 120 120" role="img" aria-label={t('Snake board, score {score}', { score: game.score })}><defs><pattern id="game-grid" width="10" height="10" patternUnits="userSpaceOnUse"><path d="M10 0H0v10" fill="none" stroke="currentColor" strokeOpacity=".08" strokeWidth=".5" /></pattern></defs><rect width="120" height="120" fill="url(#game-grid)" />{game.snake.map((cell, i) => <rect key={`${cell.x}-${cell.y}`} x={cell.x * 10 + 1} y={cell.y * 10 + 1} width="8" height="8" fill="currentColor" opacity={i === 0 ? 1 : 0.7} />)}<rect x={game.food.x * 10 + 2} y={game.food.y * 10 + 2} width="6" height="6" fill="currentColor" /></svg>{game.status !== 'playing' && <div className="game-overlay"><strong>{t({ready: 'BYTE SNAKE', paused: 'TAKE A BREATHER', over: 'ONE MORE TRY?', won: 'YOU DID IT!'}[game.status])}</strong><p>{game.status === 'ready' ? t('Collect bytes. Keep growing.') : t('SCORE {score} · BEST {best}', { score: pad(game.score), best: pad(game.highScore) })}</p><button onClick={primary}>{t(game.status === 'paused' ? 'A: RESUME' : 'A: LET’S PLAY')}</button></div>}<span className="game-best">{t('BEST {best} · A: PAUSE', { best: pad(game.highScore) })}</span></div> : <div className="lcd-main" key={`${section}-${index}`}>
                    <div className="lcd-art"><span className="pixel-spark spark-one">✦</span><PixelArt name={section === 'projects' ? projectIcons[index] : selected?.icon} /><span className="pixel-spark spark-two">+</span></div>
                    <h2>{section === 'projects' ? currentProject.title : section === 'certificates' ? currentCertificate.title : t(section === 'skills' ? currentSkills.title : section === 'about' ? 'HELLO, I’M JUAN.' : section === 'contact' ? 'LET’S BUILD SOMETHING.' : 'LITTLE MOMENTS.')}</h2>
                    <span className="lcd-subtitle">{section === 'projects' ? currentProject.tech.slice(0, 3).join(' · ') : section === 'certificates' ? currentCertificate.issuer : section === 'skills' ? t('MODULE {number}', { number: pad(index + 1) }) : t(section === 'about' ? 'SOFTWARE ENGINEER' : section === 'contact' ? 'PRESS A TO SAY HELLO' : 'THE ACTIVITY ARCHIVE')}</span>
                    <p className="lcd-description">{section === 'projects' ? t(['Clean architecture.\nA home for every achievement.', 'A battle of logic.\nBuilt one class at a time.', 'A small window\ninto my world.'][index]) : section === 'certificates' ? currentCertificate.date : section === 'skills' ? currentSkills.skills.slice(0, 3).map(skill => t(skill)).join(' / ') : t(section === 'about' ? 'I build software\nwith purpose and logic.' : section === 'contact' ? 'An idea, a question,\nor just a hello.' : 'A space for the\nthings between projects.')}</p>
                    <button className="lcd-open" onClick={primary}>{t(section === 'projects' ? 'OPEN PROJECT' : section === 'certificates' ? 'VIEW CREDENTIAL' : section === 'skills' ? 'EXPLORE TOOLKIT' : section === 'about' ? 'MEET THE MAKER' : section === 'contact' ? 'GET IN TOUCH' : 'OPEN GALLERY')}<span>↗</span></button>
                    {count > 1 && <><button className="lcd-arrow previous" aria-label={t('Previous {item}', { item: t(section === 'projects' ? 'project' : section === 'certificates' ? 'certificate' : 'skill group') })} onClick={() => direction('left')}>◂</button><button className="lcd-arrow next" aria-label={t('Next {item}', { item: t(section === 'projects' ? 'project' : section === 'certificates' ? 'certificate' : 'skill group') })} onClick={() => direction('right')}>▸</button></>}
                  </div>}
                  </>}
                  <div className="lcd-bottomline"><button onClick={secondary}>B : {t(section === 'menu' ? 'BACK' : 'MENU')}</button><button onClick={start}>{t("START : HOME")}</button></div>
                </div> : <button className="screen-off-message" onClick={() => setPowered(true)}>{t("A LITTLE WORLD")}<br />{t("IS WAITING.")}<span>{t("TURN POWER ON →")}</span></button>}
              </div>
            </div>
          </div>
          <div className="console-brand">pocket<span>{t("PORTFOLIO SYSTEM")}</span><sup>™</sup></div>
          <div className="controls-area">
            <div className="dpad-well"><div className="dpad"><span className="dpad-horizontal" /><span className="dpad-vertical" />{['up','right','down','left'].map(dir => <button key={dir} className={`dpad-button ${dir} ${pressed === dir ? 'pressed' : ''}`} aria-label={t('D-pad {direction}', { direction: t(dir) })} onClick={() => direction(dir)}><span /></button>)}<span className="dpad-center" /></div></div>
            <div className="action-buttons"><div><button className={`action-button b-button ${pressed === 'b' ? 'pressed' : ''}`} aria-label={t("B button — back to menu")} onClick={secondary} /><span>B</span></div><div><button className={`action-button a-button ${pressed === 'a' ? 'pressed' : ''}`} aria-label={t("A button — select or open")} onClick={primary} /><span>A</span></div></div>
          </div>
          <div className="system-buttons"><div><button className={pressed === 'select' ? 'pressed' : ''} aria-label={t("Select button — next section")} onClick={select} /><span>SELECT</span></div><div><button className={pressed === 'start' ? 'pressed' : ''} aria-label={t("Start button — home menu")} onClick={start} /><span>START</span></div></div>
          <div className="speaker" aria-hidden="true">{Array.from({length: 6}, (_, i) => <i key={i} />)}</div>
          <span className="case-serial">EST. 2026</span><div className="headphone-port" aria-hidden="true">◖◗</div>
        </div>
        </div>
        <div className="console-shadow" /><p className="console-caption eyebrow"><span className="tiny-led" /> {t("PLAYER 01 · READY TO EXPLORE")}</p>
        <div className="console-orbit-tools"><span>{t('Drag the case to rotate')}</span><button type="button" onClick={() => consoleResetRef.current?.()} aria-label={t('Reset console view')}>↺ {t('Reset view')}</button></div>
        <p className="sr-only" role="status" aria-live="polite" aria-atomic="true">{announcement}</p>
      </section>

      <aside className="play-guide">
        <div className="guide-heading eyebrow"><span>{t("HOW TO PLAY")}</span><span>↙</span></div>
        <div className="guide-step"><div className="guide-dpad">↑<span>←<b>+</b>→</span>↓</div><div><strong>{t("Find your way")}</strong><span>{t("D-pad or arrow keys")}</span></div></div>
        <div className="guide-step"><kbd>A</kbd><div><strong>{t("Take a look")}</strong><span>{t("A button or Z key")}</span></div></div>
        <div className="guide-step"><kbd>B</kbd><div><strong>{t("Go back a little")}</strong><span>{t("B button or X key")}</span></div></div>
        <div className="guide-step"><i className="guide-start" /><div><strong>{t("Make yourself at home")}</strong><span>{t("Start or Enter key")}</span></div></div>
        <div className="guide-footer eyebrow">{t("NO HIGH SCORE REQUIRED.")}</div>
        <button className="side-quest" onClick={() => { chooseSection('game'); beep(750); }}><span className="quest-cartridge"><Icon name="game" size={26} /></span><span><em>{t("A little side quest?")}</em><small>{t("TAKE A BREAK. PLAY BYTE SNAKE.")}</small></span><Icon name="arrow" size={15} /></button>
      </aside>
    </main>
    <footer className="site-footer"><span>© {new Date().getFullYear()} {profile.shortName}<span className="footer-dot">·</span>{t("BUILT WITH PURPOSE & LOGIC.")}</span><div><ExternalLink href={profile.github}>GitHub</ExternalLink><ExternalLink href={profile.linkedin}>LinkedIn</ExternalLink><button onClick={() => openReader('contact')}>{t("Say hello")} <Icon name="arrow" size={13} /></button></div><span className="footer-edition">{t("POCKET EDITION — VOL. 01")}</span></footer>
    <div className="secrets-footer"><button type="button" id="secrets-found" className="secrets-footer-button" data-discovered={foundIds.length > 0} onClick={() => setSecretsView('collection')}><span className="secrets-footer-symbol" aria-hidden="true">✧</span>{t('Secrets found')}<span>{foundIds.length}/{secretCatalog.length}</span></button></div>
    {reader && <Reader reader={reader} setReader={setReader} onClose={closeReader} t={t} />}
    {secretsView && <SecretsDialog view={secretsView} foundIds={foundIds} onView={setSecretsView} onClose={() => setSecretsView(null)} t={t} />}
  </div>;
}
