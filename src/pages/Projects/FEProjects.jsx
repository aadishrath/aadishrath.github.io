import { useState } from 'react';
import ProjectCard from '../../components/ProjectCard/ProjectCard';
import ProjectModal from '../../components/ProjectModal/ProjectModal';
import {feProjects} from '../../data/projectsBuilt';
import './Projects.css';

// Project page + modal
export default function FEProjects() {
  const [selected, setSelected] = useState(null);

  return (
    <div className="px-6 py-10 projects-page">
      <h2 className="project-title gradient-text">Frontend Projects</h2>
      <div className='section-underline'></div>
      <div className="flex flex-wrap gap-6 project-list">
        {feProjects.map((proj, idx) => (
          <ProjectCard key={idx} {...proj} onClick={() => setSelected(proj)} />
        ))}
      </div>
      {selected && <ProjectModal project={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}