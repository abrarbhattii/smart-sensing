import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useContent } from '../content/useContent';
import { TICKER_SPEED_PX_PER_S } from '../constants/ticker';
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion';
import { formatDateHuman, getEventDateStr, splitEventsByDate, todayStartMs } from '../utils/events';
import './EventHeadline.css';

const MAX_SLIDES = 3;

const DEFAULT_HEADLINE = {
    type: 'Upcoming',
    title: 'No upcoming events right now — check back soon for SCD Society announcements.',
    dateLabel: '',
};

export function EventHeadline() {
    const reducedMotion = usePrefersReducedMotion();
    const [paused, setPaused] = useState(false);
    const trackRef = useRef(null);
    const offsetRef = useRef(0);
    const pausedRef = useRef(paused);
    const events = useContent('events');

    const slides = useMemo(() => {
        const { upcoming } = splitEventsByDate(events, todayStartMs());
        return upcoming.slice(0, MAX_SLIDES).map((ev) => ({
            id: ev.id || `${getEventDateStr(ev)}-${ev.title}`,
            type: ev.type || 'Upcoming',
            title: ev.title,
            dateLabel: formatDateHuman(getEventDateStr(ev)),
        }));
    }, [events]);

    const animate = slides.length > 0 && !reducedMotion;
    const tickerItems = animate ? [...slides, ...slides] : slides;

    useEffect(() => {
        pausedRef.current = paused;
    }, [paused]);

    useEffect(() => {
        const track = trackRef.current;
        if (!track || !animate)
            return undefined;
        let frame;
        let lastTs = performance.now();
        const step = (ts) => {
            const dt = (ts - lastTs) / 1000;
            lastTs = ts;
            const setWidth = track.scrollWidth / 2;
            if (!pausedRef.current && setWidth > 0) {
                offsetRef.current -= TICKER_SPEED_PX_PER_S * dt;
                if (-offsetRef.current >= setWidth)
                    offsetRef.current += setWidth;
                track.style.transform = `translateX(${offsetRef.current}px)`;
            }
            frame = requestAnimationFrame(step);
        };
        frame = requestAnimationFrame(step);
        return () => {
            cancelAnimationFrame(frame);
            track.style.transform = '';
            offsetRef.current = 0;
        };
    }, [animate, slides.length]);

    if (!slides.length) {
        return (
          <div className="event-headline" role="region" aria-label="Upcoming event headlines">
            <Link to="/Society/Events" className="event-headline__inner event-headline__inner--static">
              <span className="event-headline__badge">
                <i className="fas fa-bullhorn" aria-hidden="true"/>
                {DEFAULT_HEADLINE.type}
              </span>
              <span className="event-headline__title">{DEFAULT_HEADLINE.title}</span>
              <span className="event-headline__cta">
                Details <i className="fas fa-arrow-right" aria-hidden="true"/>
              </span>
            </Link>
          </div>
        );
    }

    return (
      <div
        className="event-headline"
        role="region"
        aria-label="Upcoming event headlines"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onFocus={() => setPaused(true)}
        onBlur={() => setPaused(false)}
      >
        <div className={`event-headline__inner${animate ? '' : ' event-headline__inner--static'}`}>
          <span className="event-headline__badge">
            <i className="fas fa-bullhorn" aria-hidden="true"/>
            Upcoming
          </span>
          <div className="event-headline__marquee">
            <div ref={trackRef} className="event-headline__track">
              {tickerItems.map((ev, i) => (
                <Link
                  key={`${ev.id}-${i}`}
                  to="/Society/Events"
                  className="event-headline__item"
                  tabIndex={animate && i >= slides.length ? -1 : undefined}
                  aria-hidden={animate && i >= slides.length ? true : undefined}
                >
                  {ev.dateLabel ? <span className="event-headline__date">{ev.dateLabel}</span> : null}
                  <span className="event-headline__title">{ev.title}</span>
                  <span className="event-headline__type">{ev.type}</span>
                </Link>
              ))}
            </div>
          </div>
          <Link to="/Society/Events" className="event-headline__cta">
            Details <i className="fas fa-arrow-right" aria-hidden="true"/>
          </Link>
        </div>
      </div>
    );
}
