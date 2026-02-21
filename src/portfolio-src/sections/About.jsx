import { Section, SectionTitle, VCard } from "../components/ui/index";
import { VaporImg } from "../components/decorative/index";
import { ABOUT_CARDS } from "../data/portfolioData";
import { IMG_BUST_GLITCH, IMG_STAR } from "../data/images";

export function About() {
  return (
    <div style={{ position:"relative" }}>
      <div style={{ position:"absolute", left:"-10px", top:"60px", zIndex:0, opacity:.55 }}>
        <VaporImg src={IMG_BUST_GLITCH} size={85} glow="rgba(180,79,255,0.6)" />
      </div>
      <div style={{ position:"absolute", right:"-15px", top:"10px", zIndex:0, opacity:.4 }}>
        <VaporImg src={IMG_STAR} size={55} animDelay="1.5s" glow="rgba(0,245,255,0.5)" style={{ animation:"floatYR 6s 1.5s ease-in-out infinite" }} />
      </div>
      <Section id="about">
        <SectionTitle>SOBRE MÍ</SectionTitle>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"1.2rem" }}>
          <VCard style={{ gridColumn:"1 / -1" }} title="about.txt">
            <p style={{ fontFamily:"'Space Mono', monospace", fontSize:".82rem", lineHeight:2, color:"rgba(255,192,232,.8)" }}>
              Estudiante de Ingeniería de Software con bases sólidas en{" "}
              <span style={{ color:"var(--cyan)", textShadow:"0 0 6px var(--cyan)" }}>Java y C#</span> y entornos{" "}
              <span style={{ color:"var(--cyan)", textShadow:"0 0 6px var(--cyan)" }}>Linux</span>.
              Aprovecho mi formación lógico-matemática para construir código estructurado y eficiente.
              Busco una oportunidad donde aplicar mis habilidades en{" "}
              <span style={{ color:"var(--pink)", textShadow:"0 0 6px var(--pink)" }}>Programación Orientada a Objetos</span>{" "}
              y contribuir al desarrollo de soluciones tecnológicas de impacto real.
            </p>
          </VCard>
          {ABOUT_CARDS.map(c => (
          <VCard key={c.label} accent={c.accent} title={c.label.toLowerCase().replace(/ /g,"_")+".exe"}>
            <div style={{ display:"flex", gap:"1rem", alignItems:"flex-start" }}>
              {c.img && <img src={c.img} alt="" height={c.label==="PROBLEM SOLVER"?60:60}
                style={{ flexShrink:0, marginTop:2, filter:`drop-shadow(0 0 5px ${c.accent})`,
                borderRadius: c.label==="PROBLEM SOLVER"?"50%":"0" }} />}
              <div>
                <h3 style={{ fontFamily:"'VT323', monospace", fontSize:"1.1rem", color:c.accent, letterSpacing:".1em", textShadow:`0 0 8px ${c.accent}`, marginBottom:".3rem" }}>{c.label}</h3>
                <p style={{ fontFamily:"'Space Mono', monospace", fontSize:".7rem", color:"rgba(200,160,220,.65)", lineHeight:1.7 }}>{c.desc}</p>
              </div>
            </div>
          </VCard>
          ))}
        </div>
      </Section>
    </div>
  );
}
