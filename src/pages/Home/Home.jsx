import { aboutMe, summary } from '../../data/aboutMe';
import { buckets } from '../../data/langAndTools';
import * as FaIcons from 'react-icons/fa';
import './Home.css';
import { iconsMap } from '../../assets/iconsMap';


// Home page
export default function Home() {
  return (
    <div className="px-6 py-10 about-container">
      <section className="hero-intro full-screen-hero" id='first-section'>
        <h1 className="hero-title gradient-text">Aadish Rathore</h1>
        <h3 className="hero-subtitle">Software Engineer & ML Enthusiast</h3>
        <p className="hero-subtext">
            {summary}
        </p>

        <div className="scroll-arrow"
          onClick={() => {document.getElementById("empty-section").scrollIntoView({behavior: "smooth"});}}
        >
          <img src={iconsMap.down} alt="Scroll Down" className="arrow-icon" />
        </div>
      </section>

      <section className="px-6 py-10" id='empty-section'></section>
      <section className="intro" id='second-section'>
        <header>
          <h2  className="aboutMe-title gradient-text">About Me</h2>
          <div className='section-underline'></div>
        </header>
        <article>
          {aboutMe.split('\n\n').map((p, i) => (
            <p key={i} className="text-lg leading-relaxed text-gray-300 max-w-3xl mx-auto px-4 py-6">{p}</p>
          ))}
        </article>
      </section>

      <section className="tech-grid-section" id='fourth-section'>
        <header>
          <h2 className="tech-grid-title gradient-text">Languages & Tools</h2>
          <div className='section-underline'></div>
        </header>
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

      <section className="mobile-note">
        <header>
          <p className="side-note-title gradient-text">Side Note</p>
          <div className='section-underline'></div>
        </header>
        <p>Thanks for visiting — explore more on desktop for the full experience.</p>
      </section>
    </div>
  );
}
