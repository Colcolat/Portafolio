import { PalmTree } from "../components/decorative/index";

export function Footer() {
  return (
    <footer style={{ position:"relative", zIndex:1, textAlign:"center", padding:"2rem", borderTop:"1px solid rgba(255,45,155,.15)" }}>
      <div style={{ position:"absolute", left:"2%",  bottom:"100%", opacity:.6  }}><PalmTree height={90} style={{ animationDelay:"0.5s" }} /></div>
      <div style={{ position:"absolute", left:"9%",  bottom:"100%", opacity:.35 }}><PalmTree height={60} style={{ animationDelay:"1.3s" }} /></div>
      <div style={{ position:"absolute", right:"2%", bottom:"100%", opacity:.6  }}><PalmTree height={85} flip style={{ animationDelay:"1.8s" }} /></div>
      <div style={{ position:"absolute", right:"9%", bottom:"100%", opacity:.35 }}><PalmTree height={65} flip style={{ animationDelay:"3s" }} /></div>
      <div style={{ height:2, background:"linear-gradient(90deg, transparent, var(--pink), var(--purple), var(--cyan), transparent)", marginBottom:"1.2rem", opacity:.5 }} />
      <p style={{ fontFamily:"'VT323', monospace", fontSize:".95rem", color:"rgba(255,45,155,.35)", letterSpacing:".2em" }}>
        JUAN JOSÉ ZAPATA BUENFIL · 2026 · HECHO CON ☕ Y ARCH LINUX
      </p>
    </footer>
  );
}
