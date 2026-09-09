import { profile } from '../data/portfolio';
import './DeveloperRoom.css';

// An original, four-color room. No text or personal details are baked into the art.
export function DeveloperRoomArt({ className = '' }) {
  return <svg className={`developer-room-art ${className}`} viewBox="0 0 192 128" aria-hidden="true" focusable="false" shapeRendering="crispEdges">
    <rect width="192" height="128" fill="var(--room-light)" />

    {/* Stepped outline, wall molding, and floorboards. */}
    <path fill="var(--room-dark)" d="M8 8h176v4H8zM4 12h4v104H4zM184 12h4v104h-4zM8 116h176v4H8z" />
    <path fill="var(--room-mid)" d="M8 80h176v36H8z" />
    <path fill="var(--room-dark)" d="M8 78h176v4H8z" />
    <path fill="var(--room-shadow)" d="M8 94h176v2H8zM8 110h176v2H8zM28 82h2v12h-2zM100 82h2v12h-2zM164 82h2v12h-2zM58 96h2v14h-2zM132 96h2v14h-2zM28 112h2v4h-2zM100 112h2v4h-2zM164 112h2v4h-2z" />

    {/* A small window and a very pixelated day outside. */}
    <path fill="var(--room-shadow)" d="M132 20h38v36h-38z" />
    <path fill="var(--room-dark)" d="M128 16h38v36h-38z" />
    <path fill="var(--room-mid)" d="M132 20h30v28h-30z" />
    <path fill="var(--room-light)" d="M138 24h10v4h-10zM134 28h18v4h-18zM152 38h10v4h-10zM148 42h14v4h-14z" />
    <path fill="var(--room-dark)" d="M146 20h4v28h-4zM132 32h30v4h-30zM124 52h46v4h-46z" />

    {/* Bookshelf: two shelves, mismatched book spines, and a little box. */}
    <path fill="var(--room-shadow)" d="M20 28h34v56H20z" />
    <path fill="var(--room-dark)" d="M16 24h34v4H16zM16 28h4v54h-4zM46 28h4v54h-4zM20 50h26v4H20zM20 74h26v4H20z" />
    <path fill="var(--room-mid)" d="M20 28h26v22H20zM20 54h26v20H20z" />
    <path fill="var(--room-dark)" d="M24 34h4v16h-4zM32 30h4v20h-4zM40 38h4v12h-4zM24 62h18v12H24z" />
    <path fill="var(--room-light)" d="M24 38h4v2h-4zM32 34h4v2h-4zM28 64h10v2H28z" />

    {/* Desk legs sit behind the desktop, with real empty space underneath. */}
    <path fill="var(--room-shadow)" d="M82 92h80v6H82zM158 74h8v20h-8zM86 74h8v20h-8z" />
    <path fill="var(--room-dark)" d="M82 72h6v22h-6zM158 72h6v22h-6zM78 68h90v8H78z" />
    <path fill="var(--room-light)" d="M78 66h90v4H78z" />

    {/* Monitor and a tiny abstract code editor. */}
    <path fill="var(--room-shadow)" d="M96 34h34v28H96z" />
    <path fill="var(--room-dark)" d="M92 30h36v28H92zM106 58h8v6h-8zM100 64h20v2h-20z" />
    <path fill="var(--room-mid)" d="M96 34h28v20H96z" />
    <path fill="var(--room-light)" d="M100 38h8v2h-8zM100 42h4v2h-4zM108 42h12v2h-12zM104 46h10v2h-10z" />
    <path fill="var(--room-dark)" d="M118 48h4v2h-4zM98 70h28v2H98z" />
    <path fill="var(--room-shadow)" d="M98 68h28v2H98zM132 68h6v4h-6z" />

    {/* A mug and a plant; set dressing, not claims about the owner. */}
    <path fill="var(--room-dark)" d="M140 58h8v8h-8zM148 58h4v2h-4zM150 60h2v4h-2zM148 64h4v2h-4z" />
    <path fill="var(--room-mid)" d="M142 58h4v2h-4z" />
    <path fill="var(--room-dark)" d="M164 58h14v4h-14zM166 62h10v8h-10zM170 40h4v18h-4zM160 42h4v8h-4zM164 46h6v6h-6zM178 36h4v10h-4zM174 42h4v8h-4z" />
    <path fill="var(--room-shadow)" d="M168 62h4v6h-4zM164 46h2v4h-2zM178 38h2v6h-2z" />

    {/* A generic little player, waiting just outside the workbench. */}
    <path fill="var(--room-shadow)" d="M52 108h30v4H52zM48 104h38v4H48z" />
    <path fill="var(--room-dark)" d="M60 66h14v4H60zM56 70h22v14H56zM60 84h14v4H60zM56 88h22v16H56zM52 92h4v8h-4zM78 92h4v8h-4zM56 104h8v6h-8zM70 104h8v6h-8z" />
    <path fill="var(--room-light)" d="M60 74h14v10H60zM56 94h4v6h-4zM74 94h4v6h-4z" />
    <path fill="var(--room-dark)" d="M60 74h4v4h-4zM70 74h4v4h-4zM64 82h6v2h-6z" />
    <path fill="var(--room-mid)" d="M60 88h14v12H60z" />
    <path fill="var(--room-light)" d="M64 90h2v2h-2zM68 92h2v2h-2zM64 94h2v2h-2z" />

    {/* The tiny wall accent echoes a command prompt without readable text. */}
    <path fill="var(--room-shadow)" d="M66 24h12v16H66z" />
    <path fill="var(--room-dark)" d="M62 20h12v16H62z" />
    <path fill="var(--room-light)" d="M64 22h8v12h-8z" />
    <path fill="var(--room-dark)" d="M66 26h2v2h-2zM68 28h2v2h-2zM66 30h2v2h-2z" />
  </svg>;
}

export default function DeveloperRoom({ t }) {
  return <div className="developer-room">
    <figure className="developer-room__scene">
      <div className="developer-room__frame"><DeveloperRoomArt /></div>
      <figcaption>{t('PLAYER 01 / WORKSPACE')}</figcaption>
    </figure>
    <div className="developer-room__notes">
      <p className="developer-room__welcome">{t('You found the room behind the pixels.')}</p>
      <p className="developer-room__thanks">{t('Thanks for exploring a little further. Here is the person behind this little world.')}</p>
      <div className="developer-room__identity">
        <p className="developer-room__name">{profile.name}</p>
        <p className="developer-room__role">{t(profile.role)}</p>
      </div>
      <blockquote>{t(profile.quote)}</blockquote>
      <ul className="developer-room__tools" aria-label={t('A few tools on the workbench')}>
        {['C#', '.NET', 'PostgreSQL'].map((tool) => <li key={tool}>{tool}</li>)}
      </ul>
    </div>
  </div>;
}
