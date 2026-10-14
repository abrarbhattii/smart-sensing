import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useContent } from '../content/useContent';
import { InfoModal } from './InfoModal';
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion';
import { formatDateHuman, getEventDateStr, splitEventsByDate, todayStartMs } from '../utils/events';
import { TICKER_SPEED_PX_PER_S } from '../constants/ticker';
import './HomeTopStrips.css';

function eventPath(ev) {
    return `/Society/Events/${encodeURIComponent(ev.slug || ev.id)}`;
}

export function HomeEventsBulletin() {
    const events = useContent('events');
    const { upcoming } = useMemo(() => splitEventsByDate(events, todayStartMs()), [events]);
    const [selected, setSelected] = useState(null);
    const [open, setOpen] = useState(false);
    const [paused, setPaused] = useState(false);
    const reducedMotion = usePrefersReducedMotion();
    const trackRef = useRef(null);
    const offsetRef = useRef(0);
    const pausedRef = useRef(paused);
    const animate = upcoming.length > 1 && !reducedMotion;
    const items = animate ? [...upcoming, ...upcoming] : upcoming;

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
    }, [animate, upcoming.length]);

    const openEvent = (ev) => {
        setSelected(ev);
        setOpen(true);
    };

    return (
      <>
        <section className="home-strip home-strip--events" aria-label="Upcoming events">
          <div className="home-strip__label">
            <i className="fas fa-bullhorn" aria-hidden="true"/>
            <span>Upcoming</span>
          </div>
          <div
            className="home-strip__marquee"
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
          >
            {upcoming.length === 0 ? (
              <p className="home-strip__empty">No upcoming events — check back soon.</p>
            ) : (
              <div className="home-strip__track" ref={trackRef}>
                {items.map((ev, i) => (
                  <button
                    key={`${ev.id || ev.title}-${i}`}
                    type="button"
                    className="home-strip__chip"
                    tabIndex={i >= upcoming.length ? -1 : 0}
                    aria-hidden={i >= upcoming.length}
                    onClick={() => openEvent(ev)}
                  >
                    <span className="home-strip__chip-type">{ev.type || 'Event'}</span>
                    <span className="home-strip__chip-date">{formatDateHuman(getEventDateStr(ev))}</span>
                    <span className="home-strip__chip-title">{ev.title}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
          <Link to="/Society/Events" className="home-strip__all">All events</Link>
        </section>

        <InfoModal open={open} onClose={() => setOpen(false)} title={selected?.title || 'Event'} className="modal-abstract">
          {selected ? (
            <div className="home-strip-popup">
              <p className="home-strip-popup__meta">
                {[selected.type, formatDateHuman(getEventDateStr(selected)), selected.location].filter(Boolean).join(' · ')}
              </p>
              {selected.summary ? <p>{selected.summary}</p> : null}
              {selected.highlights?.length ? (
                <ul>
                  {selected.highlights.map((h) => <li key={h}>{h}</li>)}
                </ul>
              ) : null}
              <div className="home-strip-popup__actions">
                <Link to={eventPath(selected)} className="btn btn-primary btn-sm" onClick={() => setOpen(false)}>
                  Details
                </Link>
              </div>
            </div>
          ) : null}
        </InfoModal>
      </>
    );
}
