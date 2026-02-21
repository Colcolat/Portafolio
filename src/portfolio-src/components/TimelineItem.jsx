import { VCard } from "./ui/index";

export function TimelineItem({ date, title, institution, description, badge }) {
  return (
    <div style={{ display:"flex", gap:"1.5rem", marginBottom:"2rem" }}>
      <div style={{ display:"flex", flexDirection:"column", alignItems:"center" }}>
        <div style={{ width:12, height:12, borderRadius:"50%", flexShrink:0, marginTop:4, background:"var(--pink)", boxShadow:"0 0 10px var(--pink), 0 0 20px var(--pink)" }} />
        <div style={{ width:1, flex:1, marginTop:6, background:"rgba(255,45,155,.25)" }} />
      </div>
      <VCard style={{ flex:1 }}>
        <div style={{ display:"flex", justifyContent:"space-between", flexWrap:"wrap", gap:".4rem", marginBottom:".4rem" }}>
          <span style={{ fontFamily:"'VT323', monospace", fontSize:".95rem", color:"var(--cyan)", letterSpacing:".1em" }}>{date}</span>
          {badge && <span style={{ fontFamily:"'VT323', monospace", fontSize:".85rem", padding:".1rem .6rem", border:"1px solid rgba(0,245,255,.4)", borderRadius:".2rem", color:"var(--cyan)", boxShadow:"0 0 6px var(--cyan)" }}>{badge}</span>}
        </div>
        <h3 style={{ fontFamily:"'Righteous', cursive", color:"var(--light-pink)", fontSize:"1rem", letterSpacing:".08em", marginBottom:".2rem" }}>{title}</h3>
        <p style={{ fontFamily:"'VT323', monospace", fontSize:".95rem", color:"var(--mauve)", marginBottom:description?".5rem":0 }}>{institution}</p>
        {description && <p style={{ fontFamily:"'Space Mono', monospace", fontSize:".7rem", color:"rgba(200,160,220,.6)", lineHeight:1.8 }}>{description}</p>}
      </VCard>
    </div>
  );
}
