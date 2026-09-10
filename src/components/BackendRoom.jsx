import { profile, projects, skillGroups } from '../data/portfolio';
import './BackendRoom.css';

const languages = skillGroups.find((group) => group.title === 'Programming Languages').skills;
const backendFields = [
  { label: 'Languages', skills: languages.filter((skill) => !skill.includes('PostgreSQL')) },
  { label: 'Frameworks & ORMs', skills: skillGroups.find((group) => group.title === 'Frameworks & ORMs').skills },
  { label: 'Data', skills: languages.filter((skill) => skill.includes('PostgreSQL')) },
  { label: 'Architecture & Practices', skills: skillGroups.find((group) => group.title === 'Architecture & Practices').skills },
];
const featuredProject = projects.find((project) => project.id === 'skillvault');

// An abstract board, not a diagram of a project's infrastructure.
function CircuitArt() {
  return <svg viewBox="0 0 200 100" aria-hidden="true" focusable="false" className="backend-room__circuit">
    <g fill="none" stroke="currentColor" strokeWidth="1">
      <path d="M6 18h37l17 17h15M6 50h69M6 82h37l17-17h15M125 35h15l17-17h37M125 50h69M125 65h15l17 17h37" />
      <path d="M84 25V8M100 25V0M116 25V8M84 75v17M100 75v25M116 75v17" />
      <rect x="75" y="25" width="50" height="50" rx="3" />
      <rect x="81" y="31" width="38" height="38" rx="1" />
      <circle cx="6" cy="18" r="3" /><circle cx="6" cy="50" r="3" /><circle cx="6" cy="82" r="3" />
      <circle cx="194" cy="18" r="3" /><circle cx="194" cy="50" r="3" /><circle cx="194" cy="82" r="3" />
    </g>
    <path fill="currentColor" d="M92 40h-4v7h-3v6h3v7h4v-4h-2v-5h-2v-2h2v-5h2zm16 0h4v7h3v6h-3v7h-4v-4h2v-5h2v-2h-2v-5h-2z" />
  </svg>;
}

export default function BackendRoom({ t }) {
  return <div className="backend-room">
    <p className="backend-room__intro">{t('The unseen part matters, too.')}</p>
    <p className="backend-room__description">{t('A closer look at the technologies and practices behind my work.')}</p>

    <section className="backend-room__plate" aria-label={t('Backend field notes')}>
      <div className="backend-room__plate-header">
        <span>{t('BACKEND / FIELD NOTES')}</span>
        <span aria-hidden="true">{'{ }'}</span>
      </div>
      <div className="backend-room__plate-lead">
        <div>
          <p className="backend-room__specialty">{t('Backend Developer')}</p>
          <p className="backend-room__signature">{profile.shortName}</p>
        </div>
        <CircuitArt />
      </div>
      <dl className="backend-room__fields">
        {backendFields.map((field, index) => <div className="backend-room__field" key={field.label}>
          <dt><span aria-hidden="true">0{index + 1}</span>{t(field.label)}</dt>
          <dd>{field.skills.map((skill) => <span key={skill}>{t(skill)}</span>)}</dd>
        </div>)}
      </dl>
      <p className="backend-room__plate-note"><span aria-hidden="true">↳</span>{t(profile.quote)}</p>
    </section>

    <section className="backend-room__project" aria-label={t('In practice')}>
      <div className="backend-room__project-heading">
        <p>{t('IN PRACTICE')}</p>
        <h3>{featuredProject.title}</h3>
      </div>
      <div className="backend-room__project-details">
        <p>{t(featuredProject.description)}</p>
        <ul aria-label={t('Project technologies')}>
          {featuredProject.tech.map((tool) => <li key={tool}>{tool}</li>)}
        </ul>
        <a href={featuredProject.githubLink} target="_blank" rel="noreferrer">
          {t('Inspect the source')}<span aria-hidden="true">↗</span>
          <span className="sr-only"> ({t('opens in a new tab')})</span>
        </a>
      </div>
    </section>
  </div>;
}
