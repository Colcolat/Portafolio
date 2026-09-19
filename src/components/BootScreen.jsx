import PixelArt from './PixelArt';
import './BootScreen.css';

export default function BootScreen({ t, onStart }) {
  return <div className="boot-screen">
    <span className="boot-edition">{t('POCKET EDITION')} <span aria-hidden="true">/ 01</span></span>
    <div className="boot-mark" aria-hidden="true"><span>+</span><PixelArt name="console" /><span>+</span></div>
    <h2>pocket<span>{t('A LITTLE WORLD TO EXPLORE')}</span></h2>
    <button className="boot-start" type="button" onClick={onStart}
      onKeyDown={event => { if (event.repeat) event.preventDefault(); }}>
      <span aria-hidden="true">▶</span>{t('PRESS START TO BEGIN')}
    </button>
    <span className="boot-hint">START / ENTER</span>
  </div>;
}
