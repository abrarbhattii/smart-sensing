import { Link } from 'react-router-dom';
import { SectionTitle } from '../components/SectionTitle';
import { useContent } from '../content/useContent';
import './HubShared.css';

export function LabHubPage() {
    const { intro: labHubIntro, entries: labHubEntries } = useContent('labHub');
    return (
      <main>
        <section className="section">
          <div className="container">
            <SectionTitle title={labHubIntro.title} subtitle={labHubIntro.subtitle}/>
            <p className="mx-auto text-center" style={{ maxWidth: 760, color: '#475569' }}>
              {labHubIntro.summary}
            </p>
            <div className="hub-entry-grid">
              {labHubEntries.map((entry) => (
                <Link key={entry.id || entry.to} to={entry.to} className="hub-entry-card">
                  <div className="hub-entry-card__icon" aria-hidden="true">
                    <i className={entry.icon}/>
                  </div>
                  <h3>{entry.title}</h3>
                  <p>{entry.description}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>
    );
}
