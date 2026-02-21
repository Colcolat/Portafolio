import { Section, SectionTitle, VCard } from "../components/ui/index";
import { VaporImg } from "../components/decorative/index";
import { INTEREST_ITEMS } from "../data/portfolioData";
import { IMG_HAND } from "../data/images";
import { GALLERY } from "../data/images";

export function Interests() {
  return (
    <Section id="interests">
      <SectionTitle>INTERESES</SectionTitle>
      <div style={{ position:"absolute", left:"-40px", bottom:"30px", zIndex:2, opacity:.8 }}>
        <VaporImg src={IMG_HAND} size={100} animDelay="1.5s" glow="rgba(180,79,255,0.6)" style={{ animation:"floatYR 6s 1.5s ease-in-out infinite" }} />
      </div>
      <div style={{ display:"flex", flexWrap:"wrap", gap:"1.2rem", marginBottom:"2rem", position:"relative", zIndex:1 }}>
        {INTEREST_ITEMS.map(item => (
          <VCard key={item.title} accent={item.accent} title={item.title} style={{ flex:"1 1 220px" }}>
            <div style={{ textAlign:"center" }}>
              <img src={item.icon} alt={item.title} height={90} style={{ display:"block", margin:"0 auto .75rem", filter:`drop-shadow(0 0 10px ${item.accent})` }} />
              <p style={{ fontFamily:"'Space Mono', monospace", fontSize:".7rem", color:"rgba(200,160,220,.6)", lineHeight:1.7 }}>{item.desc}</p>
            </div>
          </VCard>
        ))}
      </div>
      <VCard accent="var(--purple)" style={{ textAlign:"center", padding:"2rem", position:"relative", zIndex:1 }}>
        <p style={{ fontFamily:"'VT323', monospace", fontSize:"1rem", color:"var(--purple)", letterSpacing:".2em", textShadow:"0 0 8px var(--purple)", marginBottom:"1.2rem" }}>░░ GALERÍA ░░</p>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(3, 1fr)", gap:".6rem" }}>
        {GALLERY.map((src, i) => (
          <div key={i} style={{ aspectRatio:"1", borderRadius:".3rem", overflow:"hidden", border:"1px solid rgba(180,79,255,.2)" }}>
            <img src={src} alt="" style={{ width:"100%", height:"100%", objectFit:"cover", opacity:.85 }} />
          </div>
        ))}
        </div>
      </VCard>
    </Section>
  );
}
