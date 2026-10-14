import { useCallback, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { HAS_SUPABASE } from '../lib/env';
import snapshot from './snapshot.json';

// Loaded lazily so the Supabase client stays out of the initial bundle.
async function fetchContent(key) {
    const [{ supabase }, { fetchers }] = await Promise.all([import('../lib/supabase'), import('./fetchers')]);
    return fetchers[key](supabase);
}

const EMPTY_INTRO = { title: '', subtitle: '', summary: '' };

const EMPTY_CONTENT = {
    home: { recentWork: [], collaborators: [] },
    hero: [],
    events: [],
    team: { members: [], bios: {} },
    research: { areas: [] },
    projects: [],
    labHub: { intro: EMPTY_INTRO, entries: [] },
    appsTools: { intro: EMPTY_INTRO, tools: [] },
    whoWeAre: { intro: EMPTY_INTRO, pillars: [], facts: [], keyAreas: { pillars: [], nodes: [] } },
    society: { intro: EMPTY_INTRO, groups: [] },
    academy: { intro: EMPTY_INTRO, sections: [] },
    sawaid: {
        activity: [],
        projects: [],
        keyphrases: [],
        themes: [],
        profile: { organization: '', organizationUrl: '', email: '', stats: '', outputsLabel: '', biography: '' },
        interests: [],
        keywords: [],
        education: [],
        appointments: [],
        journalArticles: [],
        underReview: [],
        bookChapters: [],
        editorialRoles: [],
    },
};

const SNAPSHOT_TIME = snapshot.generatedAt ? Date.parse(snapshot.generatedAt) : 0;

// Content each route needs, so hovering a nav link can warm the cache.
const ROUTE_CONTENT = [
    ['/Home', ['home', 'hero', 'events']],
    ['/Who-We-Are', ['whoWeAre']],
    ['/Lab/Research', ['research']],
    ['/Lab/Apps-Tools', ['appsTools']],
    ['/Lab/Projects', ['projects']],
    ['/Lab', ['labHub']],
    ['/Society/Events', ['events', 'society']],
    ['/Society', ['society', 'events']],
    ['/Academy', ['academy']],
    ['/People/sawaid-abbas', ['team', 'sawaid']],
    ['/People', ['team']],
];

export function contentQuery(key) {
    return {
        queryKey: ['content', key],
        queryFn: () => fetchContent(key),
        initialData: snapshot.data?.[key],
        initialDataUpdatedAt: SNAPSHOT_TIME,
        enabled: HAS_SUPABASE,
    };
}

/** Returns content for a group immediately (snapshot/cache) and refreshes it in the background. */
export function useContent(key) {
    const { data } = useQuery(contentQuery(key));
    return useMemo(() => {
        const fallback = EMPTY_CONTENT[key];
        if (data == null)
            return fallback;
        return Array.isArray(fallback) ? data : { ...fallback, ...data };
    }, [data, key]);
}

export function usePrefetchRoute() {
    const queryClient = useQueryClient();
    return useCallback((path) => {
        if (!HAS_SUPABASE || !path)
            return;
        const match = ROUTE_CONTENT.find(([prefix]) => path === prefix || path.startsWith(`${prefix}/`) || path.startsWith(`${prefix}#`));
        match?.[1].forEach((key) => {
            const { enabled: _enabled, ...options } = contentQuery(key);
            queryClient.prefetchQuery(options);
        });
    }, [queryClient]);
}

export function invalidateContent(queryClient) {
    return queryClient.invalidateQueries({ queryKey: ['content'] });
}
