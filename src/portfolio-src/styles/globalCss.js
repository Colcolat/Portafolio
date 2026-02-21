export const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=VT323&family=Righteous&family=Space+Mono:ital,wght@0,400;0,700;1,400&display=swap');

  :root {
    --pink:       #ff2d9b;
    --hotpink:    #ff6ec7;
    --cyan:       #00f5ff;
    --purple:     #b44fff;
    --mauve:      #9b8ec4;
    --dark:       #0a0020;
    --light-pink: #ffc0e8;
  }

  * { box-sizing: border-box; margin: 0; padding: 0; }
  html { scroll-behavior: smooth; }
  body { background: var(--dark); color: var(--light-pink); font-family: 'Space Mono', monospace; overflow-x: hidden; }

  body::before {
    content: ''; position: fixed; inset: 0; z-index: 9999; pointer-events: none;
    background: repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.07) 2px, rgba(0,0,0,0.07) 4px);
  }

  ::-webkit-scrollbar { width: 5px; }
  ::-webkit-scrollbar-track { background: var(--dark); }
  ::-webkit-scrollbar-thumb { background: var(--pink); border-radius: 4px; box-shadow: 0 0 8px var(--pink); }

  @keyframes glitch1 {
    0%   { clip-path: inset(20% 0 50% 0); transform: translate(-4px,0); }
    20%  { clip-path: inset(60% 0 10% 0); transform: translate(4px,0); }
    40%  { clip-path: inset(10% 0 80% 0); transform: translate(-2px,0); }
    60%  { clip-path: inset(80% 0  5% 0); transform: translate(3px,0); }
    80%  { clip-path: inset(40% 0 40% 0); transform: translate(-3px,0); }
    100% { clip-path: inset(20% 0 50% 0); transform: translate(-4px,0); }
  }
  @keyframes glitch2 {
    0%   { clip-path: inset(50% 0 20% 0); transform: translate(4px,0); }
    20%  { clip-path: inset(10% 0 60% 0); transform: translate(-4px,0); }
    40%  { clip-path: inset(80% 0 10% 0); transform: translate(2px,0); }
    60%  { clip-path: inset( 5% 0 80% 0); transform: translate(-3px,0); }
    80%  { clip-path: inset(40% 0 40% 0); transform: translate(3px,0); }
    100% { clip-path: inset(50% 0 20% 0); transform: translate(4px,0); }
  }
  @keyframes flicker { 0%,100%{opacity:1} 92%{opacity:1} 93%{opacity:.4} 94%{opacity:1} 96%{opacity:.6} 97%{opacity:1} }
  @keyframes marbleShift { 0%{background-position:0% 50%} 50%{background-position:100% 50%} 100%{background-position:0% 50%} }
  @keyframes fadeUp { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
  @keyframes gridMove { from{background-position:0 0} to{background-position:0 60px} }
  @keyframes scanLine { from{top:-5%} to{top:110%} }
  @keyframes blink { 50%{opacity:0} }
  @keyframes floatY { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-18px)} }
  @keyframes floatYR { 0%,100%{transform:translateY(0) rotate(5deg)} 50%{transform:translateY(-14px) rotate(-3deg)} }
  @keyframes sunPulse { 0%,100%{opacity:.9} 50%{opacity:1} }
  @keyframes palmSway { 0%,100%{transform:rotate(-2deg)} 50%{transform:rotate(2deg)} }
  @keyframes glowPulse {
    0%,100%{ filter: drop-shadow(0 0 6px var(--pink)) drop-shadow(0 0 12px rgba(255,45,155,.4)); }
    50%    { filter: drop-shadow(0 0 14px var(--pink)) drop-shadow(0 0 28px rgba(255,45,155,.7)); }
  }

  .fade-up   { animation: fadeUp .7s ease both; }
  .fade-up-1 { animation: fadeUp .7s .15s ease both; }
  .fade-up-2 { animation: fadeUp .7s .30s ease both; }
  .fade-up-3 { animation: fadeUp .7s .45s ease both; }
  .fade-up-4 { animation: fadeUp .7s .60s ease both; }
`;
