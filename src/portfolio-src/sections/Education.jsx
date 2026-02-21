import { Section, SectionTitle } from "../components/ui/index";
import { PalmTree, VaporImg } from "../components/decorative/index";
import { TimelineItem } from "../components/TimelineItem";
import { EDUCATION_ITEMS } from "../data/portfolioData";
import { IMG_BUST_CRY, IMG_ARCH } from "../data/images";

export function Education() {
  return (
    <div style={{ position:"relative" }}>
      <div style={{ position:"absolute", left:"-5%",  top:"20%", zIndex:0, opacity:.25 }}><PalmTree height={110} style={{ animationDelay:"3.5s" }} /></div>
      <div style={{ position:"absolute", right:"-5%", top:"10%", zIndex:0, opacity:.25 }}><PalmTree height={95} flip style={{ animationDelay:"1s" }} /></div>
      <div style={{ position:"absolute", right:"-10px", bottom:"80px", zIndex:2, opacity:.85 }}><VaporImg src={IMG_BUST_CRY} size={75} animDelay="2s" glow="rgba(0,245,255,0.6)" /></div>
      <div style={{ position:"absolute", left:"10px",  bottom:"40px", zIndex:2, opacity:.5  }}><VaporImg src={IMG_ARCH} size={42} animDelay="3s" glow="rgba(0,180,255,0.7)" style={{ animation:"floatYR 8s 3s ease-in-out infinite" }} /></div>
      <Section id="education">
        <SectionTitle>EDUCACIÓN & CERTIFICACIONES</SectionTitle>
        <div style={{ paddingLeft:".5rem" }}>
          {EDUCATION_ITEMS.map((item, i) => <TimelineItem key={i} {...item} />)}
        </div>
      </Section>
    </div>
  );
}
