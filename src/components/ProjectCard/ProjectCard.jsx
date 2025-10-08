import './ProjectCard.css';

// Project Card component
function ProjectCard({ title, description, onClick }) {
  return (
    <div
      className="bg-white shadow-md rounded-lg p-4 hover:shadow-xl transition cursor-pointer project-card"
      onClick={onClick}
    >
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}

export default ProjectCard;
