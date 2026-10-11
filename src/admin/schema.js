// Admin forms are generated from this config. Each group appears in the
// sidebar; each table gets a list view and a form. `children` are child
// tables edited inline as repeatable rows inside the parent form.

const text = (name, label, opts = {}) => ({ name, label, type: 'text', ...opts });
const area = (name, label, opts = {}) => ({ name, label, type: 'textarea', ...opts });
const url = (name, label, opts = {}) => ({ name, label, type: 'url', ...opts });
const num = (name, label, opts = {}) => ({ name, label, type: 'number', ...opts });
const bool = (name, label, opts = {}) => ({ name, label, type: 'checkbox', ...opts });
const date = (name, label, opts = {}) => ({ name, label, type: 'date', ...opts });
const image = (name, label, opts = {}) => ({ name, label, type: 'image', ...opts });
const file = (name, label, opts = {}) => ({ name, label, type: 'file', ...opts });
const select = (name, label, options, opts = {}) => ({ name, label, type: 'select', options, ...opts });
const ref = (name, label, table, labelColumn, valueColumn = 'id', opts = {}) => ({ name, label, type: 'ref', table, labelColumn, valueColumn, ...opts });
const icon = (name, label = 'Icon (Font Awesome class)', opts = {}) => ({ name, label, type: 'icon', ...opts });

const tagRows = (table, fk, label = 'Tags', column = 'tag') => ({
    table, fk, label, fields: [text(column, label.replace(/s$/, ''), { required: true })],
});

const introTable = (name, label, pageHint) => ({
    name, label, pk: 'id', singleton: true, publishable: true,
    hint: pageHint,
    fields: [text('title', 'Title', { required: true }), text('subtitle', 'Subtitle'), area('summary', 'Summary', { rows: 4 })],
});

const hubCards = (name, label, hint) => ({
    name, label, pk: 'id', sortable: true, publishable: true, hint,
    listColumns: ['title', 'link_to'],
    fields: [
        text('title', 'Title', { required: true }),
        area('description', 'Description', { rows: 3 }),
        text('link_to', 'Link (page path, e.g. /Lab/Research)'),
        icon('icon'),
    ],
});

export const GROUPS = [
    {
        id: 'home',
        label: 'Home',
        icon: 'fas fa-house',
        tables: [
            {
                name: 'recent_work',
                label: 'Recent work',
                hint: 'Carousel on the home page.',
                pk: 'id', sortable: true, publishable: true,
                listColumns: ['title', 'type', 'label'],
                fields: [
                    select('type', 'Type', [['paper', 'Publication'], ['project', 'Project'], ['award', 'Award']], { required: true, defaultValue: 'paper' }),
                    text('label', 'Small label (e.g. New Publication · 2024)'),
                    text('title', 'Title', { required: true }),
                    area('description', 'Description', { rows: 4 }),
                    image('image_url', 'Image'),
                    url('link', 'Main button link'),
                    text('link_label', 'Main button text', { placeholder: 'View Paper' }),
                    text('extra_label', 'Second button text'),
                    url('extra_href', 'Second button link'),
                ],
                children: [tagRows('recent_work_tags', 'recent_work_id')],
            },
            {
                name: 'collaborators',
                label: 'Partners (map)',
                hint: 'Markers on the partnerships map.',
                pk: 'id', sortable: true, publishable: true,
                listColumns: ['name', 'location'],
                fields: [
                    text('name', 'Short name', { required: true }),
                    text('full_name', 'Full name'),
                    text('location', 'Location (city, country)'),
                    num('lat', 'Latitude', { required: true, step: 'any' }),
                    num('lng', 'Longitude', { required: true, step: 'any' }),
                    url('url', 'Website'),
                    image('logo_url', 'Logo'),
                ],
            },
        ],
    },
    {
        id: 'who',
        label: 'Who We Are',
        icon: 'fas fa-circle-info',
        tables: [
            introTable('who_we_are_intro', 'Page intro', 'Heading and summary at the top of Who We Are.'),
            hubCards('who_we_are_pillars', 'Pillar cards', 'Cards under the Who We Are intro.'),
            {
                name: 'who_we_are_facts',
                label: 'Important information',
                pk: 'id', sortable: true, publishable: true,
                listColumns: ['label', 'value'],
                fields: [text('label', 'Label', { required: true }), area('value', 'Value', { rows: 2 })],
            },
            {
                name: 'key_area_pillars',
                label: 'Key areas: pillars',
                hint: 'The three large hexagons on the left of the key areas graphic.',
                pk: 'id', pkFrom: 'label', sortable: true, publishable: true,
                listColumns: ['label', 'id'],
                fields: [
                    text('id', 'ID', { pk: true }),
                    text('label', 'Label', { required: true }),
                    icon('icon', 'Icon (Font Awesome name, e.g. fa-cloud)'),
                ],
            },
            {
                name: 'key_area_nodes',
                label: 'Key areas: topics',
                hint: 'Topic hexagons. Pick the pillars each topic connects to.',
                pk: 'id', pkFrom: 'title', sortable: true, publishable: true,
                listColumns: ['title', 'id'],
                fields: [
                    text('id', 'ID', { pk: true }),
                    text('title', 'Title', { required: true }),
                    icon('icon', 'Icon (Font Awesome name, e.g. fa-leaf)'),
                    { name: 'color', label: 'Accent colour', type: 'color', defaultValue: '#38a169' },
                    area('description', 'Description', { rows: 3 }),
                ],
                children: [
                    tagRows('key_area_node_tags', 'node_id'),
                    {
                        table: 'key_area_node_pillars', fk: 'node_id', label: 'Connected pillars', ordered: false,
                        fields: [ref('pillar_id', 'Pillar', 'key_area_pillars', 'label', 'id', { required: true })],
                    },
                ],
            },
        ],
    },
    {
        id: 'people',
        label: 'People',
        icon: 'fas fa-users',
        tables: [
            {
                name: 'team_members',
                label: 'Team members',
                hint: 'Cards on the People page.',
                pk: 'id', pkFrom: 'name', pkSeparator: '_', sortable: true, publishable: true,
                listColumns: ['name', 'section', 'category', 'year'],
                fields: [
                    text('id', 'ID', { pk: true }),
                    text('name', 'Name', { required: true }),
                    select('section', 'Section', [['professor', 'Professor'], ['advisor', 'Research advisor'], ['researcher', 'Researcher']], { required: true, defaultValue: 'researcher' }),
                    select('category', 'Researcher role (filter)', [['', '—'], ['phd', 'PhD Candidate'], ['associate', 'Associate'], ['assistant', 'Assistant'], ['student', 'Student']]),
                    text('year', 'Year joined', { placeholder: '2026' }),
                    text('role', 'Role / title'),
                    text('institution', 'Institution'),
                    image('photo_url', 'Photo'),
                    area('bio', 'Short bio', { rows: 3 }),
                    url('linkedin', 'LinkedIn URL'),
                ],
            },
            {
                name: 'team_bios',
                label: 'Member profiles',
                hint: 'Extra details shown in the "View Bio" popup (links, top publications, awards).',
                pk: 'member_id', publishable: true,
                listColumns: ['member_id', 'publication_category'],
                fields: [
                    ref('member_id', 'Team member', 'team_members', 'name', 'id', { required: true, pk: true }),
                    area('biography', 'Biography', { rows: 5 }),
                    text('publication_category', 'Research areas'),
                    text('profile_url', 'Full profile page path (e.g. People/sawaid-abbas)'),
                    url('google_scholar', 'Google Scholar'),
                    url('scopus', 'Scopus'),
                    url('orcid', 'ORCID'),
                    url('science_direct', 'Science Direct'),
                    url('researchgate', 'ResearchGate'),
                    url('publons', 'Publons'),
                    url('loop', 'Loop'),
                    url('space4water', 'Space4Water'),
                    url('journal', 'Journal'),
                ],
                children: [
                    {
                        table: 'team_bio_publications', fk: 'member_id', label: 'Top publications',
                        fields: [text('title', 'Title', { required: true }), text('year', 'Year'), text('journal', 'Journal'), url('url', 'URL')],
                    },
                    {
                        table: 'team_bio_chapters', fk: 'member_id', label: 'Book chapters',
                        fields: [text('title', 'Title', { required: true }), text('year', 'Year'), text('book', 'Book'), url('url', 'URL')],
                    },
                    { table: 'team_bio_awards', fk: 'member_id', label: 'Awards', fields: [text('text', 'Award', { required: true })] },
                ],
            },
        ],
    },
    {
        id: 'sawaid',
        label: 'Dr. Sawaid Abbas',
        icon: 'fas fa-user-graduate',
        tables: [
            {
                name: 'sawaid_profile',
                label: 'Profile header & biography',
                hint: 'Name, role, photo and links come from People → Team members / Member profiles.',
                pk: 'id', singleton: true, publishable: true,
                fields: [
                    text('organization', 'Organisation'),
                    url('organization_url', 'Organisation website'),
                    text('email', 'Email'),
                    text('stats', 'Stats line (h-index, citations…)'),
                    text('outputs_label', 'Research output count (e.g. 80+)'),
                    area('biography', 'Biography (blank line between paragraphs)', { rows: 10 }),
                ],
            },
            {
                name: 'sawaid_interests', label: 'Research interests', pk: 'id', sortable: true, publishable: true,
                listColumns: ['text'], fields: [text('text', 'Interest', { required: true })],
            },
            {
                name: 'sawaid_keywords', label: 'Keywords', pk: 'id', sortable: true, publishable: true,
                listColumns: ['keyword'], fields: [text('keyword', 'Keyword', { required: true })],
            },
            {
                name: 'sawaid_education', label: 'Education', pk: 'id', sortable: true, publishable: true,
                listColumns: ['degree', 'details'], fields: [text('degree', 'Degree', { required: true }), area('details', 'Details', { rows: 2 })],
            },
            {
                name: 'sawaid_appointments', label: 'Appointments', pk: 'id', sortable: true, publishable: true,
                listColumns: ['years', 'title'],
                fields: [text('years', 'Years (e.g. 2022 – present)'), text('title', 'Title', { required: true }), area('details', 'Details', { rows: 2 })],
            },
            {
                name: 'sawaid_outputs', label: 'Research outputs', pk: 'id', sortable: true, publishable: true,
                listColumns: ['kind', 'year', 'title'],
                fields: [
                    select('kind', 'Type', [['journal', 'Journal article'], ['under_review', 'Under review'], ['book_chapter', 'Book chapter']], { required: true, defaultValue: 'journal' }),
                    text('authors', 'Authors'),
                    text('year', 'Year'),
                    text('title', 'Title', { required: true }),
                    text('venue', 'Journal / book'),
                    text('note', 'Note (e.g. (Minor Revisions))'),
                    url('url', 'Link'),
                    text('link_label', 'Link text (defaults to the URL)'),
                ],
            },
            {
                name: 'sawaid_editorial_roles', label: 'Editorial roles', pk: 'id', sortable: true, publishable: true,
                listColumns: ['role', 'detail'],
                fields: [
                    text('role', 'Role', { required: true }),
                    text('detail', 'Details'),
                    text('journal', 'Journal (shown in italics)'),
                    text('impact_factor', 'Impact factor (e.g. IF 4.6)'),
                ],
            },
            {
                name: 'sawaid_projects', label: 'Projects', pk: 'id', sortable: true, publishable: true,
                listColumns: ['title', 'status', 'years'],
                fields: [
                    text('title', 'Title', { required: true }),
                    select('status', 'Status', [['active', 'Active'], ['completed', 'Completed'], ['process', 'In process']], { defaultValue: 'active' }),
                    text('role', 'Role'),
                    text('funder', 'Funder'),
                    text('years', 'Years'),
                    area('summary', 'Summary', { rows: 3 }),
                ],
            },
            {
                name: 'sawaid_activity', label: 'Research activity per year', pk: 'id', sortable: true, publishable: true,
                listColumns: ['year', 'count', 'detail'],
                fields: [num('year', 'Year', { required: true }), num('count', 'Number of outputs', { required: true }), text('detail', 'Detail')],
            },
            {
                name: 'sawaid_fingerprint_keyphrases', label: 'Fingerprint keyphrases', pk: 'id', sortable: true, publishable: true,
                listColumns: ['phrase'], fields: [text('phrase', 'Keyphrase', { required: true })],
            },
            {
                name: 'sawaid_fingerprint_themes', label: 'Fingerprint themes', pk: 'id', sortable: true, publishable: true,
                listColumns: ['label', 'active'], fields: [text('label', 'Label', { required: true }), bool('active', 'Highlighted')],
            },
        ],
    },
    {
        id: 'lab',
        label: 'SCD Lab',
        icon: 'fas fa-flask',
        tables: [
            introTable('lab_hub_intro', 'Lab page intro', 'Heading and summary at the top of SCD Lab.'),
            hubCards('lab_hub_entries', 'Lab page cards', 'Cards on the SCD Lab landing page.'),
            {
                name: 'research_areas',
                label: 'Research areas',
                hint: 'Cards on Research and the heading of each publication page. Icons bundled with the site use paths like /src/images/research/Earth.png.',
                pk: 'slug', pkFrom: 'title', sortable: true, publishable: true,
                listColumns: ['title', 'slug'],
                fields: [
                    text('slug', 'URL slug', { pk: true }),
                    text('title', 'Card title', { required: true }),
                    area('description', 'Card description', { rows: 3 }),
                    image('image_url', 'Card icon image'),
                    text('page_title', 'Publication page title'),
                    text('subtitle', 'Publication page subtitle'),
                    text('legacy_filename', 'Old page filename (redirects, optional)'),
                ],
                children: [tagRows('research_area_tags', 'area_slug')],
            },
            {
                name: 'publications',
                label: 'Publications',
                pk: 'id', sortable: true, publishable: true,
                listColumns: ['title', 'area_slug', 'year'],
                filterBy: 'area_slug',
                fields: [
                    ref('area_slug', 'Research area', 'research_areas', 'title', 'slug', { required: true }),
                    text('title', 'Title', { required: true }),
                    text('authors', 'Authors'),
                    text('year', 'Year'),
                    text('journal', 'Journal'),
                    text('volume', 'Volume'),
                    text('pages', 'Pages'),
                    text('doi', 'DOI (e.g. 10.1029/2024GL113276)'),
                    url('url', 'Link'),
                    num('citations', 'Citations'),
                    select('status', 'Status', [['Published', 'Published'], ['Under review', 'Under review'], ['To be added', 'To be added']], { defaultValue: 'Published' }),
                    area('abstract', 'Abstract', { rows: 6 }),
                ],
                children: [tagRows('publication_keywords', 'publication_id', 'Keywords', 'keyword')],
            },
            {
                name: 'projects',
                label: 'Projects',
                hint: 'Cards on SCD Lab → Projects. Click opens /Lab/Projects/<slug> with overview, gallery, optional video and highlights.',
                pk: 'id', sortable: true, publishable: true,
                listColumns: ['title', 'slug', 'years'],
                fields: [
                    text('title', 'Title', { required: true }),
                    text('slug', 'URL slug (e.g. drought-risks)'),
                    area('description', 'Card description', { rows: 3 }),
                    text('icon_class', 'Icon classes (e.g. fas fa-water text-primary me-2)'),
                    image('gif_url', 'Card / hero image (also first in the gallery)'),
                    text('gif_alt', 'Image description (alt text)'),
                    area('details', 'Detail page: overview (blank line between paragraphs)', { rows: 6 }),
                    text('years', 'Years (e.g. 2023 – 2026)'),
                    text('funder', 'Funder'),
                    text('partners', 'Partners'),
                    url('video_url', 'Detail page: video (YouTube / Vimeo)'),
                    url('link_url', 'Detail page: button link'),
                    text('link_label', 'Detail page: button text', { placeholder: 'Visit project' }),
                ],
                children: [
                    {
                        table: 'project_badges', fk: 'project_id', label: 'Badges',
                        fields: [
                            text('text', 'Badge', { required: true }),
                            select('variant', 'Colour', [['primary', 'Blue'], ['secondary', 'Grey'], ['success', 'Green'], ['warning', 'Amber'], ['info', 'Cyan'], ['danger', 'Red']], { defaultValue: 'primary' }),
                        ],
                    },
                    {
                        table: 'project_images', fk: 'project_id', label: 'Gallery images',
                        fields: [image('image_url', 'Image', { required: true }), text('caption', 'Caption')],
                    },
                    { table: 'project_highlights', fk: 'project_id', label: 'Key highlights', fields: [text('text', 'Highlight', { required: true })] },
                ],
            },
            introTable('apps_tools_intro', 'Apps & Tools intro', 'Heading and summary at the top of SCD Lab → Apps & Tools.'),
            {
                name: 'apps_tools',
                label: 'Apps & Tools',
                hint: 'Cards on SCD Lab → Apps & Tools. Clicking a card opens its link in a new tab.',
                pk: 'id', sortable: true, publishable: true,
                listColumns: ['title', 'category'],
                fields: [
                    text('title', 'Name', { required: true }),
                    text('category', 'Category (e.g. Web app, Dashboard, Python package)'),
                    area('summary', 'Short description', { rows: 3 }),
                    image('image_url', 'Card image / screenshot'),
                    url('link_url', 'Link', { required: true }),
                    text('link_label', 'Link text', { placeholder: 'Open tool' }),
                ],
                children: [tagRows('apps_tool_tags', 'tool_id')],
            },
        ],
    },
    {
        id: 'society',
        label: 'SCD Society',
        icon: 'fas fa-people-group',
        tables: [
            {
                name: 'events',
                label: 'News & events',
                hint: 'Events with a date today or later appear as upcoming (ticker); earlier ones as past.',
                pk: 'id', pkFrom: 'title', pkPrefix: 'evt-', publishable: true,
                orderBy: { column: 'date', ascending: false },
                listColumns: ['date', 'title', 'type'],
                fields: [
                    text('id', 'ID', { pk: true }),
                    text('title', 'Title', { required: true }),
                    date('date', 'Date', { required: true }),
                    text('time', 'Time (e.g. 09:00 AM)'),
                    text('type', 'Type (e.g. Workshop, Training, Webinar)'),
                    text('location', 'Location'),
                    text('organizer', 'Organiser'),
                    area('summary', 'Summary', { rows: 3 }),
                    area('details', 'Details', { rows: 5 }),
                ],
                children: [
                    { table: 'event_highlights', fk: 'event_id', label: 'Highlights', fields: [text('text', 'Highlight', { required: true })] },
                    tagRows('event_tags', 'event_id'),
                ],
            },
            introTable('society_intro', 'Society page intro', 'Heading and summary at the top of SCD Society.'),
            {
                name: 'society_event_groups',
                label: 'Event categories',
                hint: 'Sections on the SCD Society page (Conferences, Webinars…).',
                pk: 'id', pkFrom: 'title', sortable: true, publishable: true,
                listColumns: ['title', 'id'],
                fields: [text('id', 'ID', { pk: true }), text('title', 'Title', { required: true }), icon('icon')],
            },
            {
                name: 'society_event_items',
                label: 'Category listings',
                hint: 'Cards on SCD Society. Click opens /Society/<category>/<slug> with overview, highlights, text+image blocks, optional video.',
                pk: 'id', sortable: true, publishable: true,
                listColumns: ['title', 'group_id', 'slug', 'date'],
                filterBy: 'group_id',
                fields: [
                    ref('group_id', 'Category', 'society_event_groups', 'title', 'id', { required: true }),
                    text('title', 'Title', { required: true }),
                    text('slug', 'URL slug'),
                    text('date', 'Date'),
                    text('time', 'Time'),
                    text('location', 'Location'),
                    text('organizer', 'Organiser / speaker'),
                    area('summary', 'Card summary', { rows: 3 }),
                    image('image_url', 'Card image'),
                    area('details', 'Detail page: overview (blank line between paragraphs)', { rows: 6 }),
                    url('video_url', 'Detail page: video (YouTube / Vimeo)'),
                    url('link_url', 'Detail page: button link (recording, slides, registration)'),
                    text('link_label', 'Detail page: button text', { placeholder: 'Learn more' }),
                ],
                children: [
                    { table: 'society_event_item_highlights', fk: 'item_id', label: 'Highlights', fields: [text('text', 'Highlight', { required: true })] },
                    {
                        table: 'society_event_item_sections', fk: 'item_id', label: 'Content blocks (text above, image below)',
                        fields: [
                            text('heading', 'Heading'),
                            area('body', 'Text', { rows: 4, required: true }),
                            image('image_url', 'Image'),
                        ],
                    },
                ],
            },
        ],
    },
    {
        id: 'academy',
        label: 'Academy',
        icon: 'fas fa-graduation-cap',
        tables: [
            introTable('academy_intro', 'Academy page intro', 'Heading and summary at the top of SCD Research Academy.'),
            {
                name: 'academy_sections',
                label: 'Sections',
                pk: 'id', pkFrom: 'title', sortable: true, publishable: true,
                listColumns: ['title', 'id'],
                fields: [text('id', 'ID', { pk: true }), text('title', 'Title', { required: true }), text('subtitle', 'Subtitle'), icon('icon')],
            },
            {
                name: 'academy_items',
                label: 'Resources',
                hint: 'Tutorials/labs/lectures open /Academy/<section>/<slug>. Spatial data (section "data") stays a download popup. Tutorials & labs: downloads + repeating text+image blocks. Lectures: overview + video.',
                pk: 'id', sortable: true, publishable: true,
                listColumns: ['title', 'section_id', 'slug', 'format'],
                filterBy: 'section_id',
                fields: [
                    ref('section_id', 'Section', 'academy_sections', 'title', 'id', { required: true }),
                    text('title', 'Title', { required: true }),
                    text('slug', 'URL slug'),
                    text('level', 'Level (e.g. Beginner)'),
                    text('format', 'Format (e.g. Tutorial, Lab, Lecture, Dataset)'),
                    text('duration', 'Duration (e.g. 2 hours)'),
                    text('instructor', 'Instructor'),
                    area('summary', 'Card summary', { rows: 3 }),
                    image('image_url', 'Card image'),
                    area('details', 'Overview / intro (blank line between paragraphs)', { rows: 8 }),
                    url('video_url', 'Lectures: video (YouTube / Vimeo — embedded on the detail page)'),
                    url('link', 'External resource link (optional)'),
                ],
                children: [
                    { table: 'academy_item_points', fk: 'item_id', label: 'Outline bullets (spatial data popup)', fields: [text('text', 'Point', { required: true })] },
                    {
                        table: 'academy_item_files', fk: 'item_id', label: 'Downloads',
                        fields: [
                            text('label', 'Name', { required: true }),
                            file('file_url', 'File', { required: true }),
                            text('file_type', 'Type (e.g. Shapefile, PDF, GeoTIFF)'),
                            text('file_size', 'Size (e.g. 12 MB)'),
                        ],
                    },
                    {
                        table: 'academy_item_sections', fk: 'item_id', label: 'Content blocks (tutorials & labs: text above, image below)',
                        fields: [
                            text('heading', 'Heading'),
                            area('body', 'Text', { rows: 4, required: true }),
                            image('image_url', 'Image'),
                        ],
                    },
                ],
            },
        ],
    },
];

export const TABLES = Object.fromEntries(
    GROUPS.flatMap((group) => group.tables.map((table) => [table.name, { ...table, group }])),
);
