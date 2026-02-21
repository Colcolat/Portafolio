import { useState } from "react";

// ─── GlitchText ───────────────────────────────────────────────────────────────
export function GlitchText({ children, style = {} }) {
  return (
    <div style={{ position: "relative", display: "inline-block", ...style }}>
      <span aria-hidden style={{ position:"absolute", inset:0, color:"var(--cyan)", animation:"glitch1 3.5s infinite steps(1)", opacity:.7, fontFamily:"inherit", fontSize:"inherit", fontWeight:"inherit", letterSpacing:"inherit" }}>{children}</span>
      <span aria-hidden style={{ position:"absolute", inset:0, color:"var(--pink)", animation:"glitch2 3.5s .05s infinite steps(1)", opacity:.7, fontFamily:"inherit", fontSize:"inherit", fontWeight:"inherit", letterSpacing:"inherit" }}>{children}</span>
      <span style={{ position:"relative", animation:"flicker 8s infinite" }}>{children}</span>
    </div>
  );
}

// ─── MarbleDivider ────────────────────────────────────────────────────────────
export function MarbleDivider() {
  return (
    <div style={{ height:3, borderRadius:2, margin:"0 0 2.5rem", background:"linear-gradient(90deg, var(--pink), var(--purple), var(--cyan), var(--hotpink), var(--purple))", backgroundSize:"300% 300%", animation:"marbleShift 4s ease infinite", boxShadow:"0 0 12px var(--pink), 0 0 24px rgba(255,45,155,.3)" }} />
  );
}

// ─── Section + SectionTitle ───────────────────────────────────────────────────
export function Section({ id, children }) {
  return (
    <section id={id} style={{ position:"relative", zIndex:1, maxWidth:920, margin:"0 auto", padding:"6rem 2rem" }}>
      {children}
    </section>
  );
}

export function SectionTitle({ children }) {
  return (
    <div style={{ marginBottom:"2rem" }}>
      <h2 style={{ fontFamily:"'Righteous', cursive", fontSize:"clamp(1.6rem,4vw,2.2rem)", color:"var(--light-pink)", letterSpacing:".15em", textShadow:"0 0 12px var(--pink), 0 0 30px rgba(255,45,155,.4)", marginBottom:".75rem" }}>
        <span style={{ color:"var(--pink)" }}>// </span>{children}
      </h2>
      <MarbleDivider />
    </div>
  );
}

// ─── VCard ────────────────────────────────────────────────────────────────────
export function VCard({ children, title = "", style = {}, accent = "var(--pink)" }) {
  const [h, setH] = useState(false);
  return (
    <div
      onMouseEnter={() => setH(true)}
      onMouseLeave={() => setH(false)}
      style={{
        background: "rgba(10,0,30,.92)",
        border: `2px solid ${h ? accent : "rgba(180,79,255,.45)"}`,
        borderRadius: "0.4rem",
        backdropFilter: "blur(10px)",
        transition: "all .2s",
        transform: h ? "translateY(-2px)" : "none",
        boxShadow: h
          ? `0 6px 30px ${accent}44, inset 0 0 30px rgba(0,0,0,.3)`
          : `inset 2px 2px 0px rgba(255,255,255,.04), inset -2px -2px 0px rgba(0,0,0,.4)`,
        overflow: "hidden",
        ...style,
      }}
    >
      <div style={{
        display:"flex", alignItems:"center", justifyContent:"space-between",
        padding:"0.35rem 0.7rem",
        background: h ? `linear-gradient(90deg, ${accent}33, rgba(20,0,60,.9))` : "linear-gradient(90deg, rgba(80,0,160,.6), rgba(10,0,30,.9))",
        borderBottom: `1px solid ${h ? accent + "66" : "rgba(180,79,255,.25)"}`,
        transition:"all .2s",
      }}>
        <div style={{ display:"flex", gap:"5px", alignItems:"center" }}>
          <span style={{ width:10, height:10, borderRadius:"50%", background:"#ff5f57", display:"block", boxShadow:"0 0 4px #ff5f57" }} />
          <span style={{ width:10, height:10, borderRadius:"50%", background:"#febc2e", display:"block", boxShadow:"0 0 4px #febc2e" }} />
          <span style={{ width:10, height:10, borderRadius:"50%", background:"#28c840", display:"block", boxShadow:"0 0 4px #28c840" }} />
        </div>
        {title && <span style={{ fontFamily:"'VT323', monospace", fontSize:".8rem", color:"rgba(255,192,232,.5)", letterSpacing:".1em", margin: "0 0.5rem"  }}>{title}</span>}
        <span style={{ fontFamily:"'VT323', monospace", fontSize:".75rem", color:"rgba(180,79,255,.4)", letterSpacing:".05em" }}></span>
      </div>
      <div style={{ padding:"1.2rem 1.5rem" }}>{children}</div>
    </div>
  );
}

// ─── RetroTag ─────────────────────────────────────────────────────────────────
export function RetroTag({ label, color = "var(--pink)" }) {
  const [h, setH] = useState(false);
  return (
    <span
      onMouseEnter={() => setH(true)}
      onMouseLeave={() => setH(false)}
      style={{
        fontFamily:"'VT323', monospace", fontSize:"1rem", letterSpacing:".08em",
        padding:".2rem .8rem", border:`1px solid ${h ? color : "rgba(255,45,155,.3)"}`,
        borderRadius:".2rem", color: h ? color : "rgba(255,192,232,.7)",
        background: h ? `${color}18` : "transparent",
        transition:"all .2s", cursor:"default",
        boxShadow: h ? `0 0 8px ${color}` : "none",
      }}
    >{label}</span>
  );
}

// ─── RetroBtn ─────────────────────────────────────────────────────────────────
export function RetroBtn({ children, href, accent = "var(--pink)", filled = false }) {
  const [h, setH] = useState(false);
  return (
    <a
      href={href}
      onMouseEnter={() => setH(true)}
      onMouseLeave={() => setH(false)}
      style={{
        fontFamily:"'VT323', monospace", fontSize:"1.05rem", letterSpacing:".12em",
        padding:".6rem 1.6rem", border:`2px solid ${accent}`, borderRadius:".2rem",
        color: filled ? (h ? accent : "var(--dark)") : (h ? "var(--dark)" : accent),
        background: filled ? (h ? "transparent" : accent) : (h ? accent : "transparent"),
        textDecoration:"none", transition:"all .2s", display:"inline-block",
        boxShadow: h ? `0 0 16px ${accent}, 0 0 32px ${accent}66` : `0 0 6px ${accent}88`,
      }}
    >{children}</a>
  );
}
