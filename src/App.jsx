import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar/Navbar';
import Footer from './components/Footer/Footer';
import SiteChatbot from './components/SiteChatbot/SiteChatbot';
import { Suspense, lazy, useEffect, useRef, useState } from 'react';
import Spinner from './components/Spinner/Spinner';
import './App.css';

// Lazy-loaded pages
const Home = lazy(() => import('./pages/Home/Home'));
const MLProjects = lazy(() => import('./pages/Projects/MLProjects'));
const FEProjects = lazy(() => import('./pages/Projects/FEProjects'));
const SentimentDemo = lazy(() => import('./pages/SentimentDemo/index'));
const RagDemo = lazy(() => import('./pages/RagDemo/index'));

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
              <Route path="/sentiment" element={<SentimentDemo />} />
              <Route path="/rag" element={<RagDemo />} />
            </Routes>
          </Suspense>
        </main>
        <Footer ref={footerRef} />
        <SiteChatbot />
      </div>
    </Router>
  );
}

export default App;
