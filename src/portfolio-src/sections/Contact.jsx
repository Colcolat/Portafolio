import { Section, SectionTitle, VCard, RetroBtn } from "../components/ui/index";
import { VaporImg } from "../components/decorative/index";
import { IMG_BUST_DAVID, IMG_STAR } from "../data/images";

export function Contact() {
  return (
    <div style={{ position:"relative" }}>
      <div style={{ position:"absolute", left:"-10px", top:"30px", zIndex:2, opacity:.85 }}>
        <VaporImg src={IMG_BUST_DAVID} size={80} animDelay="1s" glow="rgba(255,45,155,0.5)" />
      </div>
      <div style={{ position:"absolute", right:"10px", top:"40px", zIndex:2, opacity:.6 }}>
        <VaporImg src={IMG_STAR} size={50} animDelay="3.5s" glow="rgba(180,79,255,0.5)" style={{ animation:"floatYR 7s 3.5s ease-in-out infinite" }} />
      </div>
      <Section id="contact">
        <SectionTitle>CONTACTO</SectionTitle>
        <VCard accent="var(--pink)" style={{ textAlign:"center", padding:"3rem 2rem" }}>
          <p style={{ fontFamily:"'Righteous', cursive", fontSize:"clamp(1.5rem,4vw,2rem)", color:"var(--light-pink)", textShadow:"0 0 15px var(--pink)", marginBottom:".75rem", letterSpacing:".1em" }}>¿HABLAMOS?</p>
          <p style={{ fontFamily:"'Space Mono', monospace", fontSize:".78rem", color:"rgba(200,160,220,.65)", lineHeight:1.9, maxWidth:480, margin:"0 auto 2.5rem" }}>
            Abierto a oportunidades profesionales, colaboraciones y proyectos interesantes. ¡No dudes en escribirme!
          </p>
          <div style={{ display:"flex", justifyContent:"center", gap:"1rem", flexWrap:"wrap" }}>
            <RetroBtn href="https://github.com/Colcolat" accent="var(--mauve)">⌥ GITHUB</RetroBtn>
            <RetroBtn href="https://www.linkedin.com/in/juan-jos%C3%A9-zapata-buenfil" accent="var(--cyan)">◈ LINKEDIN</RetroBtn>
            <RetroBtn href="mailto:tu@email.com" accent="var(--pink)" filled>✉ EMAIL</RetroBtn>
          </div>
        </VCard>
      </Section>
    </div>
  );
}
