import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useContent } from '../content/useContent';
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion';
import { imageUrl } from '../utils/imageUrl';
import './RecentWorkCarousel.css';

const AUTOPLAY_MS = 3000;
const ALSO_RECENT_COUNT = 3;

const TYPE_CLASS = {
    paper: 'badge-paper',
    project: 'badge-project',
    award: 'badge-award',
};
const TYPE_LABEL = {
    paper: 'Publication',
    project: 'Project',
    award: 'Award',
};

function SmartLink({ href, className, children }) {
    if (href.startsWith('http')) {
        return (
          <a href={href} target="_blank" rel="noopener noreferrer" className={className}>
            {children}
          </a>
        );
    }
    return (
      <Link to={href} className={className}>
        {children}
      </Link>
    );
}

export function RecentWorkCarousel() {
    const { recentWork: rawItems } = useContent('home');
    const recentWork = useMemo(
        () => rawItems.map((entry) => ({ ...entry, image: entry.image ? imageUrl(entry.image) : '' })),
        [rawItems],
    );
    const [slideState, setCurrentSlide] = useState(0);
    const [paused, setPaused] = useState(false);
    const reducedMotion = usePrefersReducedMotion();
    const len = recentWork.length;
    const currentSlide = len ? slideState % len : 0;
    const item = recentWork[currentSlide] || null;

    const goToSlide = (n) => {
        if (len)
            setCurrentSlide((n + len) % len);
    };

    const alsoRecent = useMemo(() => {
        if (len <= 1)
            return [];
        const count = Math.min(ALSO_RECENT_COUNT, len - 1);
        const items = [];
        for (let i = 1; i <= count; i += 1) {
            const index = (currentSlide + i) % len;
            items.push({ item: recentWork[index], index });
        }
        return items;
    }, [currentSlide, len, recentWork]);

    useEffect(() => {
        if (len <= 1 || paused || reducedMotion)
            return undefined;
        const timer = setTimeout(() => setCurrentSlide((s) => (s + 1) % len), AUTOPLAY_MS);
        return () => clearTimeout(timer);
    }, [currentSlide, paused, reducedMotion, len]);

    const onKeyDown = (e) => {
        if (e.key === 'ArrowLeft') {
            e.preventDefault();
            goToSlide(currentSlide - 1);
        }
        if (e.key === 'ArrowRight') {
            e.preventDefault();
            goToSlide(currentSlide + 1);
        }
    };

    if (!item) {
        return null;
    }

    const typeClass = TYPE_CLASS[item.type] || 'badge-paper';
    const typeLabel = TYPE_LABEL[item.type] || item.type;

    return (
      <div
        className="rw-feature"
        role="region"
        aria-roledescription="carousel"
        aria-label="Recent work"
        tabIndex={0}
        onKeyDown={onKeyDown}
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onFocus={() => setPaused(true)}
        onBlur={(e) => {
            if (!e.currentTarget.contains(e.relatedTarget))
                setPaused(false);
        }}
      >
        <article className="rw-feature__panel" aria-live={paused || reducedMotion ? 'polite' : 'off'}>
          <div className="rw-feature__media">
            {item.image ? (
              <img
                src={item.image}
                alt=""
                loading="lazy"
                onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    const parent = e.currentTarget.parentElement;
                    if (parent)
                        parent.classList.add('rw-feature__media--fallback');
                }}
              />
            ) : (
              <div className="rw-feature__media--fallback" aria-hidden="true"/>
            )}
            <span className={`rw-type-badge ${typeClass}`}>{typeLabel}</span>
          </div>

          <div className="rw-feature__body">
            <p className="rw-feature__label">{item.label}</p>
            <h3 className="rw-feature__title">{item.title}</h3>
            <p className="rw-feature__desc">{item.desc}</p>
            {item.tags?.length ? (
              <div className="rw-tags">
                {item.tags.map((t) => (
                  <span key={t} className="rw-tag">{t}</span>
                ))}
              </div>
            ) : null}
            <div className="rw-actions">
              {item.link ? (
                <SmartLink href={item.link} className="rw-btn-primary">
                  {item.linkLabel || 'Read More'}
                </SmartLink>
              ) : null}
              {item.extra ? (
                <SmartLink href={item.extra.href} className="rw-btn-outline">
                  {item.extra.label}
                </SmartLink>
              ) : null}
            </div>
          </div>
        </article>

        {len > 1 ? (
          <div className="rw-nav">
            <button
              type="button"
              className="rw-nav-btn"
              aria-label="Previous item"
              onClick={() => goToSlide(currentSlide - 1)}
            >
              <i className="fas fa-chevron-left" aria-hidden="true"/>
            </button>
            <div className="rw-dots" role="tablist" aria-label="Choose recent work item">
              {recentWork.map((entry, i) => (
                <button
                  type="button"
                  key={entry.id || entry.title}
                  className={`rw-dot${i === currentSlide ? ' active' : ''}`}
                  aria-label={`Show item ${i + 1}: ${entry.title}`}
                  aria-current={i === currentSlide ? 'true' : undefined}
                  onClick={() => goToSlide(i)}
                />
              ))}
            </div>
            <button
              type="button"
              className="rw-nav-btn"
              aria-label="Next item"
              onClick={() => goToSlide(currentSlide + 1)}
            >
              <i className="fas fa-chevron-right" aria-hidden="true"/>
            </button>
          </div>
        ) : null}

        {alsoRecent.length > 0 ? (
          <div className="rw-also">
            <p className="rw-also__heading">More highlights</p>
            <div className="rw-also__row">
              {alsoRecent.map(({ item: thumb, index }) => (
                <button
                  type="button"
                  key={thumb.id || thumb.title}
                  className="rw-also__item"
                  onClick={() => goToSlide(index)}
                  aria-label={`Show: ${thumb.title}`}
                >
                  <span className="rw-also__thumb">
                    {thumb.image ? (
                      <img src={thumb.image} alt="" loading="lazy"/>
                    ) : null}
                  </span>
                  <span className="rw-also__meta">
                    <span className={`rw-also__type ${TYPE_CLASS[thumb.type] || 'badge-paper'}`}>
                      {TYPE_LABEL[thumb.type] || thumb.type}
                    </span>
                    <span className="rw-also__title">{thumb.title}</span>
                  </span>
                </button>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    );
}
