import { useParams } from 'react-router-dom';
import { BackLink } from '../components/BackLink';
import { SectionTitle } from '../components/SectionTitle';
import { ImageGallery, MetaList, Paragraphs } from '../components/DetailContent';
import { useContent } from '../content/useContent';
import { imageUrl } from '../utils/imageUrl';
import { formatDateHuman, getEventDateStr } from '../utils/events';
import { NotFoundPage } from './NotFoundPage';
import './DetailShared.css';

export function EventDetailPage() {
    const { slug } = useParams();
    const events = useContent('events');
    const event = events.find((e) => e.slug === slug || e.id === slug);

    if (!event)
        return <NotFoundPage />;

    const backTo = event.societyGroupId
        ? `/Society/${encodeURIComponent(event.societyGroupId)}`
        : '/Society/Events';
    const backLabel = event.societyGroupId
        ? 'Back to category'
        : 'Back to News & Events';

    const gallery = [
        ...(event.image ? [{ src: imageUrl(event.image), caption: '' }] : []),
        ...(event.images || []).map((img) => ({ src: imageUrl(img.src), caption: img.caption })),
    ];

    return (
      <main>
        <section className="section">
          <div className="container">
            <BackLink to={backTo} label={backLabel} title={backLabel}/>
            <div className="detail-page__hero">
              <div>
                <SectionTitle title={event.title} subtitle={event.type || 'Event'}/>
                <MetaList items={[
                    ['far fa-calendar-alt', formatDateHuman(getEventDateStr(event))],
                    ['far fa-clock', event.time],
                    ['fas fa-map-marker-alt', event.location],
                    ['fas fa-user-tie', event.organizer],
                ]}/>
                <Paragraphs text={event.details || event.summary}/>
              </div>
              {event.image ? (
                <div className="detail-page__hero-media">
                  <img src={imageUrl(event.image)} alt=""/>
                </div>
              ) : null}
            </div>

            <ImageGallery images={gallery.filter((g, i) => !(event.image && i === 0))} title={event.title}/>

            {event.highlights?.length ? (
              <>
                <h2 className="detail-page__heading">Highlights</h2>
                <ul className="detail-page__list">
                  {event.highlights.map((text) => <li key={text}>{text}</li>)}
                </ul>
              </>
            ) : null}

            {event.tags?.length ? (
              <div className="detail-page__badges mt-3">
                {event.tags.map((tag) => <span key={tag} className="badge bg-secondary">{tag}</span>)}
              </div>
            ) : null}

            <p className="mt-4 mb-0">
              <BackLink to="/Society/Events" label="All news & events" title="All news & events"/>
            </p>
          </div>
        </section>
      </main>
    );
}
