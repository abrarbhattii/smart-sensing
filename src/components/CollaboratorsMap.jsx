import { useEffect, useMemo, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, GeoJSON, LayersControl, useMap } from 'react-leaflet';
import L from 'leaflet';
import { imageUrl } from '../utils/imageUrl';
import './CollaboratorsMap.css';

const COUNTRIES_URL = 'https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_110m_admin_0_countries.geojson';
const FIT_OPTIONS = { padding: [40, 40], maxZoom: 12 };

let countriesRequest = null;
function loadCountries() {
    if (!countriesRequest) {
        countriesRequest = fetch(COUNTRIES_URL)
            .then((r) => (r.ok ? r.json() : null))
            .catch(() => null)
            .then((data) => {
                if (!data)
                    countriesRequest = null;
                return data;
            });
    }
    return countriesRequest;
}

function fitToCollaborators(map, bounds, collaborators) {
    if (collaborators.length === 1) {
        map.setView([collaborators[0].lat, collaborators[0].lng], 8);
    }
    else if (bounds) {
        map.fitBounds(bounds, FIT_OPTIONS);
    }
}

function HomeControl({ bounds, collaborators }) {
    const map = useMap();
    useEffect(() => {
        const HomeBtn = L.Control.extend({
            onAdd() {
                const btn = L.DomUtil.create('button', 'collaborators-map__home-btn');
                btn.type = 'button';
                btn.title = 'Reset to original extent';
                btn.setAttribute('aria-label', 'Reset map to original extent');
                btn.innerHTML = '<i class="fas fa-home" aria-hidden="true"></i>';
                L.DomEvent.disableClickPropagation(btn);
                L.DomEvent.on(btn, 'click', () => fitToCollaborators(map, bounds, collaborators));
                return btn;
            },
        });
        const control = new HomeBtn({ position: 'topleft' });
        map.addControl(control);
        return () => {
            map.removeControl(control);
        };
    }, [map, bounds, collaborators]);
    return null;
}

function MapResizer() {
    const map = useMap();
    useEffect(() => {
        const onResize = () => map.invalidateSize();
        window.addEventListener('resize', onResize);
        return () => window.removeEventListener('resize', onResize);
    }, [map]);
    return null;
}

function FitBounds({ bounds, collaborators }) {
    const map = useMap();
    useEffect(() => {
        fitToCollaborators(map, bounds, collaborators);
    }, [map, bounds, collaborators]);
    return null;
}

function escapeHtml(value) {
    return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function collaboratorIcon(collaborator) {
    const safeName = escapeHtml(collaborator.name);
    const initials = escapeHtml(String(collaborator.name).slice(0, 2).toUpperCase());
    const logoSrc = collaborator.logo ? imageUrl(collaborator.logo) : '';
    const logoHtml = logoSrc
        ? `<img class="collaborators-marker__logo" src="${escapeHtml(logoSrc)}" alt="${safeName}" />`
        : `<span class="collaborators-marker__logo collaborators-marker__logo--fallback" aria-hidden="true">${initials}</span>`;

    return L.divIcon({
        className: 'collaborators-marker',
        html: `
      <div class="collaborators-marker__stack">
        <span class="collaborators-marker__bubble">${safeName}</span>
        <span class="collaborators-marker__avatar">${logoHtml}</span>
      </div>
    `,
        iconSize: [140, 64],
        iconAnchor: [22, 64],
        popupAnchor: [0, -56],
    });
}

/** Group markers that sit within ~pixelThreshold of each other at the current zoom. */
function buildOverlapGroups(collaborators, map, pixelThreshold = 56) {
    const points = collaborators.map((c) => map.latLngToLayerPoint([c.lat, c.lng]));
    const groups = collaborators.map((_, i) => i);
    const find = (i) => {
        while (groups[i] !== i)
            i = groups[i] = groups[groups[i]];
        return i;
    };
    const unite = (a, b) => {
        const ra = find(a);
        const rb = find(b);
        if (ra !== rb)
            groups[rb] = ra;
    };
    for (let i = 0; i < points.length; i += 1) {
        for (let j = i + 1; j < points.length; j += 1) {
            if (points[i].distanceTo(points[j]) < pixelThreshold)
                unite(i, j);
        }
    }
    const byRoot = new Map();
    collaborators.forEach((_, i) => {
        const root = find(i);
        if (!byRoot.has(root))
            byRoot.set(root, []);
        byRoot.get(root).push(i);
    });
    return collaborators.map((_, i) => {
        const members = byRoot.get(find(i));
        return { members, indexInGroup: members.indexOf(i) };
    });
}

function CollaboratorMarker({ collaborator: c, allCollaborators }) {
    const map = useMap();
    const [position, setPosition] = useState([c.lat, c.lng]);
    const icon = useMemo(
        () => collaboratorIcon(c),
        [c.name, c.logo],
    );

    useEffect(() => {
        const updatePosition = () => {
            const groups = buildOverlapGroups(allCollaborators, map);
            const selfIndex = allCollaborators.findIndex((item) => item.name === c.name);
            const group = groups[selfIndex];
            if (!group || group.members.length < 2) {
                setPosition([c.lat, c.lng]);
                return;
            }
            // Fan overlapping markers out in screen space so nearby partners (e.g. AFCD + KFBG) both show
            const angle = ((2 * Math.PI * group.indexInGroup) / group.members.length) - Math.PI / 2;
            const radius = 40 + Math.max(0, group.members.length - 2) * 8;
            const base = map.latLngToLayerPoint([c.lat, c.lng]);
            const offset = L.point(
                base.x + radius * Math.cos(angle),
                base.y + radius * Math.sin(angle),
            );
            const latLng = map.layerPointToLatLng(offset);
            setPosition([latLng.lat, latLng.lng]);
        };
        updatePosition();
        map.on('zoomend', updatePosition);
        map.on('moveend', updatePosition);
        return () => {
            map.off('zoomend', updatePosition);
            map.off('moveend', updatePosition);
        };
    }, [map, c.lat, c.lng, c.name, allCollaborators]);

    const eventHandlers = useMemo(() => ({
        dblclick: (e) => {
            L.DomEvent.stopPropagation(e);
            map.setView([c.lat, c.lng], 16, { animate: true });
        },
    }), [map, c.lat, c.lng]);
    return (<Marker position={position} icon={icon} eventHandlers={eventHandlers} title={c.name} alt={c.name}>
      <Popup>
        <CollaboratorPopup collaborator={c}/>
      </Popup>
    </Marker>);
}

export function CollaboratorsMap({ collaborators }) {
    const bounds = useMemo(() => (collaborators.length
        ? L.latLngBounds(collaborators.map((c) => [c.lat, c.lng]))
        : null), [collaborators]);
    if (!collaborators.length) {
        return <p className="collaborators-map__empty">No collaborators to display.</p>;
    }
    return (<div className="collaborators-map">
      <MapContainer center={[25, 60]} zoom={2} scrollWheelZoom className="collaborators-map__canvas" id="collaboratorsMapCanvas" style={{ height: '500px', width: '100%' }}>
        <LayersControl position="topright">
          <LayersControl.BaseLayer checked name="Satellite">
            <TileLayer attribution="Tiles &copy; Esri &mdash; Source: Esri, Maxar, Earthstar Geographics, and the GIS User Community" url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}" maxZoom={20}/>
          </LayersControl.BaseLayer>
          <LayersControl.BaseLayer name="Streets">
            <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>' url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png" subdomains="abcd" maxZoom={20}/>
          </LayersControl.BaseLayer>
          <LayersControl.Overlay checked name="Country boundaries">
            <GeoJSONLayer />
          </LayersControl.Overlay>
        </LayersControl>

        {collaborators.map((c) => (
          <CollaboratorMarker key={c.name} collaborator={c} allCollaborators={collaborators}/>
        ))}

        <FitBounds bounds={bounds} collaborators={collaborators}/>
        <HomeControl bounds={bounds} collaborators={collaborators}/>
        <MapResizer />
      </MapContainer>
    </div>);
}

const COUNTRY_STYLE = {
    color: 'rgba(255, 255, 255, 0.6)',
    weight: 1,
    fillColor: 'transparent',
    fillOpacity: 0,
};

function GeoJSONLayer() {
    const [data, setData] = useState(null);
    useEffect(() => {
        let cancelled = false;
        loadCountries().then((result) => {
            if (!cancelled)
                setData(result);
        });
        return () => {
            cancelled = true;
        };
    }, []);
    if (!data)
        return null;
    return (<GeoJSON data={data} style={COUNTRY_STYLE} interactive={false}/>);
}

function CollaboratorPopup({ collaborator: c }) {
    const map = useMap();
    return (<div className="collaborators-popup">
      <div className="collaborators-popup__header">
        {c.logo ? (<img src={imageUrl(c.logo)} alt={c.name} className="collaborators-popup__logo" onError={(e) => {
                e.currentTarget.style.display = 'none';
            }}/>) : null}
        <div>
          <strong className="collaborators-popup__name">{c.name}</strong>
          {c.fullName && c.fullName !== c.name ? (<span className="collaborators-popup__full">{c.fullName}</span>) : null}
        </div>
      </div>
      <p className="collaborators-popup__location">
        <i className="fas fa-map-pin me-1" aria-hidden="true"/>
        {c.location}
      </p>
      <div className="collaborators-popup__actions">
        <button type="button" className="collaborators-popup__zoom-btn" title="Zoom to view location" onClick={() => map.setView([c.lat, c.lng], 16, { animate: true })}>
          <i className="fas fa-search-plus me-1" aria-hidden="true"/>
          Zoom to view
        </button>
        {c.url ? (<a href={c.url} target="_blank" rel="noopener noreferrer" className="collaborators-popup__link">
            Visit website <i className="fas fa-external-link-alt ms-1" aria-hidden="true"/>
          </a>) : null}
      </div>
    </div>);
}
