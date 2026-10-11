import { Link } from 'react-router-dom';
import { BackLink } from '../components/BackLink';
import { ScholarHeader } from '../components/ScholarHeader';
import { useScholar } from '../content/scholar';
import { useContent } from '../content/useContent';
import './SawaidAbbasPage.css';

export function SawaidAbbasFingerprintsPage() {
    const team = useContent('team');
    const { profile, projects, keyphrases, themes } = useContent('sawaid');
    const { member, bio } = useScholar(team);
    const outputsLabel = profile.outputsLabel ? ` (${profile.outputsLabel})` : '';
    return (
      <section className="section profile-section">
        <div className="container">
          <BackLink to="/People/sawaid-abbas" label="Back to Dr. Sawaid Abbas" title="Back to Profile"/>

          <ScholarHeader member={member} bio={bio} profile={profile}/>

          <nav className="profile-tabs" aria-label="Profile sections">
            <Link to="/People/sawaid-abbas" className="profile-tab"><i className="fas fa-user"/> Overview</Link>
            <Link to="/People/sawaid-abbas-fingerprints" className="profile-tab profile-tab--active"><i className="fas fa-fingerprint"/> Fingerprint</Link>
            <Link to="/People/sawaid-abbas#research-output" className="profile-tab"><i className="fas fa-book-open"/> Research Output{outputsLabel}</Link>
            <Link to="/People/sawaid-abbas#projects" className="profile-tab"><i className="fas fa-cube"/> Projects ({projects.length})</Link>
          </nav>

          <div className="scholar-content fingerprints-page-content">
            <section className="scholar-block">
              <h2 className="scholar-block-title">Fingerprint</h2>
              <p className="scholar-fingerprint-intro">
                Dive into the research topics where Sawaid Abbas is active. Topic labels come from the works of this scholar.
              </p>
              <h3 className="scholar-subtitle">Keyphrases</h3>
              <div className="fingerprint-tags">
                {keyphrases.map((tag) => (<span key={tag} className="fp-tag"><i className="fp-dot"/>{tag}</span>))}
              </div>
              <h3 className="scholar-subtitle">Environmental Science</h3>
              <div className="fingerprint-tags">
                {themes.map((tag) => (
                  <span key={tag.label} className="fp-tag">
                    <i className={`fp-dot${tag.active ? ' fp-dot-active' : ''}`}/>
                    {tag.label}
                  </span>
                ))}
              </div>
            </section>
          </div>
        </div>
      </section>
    );
}
