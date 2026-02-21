import { useState, useEffect } from "react";

export function Nav() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  const links = ["SOBRE MÍ","SKILLS","EDUCACIÓN","INTERESES","CONTACTO"];
  const hrefs = ["#about","#skills","#education","#interests","#contact"];

  return (
    <nav style={{ position:"fixed", top:0, left:0, right:0, zIndex:100, padding:"0.9rem 2.5rem", background:scrolled?"rgba(10,0,32,.92)":"transparent", backdropFilter:scrolled?"blur(14px)":"none", borderBottom:scrolled?"1px solid rgba(255,45,155,.3)":"none", transition:"all .4s", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
      <span style={{ fontFamily:"'Righteous', cursive", fontSize:"1.3rem", color:"var(--pink)", textShadow:"0 0 10px var(--pink), 0 0 20px var(--pink)", letterSpacing:".08em" }}>
        JJ<span style={{ color:"var(--cyan)", textShadow:"0 0 10px var(--cyan)" }}>.exe</span>
      </span>
      <div style={{ display:"flex", gap:"2rem" }}>
        {links.map((l, i) => (
          <a key={l} href={hrefs[i]}
            style={{ fontFamily:"'VT323', monospace", fontSize:"1rem", color:"rgba(255,192,232,.6)", textDecoration:"none", letterSpacing:".12em", transition:"all .2s" }}
            onMouseEnter={e => { e.target.style.color="var(--cyan)"; e.target.style.textShadow="0 0 8px var(--cyan)"; }}
            onMouseLeave={e => { e.target.style.color="rgba(255,192,232,.6)"; e.target.style.textShadow="none"; }}
          >{l}</a>
        ))}
      </div>
    </nav>
  );
}
