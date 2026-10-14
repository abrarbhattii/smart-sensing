import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { BackLink } from '../components/BackLink';
import { SectionTitle } from '../components/SectionTitle';
import { HubMediaCard } from '../components/HubMediaCard';
import { ItemDetailModal } from '../components/ItemDetailModal';
import { useContent } from '../content/useContent';
import { imageUrl } from '../utils/imageUrl';
import academyFallback from '../images/home/academia.png';
import { NotFoundPage } from './NotFoundPage';
import './HubShared.css';

const DETAIL_SECTIONS = new Set(['tutorials', 'labs', 'lectures']);

function toDataPopup(item) {
    return {
        key: item.id,
        title: item.title,
        images: item.image ? [{ src: imageUrl(item.image, academyFallback) }] : [],
        meta: [
            ['fas fa-layer-group', item.format],
            ['fas fa-signal', item.level],
        ],
        details: item.details || item.summary,
        listTitle: 'What is included',
        list: item.points,
        files: item.files,
        links: item.link ? [{ href: item.link, label: 'Open external resource', icon: 'fas fa-external-link-alt' }] : [],
    };
}

export function AcademySectionPage() {
    const { sectionId } = useParams();
    const { sections } = useContent('academy');
    const section = sections.find((s) => s.id === sectionId);
    const [selected, setSelected] = useState(null);
    const [open, setOpen] = useState(false);

    if (!section)
        return <NotFoundPage />;

    const isData = section.id === 'data';
    const useDetailPage = DETAIL_SECTIONS.has(section.id);
    const items = section.items || [];

    return (
      <main>
        <section className="section">
          <div className="container">
            <BackLink to="/Academy" label="Back to Academy" title="Back to Academy"/>
            <SectionTitle title={section.title} subtitle={section.subtitle}/>
            <p className="mb-4" style={{ color: '#64748b', maxWidth: 720 }}>
              {isData
                  ? 'Open a dataset card to preview details and downloads.'
                  : 'Select a resource for full details, materials, and media.'}
            </p>

            {items.length === 0 ? (
              <p className="text-muted">No {section.title.toLowerCase()} listed yet.</p>
            ) : (
              <div className="hub-item-list">
                {items.map((item) => (
                  <HubMediaCard
                    key={item.id || item.title}
                    icon={section.icon}
                    title={item.title}
                    meta={[item.format, item.level].filter(Boolean).join(' · ')}
                    summary={item.summary}
                    image={item.image}
                    fallback={academyFallback}
                    actionLabel={isData ? (item.files?.length ? 'View & download' : 'Open resource') : 'Open resource'}
                    to={useDetailPage ? `/Academy/${section.id}/${encodeURIComponent(item.slug || item.id)}` : undefined}
                    onOpen={isData ? () => {
                        setSelected(toDataPopup(item));
                        setOpen(true);
                    } : undefined}
                  />
                ))}
              </div>
            )}
          </div>
        </section>
        <ItemDetailModal id="academyResourceModal" item={selected} open={open} onClose={() => setOpen(false)}/>
      </main>
    );
}
