import { SectionTitle } from '../components/SectionTitle';
import { useContent } from '../content/useContent';
import { imageUrl } from '../utils/imageUrl';
import toolFallback from '../images/home/academia.png';
import './AppsToolsPage.css';

function showFallback(e) {
    if (!e.currentTarget.src.endsWith(toolFallback))
        e.currentTarget.src = toolFallback;
}

export function AppsToolsPage() {
    const { intro, tools } = useContent('appsTools');
    return (
      <main>
        <section id="apps-tools" className="section">
          <div className="container">
            <SectionTitle title={intro.title || 'Apps & Tools'} subtitle={intro.subtitle || 'Geospatial apps and tools built by SCD'}/>
            {intro.summary ? (
              <p className="mx-auto text-center mb-4" style={{ maxWidth: 760, color: '#475569' }}>{intro.summary}</p>
            ) : null}

            {tools.length === 0 ? (
              <p className="text-center text-muted">Apps and tools will be listed here soon.</p>
            ) : (
              <div className="row">
                {tools.map((tool) => (
                  <div key={tool.id} className="col-lg-4 col-md-6 mb-4">
                    <a href={tool.link} target="_blank" rel="noopener noreferrer" className="tool-card">
                      <div className="tool-card__image">
                        <img src={imageUrl(tool.image, toolFallback)} alt="" loading="lazy" onError={showFallback}/>
                        {tool.category ? <span className="tool-card__category">{tool.category}</span> : null}
                      </div>
                      <div className="tool-card__body">
                        <h4>{tool.title}</h4>
                        {tool.summary ? <p>{tool.summary}</p> : null}
                        {tool.tags.length ? (
                          <div className="tool-card__tags">
                            {tool.tags.map((tag) => <span key={tag} className="tag">{tag}</span>)}
                          </div>
                        ) : null}
                        <span className="tool-card__open">
                          {tool.linkLabel || 'Open tool'}
                          <i className="fas fa-external-link-alt ms-2" aria-hidden="true"/>
                        </span>
                      </div>
                    </a>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
    );
}
