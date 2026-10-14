// @vitest-environment jsdom
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { QueryClient } from '@tanstack/react-query';
import { ContentProvider } from '../content/ContentProvider';
import { MainLayout } from '../layouts/MainLayout';
import { HomePage } from './HomePage';
import { WhoWeArePage } from './WhoWeArePage';
import { LabHubPage } from './LabHubPage';
import { AppsToolsPage } from './AppsToolsPage';
import { ResearchPage } from './ResearchPage';
import { ProjectsPage } from './ProjectsPage';
import { ProjectDetailPage } from './ProjectDetailPage';
import { SocietyHubPage } from './SocietyHubPage';
import { SocietyGroupPage } from './SocietyGroupPage';
import { EventDetailPage } from './EventDetailPage';
import { AcademyPage } from './AcademyPage';
import { AcademySectionPage } from './AcademySectionPage';
import { AcademyResourcePage } from './AcademyResourcePage';
import { TeamPage } from './TeamPage';
import { NewsEventsPage } from './NewsEventsPage';
import { PublicationTopicPage } from './PublicationTopicPage';
import { SawaidAbbasPage } from './SawaidAbbasPage';
import { SawaidAbbasFingerprintsPage } from './SawaidAbbasFingerprintsPage';
import { NotFoundPage } from './NotFoundPage';
import snapshot from '../content/snapshot.json';

vi.mock('chart.js/auto', () => ({
    Chart: class {
        destroy() { }
    },
}));

beforeAll(() => {
    globalThis.IS_REACT_ACT_ENVIRONMENT = true;
    window.matchMedia ||= () => ({ matches: false, addEventListener() { }, removeEventListener() { } });
    window.scrollTo = () => { };
    Element.prototype.scrollIntoView = () => { };
    globalThis.IntersectionObserver = class {
        observe() { }
        disconnect() { }
    };
    globalThis.fetch = vi.fn(async () => ({ ok: false, json: async () => null }));
});

let container;
let root;

afterEach(() => {
    act(() => root.unmount());
    container.remove();
});

function renderAt(path, element, routePath = path) {
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
    act(() => {
        root.render(<ContentProvider client={new QueryClient()}>
          <MemoryRouter initialEntries={[path]}>
            <Routes>
              <Route element={<MainLayout />}>
                <Route path={routePath} element={element}/>
              </Route>
            </Routes>
          </MemoryRouter>
        </ContentProvider>);
    });
    return container;
}

describe('pages render without crashing', () => {
    const cases = [
        ['/Home', HomePage, 'Smart Sensing for Climate'],
        ['/Who-We-Are', WhoWeArePage, 'What We Do'],
        ['/Lab', LabHubPage, 'SCD Lab'],
        ['/Lab/Research', ResearchPage, 'Core Research Areas'],
        ['/Lab/Projects', ProjectsPage, 'Our Projects'],
        ['/Lab/Apps-Tools', AppsToolsPage, 'Apps & Tools'],
        ['/Society', SocietyHubPage, 'SCD Society'],
        ['/Society/Events', NewsEventsPage, 'Past Events'],
        ['/Academy', AcademyPage, 'SCD Research Academy'],
        ['/People', TeamPage, 'Our Team'],
        ['/People/sawaid-abbas', SawaidAbbasPage, 'Research Output'],
        ['/People/sawaid-abbas-fingerprints', SawaidAbbasFingerprintsPage, 'Keyphrases'],
        ['/missing', NotFoundPage, 'Page not found'],
    ];
    it.each(cases)('%s', (path, Page, text) => {
        const el = renderAt(path, <Page />);
        expect(el.textContent).toContain(text);
    });

    it('renders a publication topic page by slug', () => {
        const el = renderAt('/Lab/Research/climate', <PublicationTopicPage />, '/Lab/Research/:slug');
        expect(el.textContent).toContain('Climate Change & Environmental Monitoring');
    });

    it('shows not found for an unknown publication slug', () => {
        const el = renderAt('/Lab/Research/nope', <PublicationTopicPage />, '/Lab/Research/:slug');
        expect(el.textContent).toContain('Page not found');
    });

    it('renders a project detail page', () => {
        const project = snapshot.data.projects[0];
        const el = renderAt(`/Lab/Projects/${project.id}`, <ProjectDetailPage />, '/Lab/Projects/:slug');
        expect(el.textContent).toContain(project.title);
    });

    it('renders an academy section listing page', () => {
        const section = snapshot.data.academy.sections.find((s) => s.id === 'tutorials');
        const el = renderAt('/Academy/tutorials', <AcademySectionPage />, '/Academy/:sectionId');
        expect(el.textContent).toContain(section.title);
    });

    it('renders an academy tutorial detail page', () => {
        const section = snapshot.data.academy.sections.find((s) => s.id === 'tutorials');
        const item = section.items[0];
        const el = renderAt(`/Academy/tutorials/${item.id}`, <AcademyResourcePage />, '/Academy/:sectionId/:slug');
        expect(el.textContent).toContain(item.title);
    });

    it('renders a society category listing page', () => {
        const group = snapshot.data.society.groups[0];
        const el = renderAt(`/Society/${group.id}`, <SocietyGroupPage />, '/Society/:groupId');
        expect(el.textContent).toContain(group.title);
    });

    it('renders an event detail page from news & events', () => {
        const event = snapshot.data.events[0];
        const el = renderAt(`/Society/Events/${event.slug || event.id}`, <EventDetailPage />, '/Society/Events/:slug');
        expect(el.textContent).toContain(event.title);
    });

    it('shows not found for spatial-data academy detail route', () => {
        const section = snapshot.data.academy.sections.find((s) => s.id === 'data');
        const item = section?.items[0];
        if (!item)
            return;
        const el = renderAt(`/Academy/data/${item.id}`, <AcademyResourcePage />, '/Academy/:sectionId/:slug');
        expect(el.textContent).toContain('Page not found');
    });
});
