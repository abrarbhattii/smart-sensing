import { SectionTitle } from '../components/SectionTitle';
import { HubEntryCard } from '../components/HubEntryCard';
import { useContent } from '../content/useContent';
import './HubShared.css';

const SECTION_META = {
    tutorials: {
        badge: 'Learn',
        subtitle: 'Self-paced guides',
        bullets: [
            'Step-by-step geospatial workflows',
            'Practical project-oriented guides',
            'Materials you can follow at your own pace',
        ],
        cta: 'Browse tutorials',
    },
    labs: {
        badge: 'Practice',
        subtitle: 'Instructor-led labs',
        bullets: [
            'Guided practical sessions',
            'Facilitator-supported exercises',
            'Hands-on geospatial skills',
        ],
        cta: 'Browse labs',
    },
    lectures: {
        badge: 'Watch',
        subtitle: 'Recorded lectures',
        bullets: [
            'On-demand lecture recordings',
            'Core concepts and methods',
            'Watch anytime, revisit as needed',
        ],
        cta: 'Browse lectures',
    },
    data: {
        badge: 'Data',
        subtitle: 'Spatial datasets',
        bullets: [
            'Downloadable spatial datasets',
            'Resources for analysis and teaching',
            'Formats ready for GIS and EO work',
        ],
        cta: 'Browse datasets',
    },
};

export function AcademyPage() {
    const { intro: academyIntro, sections: academySections } = useContent('academy');

    return (
      <main>
        <section className="section">
          <div className="container">
            <SectionTitle title={academyIntro.title} subtitle={academyIntro.subtitle}/>
            <p className="mx-auto text-center mb-4" style={{ maxWidth: 760, color: '#475569' }}>
              {academyIntro.summary}
            </p>

            <div className="hub-entry-grid">
              {academySections.map((section) => {
                  const meta = SECTION_META[section.id] || {};
                  return (
                    <HubEntryCard
                      key={section.id}
                      entry={{
                          id: section.id,
                          title: section.title,
                          description: section.subtitle || `Browse ${section.title.toLowerCase()} from SCD Research Academy.`,
                          to: `/Academy/${encodeURIComponent(section.id)}`,
                          icon: section.icon || 'fas fa-graduation-cap',
                          badge: meta.badge,
                          subtitle: meta.subtitle || section.subtitle,
                          bullets: meta.bullets,
                          cta: meta.cta || `Explore ${section.title}`,
                      }}
                    />
                  );
              })}
            </div>
          </div>
        </section>
      </main>
    );
}
