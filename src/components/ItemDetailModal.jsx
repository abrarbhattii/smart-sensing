import { useState } from 'react';
import { downloadHref, videoEmbedUrl } from '../utils/mediaEmbed';
import { InfoModal } from './InfoModal';
import './ItemDetailModal.css';

function Paragraphs({ text }) {
    return String(text)
        .split(/\n\s*\n/)
        .map((p) => p.trim())
        .filter(Boolean)
        .map((p, i) => <p key={i}>{p}</p>);
}

function Gallery({ images, title }) {
    const [index, setIndex] = useState(0);
    const current = images[Math.min(index, images.length - 1)];
    return (
      <div className="detail-gallery">
        <figure className="detail-gallery__main">
          <img src={current.src} alt={current.caption || title}/>
          {current.caption ? <figcaption>{current.caption}</figcaption> : null}
        </figure>
        {images.length > 1 ? (
          <div className="detail-gallery__thumbs">
            {images.map((img, i) => (
              <button
                key={`${img.src}-${i}`}
                type="button"
                className={`detail-gallery__thumb${i === index ? ' active' : ''}`}
                onClick={() => setIndex(i)}
                aria-label={`Show image ${i + 1}`}
                aria-pressed={i === index}
              >
                <img src={img.src} alt=""/>
              </button>
            ))}
          </div>
        ) : null}
      </div>
    );
}

function DetailBody({ item, open }) {
    const embed = item.video ? videoEmbedUrl(item.video) : null;
    const meta = (item.meta || []).filter(([, text]) => text);
    const hasContent = item.details || item.list?.length || item.video || item.files?.length || item.links?.length;
    return (
      <div className="detail-body">
        {item.images?.length ? <Gallery key={item.key} images={item.images} title={item.title}/> : null}

        {meta.length ? (
          <ul className="detail-meta">
            {meta.map(([icon, text]) => (
              <li key={`${icon}-${text}`}>
                <i className={icon} aria-hidden="true"/>
                {text}
              </li>
            ))}
          </ul>
        ) : null}

        {item.badges?.length ? (
          <div className="detail-badges">
            {item.badges.map((b) => <span key={b.text} className={`badge bg-${b.variant || 'primary'}`}>{b.text}</span>)}
          </div>
        ) : null}

        {item.details ? <div className="detail-text"><Paragraphs text={item.details}/></div> : null}

        {item.list?.length ? (
          <>
            <h6 className="detail-heading">{item.listTitle}</h6>
            <ul className="detail-list">
              {item.list.map((text) => <li key={text}>{text}</li>)}
            </ul>
          </>
        ) : null}

        {item.video && open ? (
          embed ? (
            <div className="ratio ratio-16x9 detail-video">
              <iframe
                src={embed}
                title={item.title}
                loading="lazy"
                allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          ) : (
            <p><a href={item.video} target="_blank" rel="noopener noreferrer"><i className="fas fa-play-circle me-1" aria-hidden="true"/>Watch video</a></p>
          )
        ) : null}

        {item.files?.length ? (
          <>
            <h6 className="detail-heading">Downloads</h6>
            <ul className="detail-files">
              {item.files.map((file) => (
                <li key={file.url}>
                  <a href={downloadHref(file.url)} download target="_blank" rel="noopener noreferrer">
                    <i className="fas fa-download" aria-hidden="true"/>
                    <span className="detail-files__label">{file.label}</span>
                    {file.type || file.size ? <small>{[file.type, file.size].filter(Boolean).join(' · ')}</small> : null}
                  </a>
                </li>
              ))}
            </ul>
          </>
        ) : null}

        {item.links?.length ? (
          <div className="detail-actions">
            {item.links.map((link) => (
              <a key={link.href} href={link.href} target="_blank" rel="noopener noreferrer" className="btn btn-primary btn-sm">
                {link.icon ? <i className={`${link.icon} me-1`} aria-hidden="true"/> : null}
                {link.label}
              </a>
            ))}
          </div>
        ) : null}

        {!hasContent ? <p className="text-muted mb-0">More details coming soon.</p> : null}
      </div>
    );
}

/**
 * Popup for a card's full content. `item` fields are all optional apart from title:
 * key, images [{src, caption}], meta [[iconClass, text]], badges, details, listTitle,
 * list, video, files [{label, url, type, size}], links [{href, label, icon}].
 */
export function ItemDetailModal({ id, item, open, onClose }) {
    return (
      <InfoModal id={id} open={open} onClose={onClose} title={item?.title || ''} className="modal-abstract detail-modal">
        {item ? <DetailBody item={item} open={open}/> : null}
      </InfoModal>
    );
}
