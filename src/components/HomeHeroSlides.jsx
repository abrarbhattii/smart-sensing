import { useEffect, useState } from 'react';
import { useContent } from '../content/useContent';
import { imageUrl } from '../utils/imageUrl';
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion';
import topoFallback from '../images/home/Topo.jpg';
import './HomeHeroSlides.css';

const AUTOPLAY_MS = 3200;

export function HomeHeroSlides() {
    const slides = useContent('hero');
    const reducedMotion = usePrefersReducedMotion();
    const [index, setIndex] = useState(0);
    const hasSlides = slides.length > 0;

    useEffect(() => {
        if (!hasSlides || reducedMotion || slides.length < 2)
            return undefined;
        const id = window.setInterval(() => {
            setIndex((i) => (i + 1) % slides.length);
        }, AUTOPLAY_MS);
        return () => window.clearInterval(id);
    }, [hasSlides, reducedMotion, slides.length]);

    return (
      <section id="home" className="hero hero--slides" aria-label="Introduction">
        <div className="hero__slides" aria-hidden="true">
          {hasSlides ? slides.map((slide, i) => (
            <div
              key={slide.id || i}
              className={`hero__slide${i === index ? ' hero__slide--active' : ''}`}
              style={{ backgroundImage: `url(${imageUrl(slide.image, topoFallback)})` }}
            />
          )) : (
            <div className="hero__slide hero__slide--active" style={{ backgroundImage: `url(${topoFallback})` }}/>
          )}
        </div>
        <div className="hero__overlay" aria-hidden="true"/>
        <div className="container hero__inner">
          <div className="hero-content">
            <h1 className="hero__brand">Smart Sensing for Climate &amp; Development</h1>
            <div className="hero__leads" aria-live="polite">
              {hasSlides ? slides.map((slide, i) => (
                <p
                  key={slide.id || i}
                  className={`hero__lead${i === index ? ' hero__lead--active' : ''}`}
                  aria-hidden={i !== index}
                >
                  {slide.caption || '\u00a0'}
                </p>
              )) : (
                <p className="hero__lead hero__lead--active">{'\u00a0'}</p>
              )}
            </div>
          </div>
          {hasSlides && slides.length > 1 ? (
            <div className="hero__dots" role="tablist" aria-label="Hero slides">
              {slides.map((slide, i) => (
                <button
                  key={slide.id || i}
                  type="button"
                  role="tab"
                  aria-selected={i === index}
                  aria-label={`Show slide ${i + 1}`}
                  className={`hero__dot${i === index ? ' active' : ''}`}
                  onClick={() => setIndex(i)}
                />
              ))}
            </div>
          ) : null}
        </div>
      </section>
    );
}
