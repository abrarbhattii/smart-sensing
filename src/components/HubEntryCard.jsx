import { Link } from 'react-router-dom';

const CARD_META = {
    '/Lab': {
        badge: 'LAB',
        subtitle: 'Research laboratory',
        bullets: [
            'Publications and thematic research areas',
            'Applied geospatial projects for climate resilience',
            'Earth observation methods and tools',
        ],
        cta: 'Explore SCD Lab',
    },
    '/Society': {
        badge: 'Society',
        subtitle: 'Community & knowledge exchange',
        bullets: [
            'Conferences, webinars, and seminars',
            'Workshops and network events',
            'News and society programmes',
        ],
        cta: 'Explore SCD Society',
    },
    '/Academy': {
        badge: 'Academy',
        subtitle: 'Training & learning pathways',
        bullets: [
            'Tutorials and instructor-led labs',
            'Recorded lectures and courses',
            'Spatial datasets for download',
        ],
        cta: 'Explore Academy',
    },
    '/Lab/Research': {
        badge: 'Research',
        subtitle: 'Core research areas',
        bullets: [
            'Browse thematic research programmes',
            'Publication topics and outputs',
            'Earth observation science themes',
        ],
        cta: 'Explore Research',
    },
    '/Lab/Projects': {
        badge: 'Projects',
        subtitle: 'Applied collaborations',
        bullets: [
            'Explore applied project portfolios',
            'Partners and funders',
            'Climate and development case studies',
        ],
        cta: 'Explore Projects',
    },
    '/Lab/Apps-Tools': {
        badge: 'Tools',
        subtitle: 'Apps & geospatial tools',
        bullets: [
            'Useful apps for geospatial work',
            'Practical tools from SCD',
            'Resources for analysts and practitioners',
        ],
        cta: 'Explore Apps & Tools',
    },
};

function bulletsFromDescription(description) {
    const parts = String(description || '')
        .split(/(?<=[.!?])\s+/)
        .map((s) => s.replace(/^PLACEHOLDER:\s*/i, '').trim())
        .filter(Boolean);
    return parts.slice(0, 3);
}

function resolveMeta(entry) {
    const preset = CARD_META[entry.to] || {};
    const fromDesc = bulletsFromDescription(entry.description);
    const bullets = entry.bullets?.length
        ? entry.bullets
        : (fromDesc.length >= 2 ? fromDesc : (preset.bullets || fromDesc));
    return {
        badge: entry.badge || preset.badge || 'SCD',
        subtitle: entry.subtitle || preset.subtitle || entry.title,
        bullets,
        cta: entry.cta || preset.cta || `Explore ${entry.title}`,
    };
}

export function HubEntryCard({ entry }) {
    const meta = resolveMeta(entry);
    return (
      <Link to={entry.to} className="hub-entry-card">
        <div className="hub-entry-card__top">
          <div className="hub-entry-card__icon" aria-hidden="true">
            <i className={entry.icon}/>
          </div>
          <span className="hub-entry-card__badge">{meta.badge}</span>
        </div>

        <h3 className="hub-entry-card__title">{entry.title}</h3>
        <p className="hub-entry-card__subtitle">{meta.subtitle}</p>
        <span className="hub-entry-card__accent" aria-hidden="true"/>

        {meta.bullets.length ? (
          <ul className="hub-entry-card__list">
            {meta.bullets.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        ) : (
          <p className="hub-entry-card__desc">{entry.description}</p>
        )}

        <div className="hub-entry-card__footer">
          <span className="hub-entry-card__cta">{meta.cta}</span>
          <span className="hub-entry-card__arrow" aria-hidden="true">
            <i className="fas fa-arrow-right"/>
          </span>
        </div>
      </Link>
    );
}
