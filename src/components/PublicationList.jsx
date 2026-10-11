import { useState } from 'react';
import { cleanDoi, sortPapers } from '../services/publicationsService';
import { InfoModal } from './InfoModal';
import './PublicationList.css';

const NO_ABSTRACT = 'Abstract to be added.';

export function PublicationList({ papers }) {
    const [selected, setSelected] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);
    const sorted = sortPapers(papers);

    const openAbstract = (paper) => {
        setSelected(paper);
        setModalOpen(true);
    };

    return (<>
      {sorted.map((p, idx) => {
            const title = p.title || 'Untitled';
            const year = p.year || '—';
            const authors = p.authors || 'Authors to be added.';
            const journal = p.journal || 'Journal to be added.';
            const volume = p.volume || '';
            const pages = p.pages || '';
            const citations = p.citations != null ? `${p.citations} citations` : '';
            const abstract = p.abstract || NO_ABSTRACT;
            const abstractShort = abstract.length > 200 ? abstract.slice(0, 200) + '…' : abstract;
            const keywords = Array.isArray(p.keywords) ? p.keywords : ['Keywords to be added'];
            const doi = cleanDoi(p.doi);
            const pdfUrl = p.pdf || p.url;
            const status = p.status || 'Published';
            const metaParts = [];
            if (volume || pages) {
                metaParts.push(`Vol. ${volume}${volume && pages ? ' · ' : ''}${pages ? `pp. ${pages}` : ''}`);
            }
            if (citations)
                metaParts.push(citations);
            return (<div key={doi || `${title}-${idx}`} className="publication-entry">
            <div className="publication-entry__header">
              <span className="publication-entry__bullet"/>
              <div className="publication-entry__title-wrap">
                <h3 className="publication-entry__title">
                  {p.url ? (<a href={p.url} target="_blank" rel="noopener noreferrer">
                      {title}
                    </a>) : (title)}
                </h3>
              </div>
              <span className="publication-entry__year">{year}</span>
            </div>
            <p className="publication-entry__authors">{authors}</p>
            <div className="publication-entry__meta">
              <span className="publication-entry__journal">{journal}</span>
              {metaParts.length ? metaParts.join(' · ') : ''}
              <i className="fas fa-clock ms-1" aria-hidden="true"/>
              {status === 'Published' ? <i className="fas fa-lock ms-1" title="Published"/> : null}
            </div>
            <p className="publication-entry__abstract">{abstractShort}</p>
            <div className="publication-entry__keywords">
              {keywords.map((k, kIdx) => (<span key={`${k}-${kIdx}`} className="publication-entry__keyword">
                  {k}
                </span>))}
            </div>
            <div className="publication-entry__actions">
              <div className="publication-entry__actions-left">
                {pdfUrl ? (<a href={pdfUrl} target="_blank" rel="noopener noreferrer" className="publication-entry__btn-pdf">
                    PDF
                  </a>) : null}
                {doi ? (<a href={`https://doi.org/${doi}`} target="_blank" rel="noopener noreferrer" className="publication-entry__doi">
                    DOI: {doi}
                  </a>) : (<span className="publication-entry__doi">DOI: to be added</span>)}
              </div>
              <button type="button" className="publication-entry__btn-abstract" onClick={() => openAbstract(p)}>
                Read abstract <i className="fas fa-chevron-down ms-1" aria-hidden="true"/>
              </button>
            </div>
          </div>);
        })}
      <InfoModal open={modalOpen} onClose={() => setModalOpen(false)} title={selected?.title || 'Abstract'}>
        {selected?.abstract && selected.abstract !== NO_ABSTRACT ? selected.abstract : 'No abstract available.'}
      </InfoModal>
    </>);
}
