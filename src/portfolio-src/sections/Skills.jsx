import { Section, SectionTitle, VCard } from "../components/ui/index";
import { PalmTree, VaporImg } from "../components/decorative/index";
import { SKILL_GROUPS } from "../data/portfolioData";
import { IMG_ARCH } from "../data/images";

export function Skills() {
  return (
    <div style={{ position:"relative" }}>
      <div style={{ position:"absolute", left:"-5%", top:"30%", zIndex:0, opacity:.3 }}>
        <PalmTree height={100} style={{ animationDelay:"2s" }} />
      </div>
      <div style={{ position:"absolute", right:"-20px", top:"60px", zIndex:2, opacity:.7 }}>
        <VaporImg src={IMG_ARCH} size={55} animDelay="1s" glow="rgba(0,180,255,0.7)" style={{ animation:"floatYR 6s 1s ease-in-out infinite" }} />
      </div>
      <Section id="skills">
        <SectionTitle>HABILIDADES</SectionTitle>
        <div style={{ display:"flex", flexDirection:"column", gap:"1.2rem" }}>
          {SKILL_GROUPS.map(g => (
            <VCard key={g.cat} accent={g.color} title={`skills/${g.cat.toLowerCase()}.config`}>
              <div style={{ display:"flex", flexWrap:"wrap", gap:".6rem", alignItems:"center" }}>
                {g.skills.map(s => (
                  <div key={s.label}
                    style={{ display:"flex", alignItems:"center", gap:".4rem", padding:".25rem .75rem", border:`1px solid ${g.color}55`, borderRadius:".2rem", background:`${g.color}0d`, transition:"all .2s", cursor:"default" }}
                    onMouseEnter={e=>{ e.currentTarget.style.borderColor=g.color; e.currentTarget.style.background=`${g.color}22`; e.currentTarget.style.boxShadow=`0 0 8px ${g.color}`; }}
                    onMouseLeave={e=>{ e.currentTarget.style.borderColor=`${g.color}55`; e.currentTarget.style.background=`${g.color}0d`; e.currentTarget.style.boxShadow="none"; }}
                  >
                    {s.logo && <img src={s.logo} alt="" height={30} style={{ display:"block", filter:"drop-shadow(0 0 3px currentColor)" }} />}
                    <span style={{ fontFamily:"'VT323', monospace", fontSize:"1rem", letterSpacing:".08em", color:"rgba(255,192,232,.8)" }}>{s.label}</span>
                  </div>
                ))}
              </div>
            </VCard>
          ))}
        </div>
      </Section>
    </div>
  );
}
