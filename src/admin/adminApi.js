import { supabase } from '../lib/supabase';

const MAX_IMAGE_SIDE = 1600;

async function run(query) {
    const { data, error } = await query;
    if (error)
        throw new Error(error.message);
    return data;
}

export function slugify(value, separator = '-') {
    return String(value || '')
        .toLowerCase()
        .normalize('NFKD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/&/g, ' and ')
        .replace(/[^a-z0-9]+/g, separator)
        .replace(new RegExp(`^\\${separator}+|\\${separator}+$`, 'g'), '')
        .slice(0, 80);
}

export async function checkIsAdmin() {
    const { data, error } = await supabase.rpc('is_admin');
    if (error)
        throw new Error(error.message);
    return data === true;
}

export async function listRows(table) {
    let query = supabase.from(table.name).select('*');
    if (table.orderBy)
        query = query.order(table.orderBy.column, { ascending: table.orderBy.ascending, nullsFirst: false });
    else if (table.sortable)
        query = query.order('sort_order', { ascending: true });
    return run(query);
}

export async function listOptions(tableName, labelColumn, valueColumn) {
    const rows = await run(supabase.from(tableName).select(`${valueColumn}, ${labelColumn}`).order(labelColumn));
    return rows.map((r) => ({ value: r[valueColumn], label: r[labelColumn] || r[valueColumn] }));
}

function childSelect(child) {
    return `${child.table}(*)`;
}

export async function getRecord(table, id) {
    const select = ['*', ...(table.children || []).map(childSelect)].join(', ');
    const row = await run(supabase.from(table.name).select(select).eq(table.pk, id).maybeSingle());
    if (!row)
        return null;
    for (const child of table.children || []) {
        const list = row[child.table] || [];
        row[child.table] = child.ordered === false ? list : [...list].sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
    }
    return row;
}

function cleanValue(field, value) {
    if (field.type === 'checkbox')
        return Boolean(value);
    if (field.type === 'number') {
        if (value === '' || value === null || value === undefined)
            return null;
        const n = Number(value);
        return Number.isFinite(n) ? n : null;
    }
    if (typeof value === 'string') {
        const trimmed = value.trim();
        return trimmed === '' ? null : trimmed;
    }
    return value ?? null;
}

function buildPayload(fields, values) {
    const payload = {};
    for (const field of fields)
        payload[field.name] = cleanValue(field, values[field.name]);
    return payload;
}

async function nextSortOrder(tableName) {
    const rows = await run(supabase.from(tableName).select('sort_order').order('sort_order', { ascending: false }).limit(1));
    return rows.length ? (rows[0].sort_order ?? 0) + 1 : 0;
}

/** Inserts or updates a record, then replaces its child rows. Returns the saved primary key. */
export async function saveRecord(table, values, originalId) {
    const payload = buildPayload(table.fields, values);
    if (table.publishable)
        payload.published = Boolean(values.published);

    let pkValue;
    if (table.singleton) {
        payload[table.pk] = 'default';
        await run(supabase.from(table.name).upsert(payload, { onConflict: table.pk }));
        pkValue = 'default';
    }
    else if (originalId != null) {
        delete payload[table.pk];
        const saved = await run(supabase.from(table.name).update(payload).eq(table.pk, originalId).select(table.pk).single());
        pkValue = saved[table.pk];
    }
    else {
        if (table.pkFrom && !payload[table.pk]) {
            const base = slugify(values[table.pkFrom], table.pkSeparator || '-');
            payload[table.pk] = `${table.pkPrefix || ''}${base || Date.now()}`;
        }
        if (table.sortable)
            payload.sort_order = await nextSortOrder(table.name);
        const saved = await run(supabase.from(table.name).insert(payload).select(table.pk).single());
        pkValue = saved[table.pk];
    }

    for (const child of table.children || []) {
        await run(supabase.from(child.table).delete().eq(child.fk, pkValue));
        const requiredFields = child.fields.filter((f) => f.required);
        const rows = (values[child.table] || [])
            .map((row) => buildPayload(child.fields, row))
            // Keep rows that fill required fields; if none are required, keep any non-empty row
            // (content blocks only have optional heading/body/image).
            .filter((row) => (requiredFields.length
                ? requiredFields.every((f) => row[f.name] != null)
                : child.fields.some((f) => row[f.name] != null)));
        if (!rows.length)
            continue;
        const seen = new Set();
        const toInsert = [];
        rows.forEach((row, i) => {
            const key = JSON.stringify(row);
            if (child.ordered === false && seen.has(key))
                return;
            seen.add(key);
            toInsert.push(child.ordered === false ? { ...row, [child.fk]: pkValue } : { ...row, [child.fk]: pkValue, sort_order: i });
        });
        await run(supabase.from(child.table).insert(toInsert));
    }
    return pkValue;
}

export async function deleteRecord(table, id) {
    await run(supabase.from(table.name).delete().eq(table.pk, id));
}

export async function setPublished(table, id, published) {
    await run(supabase.from(table.name).update({ published }).eq(table.pk, id));
}

/** Persists a new order: rows are given sort_order 0..n-1 in the order passed. */
export async function saveOrder(table, orderedRows) {
    const updates = orderedRows
        .map((row, index) => ({ row, index }))
        .filter(({ row, index }) => row.sort_order !== index);
    for (const { row, index } of updates)
        await run(supabase.from(table.name).update({ sort_order: index }).eq(table.pk, row[table.pk]));
}

async function shrinkImage(file) {
    if (!/^image\/(png|jpe?g|webp)$/i.test(file.type) || typeof createImageBitmap !== 'function')
        return { blob: file, ext: (file.name.split('.').pop() || 'bin').toLowerCase(), type: file.type };
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, MAX_IMAGE_SIDE / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    canvas.getContext('2d').drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close?.();
    const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/webp', 0.85));
    if (!blob || blob.size >= file.size)
        return { blob: file, ext: (file.name.split('.').pop() || 'jpg').toLowerCase(), type: file.type };
    return { blob, ext: 'webp', type: 'image/webp' };
}

/** Uploads any file (zip, pdf, tif...) unchanged to the public media bucket and returns its public URL. */
export async function uploadFile(file, folder) {
    const dot = file.name.lastIndexOf('.');
    const ext = dot > 0 ? file.name.slice(dot + 1).toLowerCase() : 'bin';
    const base = slugify(dot > 0 ? file.name.slice(0, dot) : file.name) || 'file';
    const path = `files/${folder}/${Date.now()}-${base}.${ext}`;
    const { error } = await supabase.storage.from('media').upload(path, file, {
        contentType: file.type || 'application/octet-stream',
        cacheControl: '31536000',
        upsert: false,
    });
    if (error)
        throw new Error(error.message);
    return supabase.storage.from('media').getPublicUrl(path).data.publicUrl;
}

/** Uploads an image to the public media bucket and returns its public URL. GIF/SVG are uploaded unchanged. */
export async function uploadImage(file, folder) {
    const { blob, ext, type } = await shrinkImage(file);
    const base = slugify(file.name.replace(/\.[^.]+$/, '')) || 'image';
    const path = `uploads/${folder}/${Date.now()}-${base}.${ext}`;
    const { error } = await supabase.storage.from('media').upload(path, blob, {
        contentType: type || undefined,
        cacheControl: '31536000',
        upsert: false,
    });
    if (error)
        throw new Error(error.message);
    return supabase.storage.from('media').getPublicUrl(path).data.publicUrl;
}
