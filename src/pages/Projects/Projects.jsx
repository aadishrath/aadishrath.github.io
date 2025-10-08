import { useState } from 'react';
import ProjectCard from '../../components/ProjectCard/ProjectCard';
import ProjectModal from '../../components/ProjectModal/ProjectModal';
import projects from '../../data/projectsBuilt';
import './Projects.css';

// Project page + modal
function Projects() {
  const [selected, setSelected] = useState(null);

  return (
    <div className="px-6 py-10 projects-page">
      <h2 className="project-title">All Projects</h2>
      <div className="flex flex-wrap gap-6 project-list">
        {projects.map((proj, idx) => (
          <ProjectCard key={idx} {...proj} onClick={() => setSelected(proj)} />
        ))}
      </div>
      {selected && <ProjectModal project={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}

export default Projects;
