import { NavLink } from 'react-router-dom';
import './Navbar.css';

// Navbar component
function Navbar({ onContactClick, onHomeClick, toggleTheme }) {

  function handleNavClick(e, label) {
    if (label === "Contact") {
      e.preventDefault();
      onContactClick();
      return;
    }

    if (label === "Home") {
      if (window.location.pathname === "/") {
        e.preventDefault();
        onHomeClick();
      }
    }
  }

  return (
    <nav className="navbar">
      {/* Desktop Nav */}
      <div className="desktop-nav">
        <NavLink to="/" onClick={(e) => handleNavClick(e, "Home")} className={({isActive}) => isActive ? "active" : ""}>Home</NavLink>
        <NavLink to="/projects" className={({isActive}) => isActive ? "active" : ""}>ML Projects</NavLink>
        <NavLink to="/frontend" className={({isActive}) => isActive ? "active" : ""}>FE Projects</NavLink>
        <button className="contact-btn" onClick={onContactClick}>
          Contact
        </button>

        <div className="theme-toggle" onClick={toggleTheme}>
          <div className="knob"></div>
          <span className="icon sun">☀️</span>
          <span className="icon moon">🌙</span>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
