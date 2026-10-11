import { describe, expect, it } from 'vitest';
import { parseDateOnlyMs, splitEventsByDate, todayStartMs } from './events';

describe('splitEventsByDate', () => {
    const today = todayStartMs(new Date(2026, 9, 7));

    it('splits events into upcoming (soonest first) and past (latest first) by date', () => {
        const { upcoming, past } = splitEventsByDate([
            { id: 'old', date: '2024-01-10' },
            { id: 'stale', date: '2026-04-05' },
            { id: 'later', date: '2026-12-01' },
            { id: 'today', startDate: '2026-10-07' },
        ], today);
        expect(upcoming.map((e) => e.id)).toEqual(['today', 'later']);
        expect(past.map((e) => e.id)).toEqual(['stale', 'old']);
    });

    it('treats events without a valid date as past', () => {
        const { upcoming, past } = splitEventsByDate([{ id: 'x', date: 'soon' }], today);
        expect(upcoming).toEqual([]);
        expect(past.map((e) => e.id)).toEqual(['x']);
    });
});

describe('parseDateOnlyMs', () => {
    it('parses ISO dates in local time', () => {
        expect(parseDateOnlyMs('2026-04-05')).toBe(new Date(2026, 3, 5).getTime());
        expect(parseDateOnlyMs('')).toBeNull();
    });
});
