import { SectionTitle } from '../components/SectionTitle';
import { KeyAreasNetwork } from '../components/KeyAreasNetwork';
import { HubEntryCard } from '../components/HubEntryCard';
import { useContent } from '../content/useContent';
import './HubShared.css';
import './WhoWeArePage.css';

export function WhoWeArePage() {
    const { intro: whoWeAreIntro, pillars: whoWeArePillars, facts: whoWeAreFacts, keyAreas } = useContent('whoWeAre');
    return (
      <main>
        <section className="section">
          <div className="container">
            <SectionTitle title={whoWeAreIntro.title} subtitle={whoWeAreIntro.subtitle}/>
            <p className="mx-auto text-center" style={{ maxWidth: 760, color: '#475569' }}>
              {whoWeAreIntro.summary}
            </p>

            <div className="hub-entry-grid">
              {whoWeArePillars.map((pillar) => (
                <HubEntryCard key={pillar.id || pillar.title} entry={pillar}/>
              ))}
            </div>
          </div>
        </section>

        <section id="what-we-do" className="section ka-section">
          <div className="container-fluid px-0">
            <div className="container">
              <SectionTitle title="What We Do" subtitle="Our vision, mission, and key focus areas"/>
              <div className="row mb-4">
                <div className="col-lg-6 mb-4">
                  <div className="card">
                    <div className="card-body">
                      <h4>
                        <i className="fas fa-eye text-primary me-2"/>
                        Vision
                      </h4>
                      <p>
                        To create a research centred platform that turns learning into meaningful action
                        by enabling young researchers to apply existing skills in research and
                        development, explore contemporary geospatial tools, and gain practical experience
                        that connects academic knowledge with real-world industry needs.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="col-lg-6 mb-4">
                  <div className="card">
                    <div className="card-body">
                      <h4>
                        <i className="fas fa-bullseye text-primary me-2"/>
                        Mission
                      </h4>
                      <p>
                        Establish a group of researchers to strengthen quality of research by integrating
                        cutting-edge geospatial technologies and data for smart and sustainable
                        development.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <KeyAreasNetwork pillars={keyAreas.pillars} nodes={keyAreas.nodes}/>
          </div>
        </section>

        <section className="section">
          <div className="container">
            <div className="hub-section-block" style={{ marginTop: 0 }}>
              <SectionTitle title="Important information" subtitle="Affiliation, focus, and contact"/>
              <ul className="hub-fact-list">
                {whoWeAreFacts.map((fact) => (
                  <li key={fact.label}>
                    <strong>{fact.label}</strong>
                    <span>{fact.value}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      </main>
    );
}
