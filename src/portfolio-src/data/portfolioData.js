import {
  IMG_IEEE, IMG_ARCH, IMG_GGJ, IMG_MONKEY,
  IMG_JAVA, IMG_PYTHON, IMG_CSHARP,
} from "./images";

// ─── About Cards ──────────────────────────────────────────────────────────────
export const ABOUT_CARDS = [
  { img: IMG_IEEE,   label: "TESORERO IEEE",     desc: "Gestión de recursos y logística de eventos académicos", accent: "var(--pink)" },
  { img: IMG_ARCH,   label: "AUTODIDACTA LINUX", desc: "Arch Linux user. Si funciona, no lo toques.",           accent: "var(--cyan)" },
  { img: IMG_MONKEY, label: "PROBLEM SOLVER",    desc: "Enfoque lógico y estructurado ante cada desafío",       accent: "var(--purple)" },
  { img: IMG_GGJ,    label: "AGILE MINDSET",     desc: "Global Game Jam 2026: prototipo completo en 48 horas", accent: "var(--hotpink)" },
];

// ─── Skills ───────────────────────────────────────────────────────────────────
export const SKILL_GROUPS = [
  {
    cat: "LENGUAJES", color: "var(--cyan)",
    skills: [
      { label: "Java",   logo: IMG_JAVA },
      { label: "Python", logo: IMG_PYTHON },
      { label: "C#",     logo: IMG_CSHARP },
      { label: "HTML",   logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/html5/html5-original.svg" },
    ],
  },
  {
    cat: "HERRAMIENTAS", color: "var(--pink)",
    skills: [
      { label: "Linux / Arch", logo: IMG_ARCH },
      { label: "Git",          logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/git/git-original.svg" },
      { label: "Vim",          logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/vim/vim-original.svg" },
      { label: "VS Code",      logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/vscode/vscode-original.svg" },
      { label: "GitHub",       logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/github/github-original.svg" },
      { label: "MS Excel",     logo: "https://img.icons8.com/color/48/microsoft-excel-2019--v1.png" },
    ],
  },
  {
    cat: "CONCEPTOS", color: "var(--purple)",
    skills: [
      { label: "OOP",                  logo: null },
      { label: "Estructuras de Datos", logo: null },
      { label: "Algoritmos",           logo: null },
      { label: "SQL",                  logo: null },
      { label: "Lógica Booleana",      logo: null },
      { label: "Bases de Datos",       logo: null },
      { label: "Admin. de proyectos",  logo: null },
    ],
  },
  {
    cat: "IDIOMAS", color: "var(--hotpink)",
    skills: [
      { label: "Español (Nativo)",       logo: null },
      { label: "Inglés B1 — Intermedio", logo: null },
    ],
  },
];

// ─── Education Timeline ───────────────────────────────────────────────────────
export const EDUCATION_ITEMS = [
  {
    date: "SEPT 2025 → SEPT 2029",
    title: "Ingeniería en Software",
    institution: "Tecnológico de Software",
    description: "Arch Linux · POO · Administración de proyectos · Linux · HTML · C# · Git · Java · Python · GitHub · Inglés · Programación",
  },
  {
    date: "AGO 2020 → JUL 2025",
    title: "Bachillerato — Matemáticas e Informática",
    institution: "Universidad Autónoma de Yucatán (UADY)",
    badge: "RAÍCES CIENTÍFICAS",
    description: "Arch Linux · SQL · HTML · Microsoft Excel · Inglés · Programación. Seleccionado para programa gubernamental de ciencias.",
  },
  {
    date: "ENE 2023 → PRESENTE",
    title: "Certificado de Inglés — Nivel B1",
    institution: "Interlingua",
  },
  {
    date: "FEB 2026",
    title: "Certificado de Participación — Game Jam 2026",
    institution: "The Global Game Jam",
    badge: "GLOBAL GAME JAM",
    description: "C# · Programación · Diseño de mecánicas · Game Design · Trabajo en equipo. Prototipo desarrollado en 48 horas.",
  },
];

// ─── Interests ────────────────────────────────────────────────────────────────
export const INTEREST_ITEMS = [
  { icon: IMG_GGJ,  title: "GLOBAL GAME JAM", desc: "Fotos del evento internacional, junto a la experiencia de este.", accent: "var(--purple)" },
  { icon: IMG_ARCH, title: "ARCH LINUX",       desc: "Mi setup diario. Screenshots y dotfiles.",                              accent: "var(--cyan)" },
  { icon: IMG_IEEE, title: "IEEE",             desc: "Tesorero del Student Branch. Gestión de recursos y eventos académicos.",            accent: "var(--pink)" },
];

// ─── Projects ─────────────────────────────────────────────────────────────────
export const PROJECTS = [
  {
    icon: "",
    title: "GLOBAL GAME JAM 2026",
    desc: "Prototipo de videojuego en 48 hrs. Diseño de mecánicas y programación colaborativa con equipo multidisciplinario. Certificado oficial feb. 2026.",
    tags: ["C#", "Game Design", "Agile", "Teamwork"],
    accent: "var(--purple)",
  },
  {
    icon: "",
    title: "PORTAFOLIO PERSONAL",
    desc: "Portafolio personal hecho con mucha fe y poca experiencia en el Frontend",
    tags: ["React", "Vite", "JavaScript", "Responsive Design"],
    accent: "var(--pink)",
    link: true,
    href: "https://github.com/Colcolat/Portafolio.git"
  },
  {
    icon: "",
    title: "PORTAFOLIO WEB ACADÉMICO",
    desc: "Sitio de documentación desplegado en GitHub Pages. Markdown + HTML para estructurar contenido, Git para control de versiones.",
    tags: ["HTML", "Markdown", "Git", "GitHub Pages"],
    accent: "var(--cyan)",
    link: true,
    href: "https://github.com/Colcolat/Portafolio-de-Evidencias-Juan-Zapata.git"
  },
];
