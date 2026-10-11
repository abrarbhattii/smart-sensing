import { useParams } from 'react-router-dom';
import { BackLink } from '../components/BackLink';
import { SectionTitle } from '../components/SectionTitle';
import { ImageGallery, MetaList, Paragraphs, VideoEmbed } from '../components/DetailContent';
import { useContent } from '../content/useContent';
import { imageUrl } from '../utils/imageUrl';
import { NotFoundPage } from './NotFoundPage';
import './DetailShared.css';

export function ProjectDetailPage() {
    const { slug } = useParams();
    const projects = useContent('projects');
    const project = projects.find((p) => p.slug === slug || p.id === slug);

    if (!project)
        return <NotFoundPage />;

    const gallery = (project.images || []).map((img) => ({ src: imageUrl(img.src), caption: img.caption }));

    return (
      <main>
        <section className="section">
          <div className="container">
            <BackLink to="/Lab/Projects" label="Back to Projects" title="Back to Projects"/>
            <div className="detail-page__hero">
              <div>
                <SectionTitle title={project.title} subtitle="SCD Lab project"/>
                {project.badges?.length ? (
                  <div className="detail-page__badges">
                    {project.badges.map((b) => (
                      <span key={b.text} className={`badge bg-${b.variant || 'primary'}`}>{b.text}</span>
                    ))}
                  </div>
                ) : null}
                <MetaList items={[
                    ['far fa-calendar-alt', project.years],
                    ['fas fa-hand-holding-usd', project.funder],
                    ['fas fa-handshake', project.partners],
                ]}/>
                <Paragraphs text={project.details || project.description}/>
              </div>
              {project.gif ? (
                <div className="detail-page__hero-media">
                  <img src={imageUrl(project.gif)} alt={project.gifAlt || project.title}/>
                </div>
              ) : null}
            </div>

            <ImageGallery images={gallery} title={project.title}/>
            <VideoEmbed url={project.video} title={project.title}/>

            {project.highlights?.length ? (
              <>
                <h2 className="detail-page__heading">Key highlights</h2>
                <ul className="detail-page__list">
                  {project.highlights.map((text) => <li key={text}>{text}</li>)}
                </ul>
              </>
            ) : null}

            {project.link ? (
              <div className="detail-page__actions">
                <a href={project.link} target="_blank" rel="noopener noreferrer" className="btn btn-primary">
                  <i className="fas fa-external-link-alt me-1" aria-hidden="true"/>
                  {project.linkLabel || 'Visit project'}
                </a>
              </div>
            ) : null}
          </div>
        </section>
      </main>
    );
}
