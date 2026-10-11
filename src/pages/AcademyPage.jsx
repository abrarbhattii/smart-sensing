import { useState } from 'react';
import { SectionTitle } from '../components/SectionTitle';
import { HubMediaCard } from '../components/HubMediaCard';
import { ItemDetailModal } from '../components/ItemDetailModal';
import { useContent } from '../content/useContent';
import { imageUrl } from '../utils/imageUrl';
import academyFallback from '../images/home/academia.png';
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

export function AcademyPage() {
    const { intro: academyIntro, sections: academySections } = useContent('academy');
    const [selected, setSelected] = useState(null);
    const [open, setOpen] = useState(false);

    return (
      <main>
        <section className="section">
          <div className="container">
            <SectionTitle title={academyIntro.title} subtitle={academyIntro.subtitle}/>
            <p className="mx-auto text-center" style={{ maxWidth: 760, color: '#475569' }}>
              {academyIntro.summary}
            </p>

            {academySections.map((section) => (
              <div key={section.id} className="hub-section-block" id={section.id}>
                <SectionTitle title={section.title} subtitle={section.subtitle}/>
                <div className="hub-item-list">
                  {section.items.map((item) => {
                      const isData = section.id === 'data';
                      const useDetailPage = DETAIL_SECTIONS.has(section.id);
                      return (
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
                      );
                  })}
                </div>
              </div>
            ))}
          </div>
        </section>
        <ItemDetailModal id="academyResourceModal" item={selected} open={open} onClose={() => setOpen(false)}/>
      </main>
    );
}
