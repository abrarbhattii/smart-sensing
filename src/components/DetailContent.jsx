import { useState } from 'react';
import { downloadHref, videoEmbedUrl } from '../utils/mediaEmbed';
import { imageUrl } from '../utils/imageUrl';
import '../pages/DetailShared.css';

export function Paragraphs({ text }) {
    if (!text)
        return null;
    return (
      <div className="detail-page__prose">
        {String(text)
            .split(/\n\s*\n/)
            .map((p) => p.trim())
            .filter(Boolean)
            .map((p, i) => <p key={i}>{p}</p>)}
      </div>
    );
}

export function MetaList({ items }) {
    const meta = (items || []).filter(([, text]) => text);
    if (!meta.length)
        return null;
    return (
      <ul className="detail-page__meta">
        {meta.map(([icon, text]) => (
          <li key={`${icon}-${text}`}>
            <i className={icon} aria-hidden="true"/>
            {text}
          </li>
        ))}
      </ul>
    );
}

export function VideoEmbed({ url, title }) {
    if (!url)
        return null;
    const embed = videoEmbedUrl(url);
    const isFile = embed && /\.(mp4|webm|ogg)(\?|$)/i.test(embed);
    return (
      <div className="detail-page__video-wrap">
        <h2 className="detail-page__heading">Video</h2>
        {embed && !isFile ? (
          <div className="detail-page__video">
            <iframe
              src={embed}
              title={title || 'Video'}
              loading="lazy"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              referrerPolicy="strict-origin-when-cross-origin"
            />
          </div>
        ) : null}
        {isFile ? (
          <div className="detail-page__video">
            <video src={embed} controls playsInline title={title || 'Video'}/>
          </div>
        ) : null}
        {!embed ? (
          <a href={url} target="_blank" rel="noopener noreferrer" className="detail-page__video-fallback">
            <i className="fas fa-play-circle" aria-hidden="true"/>
            <span>Open video</span>
            <small>{url}</small>
          </a>
        ) : null}
      </div>
    );
}

export function DownloadList({ files }) {
    if (!files?.length)
        return null;
    return (
      <>
        <h2 className="detail-page__heading">Downloads</h2>
        <ul className="detail-page__files">
          {files.map((file) => (
            <li key={file.url}>
              <a href={downloadHref(file.url)} download target="_blank" rel="noopener noreferrer">
                <i className="fas fa-download" aria-hidden="true"/>
                <span>{file.label}</span>
                {file.type || file.size ? <small>{[file.type, file.size].filter(Boolean).join(' · ')}</small> : null}
              </a>
            </li>
          ))}
        </ul>
      </>
    );
}

export function ContentBlocks({ sections, fallbackImage }) {
    if (!sections?.length)
        return null;
    return sections.map((block, index) => (
      <article key={`${block.heading}-${index}`} className="detail-page__block">
        {block.heading ? <h3>{block.heading}</h3> : null}
        <Paragraphs text={block.body}/>
        {block.image ? (
          <div className="detail-page__block-image">
            <img src={imageUrl(block.image, fallbackImage)} alt={block.heading || ''} loading="lazy"/>
          </div>
        ) : null}
      </article>
    ));
}

export function ImageGallery({ images, title }) {
    const [index, setIndex] = useState(0);
    if (!images?.length)
        return null;
    const current = images[Math.min(index, images.length - 1)];
    return (
      <div className="detail-page__gallery">
        <figure className="detail-page__gallery-main">
          <img src={current.src} alt={current.caption || title || ''}/>
          {current.caption ? <figcaption>{current.caption}</figcaption> : null}
        </figure>
        {images.length > 1 ? (
          <div className="detail-page__gallery-thumbs">
            {images.map((img, i) => (
              <button
                key={`${img.src}-${i}`}
                type="button"
                className={`detail-page__gallery-thumb${i === index ? ' active' : ''}`}
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
