const PLACEHOLDER_AUTHORS = 'Authors to be added.';
const PLACEHOLDER_JOURNAL = 'Journal to be added.';
const CACHE_KEY = 'scd:doi-metadata:v1';
const CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000;
const REQUEST_GAP_MS = 400;

export function cleanDoi(doi) {
    return String(doi || '').trim().replace(/^https?:\/\/doi\.org\//i, '').trim();
}

export function aggregateCitationsByYear(papers) {
    const byYear = {};
    for (const p of papers) {
        const y = parseInt(p.year, 10);
        if (isNaN(y))
            continue;
        const cites = typeof p.citations === 'number' ? p.citations : parseInt(String(p.citations), 10) || 0;
        byYear[y] = (byYear[y] || 0) + cites;
    }
    const years = Object.keys(byYear)
        .map(Number)
        .sort((a, b) => a - b);
    return {
        labels: years.map(String),
        data: years.map((y) => byYear[y]),
    };
}

export function sortPapers(papers) {
    return [...papers].sort((a, b) => {
        const ya = parseInt(a.year, 10) || 0;
        const yb = parseInt(b.year, 10) || 0;
        return yb - ya;
    });
}

export async function fetchFromDoi(doi) {
    const id = cleanDoi(doi);
    if (!id)
        return null;
    try {
        const res = await fetch(`https://api.crossref.org/works/${encodeURIComponent(id)}`);
        if (!res.ok)
            return null;
        const data = await res.json();
        const work = data?.message;
        if (!work)
            return null;
        const authors = work.author?.map((a) => `${a.given || ''} ${a.family || ''}`.trim()).join(', ');
        const abstract = work.abstract?.replace(/<[^>]+>/g, '').replace(/^\s*Abstract\s*/i, '').trim() || '';
        return {
            title: work.title?.[0] || '',
            authors: authors || '',
            year: work.published?.['date-parts']?.[0]?.[0] ||
                work['published-online']?.['date-parts']?.[0]?.[0] ||
                work.created?.['date-parts']?.[0]?.[0] ||
                '',
            journal: work['container-title']?.[0] || '',
            volume: work.volume || '',
            pages: work.page || work['article-number'] || '',
            doi: id,
            abstract,
            url: work.URL || `https://doi.org/${id}`,
        };
    }
    catch {
        return null;
    }
}

export async function fetchAbstractFromSemanticScholar(doi) {
    const id = cleanDoi(doi);
    if (!id)
        return null;
    try {
        const res = await fetch(`https://api.semanticscholar.org/graph/v1/paper/DOI:${encodeURIComponent(id)}?fields=abstract,citationCount`, { headers: { Accept: 'application/json' } });
        if (!res.ok)
            return null;
        const data = await res.json();
        const result = {};
        if (data?.abstract)
            result.abstract = data.abstract;
        if (typeof data?.citationCount === 'number')
            result.citationCount = data.citationCount;
        return Object.keys(result).length ? result : null;
    }
    catch {
        return null;
    }
}

function readCache() {
    try {
        return JSON.parse(localStorage.getItem(CACHE_KEY) || '{}');
    }
    catch {
        return {};
    }
}

function writeCache(cache) {
    try {
        localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
    }
    catch {
        // Storage can be full or disabled; the cache is only an optimisation.
    }
}

const inFlight = new Map();
let lastRequestAt = 0;

async function waitForRequestSlot() {
    const wait = lastRequestAt + REQUEST_GAP_MS - Date.now();
    lastRequestAt = Math.max(Date.now(), lastRequestAt + REQUEST_GAP_MS);
    if (wait > 0)
        await new Promise((r) => setTimeout(r, wait));
}

async function loadDoiMetadata(id) {
    const cached = readCache()[id];
    if (cached && Date.now() - cached.savedAt < CACHE_TTL_MS)
        return cached.meta;
    if (inFlight.has(id))
        return inFlight.get(id);
    const request = (async () => {
        await waitForRequestSlot();
        const [scholar, crossref] = await Promise.all([
            fetchAbstractFromSemanticScholar(id),
            fetchFromDoi(id),
        ]);
        const meta = { scholar, crossref };
        if (scholar || crossref) {
            const cache = readCache();
            cache[id] = { savedAt: Date.now(), meta };
            writeCache(cache);
        }
        return meta;
    })();
    inFlight.set(id, request);
    try {
        return await request;
    }
    finally {
        inFlight.delete(id);
    }
}

export function mergeDoiMetadata(paper, { scholar, crossref }) {
    const p = { ...paper };
    if (crossref) {
        if (!p.authors || p.authors === PLACEHOLDER_AUTHORS)
            p.authors = crossref.authors || p.authors;
        if (!p.journal || p.journal === PLACEHOLDER_JOURNAL)
            p.journal = crossref.journal || p.journal;
        if (!p.volume)
            p.volume = crossref.volume || p.volume;
        if (!p.pages)
            p.pages = crossref.pages || p.pages;
        if (!p.year || p.year === '—')
            p.year = String(crossref.year || p.year || '');
        if (!p.url && crossref.url)
            p.url = crossref.url;
    }
    const abstract = scholar?.abstract || crossref?.abstract;
    if (abstract)
        p.abstract = abstract;
    if (p.citations == null && typeof scholar?.citationCount === 'number')
        p.citations = scholar.citationCount;
    return p;
}

export async function enrichPapersFromDoi(papers) {
    return Promise.all(papers.map(async (paper) => {
        const id = cleanDoi(paper.doi);
        if (!id)
            return paper;
        return mergeDoiMetadata(paper, await loadDoiMetadata(id));
    }));
}
