import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
export function useScrollToHash() {
    const { pathname, hash } = useLocation();
    useEffect(() => {
        if (!hash)
            return;
        const id = decodeURIComponent(hash.slice(1));
        const deadline = performance.now() + 3000;
        let frame;
        const tryScroll = () => {
            const el = document.getElementById(id);
            if (el) {
                el.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
            else if (performance.now() < deadline) {
                frame = requestAnimationFrame(tryScroll);
            }
        };
        tryScroll();
        return () => cancelAnimationFrame(frame);
    }, [pathname, hash]);
}
export function useScrollToTopOnLoad() {
    const { pathname, hash } = useLocation();
    useEffect(() => {
        if (!hash) {
            window.scrollTo(0, 0);
        }
    }, [pathname, hash]);
}
