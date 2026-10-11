import { describe, expect, it } from 'vitest';
import { aggregateCitationsByYear, cleanDoi, mergeDoiMetadata, sortPapers } from './publicationsService';

describe('cleanDoi', () => {
    it('strips the doi.org prefix and whitespace', () => {
        expect(cleanDoi(' https://doi.org/10.1000/xyz ')).toBe('10.1000/xyz');
        expect(cleanDoi('10.1000/abc')).toBe('10.1000/abc');
        expect(cleanDoi(undefined)).toBe('');
    });
});

describe('aggregateCitationsByYear', () => {
    it('sums citations per year and skips papers without a year', () => {
        const result = aggregateCitationsByYear([
            { year: '2023', citations: 4 },
            { year: '2021', citations: '3' },
            { year: '2023', citations: 1 },
            { year: '—', citations: 10 },
        ]);
        expect(result).toEqual({ labels: ['2021', '2023'], data: [3, 5] });
    });
});

describe('sortPapers', () => {
    it('sorts newest first without mutating the input', () => {
        const input = [{ year: '2020' }, { year: '—' }, { year: '2024' }];
        expect(sortPapers(input).map((p) => p.year)).toEqual(['2024', '2020', '—']);
        expect(input[0].year).toBe('2020');
    });
});

describe('mergeDoiMetadata', () => {
    it('fills placeholders from Crossref and prefers the Semantic Scholar abstract', () => {
        const merged = mergeDoiMetadata({ title: 'T', authors: 'Authors to be added.', year: '—' }, {
            crossref: { authors: 'A. Author', journal: 'J', year: 2022, abstract: 'crossref abstract', url: 'https://doi.org/x' },
            scholar: { abstract: 'scholar abstract', citationCount: 7 },
        });
        expect(merged).toMatchObject({
            authors: 'A. Author',
            journal: 'J',
            year: '2022',
            abstract: 'scholar abstract',
            citations: 7,
            url: 'https://doi.org/x',
        });
    });

    it('keeps existing citation counts', () => {
        const merged = mergeDoiMetadata({ citations: 2 }, { scholar: { citationCount: 9 }, crossref: null });
        expect(merged.citations).toBe(2);
    });
});
