import { GLOBAL_CSS } from "./styles/globalCss";
import { Background } from "./components/decorative/index";
import { Nav } from "./components/layout/Nav";
import { Hero } from "./sections/Hero";
import { About } from "./sections/About";
import { Skills } from "./sections/Skills";
import { Education } from "./sections/Education";
import { Interests } from "./sections/Interests";
import { Projects } from "./sections/Projects";
import { Contact } from "./sections/Contact";
import { Footer } from "./sections/Footer";

export default function Portfolio() {
  return (
    <>
      <style>{GLOBAL_CSS}</style>
      <Background />
      <Nav />
      <Hero />
      <About />
      <Skills />
      <Education />
      <Interests />
      <Projects />
      <Contact />
      <Footer />
    </>
  );
}
