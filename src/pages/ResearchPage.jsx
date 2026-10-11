import { Link } from 'react-router-dom';
import { SectionTitle } from '../components/SectionTitle';
import { useContent } from '../content/useContent';
import { publicationPath } from '../constants/routes';
import { imageUrl } from '../utils/imageUrl';
import './ResearchPage.css';

export function ResearchPage() {
    const { areas } = useContent('research');
    return (<section id="research" className="section bg-light">
      <div className="container">
        <SectionTitle title="Core Research Areas" subtitle="Cutting-edge research in smart sensing and climate technologies"/>
        <div className="row">
          {areas.map((card) => (<div key={card.slug} className="col-lg-6 mb-4">
              <div className="research-card">
                <div className="research-content">
                  <h4>
                    {card.image ? <img src={imageUrl(card.image)} alt="" aria-hidden="true" style={{ width: 30, height: 30 }}/> : null}
                    {card.title}
                  </h4>
                  <p>{card.description}</p>
                  <div className="research-tags">
                    {
                      card.tags.map((tag) => (
                        <span key={tag} className="tag">
                          {tag}
                        </span>
                      ))
                    }
                  </div>
                  <div className="research-actions">
                    <Link to={publicationPath(card.slug)} className="btn btn-sm btn-outline-secondary" aria-label={`${card.title} publications`}>
                      Publications
                    </Link>
                  </div>
                </div>
              </div>
            </div>))}
        </div>
      </div>
    </section>);
}
