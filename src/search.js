// search.js - builds OpenLibrary search URLs so language, subject, year and
// sort are applied by the API across the whole catalogue (not just the first
// page of results that happens to be loaded).
export const PAGE_SIZE = 30;

export const SORT_OPTIONS = [
  { key: 'relevance', label: 'Best match' },
  { key: 'newest', label: 'Newest first' },
  { key: 'oldest', label: 'Oldest first' },
  { key: 'title', label: 'Title A-Z (loaded books)' },
];

export const EMPTY_FILTERS = { sort: 'relevance', language: 'all', subject: 'all', yearFrom: '' };

const FIELDS = 'key,title,author_name,cover_i,edition_count,first_publish_year,subject,language';
const BASE = 'https://openlibrary.org/search.json';

const quote = (text) => `"${String(text).replace(/["\\]/g, ' ').trim()}"`;

export function validYear(value) {
  const text = String(value || '').trim();
  return /^\d{1,4}$/.test(text) ? Number(text) : null;
}

export function filtersActive(filters) {
  return filters.language !== 'all' || filters.subject !== 'all' || validYear(filters.yearFrom) !== null;
}

export function buildSearchUrl(term, filters = EMPTY_FILTERS, page = 1) {
  const params = [];
  const year = validYear(filters.yearFrom);
  const hasFilter = filters.language !== 'all' || filters.subject !== 'all' || year !== null;

  if (hasFilter) {
    const parts = [`title:${quote(term)}`];
    if (filters.language !== 'all') parts.push(`language:${filters.language}`);
    if (filters.subject !== 'all') parts.push(`subject:${quote(filters.subject)}`);
    if (year !== null) parts.push(`first_publish_year:[${year} TO *]`);
    params.push(`q=${encodeURIComponent(parts.join(' AND '))}`);
  } else {
    params.push(`title=${encodeURIComponent(term)}`);
  }
  if (filters.sort === 'newest') params.push('sort=new');
  if (filters.sort === 'oldest') params.push('sort=old');
  params.push(`fields=${FIELDS}`);
  params.push(`limit=${PAGE_SIZE}`);
  params.push(`page=${page}`);
  return `${BASE}?${params.join('&')}`;
}

export function mapDocs(docs) {
  return docs.map((doc) => ({
    id: doc.key,
    author: doc.author_name,
    cover_id: doc.cover_i,
    edition_count: doc.edition_count,
    first_publish_year: doc.first_publish_year,
    title: doc.title,
    subjects: Array.isArray(doc.subject) ? doc.subject : [],
    languages: Array.isArray(doc.language) ? doc.language : [],
  }));
}

// Most common subjects and all languages in a result set, for the filter menus.
export function buildFacets(books) {
  const languages = new Set();
  const subjectCounts = new Map();
  books.forEach((book) => {
    (book.languages || []).forEach((l) => languages.add(l));
    (book.subjects || []).slice(0, 8).forEach((s) => subjectCounts.set(s, (subjectCounts.get(s) || 0) + 1));
  });
  const subjects = [...subjectCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 15)
    .map(([name]) => name)
    .sort();
  return { languages: [...languages].sort(), subjects };
}
