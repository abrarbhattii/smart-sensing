import { QueryClientProvider } from '@tanstack/react-query';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { CACHE_MAX_AGE, cacheBuster, persister, queryClient } from './queryClient';

const persistOptions = {
    persister,
    maxAge: CACHE_MAX_AGE,
    buster: cacheBuster,
    dehydrateOptions: {
        shouldDehydrateQuery: (query) => query.queryKey[0] === 'content' && query.state.status === 'success',
    },
};

export function ContentProvider({ client = queryClient, children }) {
    if (!persister || client !== queryClient)
        return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
    return (
      <PersistQueryClientProvider client={client} persistOptions={persistOptions}>
        {children}
      </PersistQueryClientProvider>
    );
}
