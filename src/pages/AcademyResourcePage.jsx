import { useParams } from 'react-router-dom';
import { BackLink } from '../components/BackLink';
import { SectionTitle } from '../components/SectionTitle';
import { ContentBlocks, DownloadList, MetaList, Paragraphs, VideoEmbed } from '../components/DetailContent';
import { useContent } from '../content/useContent';
import { imageUrl } from '../utils/imageUrl';
import { isVideoUrl } from '../utils/mediaEmbed';
import academyFallback from '../images/home/academia.png';
import { NotFoundPage } from './NotFoundPage';
import './DetailShared.css';

const PAGE_SECTIONS = new Set(['tutorials', 'labs', 'lectures']);

export function AcademyResourcePage() {
    const { sectionId, slug } = useParams();
    const { sections } = useContent('academy');
    const section = sections.find((s) => s.id === sectionId);
    const item = section?.items.find((i) => i.slug === slug || i.id === slug);

    if (!PAGE_SECTIONS.has(sectionId) || !section || !item)
        return <NotFoundPage />;

    const isLecture = sectionId === 'lectures';
    const showBlocks = sectionId === 'tutorials' || sectionId === 'labs';
    // Prefer video_url; for lectures also accept a YouTube/Vimeo URL pasted in the external link field.
    const videoUrl = item.video || (isLecture && isVideoUrl(item.link) ? item.link : '');

    return (
      <main>
        <section className="section">
          <div className="container">
            <BackLink to={`/Academy#${sectionId}`} label={`Back to ${section.title}`} title={`Back to ${section.title}`}/>
            <div className="detail-page__hero">
              <div>
                <SectionTitle title={item.title} subtitle={section.title}/>
                <MetaList items={[
                    ['fas fa-layer-group', item.format],
                    ['fas fa-signal', item.level],
                    ['far fa-clock', item.duration],
                    ['fas fa-chalkboard-teacher', item.instructor],
                ]}/>
                <Paragraphs text={item.details || item.summary}/>
              </div>
              {item.image ? (
                <div className="detail-page__hero-media">
                  <img src={imageUrl(item.image, academyFallback)} alt=""/>
                </div>
              ) : null}
            </div>

            {videoUrl ? <VideoEmbed url={videoUrl} title={item.title}/> : null}
            <DownloadList files={item.files}/>
            {showBlocks ? <ContentBlocks sections={item.sections} fallbackImage={academyFallback}/> : null}

            {item.link && item.link !== videoUrl ? (
              <div className="detail-page__actions">
                <a href={item.link} target="_blank" rel="noopener noreferrer" className="btn btn-primary">
                  <i className="fas fa-external-link-alt me-1" aria-hidden="true"/>
                  Open external resource
                </a>
              </div>
            ) : null}
          </div>
        </section>
      </main>
    );
}
