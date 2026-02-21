import { Section, SectionTitle, VCard, RetroTag } from "../components/ui/index";
import { PROJECTS } from "../data/portfolioData";

export function Projects() {
  return (
    <Section id="projects">
      <SectionTitle>PROYECTOS</SectionTitle>
      <div style={{ display:"flex", flexDirection:"column", gap:"1.2rem" }}>
        {PROJECTS.map(p => (
          <VCard key={p.title} accent={p.accent} style={{ display:"flex", gap:"1.5rem", alignItems:"flex-start" }}>
            <span style={{ fontSize:"2rem", flexShrink:0 }}>{p.icon}</span>
            <div style={{ flex:1 }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:".4rem" }}>
                <h3 style={{ fontFamily:"'VT323', monospace", fontSize:"1.2rem", color:p.accent, letterSpacing:".1em", textShadow:`0 0 8px ${p.accent}` }}>{p.title}</h3>
                {p.link && (
                <a href={p.href} target="_blank" rel="noreferrer"
                  style={{ fontFamily:"'VT323', monospace", fontSize:".9rem", color:"var(--cyan)", textDecoration:"none" }}>
                  ↗ VER DEMO
                </a>
              )}
              </div>
              <p style={{ fontFamily:"'Space Mono', monospace", fontSize:".72rem", color:"rgba(200,160,220,.65)", lineHeight:1.8, marginBottom:".8rem" }}>{p.desc}</p>
              <div style={{ display:"flex", gap:".5rem", flexWrap:"wrap" }}>
                {p.tags.map(t => <RetroTag key={t} label={t} color={p.accent} />)}
              </div>
            </div>
          </VCard>
        ))}
      </div>
    </Section>
  );
}
