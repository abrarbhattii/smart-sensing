/** Match a News & Events row to a Society category (Conferences, Webinars, …). */
export function eventMatchesSocietyGroup(event, group) {
    if (!event || !group)
        return false;
    if (event.societyGroupId && event.societyGroupId === group.id)
        return true;

    const type = String(event.type || '').toLowerCase().trim();
    if (!type)
        return false;

    const id = String(group.id || '').toLowerCase();
    const title = String(group.title || '').toLowerCase();
    const stem = title.replace(/ies\b/g, 'y').replace(/s\b/g, '').trim();
    const idStem = id.replace(/ies$/, 'y').replace(/s$/, '');

    return (
        type === title
        || type === id
        || type === stem
        || type === idStem
        || type.includes(stem)
        || type.includes(idStem)
        || stem.includes(type)
        || idStem.includes(type)
    );
}

/** Events listed under a Society category page (from `events` only). */
export function listSocietyGroupCards(group, events) {
    if (!group)
        return [];
    return (events || []).filter((e) => eventMatchesSocietyGroup(e, group));
}
