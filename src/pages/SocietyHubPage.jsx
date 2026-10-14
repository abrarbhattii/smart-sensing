import { Link } from 'react-router-dom';
import { SectionTitle } from '../components/SectionTitle';
import { HubEntryCard } from '../components/HubEntryCard';
import { useContent } from '../content/useContent';
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
            <p className="text-center mt-3 mb-4">
              <Link to="/Society/Events" className="btn btn-primary">
                View all news &amp; events
              </Link>
            </p>

            <div className="hub-entry-grid">
              {societyEventTypes.map((group) => (
                <HubEntryCard
                  key={group.id}
                  entry={{
                      id: group.id,
                      title: group.title,
                      description: `Browse ${group.title.toLowerCase()} organized and hosted by SCD Society.`,
                      to: `/Society/${encodeURIComponent(group.id)}`,
                      icon: group.icon || 'fas fa-calendar-alt',
                  }}
                />
              ))}
            </div>
          </div>
        </section>
      </main>
    );
}
