import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar/Navbar';
import Footer from './components/Footer/Footer';
import './App.css';
import { Suspense, lazy, useEffect, useRef, useState } from 'react';
import Spinner from './components/Spinner/Spinner';

// Lazy-loaded pages
const Home = lazy(() => import('./pages/Home/Home'));
const MLProjects = lazy(() => import('./pages/Projects/MLProjects'));
const FEProjects = lazy(() => import('./pages/Projects/FEProjects'));

// Routing setup
function App() {
  const [theme, setTheme] = useState('light');
  const footerRef = useRef(null);
  const scrollToFooter = () => {
    footerRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    document.body.className = theme;
  }, [theme]);

  function toggleTheme() {
    setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'));
  }

  return (
    <Router>
      <div className="app-container">
        <Navbar onContactClick={scrollToFooter} onHomeClick={scrollToTop} toggleTheme={toggleTheme} />
        <main className="main-content">
          <Suspense fallback={<Spinner />}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/projects" element={<MLProjects />} />
              <Route path="/frontend" element={<FEProjects />} />
            </Routes>
          </Suspense>
        </main>
        <Footer ref={footerRef} />
      </div>
    </Router>
  );
}

export default App;
