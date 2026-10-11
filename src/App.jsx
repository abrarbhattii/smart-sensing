import { lazy, Suspense } from 'react';
import { BrowserRouter, Navigate, Route, Routes, useParams } from 'react-router-dom';
import { MainLayout } from './layouts/MainLayout';
import { useContent } from './content/useContent';
import { publicationPath } from './constants/routes';

const HomePage = lazy(() => import('./pages/HomePage').then((m) => ({ default: m.HomePage })));
const WhoWeArePage = lazy(() => import('./pages/WhoWeArePage').then((m) => ({ default: m.WhoWeArePage })));
const LabHubPage = lazy(() => import('./pages/LabHubPage').then((m) => ({ default: m.LabHubPage })));
const AppsToolsPage = lazy(() => import('./pages/AppsToolsPage').then((m) => ({ default: m.AppsToolsPage })));
const ResearchPage = lazy(() => import('./pages/ResearchPage').then((m) => ({ default: m.ResearchPage })));
const ProjectsPage = lazy(() => import('./pages/ProjectsPage').then((m) => ({ default: m.ProjectsPage })));
const ProjectDetailPage = lazy(() => import('./pages/ProjectDetailPage').then((m) => ({ default: m.ProjectDetailPage })));
const SocietyHubPage = lazy(() => import('./pages/SocietyHubPage').then((m) => ({ default: m.SocietyHubPage })));
const SocietyItemPage = lazy(() => import('./pages/SocietyItemPage').then((m) => ({ default: m.SocietyItemPage })));
const AcademyPage = lazy(() => import('./pages/AcademyPage').then((m) => ({ default: m.AcademyPage })));
const AcademyResourcePage = lazy(() => import('./pages/AcademyResourcePage').then((m) => ({ default: m.AcademyResourcePage })));
const TeamPage = lazy(() => import('./pages/TeamPage').then((m) => ({ default: m.TeamPage })));
const NewsEventsPage = lazy(() => import('./pages/NewsEventsPage').then((m) => ({ default: m.NewsEventsPage })));
const PublicationTopicPage = lazy(() => import('./pages/PublicationTopicPage').then((m) => ({ default: m.PublicationTopicPage })));
const SawaidAbbasPage = lazy(() => import('./pages/SawaidAbbasPage').then((m) => ({ default: m.SawaidAbbasPage })));
const SawaidAbbasFingerprintsPage = lazy(() => import('./pages/SawaidAbbasFingerprintsPage').then((m) => ({ default: m.SawaidAbbasFingerprintsPage })));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage').then((m) => ({ default: m.NotFoundPage })));
const AdminApp = lazy(() => import('./admin/AdminApp').then((m) => ({ default: m.AdminApp })));

function PageFallback() {
  return (
    <div className="text-center py-5">
      <div className="loading"/>
    </div>
  );
}

function page(element) {
  return <Suspense fallback={<PageFallback />}>{element}</Suspense>;
}

function ResearchSlugRedirect() {
  const { slug } = useParams();
  return <Navigate to={`/Lab/Research/${slug}`} replace/>;
}

function App() {
  const { areas } = useContent('research');
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/Home" replace/>}/>
        <Route path="/admin/*" element={page(<AdminApp />)}/>

        <Route element={<MainLayout activeRoute="home"/>}>
          <Route path="/Home" element={page(<HomePage />)}/>
        </Route>

        <Route element={<MainLayout activeRoute="who"/>}>
          <Route path="/Who-We-Are" element={page(<WhoWeArePage />)}/>
        </Route>

        <Route element={<MainLayout activeRoute="lab"/>}>
          <Route path="/Lab" element={page(<LabHubPage />)}/>
          <Route path="/Lab/Research" element={page(<ResearchPage />)}/>
          <Route path="/Lab/Research/:slug" element={page(<PublicationTopicPage />)}/>
          <Route path="/Lab/Projects" element={page(<ProjectsPage />)}/>
          <Route path="/Lab/Projects/:slug" element={page(<ProjectDetailPage />)}/>
          <Route path="/Lab/Apps-Tools" element={page(<AppsToolsPage />)}/>
        </Route>

        <Route element={<MainLayout activeRoute="society"/>}>
          <Route path="/Society" element={page(<SocietyHubPage />)}/>
          <Route path="/Society/Events" element={page(<NewsEventsPage />)}/>
          <Route path="/Society/:groupId/:slug" element={page(<SocietyItemPage />)}/>
        </Route>

        <Route element={<MainLayout activeRoute="academy"/>}>
          <Route path="/Academy" element={page(<AcademyPage />)}/>
          <Route path="/Academy/:sectionId/:slug" element={page(<AcademyResourcePage />)}/>
        </Route>

        <Route element={<MainLayout activeRoute="people"/>}>
          <Route path="/People" element={page(<TeamPage />)}/>
          <Route path="/People/sawaid-abbas" element={page(<SawaidAbbasPage />)}/>
          <Route path="/People/sawaid-abbas-fingerprints" element={page(<SawaidAbbasFingerprintsPage />)}/>
        </Route>

        <Route path="/Research" element={<Navigate to="/Lab/Research" replace/>}/>
        <Route path="/Research/:slug" element={<ResearchSlugRedirect />}/>
        <Route path="/Projects" element={<Navigate to="/Lab/Projects" replace/>}/>
        <Route path="/Team" element={<Navigate to="/People" replace/>}/>
        <Route path="/News_Events" element={<Navigate to="/Society/Events" replace/>}/>
        <Route path="/sawaid-abbas" element={<Navigate to="/People/sawaid-abbas" replace/>}/>
        <Route path="/sawaid-abbas-fingerprints" element={<Navigate to="/People/sawaid-abbas-fingerprints" replace/>}/>

        <Route path="/Home.html" element={<Navigate to="/Home" replace/>}/>
        <Route path="/Research.html" element={<Navigate to="/Lab/Research" replace/>}/>
        <Route path="/Projects.html" element={<Navigate to="/Lab/Projects" replace/>}/>
        <Route path="/Team.html" element={<Navigate to="/People" replace/>}/>
        <Route path="/News_Events.html" element={<Navigate to="/Society/Events" replace/>}/>
        {areas.filter((p) => p.legacyFilename).map((p) => (
          <Route key={p.legacyFilename} path={`/${p.legacyFilename}`} element={<Navigate to={publicationPath(p.slug)} replace/>}/>
        ))}

        <Route element={<MainLayout />}>
          <Route path="*" element={page(<NotFoundPage />)}/>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
