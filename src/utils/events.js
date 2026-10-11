export function parseDateOnlyMs(dateStr) {
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateStr || '');
    if (m) {
        return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3])).getTime();
    }
    const d = new Date(dateStr || '');
    if (Number.isNaN(d.getTime()))
        return null;
    return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
}

export function getEventDateStr(ev) {
    return ev?.date || ev?.startDate || '';
}

export function formatDateHuman(isoDate) {
    if (!isoDate)
        return '';
    const ms = parseDateOnlyMs(isoDate);
    if (ms == null)
        return isoDate;
    return new Date(ms).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: '2-digit' });
}

export function todayStartMs(now = new Date()) {
    return new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
}

export function splitEventsByDate(events, todayMs) {
    const all = events || [];
    const upcoming = [];
    const past = [];
    for (const ev of all) {
        const ms = parseDateOnlyMs(getEventDateStr(ev));
        if (ms != null && ms >= todayMs)
            upcoming.push(ev);
        else
            past.push(ev);
    }
    const byDate = (ev) => parseDateOnlyMs(getEventDateStr(ev)) || 0;
    upcoming.sort((a, b) => byDate(a) - byDate(b));
    past.sort((a, b) => byDate(b) - byDate(a));
    return { upcoming, past };
}
