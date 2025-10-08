import ProjectCard from '../../components/ProjectCard/ProjectCard';
import { aboutMe } from '../../data/aboutMe';
import { buckets } from '../../data/langAndTools';
import projects from '../../data/projectsBuilt';
import * as FaIcons from 'react-icons/fa';
import './Home.css';


// Home page
function Home() {
  return (
    <div className="px-6 py-10 about-container">
      <section className="intro">
        <h2  className="aboutMe-title">About Me</h2>
        <p className="text-lg leading-relaxed text-gray-300 max-w-3xl mx-auto px-4 py-6">{aboutMe}</p>
      </section>

      <section className="featured-projects">
        <h2  className="project-title">Featured Projects</h2>
        <div className="project-grid">
          {projects.slice(0, 6).map((proj, idx) => (
            <ProjectCard key={idx} {...proj} onClick={() => setSelected(proj)} />
          ))}
        </div>
      </section>

      <section className="tech-grid-section">
        <h2 className="tech-grid-title">Languages & Tools</h2>
        <div className="tech-grid-container">
          {buckets.map((bucket, index) => {
            const Icon = FaIcons[bucket.icon];
            return (
              <div key={index} className="tech-grid-card">
                <div className="tech-grid-header">
                  {Icon && <Icon className="tech-grid-icon" />}
                  <span>{bucket.title}</span>
                </div>
                <ul className="tech-grid-list">
                  {bucket.items.map((item, i) => (
                    <li key={i} className="tech-grid-item">{item}</li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}

export default Home;
