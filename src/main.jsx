import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap';
import 'leaflet/dist/leaflet.css';
import './styles/index.css';
import App from './App';
import { ContentProvider } from './content/ContentProvider';
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ContentProvider>
      <App />
    </ContentProvider>
  </StrictMode>
);
