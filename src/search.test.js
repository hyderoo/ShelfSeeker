import { buildSearchUrl, EMPTY_FILTERS, validYear, filtersActive, PAGE_SIZE } from './search';
import { parseImport, serializeList, mergeItems } from './readinglistIO';

describe('buildSearchUrl', () => {
  it('uses the plain title search when no filter is active', () => {
    const url = buildSearchUrl('the hobbit', EMPTY_FILTERS, 1);
    expect(url).toContain('title=the%20hobbit');
    expect(url).toContain(`limit=${PAGE_SIZE}`);
    expect(url).toContain('page=1');
    expect(url).not.toContain('q=');
  });
  it('moves filters into the query so they apply to the whole catalogue', () => {
    const url = buildSearchUrl('hobbit', { sort: 'newest', language: 'eng', subject: 'Fantasy fiction', yearFrom: '1990' }, 2);
    const q = decodeURIComponent(url.split('q=')[1].split('&')[0]);
    expect(q).toBe('title:"hobbit" AND language:eng AND subject:"Fantasy fiction" AND first_publish_year:[1990 TO *]');
    expect(url).toContain('sort=new');
    expect(url).toContain('page=2');
  });
  it('strips quotes from the search term', () => {
    const q = decodeURIComponent(buildSearchUrl('a"b', { ...EMPTY_FILTERS, language: 'eng' }).split('q=')[1].split('&')[0]);
    expect(q).toContain('title:"a b"');
  });
  it('ignores an invalid year', () => {
    expect(validYear('abc')).toBeNull();
    expect(validYear('12345')).toBeNull();
    expect(validYear('1990')).toBe(1990);
    expect(filtersActive({ ...EMPTY_FILTERS, yearFrom: 'x' })).toBe(false);
  });
});

describe('reading list import/export', () => {
  const items = [{ id: 'OL1W', title: 'A', author: 'X', cover_img: 'c', status: 'want', addedAt: 1 }];
  it('round-trips an export', () => {
    const { items: back, skipped } = parseImport(serializeList(items));
    expect(back).toEqual(items);
    expect(skipped).toBe(0);
  });
  it('rejects non-JSON and foreign JSON', () => {
    expect(() => parseImport('nope')).toThrow('not valid JSON');
    expect(() => parseImport('{"a":1}')).toThrow('not a ShelfSeeker');
  });
  it('skips invalid entries and fails when none are valid', () => {
    const text = JSON.stringify({ format: 'shelfseeker-reading-list', version: 1, items: [...items, { id: 1 }, { id: 'z', title: 't', status: 'bad' }] });
    expect(parseImport(text).skipped).toBe(2);
    expect(() => parseImport(JSON.stringify({ format: 'shelfseeker-reading-list', version: 1, items: [{ id: 1 }] }))).toThrow('No valid books');
  });
  it('merges by id with imported status winning', () => {
    const result = mergeItems(items, [{ ...items[0], status: 'done' }, { id: 'OL2W', title: 'B', author: '', cover_img: '', status: 'reading', addedAt: 2 }]);
    expect(result.added).toBe(1);
    expect(result.updated).toBe(1);
    expect(result.items.find((i) => i.id === 'OL1W').status).toBe('done');
  });
});
