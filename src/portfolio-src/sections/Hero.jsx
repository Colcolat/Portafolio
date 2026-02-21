import { GlitchText, RetroBtn } from "../components/ui/index";
import { Typewriter } from "../components/ui/Typewriter";
import { RetroSun, PalmTree, VaporImg, WireframeCube, WireframeDiamond } from "../components/decorative/index";
import { IMG_ISLAND, IMG_STAR } from "../data/images";

export function Hero() {
  return (
    <div style={{ position:"relative", zIndex:1, minHeight:"100vh", display:"flex", flexDirection:"column", justifyContent:"center", alignItems:"center", textAlign:"center", padding:"2rem" }}>
      <div style={{ position:"absolute", left:0, right:0, height:"3px", background:"linear-gradient(to bottom, transparent, rgba(255,110,199,.4), transparent)", animation:"scanLine 6s linear infinite", pointerEvents:"none", zIndex:2 }} />
      <div style={{ position:"absolute", top:"8%", left:"50%", transform:"translateX(-50%)", zIndex:0, opacity:0.85 }}><RetroSun size={280} /></div>
      <div style={{ position:"absolute", top:"6%", left:"5%", zIndex:0, opacity:.7 }}><VaporImg src={IMG_ISLAND} size={130} animDelay="1s" glow="rgba(255,110,199,0.5)" style={{ animation:"floatY 6s 1s ease-in-out infinite" }} /></div>
      <div style={{ position:"absolute", top:"4%", right:"4%", zIndex:0 }}><VaporImg src={IMG_STAR} size={100} animDelay="0.5s" glow="rgba(0,245,255,0.5)" style={{ animation:"floatYR 7s 0.5s ease-in-out infinite" }} /></div>
      <div style={{ position:"absolute", bottom:"48vh", left:"1%",   zIndex:0 }}><PalmTree height={180} variant={1} /></div>
      <div style={{ position:"absolute", bottom:"48vh", right:"1%",  zIndex:0 }}><PalmTree height={160} flip variant={2} style={{ animationDelay:"1.5s" }} /></div>
      <div style={{ position:"absolute", bottom:"48vh", left:"12%",  zIndex:0, opacity:.8 }}><PalmTree height={130}  variant={0} style={{ animationDelay:"0.8s" }} /></div>
      <div style={{ position:"absolute", bottom:"48vh", right:"11%", zIndex:0, opacity:.8 }}><PalmTree height={140}  flip variant={1} style={{ animationDelay:"2s" }} /></div>
      <div style={{ position:"absolute", bottom:"48vh", left:"22%",  zIndex:0, opacity:.5 }}><PalmTree height={100}  variant={2} style={{ animationDelay:"1.2s" }} /></div>
      <div style={{ position:"absolute", bottom:"48vh", right:"21%", zIndex:0, opacity:.5 }}><PalmTree height={105}  flip variant={0} style={{ animationDelay:"2.8s" }} /></div>
      <div style={{ position:"absolute", top:"12%", right:"8%", zIndex:0 }}><WireframeCube size={90} /></div>
      <div style={{ position:"absolute", top:"18%", left:"6%",  zIndex:0 }}><WireframeDiamond size={70} /></div>

      <div style={{ position:"relative", zIndex:1, width:"100%" }}>
        <p className="fade-up" style={{ fontFamily:"'VT323', monospace", fontSize:"1rem", letterSpacing:".4em", color:"var(--mauve)", marginBottom:"1.2rem" }}>▶ CARGANDO PERFIL... BIENVENIDO AL SISTEMA ◀</p>
        <div className="fade-up-1">
          <GlitchText style={{ fontFamily:"'Righteous', cursive", fontSize:"clamp(2.8rem,9vw,6.5rem)", color:"var(--light-pink)", letterSpacing:".05em", lineHeight:1.1, display:"block" }}>JUAN JOSÉ</GlitchText>
          <GlitchText style={{ fontFamily:"'Righteous', cursive", fontSize:"clamp(2.8rem,9vw,6.5rem)", color:"var(--hotpink)", letterSpacing:".05em", lineHeight:1.1, display:"block", textShadow:"0 0 20px var(--pink), 0 0 50px rgba(255,45,155,.4)" }}>ZAPATA BUENFIL</GlitchText>
        </div>
        <div className="fade-up-2" style={{ marginTop:"1.5rem", minHeight:"2.5rem" }}>
          <Typewriter texts={["JAVA & C# DEVELOPER","SOFTWARE ENG. STUDENT","LINUX ENTHUSIAST","IEEE TREASURER","PROBLEM SOLVER"]} />
        </div>
        <p className="fade-up-3" style={{ fontFamily:"'VT323', monospace", fontSize:"1.1rem", letterSpacing:".2em", color:"var(--mauve)", marginTop:"1.2rem" }}>📍 MÉRIDA, YUCATÁN, MX</p>
        <div className="fade-up-4" style={{ display:"flex", gap:"1rem", marginTop:"2.5rem", flexWrap:"wrap", justifyContent:"center" }}>
          <RetroBtn href="#about" filled>▶ EXPLORAR</RetroBtn>
          <RetroBtn href="#contact" accent="var(--cyan)">✉ CONTACTAR</RetroBtn>
        </div>
      </div>

      <div style={{ position:"absolute", bottom:"2.5rem", display:"flex", flexDirection:"column", alignItems:"center", gap:".4rem" }}>
        <div style={{ width:1, height:40, background:"linear-gradient(to bottom, var(--pink), transparent)" }} />
        <span style={{ fontFamily:"'VT323', monospace", fontSize:".9rem", color:"rgba(255,45,155,.5)", letterSpacing:".2em" }}>SCROLL▼</span>
      </div>
    </div>
  );
}
