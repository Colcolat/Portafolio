import { useState } from 'react';
import './TinyVisitor.css';

// A tiny original, monochrome sprite. Its face is empty space, so the same
// silhouette stays legible on both the console LCD and the little night scene.
function BitSprite({ className = '', waving = false }) {
  return <svg className={`bit-sprite ${className}`} data-waving={waving} viewBox="0 0 24 28"
    fill="currentColor" aria-hidden="true" focusable="false" shapeRendering="crispEdges">
    <g className="bit-sprite__body">
      <path d="M10 1h4v3h-4zM11 4h2v3h-2zM6 7h12v2H6zM4 9h16v10H4zM6 19h12v2H6z" />
      <path className="bit-sprite__face" d="M7 11h10v6H7z" />
      <path d="M8 12h2v3H8zM14 12h2v3h-2zM11 16h2v1h-2zM7 21h10v4H7zM5 25h6v2H5zM13 25h6v2h-6zM2 18h3v5H2z" />
      <path className="bit-sprite__badge" d="M11 21h2v2h-2z" />
      <g className="bit-sprite__hand"><path d="M19 16h3v5h-3zM20 13h3v4h-3zM19 11h2v3h-2z" /></g>
    </g>
  </svg>;
}

export function TinyVisitor({ t, onGreet }) {
  return <button className="tiny-visitor-trigger" type="button" onClick={onGreet}
    aria-label={t('Say hello to Bit')} title={t('Say hello to Bit')}>
    <BitSprite waving />
    <span className="tiny-visitor-ground" aria-hidden="true" />
  </button>;
}

function VisitorLandscape({ waving, waveKey }) {
  return <svg className="tiny-visitor-landscape" viewBox="0 0 192 128" aria-hidden="true"
    focusable="false" shapeRendering="crispEdges">
    <rect width="192" height="128" fill="var(--visitor-night)" />
    {/* The crescent, distant rooftops and a few still stars give Bit a place. */}
    <path fill="var(--visitor-light)" d="M148 12h12v4h-8v12h8v4h-12v-4h-4V16h4zM26 18h2v6h-2zM24 20h6v2h-6zM74 12h2v2h-2zM116 34h2v2h-2zM38 48h2v2h-2zM172 54h2v6h-2zM170 56h6v2h-6z" />
    <path fill="var(--visitor-shadow)" d="M0 70h18v-8h20v10h26v-6h12v12h22v-8h24v-8h18v10h30v-6h22v42H0z" />
    <path fill="var(--visitor-mid)" d="M0 92h192v36H0z" />
    <path fill="var(--visitor-light)" d="M0 92h192v2H0z" opacity=".4" />
    <path fill="var(--visitor-shadow)" d="M0 116h192v2H0zM26 105h16v2H26zM66 122h28v2H66zM158 102h22v2h-22zM18 95h2v10h-2zM48 107h2v9h-2zM172 118h2v10h-2z" />
    {/* An empty bench leaves room for the visitor on the other side. */}
    <path fill="var(--visitor-night)" d="M38 74h4v38h-4zM80 74h4v38h-4zM32 77h58v5H32zM32 84h58v5H32zM30 94h62v6H30z" />
    <path fill="var(--visitor-light)" d="M32 77h58v1H32zM32 84h58v1H32zM30 94h62v1H30z" opacity=".65" />
    <path fill="var(--visitor-shadow)" d="M106 111h42v4h-42z" />
    <svg x="108" y="55" width="48" height="56" viewBox="0 0 24 28" overflow="visible">
      <BitSprite key={waveKey} className="bit-sprite--landscape" waving={waving} />
    </svg>
    <path fill="var(--visitor-light)" d="M168 84h2v8h-2zM166 88h2v2h-2zM170 86h2v2h-2z" />
  </svg>;
}

export default function TinyVisitorRoom({ t }) {
  const [waveCount, setWaveCount] = useState(0);

  return <div className="tiny-visitor-room">
    <figure className="tiny-visitor-room__scene">
      <div className="tiny-visitor-room__frame"><VisitorLandscape waving={waveCount > 0} waveKey={waveCount} /></div>
      <figcaption><span>{t('A QUIET ENCOUNTER')}</span><span>{t('BIT / 01')}</span></figcaption>
    </figure>
    <div className="tiny-visitor-room__notes">
      <p className="tiny-visitor-room__heading">{t('A little company, between adventures.')}</p>
      <p className="tiny-visitor-room__story">{t('Meet Bit. A quiet little visitor who only appears when this world has a moment to breathe.')}</p>
      <p className="tiny-visitor-room__thanks">{t('Thanks for slowing down and saying hello.')}</p>
      <button className="tiny-visitor-room__wave" type="button" onClick={() => setWaveCount(count => count + 1)}>
        <span aria-hidden="true">✦</span>{t('Wave to Bit')}<span aria-hidden="true">↗</span>
      </button>
      <p className="tiny-visitor-room__response" role="status" aria-live="polite" aria-atomic="true">
        {waveCount > 0 && <span key={waveCount}>{t('Bit waves back.')}</span>}
      </p>
    </div>
  </div>;
}
