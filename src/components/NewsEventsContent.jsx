import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useContent } from '../content/useContent';
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion';
import { formatDateHuman, getEventDateStr, splitEventsByDate, todayStartMs } from '../utils/events';
import { TICKER_SPEED_PX_PER_S } from '../constants/ticker';
import './PublicationList.css';
import './NewsEventsContent.css';

function eventTypeColor(eventType) {
    const t = (eventType || '').toLowerCase();
    if (t.includes('workshop'))
        return '#38a169';
    if (t.includes('webinar'))
        return '#4299e1';
    if (t.includes('seminar'))
        return '#2c5282';
    if (t.includes('training'))
        return '#ed8936';
    if (t.includes('roundtable'))
        return '#48bb78';
    if (t.includes('poster'))
        return '#ed8936';
    if (t.includes('open'))
        return '#2c5282';
    return '#38a169';
}

function eventKey(ev) {
    return ev.id || `${ev.title}-${getEventDateStr(ev)}`;
}

function eventPath(ev) {
    return `/Society/Events/${encodeURIComponent(ev.slug || ev.id)}`;
}

export function NewsEventsContent() {
    const events = useContent('events');
    const { upcoming, past } = useMemo(() => splitEventsByDate(events, todayStartMs()), [events]);
    const [paused, setPaused] = useState(false);
    const reducedMotion = usePrefersReducedMotion();
    const animate = upcoming.length > 0 && !reducedMotion;
    const marqueeRef = useRef(null);
    const trackRef = useRef(null);
    const offsetRef = useRef(0);
    const pausedRef = useRef(paused);

    useEffect(() => {
        pausedRef.current = paused;
    }, [paused]);

    useEffect(() => {
        const track = trackRef.current;
        if (!track || !animate)
            return;
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
    }, [animate]);

    const visibleUpcomingPath = () => {
        const marquee = marqueeRef.current;
        const track = trackRef.current;
        if (!marquee || !track || !upcoming.length)
            return eventPath(upcoming[0]);
        const left = marquee.getBoundingClientRect().left;
        const items = Array.from(track.querySelectorAll('[data-event-index]'));
        const visible = items.find((el) => el.getBoundingClientRect().right > left);
        const index = visible ? Number(visible.dataset.eventIndex) : 0;
        return eventPath(upcoming[index] || upcoming[0]);
    };

    const [detailsHref, setDetailsHref] = useState(() => (upcoming[0] ? eventPath(upcoming[0]) : '/Society/Events'));

    useEffect(() => {
        if (!upcoming.length)
            return undefined;
        const sync = () => setDetailsHref(visibleUpcomingPath());
        sync();
        const id = window.setInterval(sync, 400);
        return () => window.clearInterval(id);
    }, [upcoming, animate]);

    const tickerItems = animate ? [...upcoming, ...upcoming] : upcoming;

    return (<>
      <section className="news-bulletin" aria-label="News and events bulletin">
        <div className="news-bulletin__inner">
          <div className="news-bulletin__left">
            <span className="news-bulletin__icon" aria-hidden="true">
              <i className="fas fa-bullhorn"/>
            </span>
            <span className="news-bulletin__label">BULLETIN</span>
          </div>
          <div ref={marqueeRef} className={`news-bulletin__marquee${animate ? '' : ' news-bulletin__marquee--static'}`} id="newsBulletinMarquee" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)} onFocus={() => setPaused(true)} onBlur={(e) => {
            if (!e.currentTarget.contains(e.relatedTarget))
                setPaused(false);
        }}>
            {upcoming.length === 0 ? (<span className="news-bulletin__empty">No upcoming events at the moment. Check back soon.</span>) : (<div className="news-bulletin__track" id="newsBulletinTrack" ref={trackRef}>
                {tickerItems.map((ev, i) => {
                    const isCopy = i >= upcoming.length;
                    return (<Link key={`${eventKey(ev)}-${i}`} to={eventPath(ev)} className="news-bulletin__item" data-event-index={i % upcoming.length} tabIndex={isCopy ? -1 : 0} aria-hidden={isCopy}>
                      <span className="news-bulletin__item-date">{formatDateHuman(getEventDateStr(ev))}</span>
                      <span className="news-bulletin__item-title">{ev.title}</span>
                    </Link>);
                })}
              </div>)}
          </div>
          {upcoming.length > 0 ? (<Link id="newsBulletinDetailsBtn" className="news-bulletin__details btn btn-sm btn-light" title="Open details for the currently visible bulletin item" to={detailsHref}>
              Details
            </Link>) : null}
        </div>
      </section>

      <div className="news-events-block">
        <h3 className="news-events-subtitle">
          <i className="fas fa-calendar-days me-2 text-primary" aria-hidden="true"/>
          Past Events
        </h3>
        <div id="past-events" className="news-events-list">
          {past.length === 0 ? (<p className="text-muted mb-0">No past events available.</p>) : (past.map((ev) => {
            const dateHuman = formatDateHuman(getEventDateStr(ev));
            const path = eventPath(ev);
            return (<article key={eventKey(ev)} className="publication-entry news-event-entry">
                  <div className="publication-entry__header">
                    <span className="publication-entry__bullet" style={{ background: eventTypeColor(ev.type) }}/>
                    <div className="publication-entry__title-wrap">
                      <h3 className="publication-entry__title">
                        <Link to={path}>{ev.title || 'Event'}</Link>
                      </h3>
                    </div>
                    <span className="publication-entry__year">{dateHuman || '—'}</span>
                  </div>
                  {ev.location ? (<p className="publication-entry__authors mb-1">
                      <i className="fas fa-location-dot me-2 text-primary" aria-hidden="true"/>
                      {ev.location}
                    </p>) : null}
                  <div className="publication-entry__meta">
                    {ev.organizer ? (<span className="publication-entry__journal">
                        <i className="fas fa-user me-1" aria-hidden="true"/>
                        {ev.organizer}
                      </span>) : null}
                  </div>
                  <p className="publication-entry__abstract">{ev.summary || ''}</p>
                  {ev.tags?.length ? (<div className="publication-entry__keywords">
                      {ev.tags.map((t) => (<span key={t} className="publication-entry__keyword">
                          {t}
                        </span>))}
                    </div>) : null}
                  <div className="publication-entry__actions">
                    <div className="publication-entry__actions-left">
                      <Link to={path} className="publication-entry__btn-abstract">
                        View details <i className="fas fa-arrow-right ms-1" aria-hidden="true"/>
                      </Link>
                    </div>
                  </div>
                </article>);
        }))}
        </div>
      </div>
    </>);
}
