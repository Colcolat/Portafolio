import './ByteReward.css';

// Original four-tone artwork: a chip trophy, eight collected bytes, and its keeper.
export function ByteTrophyArt({ className = '' }) {
  return <svg className={`byte-trophy-art ${className}`} viewBox="0 0 192 144"
    aria-hidden="true" focusable="false" shapeRendering="crispEdges">
    <rect width="192" height="144" fill="var(--byte-light)" />

    {/* Quiet display-case backdrop and a few square glints. */}
    <path fill="var(--byte-mid)" d="M12 12h168v2H12zM12 14h2v102h-2zM178 14h2v102h-2zM16 114h160v2H16zM32 32h2v2h-2zM156 34h2v2h-2zM24 78h2v2h-2zM160 98h2v2h-2z" />
    <path fill="var(--byte-shadow)" d="M38 42h2v10h-2zM34 46h10v2H34zM150 20h2v10h-2zM146 24h10v2h-10zM26 98h2v6h-2zM24 100h6v2h-6z" />
    <path fill="var(--byte-mid)" d="M20 118h152v4H20zM28 122h140v4H28z" />
    <path fill="var(--byte-shadow)" d="M42 112h108v6H42z" />

    {/* The handles and contact pins are behind the chip-shaped cup. */}
    <path fill="var(--byte-dark)" d="M56 40h14v6H56zM54 44h6v20h-6zM60 64h12v6H60zM124 40h14v6h-14zM134 44h6v20h-6zM122 64h12v6h-12zM76 24h4v10h-4zM88 24h4v10h-4zM100 24h4v10h-4zM112 24h4v10h-4zM76 80h4v10h-4zM88 80h4v10h-4zM100 80h4v10h-4zM112 80h4v10h-4z" />
    <path fill="var(--byte-shadow)" d="M70 34h56v50H70zM80 84h36v8H80zM90 90h14v12H90z" />
    <path fill="var(--byte-dark)" d="M68 30h56v50H68zM80 80h32v6H80zM88 86h16v16H88zM72 100h48v6H72zM64 106h64v8H64z" />
    <path fill="var(--byte-mid)" d="M74 36h44v38H74zM76 102h40v4H76zM68 108h56v2H68z" />
    <path fill="var(--byte-light)" d="M78 40h36v2H78zM78 42h2v26h-2zM80 70h34v2H80zM92 88h4v10h-4z" />

    {/* A drawn pixel 8, rather than a font-dependent glyph. */}
    <path fill="var(--byte-dark)" d="M90 44h12v4H90zM86 48h4v8h-4zM102 48h4v8h-4zM90 56h12v4H90zM86 60h4v8h-4zM102 60h4v8h-4zM90 68h12v4H90z" />

    {/* The snake keeps its trophy company, with a squared-off curl in front. */}
    <path fill="var(--byte-dark)" d="M44 84h8v12h12v-8h8v16H44zM58 96h82v-8h-18V58h10v20h18v28H58zM120 52h24v16h-24zM124 48h16v4h-16z" />
    <path fill="var(--byte-shadow)" d="M48 88h4v8h-4zM62 100h76v2H62zM126 70h2v12h-2zM128 82h16v2h-16zM144 86h2v14h-2zM124 54h16v8h-16z" />
    <path fill="var(--byte-light)" d="M132 54h4v4h-4zM124 58h2v2h-2zM72 98h2v6h-2zM84 98h2v6h-2zM96 98h2v6h-2zM108 98h2v6h-2zM120 98h2v6h-2z" />
    <path fill="var(--byte-dark)" d="M134 54h2v2h-2zM140 60h6v2h-6z" />

    {/* Eight bytes, one for each point needed to find this secret. */}
    {Array.from({ length: 8 }, (_, index) => <g key={index} transform={`translate(${49 + index * 12} 129)`}>
      <path fill="var(--byte-dark)" d="M0 0h8v8H0z" />
      <path fill="var(--byte-mid)" d="M2 2h4v4H2z" />
      <path fill="var(--byte-light)" d="M2 2h2v2H2z" />
    </g>)}
  </svg>;
}

export default function ByteReward({ t }) {
  return <div className="byte-reward">
    <figure className="byte-reward__scene">
      <div className="byte-reward__frame"><ByteTrophyArt /></div>
      <figcaption><span>{t('POCKET ARCADE / 08')}</span><span aria-hidden="true">✦</span></figcaption>
    </figure>
    <div className="byte-reward__notes">
      <p className="byte-reward__eyebrow">{t('A small reward for a curious player.')}</p>
      <p className="byte-reward__heading">{t('Eight bytes. One little victory.')}</p>
      <p className="byte-reward__story">{t('You collected eight bytes in a single round of Byte Snake. This little trophy is yours.')}</p>
      <p className="byte-reward__thanks">{t('Thanks for playing in my little world.')}</p>
      <p className="byte-reward__stamp">{t('PERSONAL BESTS START SMALL.')}</p>
    </div>
  </div>;
}
