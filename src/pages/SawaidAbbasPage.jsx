import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Chart } from 'chart.js/auto';
import { BackLink } from '../components/BackLink';
import { ScholarHeader } from '../components/ScholarHeader';
import { useScholar } from '../content/scholar';
import { useContent } from '../content/useContent';
import './SawaidAbbasPage.css';
const PROJECT_STATUS_LABELS = { active: 'Active', completed: 'Completed', process: 'In Process' };
function ResearchActivityChart({ activity, scholarUrl }) {
    const canvasRef = useRef(null);
    const [popup, setPopup] = useState(null);
    useEffect(() => {
        if (!canvasRef.current)
            return;
        const labels = activity.map((d) => String(d.year));
        const counts = activity.map((d) => d.count);
        const details = activity.map((d) => d.detail);
        const barPalette = [
            'rgba(71, 85, 105, 0.95)', 'rgba(180, 160, 130, 0.95)', 'rgba(147, 112, 219, 0.95)',
            'rgba(205, 92, 92, 0.95)', 'rgba(70, 130, 180, 0.95)', 'rgba(220, 53, 69, 0.95)',
            'rgba(32, 178, 170, 0.95)', 'rgba(255, 182, 193, 0.95)', 'rgba(200, 200, 200, 0.95)',
            'rgba(100, 149, 237, 0.95)', 'rgba(60, 179, 113, 0.95)', 'rgba(255, 140, 0, 0.95)',
        ];
        const chart = new Chart(canvasRef.current, {
            type: 'bar',
            data: {
                labels,
                datasets: [{
                        label: 'Publications',
                        data: counts,
                        backgroundColor: labels.map((_, i) => barPalette[i % barPalette.length]),
                        borderWidth: 0,
                        borderRadius: 4,
                        borderSkipped: false,
                        barPercentage: 0.75,
                        categoryPercentage: 0.85,
                    }],
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                aspectRatio: 2.0,
                plugins: { legend: { display: false }, tooltip: { enabled: false } },
                scales: {
                    x: {
                        title: { display: true, text: 'Year', color: '#fff', font: { size: 11 } },
                        grid: { display: false },
                        ticks: { maxRotation: 45, color: '#e2e8f0', font: { size: 10 } },
                    },
                    y: {
                        beginAtZero: true,
                        title: { display: true, text: 'Publications', color: '#fff', font: { size: 11 } },
                        ticks: { stepSize: 1, color: '#e2e8f0', font: { size: 10 } },
                        grid: { color: 'rgba(255,255,255,0.08)' },
                    },
                },
                onClick: (_evt, elements) => {
                    if (elements.length) {
                        const i = elements[0].index;
                        setPopup({ year: `${labels[i]}: ${counts[i]} research output(s)`, detail: details[i] });
                    }
                },
            },
        });
        return () => chart.destroy();
    }, [activity]);
    return (<section className="scholar-block scholar-activity-chart scholar-activity-chart--compact scholar-activity-chart--dark">
      <div className="activity-chart-wrap">
        <h2 className="scholar-block-title activity-chart-title">Research activity per year</h2>
        <canvas ref={canvasRef} id="researchActivityChart" role="img" aria-label="Bar chart of research publications per year"/>
        <div id="activityChartPopup" className={`activity-chart-popup${popup ? ' show' : ''}`} role="dialog" aria-hidden={!popup}>
          <button type="button" className="activity-popup-close" aria-label="Close" onClick={() => setPopup(null)}>
            <i className="fas fa-times"/>
          </button>
          {popup ? (<>
              <div className="activity-popup-year">{popup.year}</div>
              <div className="activity-popup-detail">{popup.detail}</div>
            </>) : null}
          {scholarUrl ? (<a href={scholarUrl} target="_blank" rel="noopener noreferrer" className="activity-popup-link">
              View on Google Scholar <i className="fas fa-external-link-alt ms-1"/>
            </a>) : null}
        </div>
      </div>
    </section>);
}

function linkText(output) {
    if (output.linkLabel)
        return output.linkLabel;
    return output.url.replace(/^https?:\/\//i, '');
}

export function SawaidAbbasPage() {
    const team = useContent('team');
    const sawaid = useContent('sawaid');
    const { member, bio } = useScholar(team);
    const { profile, projects } = sawaid;
    const outputsLabel = profile.outputsLabel ? ` (${profile.outputsLabel})` : '';
    const biography = profile.biography.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);

    return (<section className="section profile-section">
      <div className="container">
        <BackLink to="/People" label="Back to People" title="Back to People"/>

        <ScholarHeader member={member} bio={bio} profile={profile} detailed/>

        <nav className="profile-tabs" aria-label="Profile sections">
          <Link to="/People/sawaid-abbas" className="profile-tab profile-tab--active"><i className="fas fa-user"/> Overview</Link>
          <Link to="/People/sawaid-abbas-fingerprints" className="profile-tab"><i className="fas fa-fingerprint"/> Fingerprint</Link>
          <Link to="#research-output" className="profile-tab"><i className="fas fa-book-open"/> Research Output{outputsLabel}</Link>
          <Link to="#projects" className="profile-tab"><i className="fas fa-cube"/> Projects ({projects.length})</Link>
        </nav>

        <div className="profile-layout">
          <div className="scholar-content">
            <section className="scholar-block">
              <h2 className="scholar-block-title">Personal profile</h2>
              {sawaid.interests.length ? (<>
                  <h3 className="scholar-subtitle">Research Interests</h3>
                  <ul className="scholar-list">
                    {sawaid.interests.map((text) => <li key={text}>{text}</li>)}
                  </ul>
                </>) : null}
              {biography.length ? (<>
                  <h3 className="scholar-subtitle">Biography</h3>
                  {biography.map((p, i) => <p key={i}>{p}</p>)}
                </>) : null}
              {sawaid.education.length ? (<>
                  <h3 className="scholar-subtitle">Education / Academic qualification</h3>
                  <div className="scholar-edu-list">
                    {sawaid.education.map((e) => (<div key={e.id} className="scholar-edu-item"><strong>{e.degree}</strong>{e.details ? ` â€” ${e.details}` : ''}</div>))}
                  </div>
                </>) : null}
              {sawaid.keywords.length ? (<>
                  <h3 className="scholar-subtitle">Keywords</h3>
                  <div className="scholar-keywords">
                    {sawaid.keywords.map((k) => (<span key={k}>{k}</span>))}
                  </div>
                </>) : null}
            </section>

            {sawaid.appointments.length ? (<section className="scholar-block">
                <h2 className="scholar-block-title">Appointments</h2>
                <div className="scholar-appointments">
                  {sawaid.appointments.map((a) => (<div key={a.id} className="scholar-app-item">
                      {a.years ? <span className="scholar-app-years">{a.years}</span> : null}
                      <strong>{a.title}</strong>{a.details ? ` â€” ${a.details}` : ''}
                    </div>))}
                </div>
              </section>) : null}

            <section className="scholar-block" id="research-output">
              <h2 className="scholar-block-title">Research Output</h2>
              {bio.google_scholar ? (<p className="scholar-meta-line">
                  <a href={bio.google_scholar} target="_blank" rel="noopener noreferrer">
                    View all {profile.outputsLabel ? `${profile.outputsLabel} ` : ''}research outputs <i className="fas fa-external-link-alt ms-1"/>
                  </a>
                </p>) : null}

              {sawaid.journalArticles.length ? (<>
                  <h3 className="scholar-subtitle">Journal articles</h3>
                  <div className="scholar-output-list">
                    {sawaid.journalArticles.map((item) => (<div key={item.id} className="scholar-output-item">
                        <span className="badge-output-type">Journal article</span>
                        <div>
                          <strong>{item.authors}</strong>{item.year ? ` (${item.year})` : ''}. {item.title} {item.venue ? <em>{item.venue}</em> : null}.{' '}
                          {item.url ? <a href={item.url} target="_blank" rel="noopener noreferrer">{linkText(item)}</a> : null}
                        </div>
                      </div>))}
                  </div>
                </>) : null}

              {sawaid.underReview.length ? (<>
                  <h3 className="scholar-subtitle">Under review</h3>
                  <div className="scholar-output-list">
                    {sawaid.underReview.map((item) => (<div key={item.id} className="scholar-output-item">
                        <span className="badge-under-review">Under Review</span>
                        <div>
                          {item.authors} {item.title} {item.venue ? <em>{item.venue}</em> : null}{item.note ? ` ${item.note}` : ''}
                        </div>
                      </div>))}
                  </div>
                </>) : null}

              {sawaid.bookChapters.length ? (<>
                  <h3 className="scholar-subtitle">Book chapters</h3>
                  <div className="scholar-output-list">
                    {sawaid.bookChapters.map((item) => (<div key={item.id} className="scholar-output-item">
                        <span className="badge-output-type badge-book">Book chapter</span>
                        <div>
                          {item.authors}{item.year ? ` (${item.year})` : ''}. {item.title} {item.venue ? <>In <em>{item.venue}</em>.</> : null}{' '}
                          {item.url ? <a href={item.url} target="_blank" rel="noopener noreferrer">{linkText(item)}</a> : null}
                        </div>
                      </div>))}
                  </div>
                </>) : null}
            </section>

            <section className="scholar-block" id="projects">
              <h2 className="scholar-block-title">Projects</h2>
              <div className="scholar-projects">
                {projects.map((project) => (<div key={project.id || project.title} className="scholar-project-item">
                    <h4>{project.title}</h4>
                    <p className="scholar-project-role">
                      <span className={`badge-project-status badge-${project.status}`}>{PROJECT_STATUS_LABELS[project.status] || project.status}</span>
                      {[project.role, project.funder, project.years].filter(Boolean).join(' Â· ')}
                    </p>
                    {project.summary ? <p className="scholar-project-summary">{project.summary}</p> : null}
                  </div>))}
              </div>
            </section>

            {sawaid.editorialRoles.length ? (<section className="scholar-block scholar-block--editorial">
                <h2 className="scholar-block-title"><i className="fas fa-pen-fancy scholar-block-icon"/> Editorial Roles</h2>
                <div className="editorial-grid">
                  {sawaid.editorialRoles.map((r) => (<div key={r.id} className="editorial-card">
                      <span className="editorial-card__badge">{r.role}</span>
                      <div className="editorial-card__content">
                        {r.detail}{r.detail && r.journal ? ', ' : ''}{r.journal ? <em>{r.journal}</em> : null}
                        {r.impactFactor ? <> <span className="editorial-if">{r.impactFactor}</span></> : null}
                      </div>
                    </div>))}
                </div>
              </section>) : null}
          </div>

          <aside className="profile-chart-sidebar">
            <ResearchActivityChart activity={sawaid.activity} scholarUrl={bio.google_scholar}/>
          </aside>
        </div>
      </div>
    </section>);
}
