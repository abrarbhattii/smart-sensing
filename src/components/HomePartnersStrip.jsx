import { useEffect, useRef, useState } from 'react';
import { useContent } from '../content/useContent';
import { InfoModal } from './InfoModal';
import { imageUrl } from '../utils/imageUrl';
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion';
import { TICKER_SPEED_PX_PER_S } from '../constants/ticker';
import academiaFallback from '../images/home/academia.png';
import './HomeTopStrips.css';

export function HomePartnersStrip() {
    const { collaborators } = useContent('home');
    const partners = collaborators.filter((c) => c.logo || c.name);
    const [selected, setSelected] = useState(null);
    const [open, setOpen] = useState(false);
    const [paused, setPaused] = useState(false);
    const reducedMotion = usePrefersReducedMotion();
    const trackRef = useRef(null);
    const offsetRef = useRef(0);
    const pausedRef = useRef(paused);
    const animate = partners.length > 2 && !reducedMotion;
    const items = animate ? [...partners, ...partners] : partners;

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
                offsetRef.current -= (TICKER_SPEED_PX_PER_S * 0.7) * dt;
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
    }, [animate, partners.length]);

    const openPartner = (partner) => {
        setSelected(partner);
        setOpen(true);
    };

    if (!partners.length)
        return null;

    return (
      <>
        <section className="home-strip home-strip--partners" aria-label="Partners">
          <div className="home-strip__label home-strip__label--muted">
            <i className="fas fa-handshake" aria-hidden="true"/>
            <span>Partners</span>
          </div>
          <div
            className="home-strip__marquee"
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
          >
            <div className="home-strip__track home-strip__track--logos" ref={trackRef}>
              {items.map((partner, i) => (
                <button
                  key={`${partner.id || partner.name}-${i}`}
                  type="button"
                  className="home-strip__logo-btn"
                  title={partner.name}
                  tabIndex={i >= partners.length ? -1 : 0}
                  aria-hidden={i >= partners.length}
                  onClick={() => openPartner(partner)}
                >
                  <img
                    src={imageUrl(partner.logo, academiaFallback)}
                    alt={partner.name}
                    loading="lazy"
                    onError={(e) => {
                        if (!e.currentTarget.src.endsWith(academiaFallback))
                            e.currentTarget.src = academiaFallback;
                    }}
                  />
                </button>
              ))}
            </div>
          </div>
        </section>

        <InfoModal open={open} onClose={() => setOpen(false)} title={selected?.fullName || selected?.name || 'Partner'} className="modal-abstract">
          {selected ? (
            <div className="home-strip-popup home-strip-popup--partner">
              {selected.logo ? (
                <img src={imageUrl(selected.logo, academiaFallback)} alt="" className="home-strip-popup__logo"/>
              ) : null}
              {selected.location ? <p className="home-strip-popup__meta">{selected.location}</p> : null}
              {selected.summary ? <p>{selected.summary}</p> : null}
              {selected.details ? String(selected.details).split(/\n\s*\n/).filter(Boolean).map((p, i) => <p key={i}>{p}</p>) : null}
              <div className="home-strip-popup__actions">
                {selected.url ? (
                  <a href={selected.url} target="_blank" rel="noopener noreferrer" className="btn btn-primary btn-sm">
                    Details
                  </a>
                ) : (
                  <a href="#collaborators" className="btn btn-primary btn-sm" onClick={() => setOpen(false)}>
                    Details
                  </a>
                )}
              </div>
            </div>
          ) : null}
        </InfoModal>
      </>
    );
}
