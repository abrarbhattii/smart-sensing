import { useParams } from 'react-router-dom';
import { BackLink } from '../components/BackLink';
import { SectionTitle } from '../components/SectionTitle';
import { ContentBlocks, MetaList, Paragraphs, VideoEmbed } from '../components/DetailContent';
import { useContent } from '../content/useContent';
import { imageUrl } from '../utils/imageUrl';
import societyFallback from '../images/home/people.jpg';
import { NotFoundPage } from './NotFoundPage';
import './DetailShared.css';

export function SocietyItemPage() {
    const { groupId, slug } = useParams();
    const { groups } = useContent('society');
    const group = groups.find((g) => g.id === groupId);
    const item = group?.items.find((i) => i.slug === slug || i.id === slug);

    if (!group || !item)
        return <NotFoundPage />;

    return (
      <main>
        <section className="section">
          <div className="container">
            <BackLink to={`/Society#${groupId}`} label={`Back to ${group.title}`} title={`Back to ${group.title}`}/>
            <div className="detail-page__hero">
              <div>
                <SectionTitle title={item.title} subtitle={group.title}/>
                <MetaList items={[
                    ['far fa-calendar-alt', item.date],
                    ['far fa-clock', item.time],
                    ['fas fa-map-marker-alt', item.location],
                    ['fas fa-user-tie', item.organizer],
                ]}/>
                <Paragraphs text={item.details || item.summary}/>
              </div>
              {item.image ? (
                <div className="detail-page__hero-media">
                  <img src={imageUrl(item.image, societyFallback)} alt=""/>
                </div>
              ) : null}
            </div>

            {item.highlights?.length ? (
              <>
                <h2 className="detail-page__heading">Highlights</h2>
                <ul className="detail-page__list">
                  {item.highlights.map((text) => <li key={text}>{text}</li>)}
                </ul>
              </>
            ) : null}

            <ContentBlocks sections={item.sections} fallbackImage={societyFallback}/>
            <VideoEmbed url={item.video} title={item.title}/>

            {item.link ? (
              <div className="detail-page__actions">
                <a href={item.link} target="_blank" rel="noopener noreferrer" className="btn btn-primary">
                  <i className="fas fa-external-link-alt me-1" aria-hidden="true"/>
                  {item.linkLabel || 'Learn more'}
                </a>
              </div>
            ) : null}
          </div>
        </section>
      </main>
    );
}
