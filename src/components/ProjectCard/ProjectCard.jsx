import './ProjectCard.css';

// Project Card component
function ProjectCard({ icon, title, description, link, onClick }) {
  return (
    <div className="project-card" onClick={onClick}>
      <h3>{icon} {title}</h3>
      <a href={link} target="_blank" rel="noopener noreferrer">Link to the website</a>
      <p className="desc-text">{description}</p>

      {/* Subtle hint */}
      <p className="details-hint">More details →</p>

    </div>
  );
}

export default ProjectCard;
