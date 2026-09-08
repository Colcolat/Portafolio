// Original portfolio content, preserved independently of its presentation.
const asset = (path) => `${import.meta.env.BASE_URL}${path}`;

export const profile = {
  name: 'Juan Jose Zapata Buenfil',
  shortName: 'Juan Jose Zapata',
  role: 'Software Engineer · Backend Developer',
  summary: 'Software Engineer focused on Backend development with C#, .NET, Java, PostgreSQL and clean code methodologies.',
  about: "I build software. I'm drawn to problems that require both logical thinking and creativity, designing clean architecture, automating something tedious, or just making code that makes sense to the next person who reads it.",
  quote: 'I build software with purpose and logic.',
  email: 'jj.zapatabuenfil@gmail.com',
  github: 'https://github.com/Colcolat',
  linkedin: 'https://www.linkedin.com/in/jjzb',
  cvEs: asset('cv-es.pdf'),
  cvEn: asset('cv-en.pdf'),
};

export const projects = [
  {
    id: 'skillvault',
    title: 'SkillVault',
    description: 'Backend certification tracker platform. Implemented with .NET Core and Hexagonal Architecture.',
    tech: ['.NET Core', 'C#', 'AWS', 'PostgreSQL'],
    liveLink: 'http://skillvault-env.eba-rb388z7p.us-east-1.elasticbeanstalk.com/',
    githubLink: 'https://github.com/Colcolat/SkillVault',
    liveDemoText: 'Open Web App',
    image: asset('projects/SkillVault.png'),
    category: 'Web/Apps',
  },
  {
    id: 'pokebattle',
    title: 'PokéBattle Terminal',
    description: 'Terminal-based Pokémon battle game developed in Java using Object-Oriented Programming.',
    tech: ['Java', 'OOP', 'Terminal'],
    liveLink: null,
    githubLink: 'https://github.com/Colcolat/POKEMON_ProyectoFinal.git',
    image: asset('projects/PokeBattle.png'),
    category: 'Web/Apps',
  },
  {
    id: 'portfolio',
    title: 'Portfolio',
    description: 'My personal interactive portfolio built with React and 3D elements.',
    tech: ['React', 'Tailwind CSS', 'Framer Motion', 'Three.js'],
    liveLink: null,
    githubLink: 'https://github.com/Colcolat/Portafolio',
    image: asset('projects/Portafolio.png'),
    category: 'Web/Apps',
  },
];

export const certificates = [
  {
    id: 'ef-set-c1',
    title: 'EF SET C1 (Advanced)',
    issuer: 'EF Standard English Test',
    date: 'AUG, 2026',
    link: 'https://cert.efset.org/es/E6A8Rq',
    image: asset('certificates/EF SET Certificate_page-0001.jpg'),
  },
  {
    id: 'aws-cloud-practitioner',
    title: 'AWS Cloud Quest: Cloud Practitioner',
    issuer: 'Amazon Web Services',
    date: 'MAY, 2026',
    link: 'https://www.credly.com/badges/ecbf3d11-16c4-4595-83b3-945242488d8f/linked_in_profile',
    image: asset('certificates/CloudPractitioner_page-0001.jpg'),
  },
  {
    id: 'sql-fundamentals',
    title: 'SQL Fundamentals',
    issuer: 'DataCamp',
    date: 'JUL, 2026',
    link: 'https://www.datacamp.com/completed/statement-of-accomplishment/track/42313307504dccef526d95731e72002fcd167a05',
    image: asset('certificates/SQL Fundamentals_page-0001.jpg'),
  },
  {
    id: 'google-ai',
    title: 'Google AI Essentials',
    issuer: 'Google',
    date: 'JUL, 2026',
    link: 'https://coursera.org/share/5b90f4931579c62b7ce23e16f5f12e01',
    image: asset('certificates/Google AI_page-0001.jpg'),
  },
  {
    id: 'claude-101',
    title: 'Claude 101',
    issuer: 'Anthropic / Skilljar',
    date: 'JUL, 2026',
    link: 'https://verify.skilljar.com/c/3xvhsqiiqjf7',
    image: asset('certificates/Claude101_page-0001.jpg'),
  },
  {
    id: 'aws-cloud-operations',
    title: 'AWS Academy Graduate - Cloud Operations',
    issuer: 'Amazon Web Services',
    date: 'JUL, 2026',
    link: 'https://www.credly.com/badges/75d0efb4-63df-4c13-95cf-8e744595ce78/public_url',
    image: asset('certificates/AWS_Academy_Graduate___Cloud_Operations___Training_Badge_Badge20260812-20-idncaz_page-0001.jpg'),
  },
  {
    id: 'aws-microservices-cicd',
    title: 'AWS Academy Graduate - Microservices & CI/CD',
    issuer: 'Amazon Web Services',
    date: 'JUL, 2026',
    link: 'https://www.credly.com/badges/7a30b13b-b606-4be5-b194-73ad7f663e24',
    image: asset('certificates/AWS_Academy_Graduate___Microservices_and_CI_CD_Pipeline_Builder___Training_Badge_Badge20260812-21-2j3tov_page-0001.jpg'),
  },
  {
    id: 'aws-devops',
    title: 'Getting Started with DevOps on AWS',
    issuer: 'Amazon Web Services',
    date: 'MAY, 2026',
    // The original portfolio does not provide an external verification URL.
    link: '#',
    image: asset('certificates/DevOpsAWS_page-0001.jpg'),
  },
  {
    id: 'network-technician',
    title: 'Network Technician Career Path',
    issuer: 'Cisco',
    date: 'MAY, 2026',
    link: 'https://www.credly.com/badges/ebb7f680-fc7b-46c4-b2ad-c94b6ce3e1cc/linked_in_profile',
    image: asset('certificates/NetworkTechnicianCareerPathUpdate20260812-21-p4tbr0_page-0001.jpg'),
  },
  {
    id: 'english-business',
    title: 'English for Business and Entrepreneurship',
    issuer: 'U.S. Department of State',
    // Kept exactly as supplied by the original portfolio.
    date: 'OCT, 2026',
    link: 'https://badges.parchment.com/public/assertions/Kd1tZkcaReSpZujr15DoIA',
    image: asset('certificates/EnglishForBusiness_page-0001.jpg'),
  },
  {
    id: 'java-basic',
    title: 'Java (Basic) Certificate',
    issuer: 'HackerRank',
    date: 'MAY, 2026',
    link: 'https://www.hackerrank.com/certificates/5cdaee42e597',
    image: asset('certificates/java_basic certificate_page-0001.jpg'),
  },
];

export const skillGroups = [
  {
    title: 'Programming Languages',
    skills: ['C#', 'Java', 'Python', 'SQL (PostgreSQL)'],
  },
  {
    title: 'Frameworks & ORMs',
    skills: ['.NET Core / ASP.NET', 'Spring Boot', 'Entity Framework Core'],
  },
  {
    title: 'Architecture & Practices',
    skills: ['Hexagonal Architecture', 'OOP / SOLID', 'Design Patterns', 'RESTful APIs', 'Clean Code'],
  },
  {
    title: 'Cloud & DevOps',
    skills: ['AWS (EC2, RDS, IAM)', 'Git & GitHub', 'GitHub Actions', 'Docker'],
  },
  {
    title: 'Tools & OS',
    skills: ['VS Code & Rider', 'IntelliJ IDEA', 'Claude Code', 'Linux (Arch)'],
  },
  {
    title: 'Fundamentals & Others',
    skills: ['Computer Architecture', 'Networks', 'Unity', 'AI Tools'],
  },
];
