import { useEffect } from 'react';
const SCROLL_THRESHOLD = 20;
export function useScrollHeader(pillId = 'siteHeaderPill') {
    useEffect(() => {
        const pill = document.getElementById(pillId);
        if (!pill)
            return;
        function handleScroll() {
            pill.classList.toggle('site-header__pill--scrolled', window.scrollY > SCROLL_THRESHOLD);
        }
        handleScroll();
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, [pillId]);
}
