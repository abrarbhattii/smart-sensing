import { SectionTitle } from '../components/SectionTitle';
import { HubEntryCard } from '../components/HubEntryCard';
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
                <HubEntryCard key={entry.id || entry.to} entry={entry}/>
              ))}
            </div>
          </div>
        </section>
      </main>
    );
}
