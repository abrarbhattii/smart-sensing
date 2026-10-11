import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { SectionTitle } from '../components/SectionTitle';
import { RecentWorkCarousel } from '../components/RecentWorkCarousel';
import { CollaboratorsMap } from '../components/CollaboratorsMap';
import { EventHeadline } from '../components/EventHeadline';
import { useContent } from '../content/useContent';
import people from "../images/home/people.jpg";
import academia from "../images/home/academia.png";
import './HomePage.css';

export function HomePage() {
  const { collaborators } = useContent('home');

  useEffect(() => {
      const anchors = document.querySelectorAll('a[href^="#"]');
      const handler = (e) => {
          const anchor = e.currentTarget;
          const href = anchor.getAttribute('href');
          if (href && href.startsWith('#') && href.length > 1) {
              const target = document.querySelector(href);
              if (target) {
                  e.preventDefault();
                  target.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }
          }
      };
      anchors.forEach((a) => a.addEventListener('click', handler));
      return () => anchors.forEach((a) => a.removeEventListener('click', handler));
  }, []);

  return (
    <div className="home-page">
      <section id="home" className="hero" aria-label="Introduction">
        <div className="hero__media" aria-hidden="true"/>
        <div className="hero__overlay" aria-hidden="true"/>
        <div className="container hero__inner">
          <div className="hero-content">
            <h1 className="hero__brand">Smart Sensing for Climate &amp; Development</h1>
            <p className="hero__lead">
              Data-driven Earth observation and spatial research for climate adaptation and
              sustainable development.
            </p>
            <Link to="/Lab" className="btn btn-primary btn-lg hero__cta">
              Explore Our Work
            </Link>
          </div>
        </div>
      </section>

      <section id="recent-work">
        <div className="container">
          <SectionTitle title="Recent Work" subtitle="Publications, projects, and highlights from our Research Group"/>
          <RecentWorkCarousel />
        </div>
      </section>

      <section id="collaborators" className="section collaborators-section">
        <div className="container">
          <SectionTitle title="Partnerships & Collaboration" subtitle="Our global partners and their locations"/>
          <div id="collaboratorsMapContainer">
            <CollaboratorsMap collaborators={collaborators}/>
          </div>
        </div>
      </section>

      <section id="collaborate" className="collaborate-invite" aria-labelledby="collaborate-invite-title">
        <div className="container collaborate-invite__inner">
          <h2 id="collaborate-invite-title" className="collaborate-invite__title">
            Collaborate with us
          </h2>
          <p className="collaborate-invite__text">
            Interested in partnering on research, capacity building, or applied Earth observation projects?
            We welcome collaboration with institutions, agencies, and practitioners working toward climate
            resilience and sustainable development.
          </p>
          <a href="mailto:gss.gis.eo@gmail.com" className="btn btn-primary">
            Get in touch
          </a>
        </div>
      </section>

      <section id="team" className="section">
        <div className="container">
          <SectionTitle title="Research Group" subtitle="The people, partnerships, and publications advancing smart sensing for climate resilience"/>
          <div className="row">
            <div className="col-lg-6 mb-4">
              <div className="team-member">
                <div className="team-avatar">
                  <Link to="/People">
                    <img src={people} alt="People" className="img-fluid rounded-circle border border-dark"/>
                  </Link>
                </div>
                <Link to="/People" style={{ textDecoration: 'none' }}>
                  <h4 style={{ color: '#4a5568' }}>People</h4>
                </Link>
                <p>
                  Dedicated professionals, developing technologies for climate adaptation and
                  sustainable development.
                </p>
              </div>
            </div>
            <div className="col-lg-6 mb-4">
              <div className="team-member">
                <div className="team-avatar">
                  <Link to="/Lab/Research">
                    <img src={academia} alt="Academics" className="img-fluid rounded-circle"/>
                  </Link>
                </div>
                <Link to="/Lab/Research" style={{ textDecoration: 'none' }}>
                  <h4 style={{ color: '#4a5568' }}>Academic Contributions / Research</h4>
                </Link>
                <p>
                  Publications and research outputs in Earth Observation and Spatial Data Science for
                  climate resilience.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <EventHeadline />
    </div>
  );
}
