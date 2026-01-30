import { FaGithub, FaTimes } from 'react-icons/fa';
import ReactMarkdown from 'react-markdown';
import './ProjectModal.css';
import { iconsMap } from '../../assets/iconsMap';

// Project modal component
function ProjectModal({ project, onClose }) {
  return (
    <div className="popup-overlay" onClick={onClose}>
      <div className="popup-box" onClick={(e) => e.stopPropagation()}>
        <div className='popup-header-container'>
          <h2 className="popup-title gradient-text">{project.title}</h2>
          <button className="popup-close-icon" onClick={onClose}>
            <img src={iconsMap.close} alt='Close' />
          </button>
        </div>

        <div className='popup-body-container'>
          <div className="popup-readme">
            {project.details && (
              <div className="markdown-body">
                <ReactMarkdown>{project.details}</ReactMarkdown>
              </div>
            )}
          </div>

          {project.repo && (
            <div className="popup-link">
              <a
                href={project.repo}
                target="_blank"
                rel="noopener noreferrer"
                className="project-link"
              >
                <FaGithub /> View Repository
              </a>
            </div>
          )}
        </div>
      </div>
    </div>

  );
}

export default ProjectModal;
