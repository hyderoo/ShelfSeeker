// mockApi.js - local fixtures used ONLY when REACT_APP_MOCK_API=true.
// Lets the UI be developed and screenshot-tested without network access
// to openlibrary.org. Never used in normal builds.

const AUTHORS = {
  'OL23919A': { name: 'J. K. Rowling', birth_date: '31 July 1965', top_work: 'Harry Potter and the Philosopher\'s Stone' },
  'OL26320A': { name: 'J. R. R. Tolkien', birth_date: '3 January 1892', top_work: 'The Lord of the Rings' },
  'OL34184A': { name: 'Agatha Christie', birth_date: '15 September 1890', top_work: 'And Then There Were None' },
};

const BOOKS = [
  { key: '/works/OL24347W', title: 'Outlander', author_name: ['Diana Gabaldon'], first_publish_year: 1991, edition_count: 95, language: ['eng', 'ind'], subject: ['Time travel', 'Scotland', 'Historical fiction', 'Romance'] },
  { key: '/works/OL24348W', title: 'Dragonfly in Amber', author_name: ['Diana Gabaldon'], first_publish_year: 1992, edition_count: 70, language: ['eng'], subject: ['Time travel', 'Scotland', 'Historical fiction'] },
  { key: '/works/OL24349W', title: 'Voyager', author_name: ['Diana Gabaldon'], first_publish_year: 1993, edition_count: 66, language: ['eng'], subject: ['Time travel', 'Scotland', 'Romance'] },
  { key: '/works/OL893416W', title: 'The Outlandish Companion', author_name: ['Diana Gabaldon'], first_publish_year: 1999, edition_count: 12, language: ['eng'], subject: ['Reference', 'Scotland'] },
  { key: '/works/OL82563W', title: 'Harry Potter and the Philosopher\'s Stone', author_name: ['J. K. Rowling'], first_publish_year: 1997, edition_count: 120, language: ['eng', 'ind'], subject: ['Magic', 'Wizards', 'Fantasy fiction', 'Schools'] },
  { key: '/works/OL27448W', title: 'The Lord of the Rings', author_name: ['J. R. R. Tolkien'], first_publish_year: 1954, edition_count: 240, language: ['eng'], subject: ['Fantasy fiction', 'Middle Earth', 'Adventure'] },
  { key: '/works/OL45804W', title: 'Fantastic Beasts and Where to Find Them', author_name: ['J. K. Rowling'], first_publish_year: 2001, edition_count: 54, language: ['eng', 'ind'], subject: ['Magic', 'Animals', 'Fantasy fiction'] },
  { key: '/works/OL893415W', title: 'Murder on the Orient Express', author_name: ['Agatha Christie'], first_publish_year: 1934, edition_count: 180, language: ['eng', 'ind'], subject: ['Detective and mystery stories', 'Crime'] },
  { key: '/works/OL1168007W', title: 'The Hobbit', author_name: ['J. R. R. Tolkien'], first_publish_year: 1937, edition_count: 310, language: ['eng', 'ind'], subject: ['Fantasy fiction', 'Adventure', 'Dragons'] },
  { key: '/works/OL22934258W', title: 'Laskar Pelangi', author_name: ['Andrea Hirata'], first_publish_year: 2005, edition_count: 40, language: ['ind'], subject: ['Indonesia', 'Schools', 'Fiction'] },
  { key: '/works/OL66529W', title: 'And Then There Were None', author_name: ['Agatha Christie'], first_publish_year: 1939, edition_count: 220, language: ['eng'], subject: ['Detective and mystery stories', 'Crime'] },
  { key: '/works/OL26812582M', title: 'Bumi', author_name: ['Tere Liye'], first_publish_year: 2014, edition_count: 32, language: ['ind'], subject: ['Fantasy fiction', 'Indonesia', 'Magic'] },
  { key: '/works/OL20632060W', title: 'Harry Potter and the Chamber of Secrets', author_name: ['J. K. Rowling'], first_publish_year: 1998, edition_count: 110, language: ['eng'], subject: ['Magic', 'Wizards', 'Schools'] },
  { key: '/works/OL102470W', title: 'The Silmarillion', author_name: ['J. R. R. Tolkien'], first_publish_year: 1977, edition_count: 90, language: ['eng'], subject: ['Fantasy fiction', 'Middle Earth', 'Mythology'] },
  { key: '/works/OL17077855W', title: 'Sapiens: A Brief History of Humankind', author_name: ['Yuval Noah Harari'], first_publish_year: 2011, edition_count: 75, language: ['eng', 'ind'], subject: ['History', 'Anthropology', 'Science'] },
  { key: '/works/OL20637244W', title: 'Atomic Habits', author_name: ['James Clear'], first_publish_year: 2018, edition_count: 45, language: ['eng', 'ind'], subject: ['Self-help', 'Psychology', 'Habits'] },
];

const DETAILS = {
  '/works/OL82563W': {
    title: 'Harry Potter and the Philosopher\'s Stone',
    description: { type: '/type/text', value: 'Harry Potter has no idea how famous he is. That is because he is being raised by his miserable aunt and uncle who are terrified Harry will learn that he is really a wizard, just as his parents were.' },
    subjects: ['Magic', 'Wizards', 'Fantasy fiction', 'Schools', 'England'],
    authors: [{ author: { key: '/authors/OL23919A' } }],
  },
};

const ISBN_EDITIONS = {
  '9780747532699': {
    title: 'Harry Potter and the Philosopher\'s Stone',
    isbn_13: '9780747532699',
    isbn_10: '0747532699',
    publishers: ['Bloomsbury'],
    publish_date: '1997',
    number_of_pages: 223,
    authors: [{ key: '/authors/OL23919A' }],
    description: 'The first book in the Harry Potter series.',
  },
};

function findBookByWorkPath(pathname) {
  return BOOKS.find((b) => pathname.startsWith(b.key));
}

export function mockJson(url) {
  const { pathname, searchParams } = new URL(url);

  if (pathname === '/search.json') {
    const title = (searchParams.get('title') || '').toLowerCase();
    const docs = title
      ? BOOKS.filter((b) => b.title.toLowerCase().includes(title) || b.author_name.join(' ').toLowerCase().includes(title))
      : BOOKS;
    return Promise.resolve({ numFound: docs.length, docs });
  }

  if (pathname === '/search/authors.json') {
    const q = (searchParams.get('q') || '').toLowerCase();
    const docs = Object.entries(AUTHORS)
      .filter(([, a]) => a.name.toLowerCase().includes(q))
      .map(([key, a]) => ({ key: key.replace('/authors/', ''), ...a }));
    return Promise.resolve({ numFound: docs.length, docs });
  }

  if (pathname.startsWith('/works/')) {
    const book = findBookByWorkPath(pathname);
    const detail = DETAILS[pathname.replace('.json', '')];
    if (detail) return Promise.resolve(detail);
    if (book) {
      return Promise.resolve({
        title: book.title,
        description: `${book.title} by ${book.author_name.join(', ')}, first published in ${book.first_publish_year}.`,
        subjects: book.subject,
        authors: [{ author: { key: '/authors/OL26320A' } }],
      });
    }
    return Promise.reject(new Error('Work not found'));
  }

  if (pathname.startsWith('/authors/')) {
    const author = AUTHORS[pathname.replace('.json', '').replace('/authors/', '')];
    if (author) return Promise.resolve(author);
    return Promise.resolve({ name: 'Unknown Author' });
  }

  if (pathname.startsWith('/isbn/')) {
    const edition = ISBN_EDITIONS[pathname.replace('.json', '').replace('/isbn/', '')];
    if (edition) return Promise.resolve(edition);
    return Promise.reject(new Error('Book not found'));
  }

  if (pathname.startsWith('/subjects/')) {
    const slug = pathname.replace('/subjects/', '').replace('.json', '').replace(/_/g, ' ');
    const works = BOOKS
      .filter((b) => (b.subject || []).some((s) => s.toLowerCase() === slug))
      .map((b) => ({ key: b.key, title: b.title, authors: b.author_name.map((name) => ({ name })), first_publish_year: b.first_publish_year }));
    return Promise.resolve({ work_count: works.length, works });
  }

  return Promise.reject(new Error(`No mock for ${url}`));
}
