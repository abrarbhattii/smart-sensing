import { Link, useParams } from 'react-router-dom';
import { BackLink } from '../components/BackLink';
import { SectionTitle } from '../components/SectionTitle';
import { HubMediaCard } from '../components/HubMediaCard';
import { useContent } from '../content/useContent';
import { formatDateHuman, getEventDateStr } from '../utils/events';
import { listSocietyGroupCards } from '../utils/societyEvents';
import societyFallback from '../images/home/people.jpg';
import { NotFoundPage } from './NotFoundPage';
import './HubShared.css';

export function SocietyGroupPage() {
    const { groupId } = useParams();
    const { groups } = useContent('society');
    const events = useContent('events');
    const group = groups.find((g) => g.id === groupId);
    const cards = listSocietyGroupCards(group, events);

    if (!group)
        return <NotFoundPage />;

    return (
      <main>
        <section className="section">
          <div className="container">
            <BackLink to="/Society" label="Back to SCD Society" title="Back to SCD Society"/>
            <SectionTitle
              title={group.title}
              subtitle={`${group.title} organized and hosted by SCD Society`}
            />
            <p className="mb-4" style={{ color: '#64748b', maxWidth: 720 }}>
              Select an event for full details, gallery, and highlights on News &amp; Events.
            </p>

            {cards.length === 0 ? (
              <p className="text-muted">
                No {group.title.toLowerCase()} listed yet.{' '}
                <Link to="/Society/Events">Browse all news &amp; events</Link>.
              </p>
            ) : (
              <div className="hub-item-list">
                {cards.map((ev) => (
                  <HubMediaCard
                    key={ev.id || ev.slug}
                    icon={group.icon}
                    title={ev.title}
                    meta={[formatDateHuman(getEventDateStr(ev)) || ev.date, ev.location].filter(Boolean).join(' · ')}
                    summary={ev.summary}
                    image={ev.image}
                    fallback={societyFallback}
                    actionLabel="View details"
                    to={`/Society/Events/${encodeURIComponent(ev.slug || ev.id)}`}
                  />
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
    );
}
