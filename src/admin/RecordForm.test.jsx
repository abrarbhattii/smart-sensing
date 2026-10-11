// @vitest-environment jsdom
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeAll, describe, expect, it, vi } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RecordForm } from './RecordForm';
import { TABLES } from './schema';

vi.mock('./adminApi', () => ({
    getRecord: vi.fn(async () => null),
    saveRecord: vi.fn(async () => 'new-id'),
    listOptions: vi.fn(async () => []),
    uploadImage: vi.fn(),
    uploadFile: vi.fn(),
}));

beforeAll(() => {
    globalThis.IS_REACT_ACT_ENVIRONMENT = true;
});

async function renderForm(path) {
    const container = document.createElement('div');
    document.body.appendChild(container);
    const root = createRoot(container);
    await act(async () => {
        root.render(
          <QueryClientProvider client={new QueryClient()}>
            <MemoryRouter initialEntries={[path]}>
              <Routes>
                <Route path="/admin/:table" element={<RecordForm />}/>
                <Route path="/admin/:table/new" element={<RecordForm />}/>
              </Routes>
            </MemoryRouter>
          </QueryClientProvider>,
        );
    });
    return {
        container,
        cleanup: () => {
            act(() => root.unmount());
            container.remove();
        },
    };
}

describe('admin RecordForm', () => {
    for (const table of Object.values(TABLES)) {
        it(`renders and validates the ${table.name} form`, async () => {
            const { container, cleanup } = await renderForm(table.singleton ? `/admin/${table.name}` : `/admin/${table.name}/new`);
            const form = container.querySelector('form');
            expect(form).toBeTruthy();
            await act(async () => {
                form.requestSubmit();
            });
            expect(container.querySelector('.alert-danger')).toBeNull();
            cleanup();
        });
    }
});
