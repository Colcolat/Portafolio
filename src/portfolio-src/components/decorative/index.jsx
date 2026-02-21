import { useEffect, useRef } from "react";
import { IMG_PALM1, IMG_PALM2 } from "../../data/images";

// ─── Retro Sun ────────────────────────────────────────────────────────────────
export function RetroSun({ size = 220, style = {} }) {
  const lines = 10;
  return (
    <svg width={size} height={size / 2 + 10} viewBox={`0 0 ${size} ${size / 2 + 10}`}
      style={{ animation: "sunPulse 3s ease-in-out infinite", ...style }}>
      <defs>
        <linearGradient id="sunGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%"   stopColor="#ff2d9b" />
          <stop offset="50%"  stopColor="#ff6ec7" />
          <stop offset="100%" stopColor="#b44fff" />
        </linearGradient>
        <clipPath id="sunClip"><rect x="0" y="0" width={size} height={size / 2} /></clipPath>
      </defs>
      <circle cx={size/2} cy={size/2} r={size/2-2} fill="url(#sunGrad)" clipPath="url(#sunClip)" />
      {Array.from({ length: lines }).map((_, i) => {
        const y = (size/2) * (i/lines);
        const h = (size/2) * (0.5/lines) * (1 + i * 0.18);
        return <rect key={i} x={0} y={y} width={size} height={h} fill="var(--dark)" clipPath="url(#sunClip)" />;
      })}
      <line x1={0} y1={size/2} x2={size} y2={size/2} stroke="#ff6ec7" strokeWidth="2"
        style={{ filter:"drop-shadow(0 0 6px #ff6ec7)" }} />
    </svg>
  );
}

// ─── Palm Tree ────────────────────────────────────────────────────────────────
export function PalmTree({ height = 200, flip = false, style = {}, variant = 0 }) {
  const palms = [IMG_PALM2, IMG_PALM1, IMG_PALM2];
  return (
    <img src={palms[variant % 3]} alt="" height={height}
      style={{ display:"block", transform: flip ? "scaleX(-1)" : "none", animation:"palmSway 4s ease-in-out infinite", transformOrigin:"bottom center", filter:"drop-shadow(0 0 8px rgba(255,45,155,0.3))", ...style }}
    />
  );
}

// ─── VaporImg ─────────────────────────────────────────────────────────────────
export function VaporImg({ src, size = 120, animDelay = "0s", glow = "rgba(180,79,255,0.55)", style = {} }) {
  return (
    <img src={src} alt="" width={size}
      style={{ display:"block", animation:`floatY 5s ${animDelay} ease-in-out infinite`, filter:`drop-shadow(0 0 12px ${glow}) drop-shadow(0 0 28px ${glow.replace("0.55","0.25")})`, imageRendering:"auto", ...style }}
    />
  );
}

// ─── WireframeCube ────────────────────────────────────────────────────────────
export function WireframeCube({ size = 100, style = {} }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100"
      style={{ animation:"floatYR 6s ease-in-out infinite", filter:"drop-shadow(0 0 8px var(--cyan))", ...style }}>
      <defs>
        <linearGradient id="wfGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%"   stopColor="#00f5ff" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#b44fff" stopOpacity="0.9" />
        </linearGradient>
      </defs>
      <rect x="30" y="15" width="45" height="45" fill="none" stroke="url(#wfGrad)" strokeWidth="1" opacity="0.4" />
      <rect x="15" y="30" width="45" height="45" fill="rgba(0,10,30,0.5)" stroke="url(#wfGrad)" strokeWidth="1.5" />
      <line x1="15" y1="30" x2="30" y2="15" stroke="url(#wfGrad)" strokeWidth="1" opacity="0.7" />
      <line x1="60" y1="30" x2="75" y2="15" stroke="url(#wfGrad)" strokeWidth="1" opacity="0.7" />
      <line x1="15" y1="75" x2="30" y2="60" stroke="url(#wfGrad)" strokeWidth="1" opacity="0.7" />
      <line x1="60" y1="75" x2="75" y2="60" stroke="url(#wfGrad)" strokeWidth="1" opacity="0.7" />
      <line x1="30" y1="30" x2="30" y2="75" stroke="url(#wfGrad)" strokeWidth="0.5" opacity="0.4" />
      <line x1="45" y1="30" x2="45" y2="75" stroke="url(#wfGrad)" strokeWidth="0.5" opacity="0.4" />
      <line x1="15" y1="45" x2="60" y2="45" stroke="url(#wfGrad)" strokeWidth="0.5" opacity="0.4" />
      <line x1="15" y1="60" x2="60" y2="60" stroke="url(#wfGrad)" strokeWidth="0.5" opacity="0.4" />
    </svg>
  );
}

// ─── WireframeDiamond ─────────────────────────────────────────────────────────
export function WireframeDiamond({ size = 80, style = {} }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100"
      style={{ animation:"floatY 7s 1s ease-in-out infinite", filter:"drop-shadow(0 0 8px var(--pink))", ...style }}>
      <defs>
        <linearGradient id="dmGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%"   stopColor="#ff2d9b" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#b44fff" stopOpacity="0.9" />
        </linearGradient>
      </defs>
      <polygon points="50,5 95,50 50,95 5,50"  fill="rgba(180,79,255,0.06)" stroke="url(#dmGrad)" strokeWidth="1.5" />
      <polygon points="50,20 80,50 50,80 20,50" fill="rgba(255,45,155,0.05)" stroke="url(#dmGrad)" strokeWidth="1"   opacity="0.6" />
      <line x1="5"  y1="50" x2="95" y2="50" stroke="url(#dmGrad)" strokeWidth="0.8" opacity="0.4" />
      <line x1="50" y1="5"  x2="50" y2="95" stroke="url(#dmGrad)" strokeWidth="0.8" opacity="0.4" />
      <line x1="20" y1="20" x2="80" y2="80" stroke="url(#dmGrad)" strokeWidth="0.5" opacity="0.3" />
      <line x1="80" y1="20" x2="20" y2="80" stroke="url(#dmGrad)" strokeWidth="0.5" opacity="0.3" />
    </svg>
  );
}

// ─── Background ───────────────────────────────────────────────────────────────
export function Background() {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let animId;
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    resize();
    window.addEventListener("resize", resize);
    const stars = Array.from({ length: 160 }, () => ({
      x: Math.random(), y: Math.random(),
      r: Math.random() * 1.2 + 0.2,
      op: Math.random(), opDir: Math.random() > 0.5 ? 1 : -1,
    }));
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      stars.forEach(s => {
        s.op += 0.004 * s.opDir;
        if (s.op > 1 || s.op < 0) s.opDir *= -1;
        ctx.beginPath();
        ctx.arc(s.x * canvas.width, s.y * canvas.height, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(220,180,255,${s.op * 0.7})`;
        ctx.fill();
      });
      animId = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(animId); window.removeEventListener("resize", resize); };
  }, []);
  return (
    <div style={{ position:"fixed", inset:0, zIndex:0, pointerEvents:"none", overflow:"hidden" }}>
      <canvas ref={canvasRef} style={{ position:"absolute", inset:0 }} />
      <div style={{ position:"absolute", bottom:0, left:0, right:0, height:"52vh", backgroundImage:"linear-gradient(rgba(255,45,155,.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,45,155,.3) 1px, transparent 1px)", backgroundSize:"60px 60px", animation:"gridMove 2.5s linear infinite", transform:"perspective(400px) rotateX(65deg)", transformOrigin:"bottom center", opacity:.85 }} />
      <div style={{ position:"absolute", bottom:"51vh", left:0, right:0, height:3, background:"linear-gradient(90deg, transparent, var(--pink), var(--cyan), var(--purple), var(--pink), transparent)", boxShadow:"0 0 30px 8px var(--pink), 0 0 60px 20px rgba(255,45,155,.3)", filter:"blur(1px)" }} />
      <div style={{ position:"absolute", top:"8%", left:"8%",  width:500, height:500, borderRadius:"50%", background:"radial-gradient(circle, rgba(180,79,255,.1) 0%, transparent 70%)" }} />
      <div style={{ position:"absolute", top:"5%", right:"5%", width:400, height:400, borderRadius:"50%", background:"radial-gradient(circle, rgba(0,245,255,.07) 0%, transparent 70%)" }} />
    </div>
  );
}
