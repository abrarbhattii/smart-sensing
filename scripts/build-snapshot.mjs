// Fetches all published content from Supabase and writes
// src/content/snapshot.json, which ships inside the bundle so every page can
// render instantly before the live data refresh finishes.
// Any group that fails to load keeps its previous snapshot value, and the
// build never fails because of the snapshot.
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { createClient } from '@supabase/supabase-js';
import { CONTENT_KEYS, fetchers } from '../src/content/fetchers.js';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
try {
    process.loadEnvFile(join(root, '.env.local'));
}
catch {
    // Use variables from the environment (e.g. hosting provider settings).
}

const url = process.env.VITE_SUPABASE_URL;
const anonKey = process.env.VITE_SUPABASE_ANON_KEY;
const target = join(root, 'src', 'content', 'snapshot.json');

let previous = { generatedAt: null, data: {} };
if (existsSync(target)) {
    try {
        previous = JSON.parse(readFileSync(target, 'utf8'));
    }
    catch {
        // Corrupt snapshot: rebuild from scratch.
    }
}

if (!url || !anonKey) {
    console.warn('[snapshot] VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY not set; keeping existing snapshot.');
    process.exit(0);
}

const client = createClient(url, anonKey, { auth: { persistSession: false } });
const data = {};
let failures = 0;
await Promise.all(CONTENT_KEYS.map(async (key) => {
    try {
        data[key] = await fetchers[key](client);
    }
    catch (err) {
        failures += 1;
        console.warn(`[snapshot] ${key}: ${err.message}; keeping previous value.`);
        if (previous.data?.[key] !== undefined)
            data[key] = previous.data[key];
    }
}));

if (failures === CONTENT_KEYS.length) {
    console.warn('[snapshot] Supabase unreachable; keeping existing snapshot.');
    process.exit(0);
}

const ordered = Object.fromEntries(CONTENT_KEYS.filter((k) => k in data).map((k) => [k, data[k]]));
writeFileSync(target, JSON.stringify({ generatedAt: new Date().toISOString(), data: ordered }));
console.log(`[snapshot] wrote src/content/snapshot.json (${CONTENT_KEYS.length - failures}/${CONTENT_KEYS.length} groups live)`);
