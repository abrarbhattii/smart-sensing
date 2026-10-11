# Smart Sensing for Climate & Development (SCD)

Website for the SCD research group: lab research and projects, apps & tools, society events, academy resources, team, and news.

Built with React 19, React Router 7, Vite, Bootstrap 5, Supabase (Postgres + Storage + Auth), TanStack Query, Leaflet, and Chart.js.

## Getting started

1. Copy `.env.example` to `.env.local` and fill in values from Supabase **Project Settings → API**:

```bash
VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key

# Local scripts only (export-seed). Never put this in the frontend or with a VITE_ prefix.
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

2. Install and run:

```bash
npm install
npm run dev       # start the dev server
npm run build     # refresh snapshot, then build into dist/
npm run preview   # serve the production build locally
npm run lint      # oxlint
npm test          # vitest
npm run snapshot  # refresh src/content/snapshot.json from Supabase
npm run export-seed  # regenerate supabase/03_seed.sql from the live DB
```

## Supabase setup (SQL editor)

Run files in this order depending on the project:

| Situation | Order |
|---|---|
| **Existing project** (already has content) | `01_schema.sql` → `02_security.sql` → `04_content_updates.sql` → `05_cards_and_apps.sql` → `06_detail_pages.sql` |
| **Empty project** | `01_schema.sql` → `02_security.sql` → `05_cards_and_apps.sql` → `06_detail_pages.sql` → `03_seed.sql` |

- All SQL files are safe to re-run where noted in their headers.
- Do **not** run `03_seed.sql` on a DB that already has data (it stops if `team_members` has rows).
- After schema changes or big content edits, run `npm run snapshot` (also runs automatically on `npm run build`).

### Admin access

1. In Supabase: **Authentication → Users → Add user** (email + password).
2. Grant admin rights:

```sql
insert into public.admins (user_id, email)
select id, email from auth.users where email = 'you@example.com'
on conflict (user_id) do nothing;
```

3. Turn off public sign-ups under Authentication providers.
4. Open `/admin` on the site and sign in.

Public pages do not require login. Only `/admin` does.

## How content loading works

- **Snapshot:** `src/content/snapshot.json` is baked into the build so pages render immediately.
- **Live refresh:** React Query fetches published rows from Supabase in the background (stale after ~1 minute).
- **Browser cache:** successful content queries persist in `localStorage` (key `scd:content`, up to 7 days; cleared when the snapshot timestamp changes on a new deploy).
- If Supabase is unreachable, the site still shows snapshot/cached text. Images in Storage and `/admin` need Supabase online.

## Editing content

Use **`/admin`** (grouped forms: Home, Who We Are, People, Dr. Sawaid Abbas, SCD Lab, SCD Society, Academy).

| Area | Notes |
|---|---|
| Team | People cards + bio popup; photos via Storage or legacy `./images/...` paths |
| Research / publications | Areas and papers; topic pages at `/Lab/Research/<slug>` |
| Projects | Listing + detail page `/Lab/Projects/<slug>` (overview, gallery, optional video, highlights) |
| Apps & Tools | Cards that open external links |
| Society | Category cards → detail `/Society/<group>/<slug>` (overview, highlights, text+image blocks, video) |
| Academy tutorials / labs | Detail `/Academy/<section>/<slug>` (downloads + repeating text+image blocks) |
| Academy lectures | Same route pattern; overview + YouTube/Vimeo embed |
| Academy spatial data | Stays on `/Academy` as a download popup |
| News & events | `/Society/Events`; upcoming vs past is from the **date**, not a status flag |

**Downloads (shapefiles, PDFs, etc.):** upload to the public `media` Storage bucket (or use an external URL), then add a row under Academy resource **Downloads** (`file_url` + label).

**Fixed site images** (logo, favicon, home people/academia, research icons, topo hero) live under `src/images/` and are referenced from code or as `/src/images/...` in the DB. Other media usually goes to Supabase Storage.

## Project structure

```
src/
  admin/        Login, dashboard, generic list/forms from schema.js
  components/   Header, footer, cards, modals, map, charts, carousel
  constants/    Navigation
  content/      Fetchers, React Query hooks, snapshot.json
  hooks/        Scroll and motion-preference hooks
  images/       Bundled site images (home/, research/)
  layouts/      Main layout with header and footer
  lib/          Env + Supabase client
  pages/        One component per route (incl. detail pages)
  services/     Publication metadata (Crossref / Semantic Scholar)
  styles/       Global CSS
  utils/        imageUrl, event dates, video embeds
supabase/       Schema, security, seed, and incremental SQL
scripts/        build-snapshot.mjs, export-seed-sql.mjs
```

## Main routes

| Path | Page |
|---|---|
| `/Home` | Home |
| `/Who-We-Are` | Who We Are |
| `/Lab` | Lab hub |
| `/Lab/Research` · `/Lab/Research/:slug` | Research areas · publication topic |
| `/Lab/Projects` · `/Lab/Projects/:slug` | Projects list · detail |
| `/Lab/Apps-Tools` | Apps & Tools |
| `/Society` · `/Society/:groupId/:slug` | Society hub · item detail |
| `/Society/Events` | News & events |
| `/Academy` · `/Academy/:sectionId/:slug` | Academy hub · resource detail |
| `/People` | Team |
| `/admin` | Content admin (login required) |

Legacy paths such as `/Research`, `/Projects`, `/Team`, `/News_Events`, and `/Lab/Publications` redirect to the current URLs.

## Deployment

This is a SPA with browser history routing. The host must serve `index.html` for unknown paths (SPA fallback), otherwise refreshing `/People` returns 404.

- Netlify: `public/_redirects` with `/*  /index.html  200`
- Vercel: rewrite `/(.*)` → `/index.html`
- Apache: `FallbackResource /index.html`

Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in the host’s build environment. Do **not** expose `SUPABASE_SERVICE_ROLE_KEY` there.
