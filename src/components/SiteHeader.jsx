import { useEffect, useId, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { PRIMARY_NAV } from '../constants/navigation';
import { usePrefetchRoute } from '../content/useContent';
import logo from '../images/home/logo.jpg';
import './SiteHeader.css';

function NavLink({ to, className, children, onNavigate, ...rest }) {
    const prefetch = usePrefetchRoute();
    return (
      <Link className={className} to={to} onClick={onNavigate} onPointerEnter={() => prefetch(to)} onFocus={() => prefetch(to)} {...rest}>
        {children}
      </Link>
    );
}

function DesktopNavItem({ item, activeRoute }) {
    const isActive = item.route && activeRoute === item.route;
    const hasChildren = Boolean(item.children?.length);

    if (!hasChildren) {
        return (
          <li>
            <NavLink to={item.to} className={`nav-pill-link ${isActive ? 'nav-active' : ''}`}>
              {item.label}
            </NavLink>
          </li>
        );
    }

    return (
      <li className={`nav-item-has-flyout${isActive ? ' nav-item-has-flyout--active' : ''}`}>
        <NavLink
          to={item.to}
          className={`nav-pill-link nav-pill-link--parent ${isActive ? 'nav-active' : ''}`}
          aria-haspopup="true"
        >
          {item.label}
          <i className="fas fa-chevron-down nav-flyout-chevron" aria-hidden="true"/>
        </NavLink>
        <ul className="nav-flyout" role="menu">
          {item.children.map((child) => (
            <li key={child.to} role="none">
              <NavLink to={child.to} className="nav-flyout-link" role="menuitem">
                {child.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </li>
    );
}

function MobileNavItem({ item, activeRoute, onNavigate, openKey, setOpenKey }) {
    const isActive = item.route && activeRoute === item.route;
    const hasChildren = Boolean(item.children?.length);
    const panelId = useId();
    const isOpen = openKey === item.route;

    if (!hasChildren) {
        return (
          <li>
            <NavLink to={item.to} className={`nav-pill-link ${isActive ? 'nav-active' : ''}`} onNavigate={onNavigate}>
              {item.label}
            </NavLink>
          </li>
        );
    }

    return (
      <li className="nav-mobile-group">
        <div className="nav-mobile-group__row">
          <NavLink to={item.to} className={`nav-pill-link ${isActive ? 'nav-active' : ''}`} onNavigate={onNavigate}>
            {item.label}
          </NavLink>
          <button
            type="button"
            className="nav-mobile-group__toggle"
            aria-expanded={isOpen}
            aria-controls={panelId}
            aria-label={`${isOpen ? 'Collapse' : 'Expand'} ${item.label} submenu`}
            onClick={() => setOpenKey(isOpen ? null : item.route)}
          >
            <i className={`fas fa-chevron-${isOpen ? 'up' : 'down'}`} aria-hidden="true"/>
          </button>
        </div>
        {isOpen ? (
          <ul className="nav-mobile-submenu" id={panelId}>
            {item.children.map((child) => (
              <li key={child.to}>
                <NavLink to={child.to} className="nav-pill-link nav-mobile-submenu__link" onNavigate={onNavigate}>
                  {child.label}
                </NavLink>
              </li>
            ))}
          </ul>
        ) : null}
      </li>
    );
}

export function SiteHeader({ activeRoute = '' }) {
    const [menuOpen, setMenuOpen] = useState(false);
    const [mobileOpenKey, setMobileOpenKey] = useState(null);
    const location = useLocation();
    const headerRef = useRef(null);

    useEffect(() => {
        setMenuOpen(false);
        setMobileOpenKey(null);
        const active = document.activeElement;
        if (active instanceof HTMLElement && headerRef.current?.contains(active)) {
            active.blur();
        }
    }, [location.pathname, location.hash]);

    useEffect(() => {
        if (!menuOpen) return undefined;
        const onKey = (e) => {
            if (e.key === 'Escape') setMenuOpen(false);
        };
        document.addEventListener('keydown', onKey);
        return () => document.removeEventListener('keydown', onKey);
    }, [menuOpen]);

    const closeMenu = () => setMenuOpen(false);

    return (
      <header className="site-header" ref={headerRef}>
        <div className="site-header__pill" id="siteHeaderPill">

          <nav className="nav nav--pill" aria-label="Main navigation">
            <Link className="nav__brand" to="/Home">
              <img src={logo} alt="Smart Sensing Lab Logo" height={36} className="nav__brand-img"/>
              <span className="nav__brand-text">Smart Sensing</span>
            </Link>

            <ul className="nav-pill" id="mainNav">
              {PRIMARY_NAV.map((item) => (
                <DesktopNavItem key={item.to} item={item} activeRoute={activeRoute}/>
              ))}
            </ul>

            <Link to="/Lab" className={`nav__cta ${activeRoute === 'lab' ? 'nav-active' : ''}`} title="Explore Our Work">
              Explore
            </Link>

            <button className="nav__toggle" type="button" aria-controls="navbarNav" aria-expanded={menuOpen} aria-label="Toggle navigation" onClick={() => setMenuOpen((open) => !open)}>
              <i className={`fas ${menuOpen ? 'fa-times' : 'fa-bars'}`}/>
            </button>
          </nav>

          <div className={`nav__links collapse${menuOpen ? ' show' : ''}`} id="navbarNav">
            <ul className="nav-pill nav-pill--mobile">
              {PRIMARY_NAV.map((item) => (
                <MobileNavItem
                  key={`mobile-${item.to}`}
                  item={item}
                  activeRoute={activeRoute}
                  onNavigate={closeMenu}
                  openKey={mobileOpenKey}
                  setOpenKey={setMobileOpenKey}
                />
              ))}
              <li>
                <Link className={`nav-pill-link nav-pill-link--cta ${activeRoute === 'lab' ? 'nav-active' : ''}`} to="/Lab" onClick={closeMenu}>
                  Explore
                </Link>
              </li>
            </ul>
          </div>

        </div>
      </header>
    );
}
