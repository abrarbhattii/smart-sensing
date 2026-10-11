import { Link } from 'react-router-dom';
import { SectionTitle } from '../components/SectionTitle';
import { useContent } from '../content/useContent';
import { imageUrl } from '../utils/imageUrl';
import './ProjectsPage.css';

export function ProjectsPage() {
    const projectCards = useContent('projects');
    return (
      <section id="projects" className="section">
        <div className="container">
          <SectionTitle title="Our Projects" subtitle="Innovative projects addressing climate and development challenges"/>
          <div className="row">
            {projectCards.map((project) => (
              <div key={project.id || project.title} className="col-lg-6 mb-4">
                <Link
                  to={`/Lab/Projects/${encodeURIComponent(project.slug || project.id)}`}
                  className="project-card project-card--clickable"
                >
                  <div className="project-icon">
                    {project.gif ? <img src={imageUrl(project.gif)} alt={project.gifAlt} className="project-gif" loading="lazy"/> : null}
                  </div>
                  <br />
                  <h4>
                    <i className={project.iconClass} aria-hidden="true"/>
                    {project.title}
                  </h4>
                  <p>{project.description}</p>
                  <div className="mt-3">
                    {(project.badges || []).map((badge) => (
                      <span key={badge.text} className={`badge bg-${badge.variant} me-2`}>
                        {badge.text}
                      </span>
                    ))}
                  </div>
                  <span className="project-card__open">
                    View details
                    <i className="fas fa-arrow-right ms-1" aria-hidden="true"/>
                  </span>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
}
