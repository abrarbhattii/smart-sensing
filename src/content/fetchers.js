// Reads published site content from Supabase and maps rows to the shapes the
// pages render. Plain JS with no Vite-specific APIs so the build-time snapshot
// script (scripts/build-snapshot.mjs) can run it in Node too.

async function rows(query) {
    const { data, error } = await query;
    if (error)
        throw error;
    return data || [];
}

async function single(query) {
    const { data, error } = await query.maybeSingle();
    if (error)
        throw error;
    return data;
}

const bySortOrder = (a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0);
const sorted = (list) => [...(list || [])].sort(bySortOrder);
const values = (list, field) => sorted(list).map((item) => item[field]);
const published = (client, table, select = '*') => client.from(table).select(select).eq('published', true).order('sort_order');
const intro = (client, table) => single(client.from(table).select('title, subtitle, summary').eq('id', 'default').eq('published', true));

function mapIntro(row) {
    return { title: row?.title || '', subtitle: row?.subtitle || '', summary: row?.summary || '' };
}

function mapHubEntry(row) {
    return { id: row.id, title: row.title, description: row.description || '', to: row.link_to || '/', icon: row.icon || '' };
}

async function home(client) {
    const [recent, collaborators] = await Promise.all([
        rows(published(client, 'recent_work', '*, recent_work_tags(tag, sort_order)')),
        rows(published(client, 'collaborators')),
    ]);
    return {
        recentWork: recent.map((r) => ({
            id: r.id,
            type: r.type,
            label: r.label || '',
            title: r.title,
            desc: r.description || '',
            tags: values(r.recent_work_tags, 'tag'),
            image: r.image_url || '',
            link: r.link || '',
            linkLabel: r.link_label || 'Learn more',
            extra: r.extra_label && r.extra_href ? { label: r.extra_label, href: r.extra_href } : null,
        })),
        collaborators: collaborators.map((c) => ({
            id: c.id,
            name: c.name,
            fullName: c.full_name || '',
            lat: c.lat,
            lng: c.lng,
            location: c.location || '',
            url: c.url || '',
            logo: c.logo_url || '',
        })),
    };
}

async function events(client) {
    const list = await rows(published(client, 'events', '*, event_highlights(text, sort_order), event_tags(tag, sort_order)'));
    return list.map((e) => ({
        id: e.id,
        title: e.title,
        date: e.date || '',
        time: e.time || '',
        location: e.location || '',
        organizer: e.organizer || '',
        type: e.type || '',
        summary: e.summary || '',
        details: e.details || '',
        highlights: values(e.event_highlights, 'text'),
        tags: values(e.event_tags, 'tag'),
    }));
}

async function team(client) {
    const [members, bios] = await Promise.all([
        rows(published(client, 'team_members')),
        rows(client.from('team_bios')
            .select('*, team_bio_publications(title, year, journal, url, sort_order), team_bio_chapters(title, year, book, url, sort_order), team_bio_awards(text, sort_order)')
            .eq('published', true)),
    ]);
    const bioById = {};
    for (const b of bios) {
        bioById[b.member_id] = {
            biography: b.biography || '',
            profile_url: b.profile_url || '',
            google_scholar: b.google_scholar || '',
            scopus: b.scopus || '',
            orcid: b.orcid || '',
            science_direct: b.science_direct || '',
            researchgate: b.researchgate || '',
            publons: b.publons || '',
            loop: b.loop || '',
            space4water: b.space4water || '',
            journal: b.journal || '',
            publication_category: b.publication_category || '',
            publications: sorted(b.team_bio_publications).map(({ title, year, journal, url }) => ({ title, year: year || '', journal: journal || '', url: url || '' })),
            book_chapters: sorted(b.team_bio_chapters).map(({ title, year, book, url }) => ({ title, year: year || '', book: book || '', url: url || '' })),
            awards: values(b.team_bio_awards, 'text'),
        };
    }
    return {
        members: members.map((m) => ({
            id: m.id,
            name: m.name,
            role: m.role || '',
            institution: m.institution || '',
            photo: m.photo_url || '',
            bio: m.bio || '',
            linkedin: m.linkedin || '',
            year: m.year || '',
            category: m.category || '',
            section: m.section || 'researcher',
        })),
        bios: bioById,
    };
}

async function research(client) {
    const [areas, papers] = await Promise.all([
        rows(published(client, 'research_areas', '*, research_area_tags(tag, sort_order)')),
        rows(published(client, 'publications', '*, publication_keywords(keyword, sort_order)')),
    ]);
    return {
        areas: areas.map((a) => ({
            slug: a.slug,
            title: a.title,
            description: a.description || '',
            tags: values(a.research_area_tags, 'tag'),
            image: a.image_url || '',
            pageTitle: a.page_title || a.title,
            subtitle: a.subtitle || '',
            legacyFilename: a.legacy_filename || '',
            papers: papers
                .filter((p) => p.area_slug === a.slug)
                .map((p) => ({
                    id: p.id,
                    title: p.title,
                    url: p.url || '',
                    year: p.year || '',
                    authors: p.authors || '',
                    journal: p.journal || '',
                    volume: p.volume || '',
                    pages: p.pages || '',
                    abstract: p.abstract || '',
                    keywords: values(p.publication_keywords, 'keyword'),
                    doi: p.doi || '',
                    citations: p.citations ?? null,
                    status: p.status || '',
                })),
        })),
    };
}

function mapContentSections(list) {
    return sorted(list).map((s) => ({
        heading: s.heading || '',
        body: s.body || '',
        image: s.image_url || '',
    }));
}

async function projects(client) {
    const base = '*, project_badges(text, variant, sort_order)';
    // Detail tables are added by supabase/05_cards_and_apps.sql; fall back until it has run.
    const list = await rows(published(client, 'projects', `${base}, project_images(image_url, caption, sort_order), project_highlights(text, sort_order)`))
        .catch(() => rows(published(client, 'projects', base)));
    return list.map((p) => ({
        id: p.id,
        slug: p.slug || p.id,
        title: p.title,
        description: p.description || '',
        iconClass: p.icon_class || '',
        gif: p.gif_url || '',
        gifAlt: p.gif_alt || '',
        badges: sorted(p.project_badges).map(({ text, variant }) => ({ text, variant: variant || 'primary' })),
        details: p.details || '',
        years: p.years || '',
        funder: p.funder || '',
        partners: p.partners || '',
        link: p.link_url || '',
        linkLabel: p.link_label || '',
        video: p.video_url || '',
        images: sorted(p.project_images).map(({ image_url, caption }) => ({ src: image_url, caption: caption || '' })),
        highlights: values(p.project_highlights, 'text'),
    }));
}

async function labHub(client) {
    const [introRow, entries] = await Promise.all([
        intro(client, 'lab_hub_intro'),
        rows(published(client, 'lab_hub_entries')),
    ]);
    return { intro: mapIntro(introRow), entries: entries.map(mapHubEntry) };
}

async function appsTools(client) {
    // Tables are added by supabase/05_cards_and_apps.sql; show an empty page until it has run.
    const [introRow, tools] = await Promise.all([
        intro(client, 'apps_tools_intro').catch(() => null),
        rows(published(client, 'apps_tools', '*, apps_tool_tags(tag, sort_order)')).catch(() => []),
    ]);
    return {
        intro: mapIntro(introRow),
        tools: tools.map((t) => ({
            id: t.id,
            title: t.title,
            category: t.category || '',
            summary: t.summary || '',
            image: t.image_url || '',
            link: t.link_url || '',
            linkLabel: t.link_label || '',
            tags: values(t.apps_tool_tags, 'tag'),
        })),
    };
}

async function whoWeAre(client) {
    const [introRow, pillars, facts, kaPillars, kaNodes, nodePillars] = await Promise.all([
        intro(client, 'who_we_are_intro'),
        rows(published(client, 'who_we_are_pillars')),
        rows(published(client, 'who_we_are_facts')),
        rows(published(client, 'key_area_pillars')),
        rows(published(client, 'key_area_nodes', '*, key_area_node_tags(tag, sort_order)')),
        // Table added by supabase/01_schema.sql; tolerate projects that have not run it yet.
        rows(client.from('key_area_node_pillars').select('node_id, pillar_id')).catch(() => []),
    ]);
    return {
        intro: mapIntro(introRow),
        pillars: pillars.map(mapHubEntry),
        facts: facts.map((f) => ({ id: f.id, label: f.label, value: f.value || '' })),
        keyAreas: {
            pillars: kaPillars.map((p) => ({ id: p.id, label: p.label, icon: p.icon || '' })),
            nodes: kaNodes.map((n) => ({
                id: n.id,
                title: n.title,
                icon: n.icon || '',
                color: n.color || '',
                desc: n.description || '',
                tags: values(n.key_area_node_tags, 'tag'),
                domains: nodePillars.filter((np) => np.node_id === n.id).map((np) => np.pillar_id),
            })),
        },
    };
}

async function society(client) {
    const rich = '*, society_event_items(*, society_event_item_highlights(text, sort_order), society_event_item_sections(heading, body, image_url, sort_order))';
    const mid = '*, society_event_items(*, society_event_item_highlights(text, sort_order))';
    const [introRow, groups] = await Promise.all([
        intro(client, 'society_intro'),
        rows(published(client, 'society_event_groups', rich))
            .catch(() => rows(published(client, 'society_event_groups', mid)))
            .catch(() => rows(published(client, 'society_event_groups', '*, society_event_items(*)'))),
    ]);
    return {
        intro: mapIntro(introRow),
        groups: groups.map((g) => ({
            id: g.id,
            title: g.title,
            icon: g.icon || '',
            items: sorted(g.society_event_items)
                .filter((i) => i.published)
                .map((i) => ({
                    id: i.id,
                    slug: i.slug || i.id,
                    title: i.title,
                    date: i.date || '',
                    time: i.time || '',
                    location: i.location || '',
                    organizer: i.organizer || '',
                    summary: i.summary || '',
                    details: i.details || '',
                    image: i.image_url || '',
                    video: i.video_url || '',
                    link: i.link_url || '',
                    linkLabel: i.link_label || '',
                    highlights: values(i.society_event_item_highlights, 'text'),
                    sections: mapContentSections(i.society_event_item_sections),
                })),
        })),
    };
}

async function academy(client) {
    const rich = '*, academy_items(*, academy_item_points(text, sort_order), academy_item_files(label, file_url, file_type, file_size, sort_order), academy_item_sections(heading, body, image_url, sort_order))';
    const mid = '*, academy_items(*, academy_item_points(text, sort_order), academy_item_files(label, file_url, file_type, file_size, sort_order))';
    const [introRow, sections] = await Promise.all([
        intro(client, 'academy_intro'),
        rows(published(client, 'academy_sections', rich))
            .catch(() => rows(published(client, 'academy_sections', mid)))
            .catch(() => rows(published(client, 'academy_sections', '*, academy_items(*)'))),
    ]);
    return {
        intro: mapIntro(introRow),
        sections: sections.map((s) => ({
            id: s.id,
            title: s.title,
            subtitle: s.subtitle || '',
            icon: s.icon || '',
            items: sorted(s.academy_items)
                .filter((i) => i.published)
                .map((i) => ({
                    id: i.id,
                    slug: i.slug || i.id,
                    title: i.title,
                    level: i.level || '',
                    format: i.format || '',
                    summary: i.summary || '',
                    details: i.details || '',
                    duration: i.duration || '',
                    instructor: i.instructor || '',
                    image: i.image_url || '',
                    video: i.video_url || '',
                    link: i.link && i.link !== '#' ? i.link : '',
                    points: values(i.academy_item_points, 'text'),
                    files: sorted(i.academy_item_files).map((f) => ({ label: f.label, url: f.file_url, type: f.file_type || '', size: f.file_size || '' })),
                    sections: mapContentSections(i.academy_item_sections),
                })),
        })),
    };
}

async function sawaid(client) {
    // Profile tables are added by supabase/01_schema.sql; tolerate projects that have not run it yet.
    const optional = (promise, fallback) => promise.catch(() => fallback);
    const [activity, projectList, keyphrases, themes, profile, interests, keywords, education, appointments, outputs, editorial] = await Promise.all([
        rows(published(client, 'sawaid_activity')),
        rows(published(client, 'sawaid_projects')),
        rows(published(client, 'sawaid_fingerprint_keyphrases')),
        rows(published(client, 'sawaid_fingerprint_themes')),
        optional(single(client.from('sawaid_profile').select('*').eq('id', 'default').eq('published', true)), null),
        optional(rows(published(client, 'sawaid_interests')), []),
        optional(rows(published(client, 'sawaid_keywords')), []),
        optional(rows(published(client, 'sawaid_education')), []),
        optional(rows(published(client, 'sawaid_appointments')), []),
        optional(rows(published(client, 'sawaid_outputs')), []),
        optional(rows(published(client, 'sawaid_editorial_roles')), []),
    ]);
    const outputsOf = (kind) => outputs
        .filter((o) => o.kind === kind)
        .map((o) => ({ id: o.id, authors: o.authors || '', year: o.year || '', title: o.title, venue: o.venue || '', note: o.note || '', url: o.url || '', linkLabel: o.link_label || '' }));
    return {
        profile: {
            organization: profile?.organization || '',
            organizationUrl: profile?.organization_url || '',
            email: profile?.email || '',
            stats: profile?.stats || '',
            outputsLabel: profile?.outputs_label || '',
            biography: profile?.biography || '',
        },
        interests: interests.map((i) => i.text),
        keywords: keywords.map((k) => k.keyword),
        education: education.map((e) => ({ id: e.id, degree: e.degree, details: e.details || '' })),
        appointments: appointments.map((a) => ({ id: a.id, years: a.years || '', title: a.title, details: a.details || '' })),
        journalArticles: outputsOf('journal'),
        underReview: outputsOf('under_review'),
        bookChapters: outputsOf('book_chapter'),
        editorialRoles: editorial.map((r) => ({ id: r.id, role: r.role, detail: r.detail || '', journal: r.journal || '', impactFactor: r.impact_factor || '' })),
        activity: activity.map((a) => ({ year: a.year, count: a.count, detail: a.detail || '' })),
        projects: projectList.map((p) => ({
            id: p.id,
            title: p.title,
            role: p.role || '',
            funder: p.funder || '',
            years: p.years || '',
            status: p.status || 'active',
            summary: p.summary || '',
        })),
        keyphrases: keyphrases.map((k) => k.phrase),
        themes: themes.map((t) => ({ label: t.label, active: Boolean(t.active) })),
    };
}

export const fetchers = { home, events, team, research, projects, labHub, appsTools, whoWeAre, society, academy, sawaid };

export const CONTENT_KEYS = Object.keys(fetchers);

export async function fetchAllContent(client) {
    const entries = await Promise.all(CONTENT_KEYS.map(async (key) => [key, await fetchers[key](client)]));
    return Object.fromEntries(entries);
}
