import { Outlet } from 'react-router-dom';
import { SiteHeader } from '../components/SiteHeader';
import { SiteFooter } from '../components/SiteFooter';
import { HomeEventsBulletin } from '../components/HomeEventsBulletin';
import { HomePartnersStrip } from '../components/HomePartnersStrip';
import { useScrollHeader } from '../hooks/useScrollHeader';
import { useScrollToHash, useScrollToTopOnLoad } from '../hooks/useScrollToHash';

export function MainLayout({ activeRoute = '' }) {
    useScrollHeader();
    useScrollToHash();
    useScrollToTopOnLoad();
    return (
      <>
        <SiteHeader activeRoute={activeRoute}/>
        <div className="site-top-strips">
          <HomeEventsBulletin />
          <HomePartnersStrip />
        </div>
        <Outlet />
        <SiteFooter />
      </>
    );
}
