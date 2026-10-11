import { Link } from 'react-router-dom';
import { SectionTitle } from '../components/SectionTitle';
import { HubMediaCard } from '../components/HubMediaCard';
import { useContent } from '../content/useContent';
import societyFallback from '../images/home/people.jpg';
import './HubShared.css';

export function SocietyHubPage() {
    const { intro: societyIntro, groups: societyEventTypes } = useContent('society');

    return (
      <main>
        <section className="section">
          <div className="container">
            <SectionTitle title={societyIntro.title} subtitle={societyIntro.subtitle}/>
            <p className="mx-auto text-center" style={{ maxWidth: 760, color: '#475569' }}>
              {societyIntro.summary}
            </p>
            <p className="text-center mt-3">
              <Link to="/Society/Events" className="btn btn-primary">
                View all news &amp; events
              </Link>
            </p>

            {societyEventTypes.map((group) => (
              <div key={group.id} className="hub-section-block" id={group.id}>
                <SectionTitle
                  title={group.title}
                  subtitle={`List of ${group.title.toLowerCase()} organized/scheduled by the society`}
                />
                <div className="hub-item-list">
                  {group.items.map((item) => (
                    <HubMediaCard
                      key={item.id || item.title}
                      icon={group.icon}
                      title={item.title}
                      meta={[item.date, item.location].filter(Boolean).join(' · ')}
                      summary={item.summary}
                      image={item.image}
                      fallback={societyFallback}
                      actionLabel="View details"
                      to={`/Society/${group.id}/${encodeURIComponent(item.slug || item.id)}`}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    );
}
