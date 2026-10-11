import { Link } from 'react-router-dom';
import { GROUPS } from './schema';

export function Dashboard() {
    return (
      <>
        <h1 className="admin-title">Site content</h1>
        <p className="text-muted mb-4">
          Pick a table to edit. Changes appear on the public site within about a minute
          (immediately in this browser).
        </p>
        <div className="admin-dashboard">
          {GROUPS.map((group) => (
            <section key={group.id} className="admin-card">
              <h2 className="h6 mb-3">
                <i className={`${group.icon} fa-fw me-2 text-primary`} aria-hidden="true"/>
                {group.label}
              </h2>
              <ul className="admin-dashboard__list">
                {group.tables.map((table) => (
                  <li key={table.name}>
                    <Link to={`/admin/${table.name}`}>{table.label}</Link>
                    {table.hint ? <span className="text-muted small d-block">{table.hint}</span> : null}
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </>
    );
}
