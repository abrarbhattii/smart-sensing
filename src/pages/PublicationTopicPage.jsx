import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useContent } from '../content/useContent';
import { BackLink } from '../components/BackLink';
import { SectionTitle } from '../components/SectionTitle';
import { PublicationList } from '../components/PublicationList';
import { CitationsChart } from '../components/CitationsChart';
import { NotFoundPage } from './NotFoundPage';
import { enrichPapersFromDoi } from '../services/publicationsService';
import './PublicationTopicPage.css';

function useEnrichedPapers(papers) {
    const [state, setState] = useState({ source: papers, papers });
    useEffect(() => {
        let cancelled = false;
        enrichPapersFromDoi(papers).then((enriched) => {
            if (!cancelled)
                setState({ source: papers, papers: enriched });
        });
        return () => {
            cancelled = true;
        };
    }, [papers]);
    return state.source === papers ? state.papers : papers;
}

export function PublicationTopicPage() {
    const { slug } = useParams();
    const { areas } = useContent('research');
    const page = areas.find((p) => p.slug === slug);
    const papers = useEnrichedPapers(page?.papers ?? EMPTY);
    if (!page) {
        return <NotFoundPage />;
    }
    return (<section id="projects" className="section">
      <div className="container">
        <BackLink to="/Lab/Research" label="Back to Research" title="Back to Research"/>
        <SectionTitle title={page.pageTitle} subtitle={page.subtitle}/>
        <div className="publications-layout">
          <div className="publications-list" id="publicationsContainer">
            <PublicationList papers={papers}/>
          </div>
          <div className="citations-chart" id="citationsChartContainer">
            <CitationsChart papers={papers}/>
          </div>
        </div>
      </div>
    </section>);
}

const EMPTY = [];
