import { useEffect } from 'react';
export function useSectionObserver(enabled) {
    useEffect(() => {
        if (!enabled)
            return;
        const navContainer = document.querySelector('.site-header') || document.getElementById('mainNav');
        if (!navContainer)
            return;
        const links = Array.from(navContainer.querySelectorAll('.nav-pill-link[data-section]'));
        if (links.length === 0)
            return;
        const ratioMap = new Map();
        function setActive(sectionId) {
            links.forEach((l) => {
                l.classList.toggle('nav-active', l.dataset.section === sectionId);
            });
        }
        const observer = new IntersectionObserver((entries) => {
            entries.forEach((e) => ratioMap.set(e.target.id, e.intersectionRatio));
            let bestId = null;
            let bestRatio = -1;
            ratioMap.forEach((ratio, id) => {
                if (ratio > bestRatio) {
                    bestRatio = ratio;
                    bestId = id;
                }
            });
            if (bestId)
                setActive(bestId);
        }, {
            threshold: [0, 0.1, 0.2, 0.4, 0.6, 0.8, 1.0],
            rootMargin: '-80px 0px -25% 0px',
        });
        links.forEach((l) => {
            const sec = document.getElementById(l.dataset.section || '');
            if (sec)
                observer.observe(sec);
        });
        const timer = setTimeout(() => {
            if (links[0]?.dataset.section)
                setActive(links[0].dataset.section);
        }, 100);
        return () => {
            clearTimeout(timer);
            observer.disconnect();
        };
    }, [enabled]);
}
