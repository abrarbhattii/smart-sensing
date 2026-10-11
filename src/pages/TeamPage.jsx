import { useId, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { SectionTitle } from '../components/SectionTitle';
import { InfoModal } from '../components/InfoModal';
import { useContent } from '../content/useContent';
import { imageUrl, peopleFallback } from '../utils/imageUrl';
import './TeamPage.css';

const CURRENT_YEAR = new Date().getFullYear();

const ROLE_OPTIONS = [
    ['all', 'All'],
    ['phd', 'PhD Candidates'],
    ['associate', 'Associates'],
    ['assistant', 'Assistant'],
    ['student', 'Students'],
];

const PROFILE_LINKS = [
    ['google_scholar', 'Google Scholar', 'fas fa-graduation-cap'],
    ['scopus', 'Scopus', null],
    ['orcid', 'ORCID', 'fab fa-orcid'],
    ['science_direct', 'Science Direct', null],
    ['researchgate', 'ResearchGate', null],
    ['publons', 'Publons', null],
    ['loop', 'Loop', null],
    ['space4water', 'Space4Water', null],
    ['journal', 'Journal', null],
];

function showFallbackImage(e) {
    if (e.currentTarget.src !== peopleFallback)
        e.currentTarget.src = peopleFallback;
}

function BioModalContent({ person, bios, titleId }) {
    if (!person)
        return null;
    const detail = person.id ? bios[person.id] : null;
    const bioText = detail?.biography || person.bio || '';
    const links = detail ? PROFILE_LINKS.filter(([key]) => detail[key]) : [];
    const topPubs = detail?.publications?.slice(0, 5) || [];
    return (<div className="bio-modal-layout">
      <div className="bio-modal-photo">
        <div className="bio-modal-photo-wrap">
          <img src={imageUrl(person.photo)} alt={person.name} onError={showFallbackImage}/>
        </div>
      </div>
      <div className="bio-modal-info">
        <h3 id={titleId} className="mb-2">{person.name}</h3>
        <p className="bio-modal-role mb-1">{person.role || ''}</p>
        {person.institution ? <p className="bio-modal-institution mb-3">{person.institution}</p> : null}
        <p className="bio-modal-bio mb-3">{bioText}</p>
        {links.length ? (<div className="bio-modal-links mb-3">
            {links.map(([key, label, icon]) => (<a key={key} href={detail[key]} target="_blank" rel="noopener noreferrer" className="btn btn-outline-secondary btn-sm me-1 mb-1">
                {icon ? <i className={`${icon} me-1`} aria-hidden="true"/> : null}
                {label}
              </a>))}
          </div>) : null}
        {person.linkedin ? (<a href={person.linkedin} target="_blank" rel="noopener noreferrer" className="btn btn-outline-primary btn-sm">
            <i className="fab fa-linkedin me-1" aria-hidden="true"/>
            View LinkedIn Profile
          </a>) : null}
        {detail && (detail.publication_category || topPubs.length || detail.profile_url) ? (<div className="bio-modal-detail mt-3">
            {detail.publication_category ? (<p className="bio-detail-category"><strong>Research areas:</strong> {detail.publication_category}</p>) : null}
            {topPubs.length ? (<>
                <p className="bio-detail-label"><strong>Top publications</strong></p>
                <ul className="bio-detail-list">
                  {topPubs.map((p) => (<li key={p.title}>
                      {p.url ? <a href={p.url} target="_blank" rel="noopener noreferrer">{p.title}</a> : p.title}
                      {' '}({p.year}){p.journal ? ` — ${p.journal}` : ''}
                    </li>))}
                </ul>
              </>) : null}
            {detail.profile_url ? (<Link to={`/${detail.profile_url.replace(/^\/+/, '')}`} className="btn btn-primary btn-sm mt-2">
                <i className="fas fa-external-link-alt me-1" aria-hidden="true"/>View Full Profile
              </Link>) : null}
          </div>) : null}
      </div>
    </div>);
}

export function TeamPage() {
    const { members, bios } = useContent('team');
    const { PROFESSORS, ADVISORS, RESEARCHERS, YEAR_OPTIONS } = useMemo(() => {
        const researchers = members.filter((m) => m.section === 'researcher');
        return {
            PROFESSORS: members.filter((m) => m.section === 'professor'),
            ADVISORS: members.filter((m) => m.section === 'advisor'),
            RESEARCHERS: researchers,
            YEAR_OPTIONS: [...new Set(researchers.map((p) => String(p.year || CURRENT_YEAR)))]
                .sort((a, b) => Number(b) - Number(a)),
        };
    }, [members]);
    const [yearFilter, setYearFilter] = useState('all');
    const [roleFilter, setRoleFilter] = useState('all');
    const [filtersOpen, setFiltersOpen] = useState(false);
    const [selected, setSelected] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);
    const titleId = useId();

    const openBio = (person) => {
        setSelected(person);
        setModalOpen(true);
    };

    const researchersByYear = useMemo(() => {
        const byYear = {};
        RESEARCHERS.forEach((p) => {
            const y = p.year || CURRENT_YEAR;
            (byYear[y] ||= []).push(p);
        });
        return Object.keys(byYear)
            .map(Number)
            .sort((a, b) => b - a)
            .map((year) => ({ year, people: byYear[year] }));
    }, [RESEARCHERS]);

    const cardVisible = (person) => {
        const cardCat = (person.category || '').trim().toLowerCase();
        const cardYear = String(person.year || CURRENT_YEAR);
        const yearMatch = yearFilter === 'all' || cardYear === yearFilter;
        const catMatch = roleFilter === 'all' || cardCat === roleFilter;
        return yearMatch && catMatch;
    };

    const [headProf, ...otherProfs] = PROFESSORS;
    const anyResearcherVisible = RESEARCHERS.some(cardVisible);

    return (<section id="team" className="section">
      <div className="container">
        <SectionTitle title="Our Team" subtitle="Meet the experts driving innovation in smart sensing technologies"/>
        <hr className="team-section-divider"/>

        <div className="container mb-4">
          <div className="text-center mb-2">
            <span className="team-section-label">
              <i className="fas fa-chalkboard-teacher me-1" aria-hidden="true"/>
              Professors
            </span>
          </div>
        </div>
        <div className="row" id="professors-container">
          {PROFESSORS.length === 0 ? (<p className="text-center text-muted">No professors listed yet.</p>) : (<>
              <div className="col-12 mb-4 d-flex">
                <ProfCard person={headProf} onBio={() => openBio(headProf)}/>
              </div>
              {otherProfs.map((p) => (<div key={p.id || p.name} className="col-md-6 mb-4 d-flex">
                  <ProfCard person={p} onBio={() => openBio(p)}/>
                </div>))}
            </>)}
        </div>

        <hr className="team-section-divider"/>

        {ADVISORS.length > 0 ? (<>
            <div className="container mb-4" id="advisors-section-wrap">
              <div className="text-center mb-2">
                <span className="team-section-label">
                  <i className="fas fa-user-tie me-1" aria-hidden="true"/>
                  Research Advisors
                </span>
              </div>
            </div>
            <div className="row" id="advisors-container">
              {ADVISORS.map((p) => (<div key={p.id || p.name} className="col-md-6 mb-4 d-flex">
                  <ProfCard person={p} onBio={() => openBio(p)}/>
                </div>))}
            </div>
            <hr className="team-section-divider"/>
          </>) : null}

        <div className="container mb-3">
          <div className="text-center mb-2">
            <span className="team-section-label">
              <i className="fas fa-flask me-1" aria-hidden="true"/>
              Researchers
            </span>
          </div>
        </div>

        <div className={`team-filters-dropdown-wrap${filtersOpen ? ' open' : ''}`}>
          <button type="button" className="team-filters-dropdown-btn" id="teamFiltersBtn" aria-expanded={filtersOpen} aria-controls="teamFiltersPanel" onClick={() => setFiltersOpen((o) => !o)}>
            <i className="fas fa-filter me-2" aria-hidden="true"/>
            Filters
            <i className="fas fa-chevron-down ms-2 team-filters-chevron" aria-hidden="true"/>
          </button>
          <div className={`team-filters-dropdown-panel${filtersOpen ? ' show' : ''}`} id="teamFiltersPanel">
            <div className="team-filters-grid">
              <div className="team-filters-column" role="group" aria-label="Filter by year">
                <span className="team-filters-label">Year</span>
                {['all', ...YEAR_OPTIONS].map((y) => (<button key={y} type="button" aria-pressed={yearFilter === y} className={`filter-btn filter-btn-year${yearFilter === y ? ' active' : ''}`} onClick={() => setYearFilter(y)}>
                    {y === 'all' ? 'All Years' : y}
                  </button>))}
              </div>
              <div className="team-filters-column" role="group" aria-label="Filter by role">
                <span className="team-filters-label">Role</span>
                {ROLE_OPTIONS.map(([val, label]) => (<button key={val} type="button" aria-pressed={roleFilter === val} className={`filter-btn filter-btn-role${roleFilter === val ? ' active' : ''}`} onClick={() => setRoleFilter(val)}>
                    {label}
                  </button>))}
              </div>
            </div>
          </div>
        </div>

        <div id="researchers-container" className="mt-3">
          {RESEARCHERS.length === 0 ? (<p className="text-center text-muted">No researchers listed yet.</p>) : !anyResearcherVisible ? (<p className="text-center text-muted">No researchers match these filters.</p>) : (researchersByYear.map(({ year, people }) => {
            const visible = people.filter(cardVisible);
            if (visible.length === 0)
                return null;
            return (<div key={year} className="researcher-year-section mb-4" data-year={year}>
                  <div className="text-center mb-3">
                    <span className="team-section-label">
                      <i className="fas fa-calendar-alt me-1" aria-hidden="true"/>
                      {year}
                    </span>
                  </div>
                  <div className="researcher-grid">
                    {visible.map((person) => (<div key={person.id || person.name} className="team-card" data-category={(person.category || '').trim().toLowerCase()} data-year={person.year || year}>
                        <ResearcherCard person={person} onBio={() => openBio(person)}/>
                      </div>))}
                  </div>
                </div>);
        }))}
        </div>
      </div>

      <InfoModal id="bioModal" open={modalOpen} onClose={() => setModalOpen(false)} className="" contentClassName="bio-modal-content" bodyClassName="pt-0" headerContent={<span />} labelledBy={titleId}>
        <BioModalContent person={selected} bios={bios} titleId={titleId}/>
      </InfoModal>
    </section>);
}

function ProfCard({ person, onBio }) {
    return (<div className="prof-card w-100">
      <div className="prof-card-body">
        <h4>{person.name}</h4>
        <p className="prof-role">{person.role}</p>
        {person.institution ? <p className="prof-institution">{person.institution}</p> : null}
        <p className="prof-bio">{person.bio || ''}</p>
        <button type="button" className="view-bio-link" onClick={onBio}>
          <i className="fas fa-user-circle me-1" aria-hidden="true"/>
          View Bio
        </button>
      </div>
      <div className="prof-card-photo">
        <img src={imageUrl(person.photo)} alt={person.name} loading="lazy" onError={showFallbackImage}/>
      </div>
    </div>);
}

function ResearcherCard({ person, onBio }) {
    return (<div className="researcher-card">
      <div className="researcher-card-body">
        <h4>{person.name}</h4>
        <p className="researcher-role">{person.role}</p>
        {person.institution ? <p className="researcher-institution">{person.institution}</p> : null}
        <p className="researcher-bio">{person.bio || ''}</p>
        <button type="button" className="view-bio-link" onClick={onBio}>
          <i className="fas fa-user-circle me-1" aria-hidden="true"/>
          View Bio
        </button>
      </div>
      <div className="researcher-card-photo">
        <img src={imageUrl(person.photo)} alt={person.name} loading="lazy" onError={showFallbackImage}/>
      </div>
    </div>);
}
