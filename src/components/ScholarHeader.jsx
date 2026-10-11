import { imageUrl, peopleFallback } from '../utils/imageUrl';

const LINKS = [
    ['google_scholar', 'Google Scholar', 'fas fa-graduation-cap'],
    ['scopus', 'Scopus', null],
    ['science_direct', 'Science Direct', null],
    ['researchgate', 'ResearchGate', null],
    ['publons', 'Publons', null],
    ['loop', 'Loop', null],
    ['space4water', 'Space4Water', null],
];

export function ScholarHeader({ member, bio, profile, detailed = false }) {
    const name = member?.name || 'Dr. Sawaid Abbas';
    return (
      <div className="scholar-profile-header">
        <div className="scholar-profile-main">
          <div className="scholar-photo">
            <img
              src={imageUrl(member?.photo)}
              alt={name}
              onError={(e) => {
                  if (e.currentTarget.src !== peopleFallback)
                      e.currentTarget.src = peopleFallback;
              }}
            />
          </div>
          <div className="scholar-info">
            <h1 className="scholar-name">{name}</h1>
            {member?.role ? <p className="scholar-title">{member.role}</p> : null}
            {profile.organization ? (
              <p className="scholar-org">
                {profile.organizationUrl ? (
                  <a href={profile.organizationUrl} target="_blank" rel="noopener noreferrer">{profile.organization}</a>
                ) : profile.organization}
              </p>
            ) : null}
            {detailed && (bio.orcid || profile.email) ? (
              <p className="scholar-meta">
                {bio.orcid ? (
                  <a href={bio.orcid} target="_blank" rel="noopener noreferrer" className="scholar-orcid">
                    <i className="fab fa-orcid"/> ORCID
                  </a>
                ) : null}
                {bio.orcid && profile.email ? <span className="scholar-sep">·</span> : null}
                {profile.email ? <span>Email: {profile.email}</span> : null}
              </p>
            ) : null}
            {detailed && profile.stats ? <p className="scholar-stats">{profile.stats}</p> : null}
            <div className="scholar-links">
              {LINKS.filter(([key]) => bio[key]).map(([key, label, icon]) => (
                <a key={key} href={bio[key]} target="_blank" rel="noopener noreferrer" className="scholar-link-btn">
                  {icon ? <><i className={icon}/> </> : null}{label}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
}
