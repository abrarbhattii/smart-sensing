import { Link } from 'react-router-dom';
import { imageUrl } from '../utils/imageUrl';

/** Hub listing card (text left, image right). Pass `to` for navigation or `onOpen` for a popup. */
export function HubMediaCard({ icon, title, meta, summary, image, fallback, actionLabel = 'View details', to, onOpen }) {
    const showFallback = (e) => {
        if (!e.currentTarget.src.endsWith(fallback))
            e.currentTarget.src = fallback;
    };

    const body = (
      <>
        <div className="hub-media-card__body">
          <h4>
            {icon ? <i className={`${icon} me-2`} aria-hidden="true"/> : null}
            {title}
          </h4>
          {meta ? <p className="hub-item-card__meta">{meta}</p> : null}
          {summary ? <p>{summary}</p> : null}
          {to ? (
            <span className="hub-media-card__open">
              {actionLabel}
              <i className="fas fa-arrow-right ms-1" aria-hidden="true"/>
            </span>
          ) : (
            <button
              type="button"
              className="hub-media-card__open"
              onClick={(e) => {
                  e.stopPropagation();
                  onOpen?.();
              }}
            >
              {actionLabel}
              <i className="fas fa-arrow-right ms-1" aria-hidden="true"/>
            </button>
          )}
        </div>
        <div className="hub-media-card__photo">
          <img src={imageUrl(image, fallback)} alt="" loading="lazy" onError={showFallback}/>
        </div>
      </>
    );

    if (to) {
        return (
          <Link to={to} className="hub-item-card hub-media-card hub-media-card--link">
            {body}
          </Link>
        );
    }

    return (
      <article className="hub-item-card hub-media-card" onClick={onOpen}>
        {body}
      </article>
    );
}
