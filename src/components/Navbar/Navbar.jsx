import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaBars, FaTimes } from 'react-icons/fa';
import './Navbar.css';

// Navbar component
function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="navbar">
      {/* Desktop Nav */}
      <div className="navbar-content desktop-nav">
        <Link to="/">Home</Link>
        <Link to="/projects">Projects</Link>
      </div>

      {/* Mobile Toggle */}
      <div className="mobile-toggle">
        <button onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <FaTimes /> : <FaBars />}
        </button>
      </div>

      {/* Mobile Drawer */}
      <div className={`mobile-drawer ${isOpen ? 'open' : ''}`}>
        <Link to="/" onClick={() => setIsOpen(false)}>Home</Link>
        <Link to="/projects" onClick={() => setIsOpen(false)}>Projects</Link>
      </div>
    </nav>
  );
}

export default Navbar;
