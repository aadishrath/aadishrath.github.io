import './ProjectCard.css';

// Project Card component
function ProjectCard({ icon, title, description, onClick }) {
  return (
    <div className="project-card" onClick={onClick}>
      <h3>{icon} {title}</h3>
      <p className="desc-text">{description}</p>

      {/* Subtle hint */}
      <p className="details-hint">More details →</p>

    </div>
  );
}

export default ProjectCard;
