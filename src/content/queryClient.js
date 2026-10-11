import { QueryClient } from '@tanstack/react-query';
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister';
import snapshot from './snapshot.json';

const MINUTE = 60 * 1000;
const DAY = 24 * 60 * MINUTE;

export const CACHE_MAX_AGE = 7 * DAY;

export const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: MINUTE,
            gcTime: CACHE_MAX_AGE,
            refetchOnWindowFocus: false,
            retry: 1,
        },
    },
});

export const persister = typeof window !== 'undefined' && window.localStorage
    ? createSyncStoragePersister({ storage: window.localStorage, key: 'scd:content' })
    : undefined;

// A new deploy ships a newer snapshot, so older persisted caches are discarded.
export const cacheBuster = snapshot.generatedAt || 'none';
