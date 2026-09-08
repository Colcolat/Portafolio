import { useCallback, useEffect, useRef, useState } from 'react';
import { profile, projects, certificates, skillGroups } from './data/portfolio';
import PixelArt from './components/PixelArt';
import useByteGame from './hooks/useByteGame';

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
    book: <><path d="M12 5v15M3 3l9 2 9-2v15l-9 2-9-2V3Z" /></>,
  };
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>{paths[name] || paths.arrow}</svg>;
}

function ExternalLink({ href, children, className = '' }) {
  return <a className={`text-link ${className}`} href={href} target="_blank" rel="noreferrer">{children}<Icon name="arrow" size={15} /></a>;
}

function ContactPane() {
  const [copied, setCopied] = useState(false);
  const [copyFailed, setCopyFailed] = useState(false);
  const copyEmail = async () => {
    try { await navigator.clipboard.writeText(profile.email); setCopied(true); setCopyFailed(false); }
    catch { setCopyFailed(true); }
  };
  const send = (event) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const subject = encodeURIComponent(`Portfolio enquiry from ${data.get('name')}`);
    const body = encodeURIComponent(`${data.get('message')}\n\nFrom: ${data.get('name')}\nEmail: ${data.get('email')}`);
    window.location.href = `mailto:${profile.email}?subject=${subject}&body=${body}`;
  };
  return <div className="contact-pane">
    <p className="reader-intro">Have something in mind?<br />Let’s build it together.</p>
    <div className="email-line"><a href={`mailto:${profile.email}`}>{profile.email}</a><button className="small-button" onClick={copyEmail}>{copied ? 'Copied ✓' : 'Copy'}</button></div>
    <p className={copyFailed ? 'copy-feedback' : 'sr-only'} role="status">{copied ? 'Email address copied.' : copyFailed ? 'Copy unavailable. Select the email address to copy it.' : ''}</p>
    <form className="contact-form" onSubmit={send}>
      <label>Your name<input name="name" required autoComplete="name" placeholder="How should I call you?" /></label>
      <label>Your email<input name="email" type="email" required autoComplete="email" placeholder="you@example.com" /></label>
      <label className="form-message">Your message<textarea name="message" required rows={4} placeholder="An idea, a question, or just a hello…" /></label>
      <button className="solid-button" type="submit">Write a message <Icon name="arrow" size={16} /></button>
      <span className="form-note">Opens a draft in your email app.</span>
    </form>
    <div className="reader-links"><ExternalLink href={profile.github}>GitHub</ExternalLink><ExternalLink href={profile.linkedin}>LinkedIn</ExternalLink></div>
  </div>;
}

function GalleryPane() {
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
  </article>)}</div> : <div className="empty-gallery"><PixelArt name="sprout" /><h3>{status === 'loading' ? 'Loading the little moments…' : status === 'unavailable' ? 'The gallery is taking a break.' : 'A little room for what’s next.'}</h3><p>{status === 'loading' ? 'One moment.' : status === 'unavailable' ? 'Please try visiting again later.' : 'No activities to show just yet.'}</p></div>;
}

function Reader({ reader, setReader, onClose }) {
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
      <header className="reader-header"><span className="eyebrow">POCKET ARCHIVE / {tabNames[section]?.toUpperCase()}</span><button className="close-reader" aria-label="Close portfolio" onClick={onClose}><span>BACK TO PLAY</span><Icon name="close" /></button></header>
      <nav className="reader-tabs" aria-label="Portfolio sections">{Object.entries(tabNames).map(([id, name]) => <button key={id} className={section === id ? 'selected' : ''} aria-current={section === id ? 'page' : undefined} onClick={() => setReader({ section: id, index: 0 })}>{name}{id === 'projects' && <sup>{pad(projects.length)}</sup>}{id === 'certificates' && <sup>{pad(certificates.length)}</sup>}</button>)}</nav>
      <div className="reader-content">
        <h2 id="reader-title" className="reader-title">{{about: 'A little about me.', projects: 'Things I’ve built.', certificates: 'Always a student.', skills: 'Tools of the trade.', contact: 'Good things start with hello.', gallery: 'Life, in little frames.'}[section]}</h2>
        {section === 'about' && <div className="about-pane"><div className="maker-stamp"><PixelArt name="smile" /><span>PLAYER 01</span></div><div><span className="eyebrow">{profile.role}</span><h3>{profile.name}</h3><p>{profile.summary}</p><p>{profile.about}</p><blockquote>“{profile.quote}”</blockquote><div className="reader-links"><a className="solid-button" href={profile.cvEn} download>CV in English <Icon name="download" size={16} /></a><a className="outline-button" href={profile.cvEs} download>CV en español <Icon name="download" size={16} /></a></div><div className="reader-links"><ExternalLink href={profile.github}>GitHub</ExternalLink><ExternalLink href={profile.linkedin}>LinkedIn</ExternalLink></div></div></div>}
        {section === 'projects' && <><div className="project-picker" aria-label="Choose a project">{projects.map((item, i) => <button className={i === index ? 'selected' : ''} key={item.id} onClick={() => setReader({ section, index: i })}><span>{pad(i + 1)}</span>{item.title}</button>)}</div><article className="project-detail" key={project.id}><div className="project-image"><img src={project.image} alt={`Original screenshot of ${project.title}`} /></div><div className="project-copy"><span className="eyebrow">SELECTED WORK / {pad(index + 1)}</span><h3>{project.title}</h3><p>{project.description}</p><div className="tech-tags">{project.tech.map(tech => <span key={tech}>{tech}</span>)}</div><div className="reader-links"><ExternalLink className="solid-button" href={project.githubLink}>Source code</ExternalLink>{project.liveLink && <ExternalLink className="outline-button" href={project.liveLink}>{project.liveDemoText || 'Live project'}</ExternalLink>}</div>{project.id === 'portfolio' && <p className="archive-note">From the original portfolio archive. You’re exploring the new pocket edition.</p>}</div></article></>}
        {section === 'certificates' && <><label className="certificate-select">EXPLORE ALL {certificates.length} CREDENTIALS<select value={index} onChange={event => setReader({ section, index: Number(event.target.value) })}>{certificates.map((item, i) => <option key={item.id} value={i}>{pad(i + 1)} — {item.title}</option>)}</select></label><article className="certificate-detail"><div className="certificate-image"><img key={certificate.id} src={certificate.image} alt={`${certificate.title} certificate`} /></div><div><span className="eyebrow">BADGE {pad(index + 1)} / {pad(certificates.length)}</span><h3>{certificate.title}</h3><p>{certificate.issuer}</p><p className="credential-date">{certificate.date}</p><div className="reader-links">{certificate.link && certificate.link !== '#' && <ExternalLink className="solid-button" href={certificate.link}>Verify credential</ExternalLink>}<a className="outline-button" href={certificate.image} download>Download image <Icon name="download" size={16} /></a></div></div></article><div className="archive-pagination"><button className="small-button" onClick={() => setReader({section, index: wrap(index - 1, certificates.length)})}>← Previous badge</button><span>{pad(index + 1)} / {pad(certificates.length)}</span><button className="small-button" onClick={() => setReader({section, index: wrap(index + 1, certificates.length)})}>Next badge →</button></div></>}
        {section === 'skills' && <div className="skill-grid">{skillGroups.map((group, i) => <section key={group.title}><span className="eyebrow">MODULE {pad(i + 1)}</span><h3>{group.title}</h3><ul>{group.skills.map(skill => <li key={skill}>{skill}</li>)}</ul></section>)}</div>}
        {section === 'contact' && <ContactPane />}
        {section === 'gallery' && <GalleryPane />}
      </div>
      <footer className="reader-footer"><span>{profile.name}</span><span>BUILT WITH PURPOSE & LOGIC.</span></footer>
    </div>
  </dialog>;
}

export default function App() {
  const [section, setSection] = useState('projects');
  const [selection, setSelection] = useState(0);
  const [index, setIndex] = useState(0);
  const [reader, setReader] = useState(null);
  const [powered, setPowered] = useState(true);
  const [sound, setSound] = useState(false);
  const [pressed, setPressed] = useState('');
  const pressTimer = useRef(null);
  const audioRef = useRef(null);
  const swipeStart = useRef(null);
  const game = useByteGame({ enabled: powered && section === 'game' && !reader });
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
  const chooseSection = useCallback((next) => {
    setSection(next); setIndex(0); setPowered(true);
    setSelection(Math.max(0, sections.findIndex(item => item.id === next)));
  }, []);
  const home = useCallback(() => { setSection('menu'); setIndex(0); }, []);
  const direction = useCallback((dir) => {
    if (!powered || reader) return;
    flash(dir); beep(320);
    if (section === 'game') { turnSnake(dir); return; }
    const delta = dir === 'left' || dir === 'up' ? -1 : 1;
    if (section === 'menu') { setSelection(value => wrap(value + delta, sections.length)); return; }
    const length = section === 'projects' ? projects.length : section === 'certificates' ? certificates.length : section === 'skills' ? skillGroups.length : 1;
    if (length > 1) setIndex(value => wrap(value + delta, length));
    else home();
  }, [powered, reader, section, flash, beep, turnSnake, home]);
  const primary = useCallback(() => {
    if (!powered || reader) return;
    flash('a'); beep(660);
    if (section === 'menu') chooseSection(sections[selection].id);
    else if (section === 'game') controlSnake();
    else setReader({ section, index });
  }, [powered, reader, flash, beep, section, selection, chooseSection, controlSnake, index]);
  const secondary = useCallback(() => {
    if (!powered) return;
    flash('b'); beep(240); home();
  }, [powered, flash, beep, home]);
  const start = useCallback(() => {
    setPowered(true); flash('start'); beep(520); home();
  }, [flash, beep, home]);
  const select = () => {
    if (!powered) return;
    flash('select'); beep(380);
    const next = wrap(sections.findIndex(item => item.id === section) + 1, sections.length);
    chooseSection(sections[next].id);
  };
  useEffect(() => {
    const handleKey = (event) => {
      if (reader || event.altKey || event.ctrlKey || event.metaKey || /INPUT|TEXTAREA|SELECT/.test(event.target.tagName)) return;
      const key = event.key.toLowerCase();
      const arrows = { arrowup: 'up', arrowdown: 'down', arrowleft: 'left', arrowright: 'right' };
      if (arrows[key]) { event.preventDefault(); direction(arrows[key]); }
      else if (key === 'z') { event.preventDefault(); if (!event.repeat) primary(); }
      else if (key === 'x' || key === 'escape') { event.preventDefault(); if (!event.repeat) secondary(); }
      else if (key === 'enter' && (!event.target.closest('button, a') || event.target.closest('.handheld'))) { event.preventDefault(); if (!event.repeat) start(); }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [reader, direction, primary, secondary, start]);
  const openReader = (next = 'about', nextIndex = 0) => setReader({ section: next, index: nextIndex });
  const closeReader = useCallback(() => setReader(null), []);
  const selected = sections.find(item => item.id === section);
  const count = section === 'projects' ? projects.length : section === 'certificates' ? certificates.length : section === 'skills' ? skillGroups.length : 1;
  const currentProject = projects[index % projects.length];
  const currentCertificate = certificates[index % certificates.length];
  const currentSkills = skillGroups[index % skillGroups.length];
  const screenTitle = section === 'menu' ? 'YOUR LITTLE WORLD' : section === 'game' ? 'BYTE SNAKE' : selected?.label.toUpperCase();
  const announcement = !powered ? 'Console powered off' : section === 'menu' ? `Menu: ${sections[selection].label}` : section === 'projects' ? `Project ${index + 1}: ${currentProject.title}` : section === 'certificates' ? `Certificate ${index + 1}: ${currentCertificate.title}` : section === 'skills' ? currentSkills.title : section === 'game' ? `Byte Snake. ${game.status}. Score ${game.score}` : selected?.label;

  return <div className="portfolio-page">
    <a className="skip-link" href="#full-portfolio" onClick={event => { event.preventDefault(); openReader(); }}>Skip to full portfolio</a>
    <header className="site-header">
      <button className="wordmark" onClick={start} aria-label="Pocketfolio home"><span className="wordmark-icon"><i /><b /><em /></span>pocketfolio<span className="wordmark-dot">.</span></button>
      <span className="header-caption eyebrow">AN INTERACTIVE PORTFOLIO</span>
      <div className="header-actions"><button className="sound-toggle" onClick={() => setSound(value => !value)} aria-pressed={sound} aria-label={sound ? 'Mute sound' : 'Enable sound'}><Icon name={sound ? 'sound' : 'mute'} size={17} /><span>SOUND {sound ? 'ON' : 'OFF'}</span></button><button className="full-portfolio-link" id="full-portfolio" onClick={() => openReader()}>FULL PORTFOLIO <Icon name="arrow" size={14} /></button></div>
    </header>

    <main className="main-layout">
      <section className="introduction" aria-label="Introduction">
        <div className="edition-label eyebrow"><span className="edition-symbol">01</span> THE POCKET EDITION</div>
        <h1>Small screen.<br /><em>Big ideas.</em></h1>
        <p className="intro-description">A software engineer.<br />{' '}A backend builder.<br />A little world of things I’ve made.</p>
        <div className="maker-name"><span className="maker-rule" /><div><Icon name="plus" size={15} /><button onClick={() => openReader('about')}><strong>JUAN JOSE ZAPATA BUENFIL</strong><span>SOFTWARE & BACKEND DEVELOPMENT</span></button></div></div>
        <div className="handwritten">Made to be explored.<svg viewBox="0 0 150 62" aria-hidden="true"><path d="M5 8c31 52 103 42 126-1m-19 10 20-13 3 24" /></svg></div>
      </section>

      <section className="console-stage" aria-label="Interactive pocket portfolio">
        <p className="stage-caption eyebrow"><span /> LESS SCROLL. MORE PLAY.</p>
        <div className={`handheld ${!powered ? 'powered-off' : ''}`}>
          <div className="case-seam" /><div className="side-ridges"><i /><i /><i /><i /><i /></div>
          <button className="power-switch" role="switch" aria-checked={powered} aria-label="Console power" onClick={() => { setPowered(value => !value); beep(300); }}><span>OFF</span><i /><span>ON</span><b>◂</b></button>
          <div className="screen-bezel">
            <div className="bezel-heading"><span /><b>DOT MATRIX WITH PERSONALITY</b><span /></div>
            <div className="battery-light"><i /><span>BATTERY</span></div>
            <div className="lcd-shell">
              <div className={`lcd ${section === 'game' ? 'game-lcd' : ''}`} aria-label="Console screen" onTouchStart={event => { swipeStart.current = { x: event.touches[0].clientX, y: event.touches[0].clientY }; }} onTouchEnd={event => { if (!swipeStart.current) return; const dx = event.changedTouches[0].clientX - swipeStart.current.x; const dy = event.changedTouches[0].clientY - swipeStart.current.y; if (Math.max(Math.abs(dx), Math.abs(dy)) > 25) direction(Math.abs(dx) > Math.abs(dy) ? dx > 0 ? 'right' : 'left' : dy > 0 ? 'down' : 'up'); swipeStart.current = null; }}>
                {powered ? <div className="screen-content" key={section}>
                  <div className="lcd-topline"><span>{screenTitle}</span><span>{section === 'menu' ? '01' : section === 'game' ? pad(game.score) : `${index + 1}/${count}`}</span></div>
                  {section === 'menu' ? <div className="screen-menu">{sections.map((item, i) => <button key={item.id} className={selection === i ? 'active' : ''} aria-current={selection === i ? 'true' : undefined} onMouseEnter={() => setSelection(i)} onClick={() => chooseSection(item.id)}><span>{selection === i ? '▶' : ' '}</span>{item.label}<small>{pad(i + 1)}</small></button>)}</div> : section === 'game' ? <div className="game-area"><svg className="snake-board" viewBox="0 0 120 120" role="img" aria-label={`Snake board, score ${game.score}`}><defs><pattern id="game-grid" width="10" height="10" patternUnits="userSpaceOnUse"><path d="M10 0H0v10" fill="none" stroke="currentColor" strokeOpacity=".08" strokeWidth=".5" /></pattern></defs><rect width="120" height="120" fill="url(#game-grid)" />{game.snake.map((cell, i) => <rect key={`${cell.x}-${cell.y}`} x={cell.x * 10 + 1} y={cell.y * 10 + 1} width="8" height="8" fill="currentColor" opacity={i === 0 ? 1 : 0.7} />)}<rect x={game.food.x * 10 + 2} y={game.food.y * 10 + 2} width="6" height="6" fill="currentColor" /></svg>{game.status !== 'playing' && <div className="game-overlay"><strong>{{ready: 'BYTE SNAKE', paused: 'TAKE A BREATHER', over: 'ONE MORE TRY?', won: 'YOU DID IT!'}[game.status]}</strong><p>{game.status === 'ready' ? 'Collect bytes. Keep growing.' : `SCORE ${pad(game.score)} · BEST ${pad(game.highScore)}`}</p><button onClick={primary}>{game.status === 'paused' ? 'A: RESUME' : 'A: LET’S PLAY'}</button></div>}<span className="game-best">BEST {pad(game.highScore)} · A: PAUSE</span></div> : <div className="lcd-main" key={`${section}-${index}`}>
                    <div className="lcd-art"><span className="pixel-spark spark-one">✦</span><PixelArt name={section === 'projects' ? projectIcons[index] : selected?.icon} /><span className="pixel-spark spark-two">+</span></div>
                    <h2>{section === 'projects' ? currentProject.title : section === 'certificates' ? currentCertificate.title : section === 'skills' ? currentSkills.title : section === 'about' ? 'HELLO, I’M JUAN.' : section === 'contact' ? 'LET’S BUILD SOMETHING.' : 'LITTLE MOMENTS.'}</h2>
                    <span className="lcd-subtitle">{section === 'projects' ? currentProject.tech.slice(0, 3).join(' · ') : section === 'certificates' ? currentCertificate.issuer : section === 'skills' ? `MODULE ${pad(index + 1)}` : section === 'about' ? 'SOFTWARE ENGINEER' : section === 'contact' ? 'PRESS A TO SAY HELLO' : 'THE ACTIVITY ARCHIVE'}</span>
                    <p className="lcd-description">{section === 'projects' ? ['Clean architecture.\nA home for every achievement.', 'A battle of logic.\nBuilt one class at a time.', 'A small window\ninto my world.'][index] : section === 'certificates' ? currentCertificate.date : section === 'skills' ? currentSkills.skills.slice(0, 3).join(' / ') : section === 'about' ? 'I build software\nwith purpose and logic.' : section === 'contact' ? 'An idea, a question,\nor just a hello.' : 'A space for the\nthings between projects.'}</p>
                    <button className="lcd-open" onClick={primary}>{section === 'projects' ? 'OPEN PROJECT' : section === 'certificates' ? 'VIEW CREDENTIAL' : section === 'skills' ? 'EXPLORE TOOLKIT' : section === 'about' ? 'MEET THE MAKER' : section === 'contact' ? 'GET IN TOUCH' : 'OPEN GALLERY'}<span>↗</span></button>
                    {count > 1 && <><button className="lcd-arrow previous" aria-label={`Previous ${section === 'projects' ? 'project' : section === 'certificates' ? 'certificate' : 'skill group'}`} onClick={() => direction('left')}>◂</button><button className="lcd-arrow next" aria-label={`Next ${section === 'projects' ? 'project' : section === 'certificates' ? 'certificate' : 'skill group'}`} onClick={() => direction('right')}>▸</button></>}
                  </div>}
                  <div className="lcd-bottomline"><button onClick={secondary}>B : {section === 'menu' ? 'BACK' : 'MENU'}</button><button onClick={start}>START : HOME</button></div>
                </div> : <button className="screen-off-message" onClick={() => setPowered(true)}>A LITTLE WORLD<br />IS WAITING.<span>TURN POWER ON →</span></button>}
              </div>
            </div>
          </div>
          <div className="console-brand">pocket<span>PORTFOLIO SYSTEM</span><sup>™</sup></div>
          <div className="controls-area">
            <div className="dpad-well"><div className="dpad"><span className="dpad-horizontal" /><span className="dpad-vertical" />{['up','right','down','left'].map(dir => <button key={dir} className={`dpad-button ${dir} ${pressed === dir ? 'pressed' : ''}`} aria-label={`D-pad ${dir}`} onClick={() => direction(dir)}><span /></button>)}<span className="dpad-center" /></div></div>
            <div className="action-buttons"><div><button className={`action-button b-button ${pressed === 'b' ? 'pressed' : ''}`} aria-label="B button — back to menu" onClick={secondary} /><span>B</span></div><div><button className={`action-button a-button ${pressed === 'a' ? 'pressed' : ''}`} aria-label="A button — select or open" onClick={primary} /><span>A</span></div></div>
          </div>
          <div className="system-buttons"><div><button className={pressed === 'select' ? 'pressed' : ''} aria-label="Select button — next section" onClick={select} /><span>SELECT</span></div><div><button className={pressed === 'start' ? 'pressed' : ''} aria-label="Start button — home menu" onClick={start} /><span>START</span></div></div>
          <div className="speaker" aria-hidden="true">{Array.from({length: 6}, (_, i) => <i key={i} />)}</div>
          <span className="case-serial">EST. 2026</span><div className="headphone-port" aria-hidden="true">◖◗</div>
        </div>
        <div className="console-shadow" /><p className="console-caption eyebrow"><span className="tiny-led" /> PLAYER 01 · READY TO EXPLORE</p>
        <p className="sr-only" role="status" aria-live="polite" aria-atomic="true">{announcement}</p>
      </section>

      <aside className="play-guide">
        <div className="guide-heading eyebrow"><span>HOW TO PLAY</span><span>↙</span></div>
        <div className="guide-step"><div className="guide-dpad">↑<span>←<b>+</b>→</span>↓</div><div><strong>Find your way</strong><span>D-pad or arrow keys</span></div></div>
        <div className="guide-step"><kbd>A</kbd><div><strong>Take a look</strong><span>A button or Z key</span></div></div>
        <div className="guide-step"><kbd>B</kbd><div><strong>Go back a little</strong><span>B button or X key</span></div></div>
        <div className="guide-step"><i className="guide-start" /><div><strong>Make yourself at home</strong><span>Start or Enter key</span></div></div>
        <div className="guide-footer eyebrow">NO HIGH SCORE REQUIRED.</div>
        <button className="side-quest" onClick={() => { chooseSection('game'); beep(750); }}><span className="quest-cartridge"><Icon name="game" size={26} /></span><span><em>A little side quest?</em><small>TAKE A BREAK. PLAY BYTE SNAKE.</small></span><Icon name="arrow" size={15} /></button>
      </aside>
    </main>
    <footer className="site-footer"><span>© {new Date().getFullYear()} {profile.shortName}<span className="footer-dot">·</span>BUILT WITH PURPOSE & LOGIC.</span><div><ExternalLink href={profile.github}>GitHub</ExternalLink><ExternalLink href={profile.linkedin}>LinkedIn</ExternalLink><button onClick={() => openReader('contact')}>Say hello <Icon name="arrow" size={13} /></button></div><span className="footer-edition">POCKET EDITION — VOL. 01</span></footer>
    {reader && <Reader reader={reader} setReader={setReader} onClose={closeReader} />}
  </div>;
}
