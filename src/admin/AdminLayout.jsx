import { useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { GROUPS } from './schema';

export function AdminLayout({ email, children }) {
    const location = useLocation();
    const activeTable = location.pathname.split('/')[2] || '';
    const activeGroup = GROUPS.find((g) => g.tables.some((t) => t.name === activeTable))?.id;
    const [openGroups, setOpenGroups] = useState(() => new Set(activeGroup ? [activeGroup] : [GROUPS[0].id]));
    const [navOpen, setNavOpen] = useState(false);

    const toggleGroup = (id) => {
        setOpenGroups((prev) => {
            const next = new Set(prev);
            if (next.has(id))
                next.delete(id);
            else
                next.add(id);
            return next;
        });
    };

    return (
      <div className={`admin-shell${navOpen ? ' admin-shell--nav-open' : ''}`}>
        <aside className="admin-sidebar" aria-label="Content groups">
          <div className="admin-sidebar__brand">
            <Link to="/admin" onClick={() => setNavOpen(false)}>SCD Admin</Link>
          </div>
          <nav className="admin-sidebar__nav">
            {GROUPS.map((group) => {
                const open = openGroups.has(group.id) || group.id === activeGroup;
                return (
                  <div key={group.id} className="admin-nav-group">
                    <button type="button" className="admin-nav-group__toggle" aria-expanded={open} onClick={() => toggleGroup(group.id)}>
                      <i className={`${group.icon} fa-fw me-2`} aria-hidden="true"/>
                      <span>{group.label}</span>
                      <i className={`fas fa-chevron-${open ? 'up' : 'down'} ms-auto small`} aria-hidden="true"/>
                    </button>
                    {open ? (
                      <ul className="admin-nav-group__list">
                        {group.tables.map((table) => (
                          <li key={table.name}>
                            <NavLink to={`/admin/${table.name}`} className="admin-nav-link" onClick={() => setNavOpen(false)}>
                              {table.label}
                            </NavLink>
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </div>
                );
            })}
          </nav>
        </aside>

        <div className="admin-main">
          <header className="admin-topbar">
            <button type="button" className="btn btn-sm btn-outline-secondary admin-topbar__menu" aria-label="Toggle navigation" onClick={() => setNavOpen((o) => !o)}>
              <i className="fas fa-bars" aria-hidden="true"/>
            </button>
            <a href="/Home" target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-link">
              View site <i className="fas fa-external-link-alt ms-1" aria-hidden="true"/>
            </a>
            <span className="admin-topbar__user text-muted small">{email}</span>
            <button type="button" className="btn btn-sm btn-outline-secondary" onClick={() => supabase.auth.signOut()}>Sign out</button>
          </header>
          <main className="admin-content">{children}</main>
        </div>
      </div>
    );
}
