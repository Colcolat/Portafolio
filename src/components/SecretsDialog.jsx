import { useEffect, useRef } from 'react';
import { secretCatalog } from '../data/secrets';
import DeveloperRoom from './DeveloperRoom';
import './SecretsDialog.css';

export default function SecretsDialog({ view, foundIds, onView, onClose, t }) {
  const dialogRef = useRef(null);
  const titleRef = useRef(null);
  const roomOpen = view === 'room' && foundIds.includes('developer-room');

  useEffect(() => {
    const dialog = dialogRef.current;
    const previousFocus = document.activeElement;
    const overflow = document.body.style.overflow;
    dialog.showModal();
    document.body.style.overflow = 'hidden';
    return () => {
      dialog.close();
      document.body.style.overflow = overflow;
      queueMicrotask(() => {
        if (previousFocus?.isConnected) previousFocus.focus();
        else document.getElementById('secrets-found')?.focus();
      });
    };
  }, []);

  useEffect(() => { titleRef.current?.focus(); }, [roomOpen]);

  return <dialog className="reader secrets-dialog" ref={dialogRef} aria-labelledby="secrets-title"
    onCancel={event => { event.preventDefault(); onClose(); }}
    onClick={event => { if (event.target === event.currentTarget) onClose(); }}>
    <header className="reader-header">
      <span className="eyebrow">{t('THE SECRET ARCHIVE')} / {String(foundIds.length).padStart(2, '0')}</span>
      <button className="close-reader" type="button" aria-label={t('Close secrets')} onClick={onClose}><span>{t('BACK TO PLAY')}</span><span aria-hidden="true">✕</span></button>
    </header>
    <div className="secrets-dialog-content">
      {roomOpen && <button className="secrets-back" type="button" onClick={() => onView('collection')}>← {t('Back to discoveries')}</button>}
      <h2 id="secrets-title" ref={titleRef} tabIndex={-1}>{t(roomOpen ? 'The developer room' : 'Secrets found')}</h2>
      {roomOpen ? <DeveloperRoom t={t} /> : <>
        <p className="secrets-intro">{t('A few little things, waiting to be found.')}</p>
        <div className="secrets-progress"><span>{t('{found} of {total} discovered', { found: foundIds.length, total: secretCatalog.length })}</span><progress value={foundIds.length} max={secretCatalog.length} aria-label={t('Discovery progress')} /></div>
        <ul className="secret-collection">{secretCatalog.map((secret, i) => {
          const found = foundIds.includes(secret.id);
          return <li key={secret.id} className={found ? 'secret-card discovered' : 'secret-card'}>
            <span className="secret-number" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
            {found ? <button type="button" className="secret-card-link" onClick={() => onView('room')}><span><strong>{t(secret.title)}</strong><small>{t(secret.description)}</small></span><span aria-hidden="true">↗</span></button>
              : <div className="secret-card-locked"><strong>???</strong><span>{t('Not discovered yet')}</span><small>{t('Some buttons remember old stories.')}</small></div>}
            <span className="secret-stamp">{t(found ? 'FOUND' : 'HIDDEN')}</span>
          </li>;
        })}</ul>
        <p className="secrets-note">{t('Discoveries are saved in this browser. More secrets will arrive, one by one.')}</p>
      </>}
    </div>
  </dialog>;
}
