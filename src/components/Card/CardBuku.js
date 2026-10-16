import React, { useMemo } from 'react';
import { useGlobalContext } from '../../appprovider';
import Book from "../Card/Card";
import Loading from "../Preloader/Preloader";
import coverImg from "../../assets/gkadacover.jpg";
import { SORT_OPTIONS, EMPTY_FILTERS, filtersActive, validYear } from '../../search';
import "./CardBuku.css";

const CardBuku = () => {
  const {
    books, loading, loadingMore, slow, error, numFound, hasMore, loadMore, retry,
    resultTitle, filters, setFilters, facets,
  } = useGlobalContext();

  const setFilter = (key, value) => setFilters((prev) => ({ ...prev, [key]: value }));
  const resetFilters = () => setFilters((prev) => ({ ...EMPTY_FILTERS, sort: prev.sort }));
  const active = filtersActive(filters);
  const yearInvalid = filters.yearFrom.trim() !== '' && validYear(filters.yearFrom) === null;

  // sort by title happens on the books loaded so far; the other sorts run on the API
  const visibleBooks = useMemo(() => {
    let list = books.map((singleBook) => ({
      ...singleBook,
      id: (singleBook.id).replace("/works/", ""),
      cover_img: singleBook.cover_id ? `https://covers.openlibrary.org/b/id/${singleBook.cover_id}-L.jpg` : coverImg
    }));
    if (filters.sort === 'title') {
      list = [...list].sort((a, b) => (a.title || '').localeCompare(b.title || ''));
    }
    return list;
  }, [books, filters.sort]);

  const languageOptions = useMemo(
    () => (filters.language !== 'all' && !facets.languages.includes(filters.language)
      ? [...facets.languages, filters.language] : facets.languages),
    [facets.languages, filters.language]
  );
  const subjectOptions = useMemo(
    () => (filters.subject !== 'all' && !facets.subjects.includes(filters.subject)
      ? [...facets.subjects, filters.subject] : facets.subjects),
    [facets.subjects, filters.subject]
  );

  if (loading) {
    return (
      <>
        <Loading />
        {slow && <p className='slow-notice' role='status'>OpenLibrary is responding slowly. Still trying...</p>}
      </>
    );
  }

  const showBar = books.length > 0 || active || filters.sort !== 'relevance';

  return (
    <section className='booklist'>
      <div className='container'>
        <div className='section-title'>
          <h2>{resultTitle}</h2>
        </div>

        {showBar && (
          <div className='filter-bar' aria-label='Filter and sort results'>
            <label>
              <span>Sort</span>
              <select value={filters.sort} onChange={(e) => setFilter('sort', e.target.value)} aria-label='Sort results'>
                {SORT_OPTIONS.map(({ key, label }) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </label>
            <label>
              <span>Language</span>
              <select value={filters.language} onChange={(e) => setFilter('language', e.target.value)} aria-label='Filter by language'>
                <option value='all'>All</option>
                {languageOptions.map((l) => (
                  <option key={l} value={l}>{l.toUpperCase()}</option>
                ))}
              </select>
            </label>
            <label>
              <span>Subject</span>
              <select value={filters.subject} onChange={(e) => setFilter('subject', e.target.value)} aria-label='Filter by subject'>
                <option value='all'>All</option>
                {subjectOptions.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </label>
            <label>
              <span>Published from</span>
              <input
                type='number'
                min='0'
                placeholder='Year'
                value={filters.yearFrom}
                onChange={(e) => setFilter('yearFrom', e.target.value)}
                aria-label='Filter by earliest publish year'
                aria-invalid={yearInvalid}
              />
            </label>
            {active && (
              <button type='button' className='filter-reset' onClick={resetFilters}>
                Reset
              </button>
            )}
            <span className='filter-count' aria-live='polite'>
              {books.length} of {numFound.toLocaleString('en-US')} books
            </span>
          </div>
        )}
        {yearInvalid && <p className='filter-hint'>Enter a year with up to 4 digits, for example 1990. The year filter is ignored until then.</p>}

        {error && !error.loadingMore && (
          <div className='state-box state-error' role='alert'>
            <p>{error.message}</p>
            <button type='button' className='state-btn' onClick={retry}>Try again</button>
          </div>
        )}

        {!error && books.length === 0 && (
          <div className='state-box state-empty'>
            <p>{active
              ? 'No books match these filters.'
              : 'No books found for that search. Check the spelling or try another title.'}</p>
            {active && <button type='button' className='filter-reset' onClick={resetFilters}>Reset filters</button>}
          </div>
        )}

        {books.length > 0 && (
          <div className='booklist-content grid'>
            {visibleBooks.map((item, index) => (
              <Book key={`${item.id}-${index}`} {...item} />
            ))}
          </div>
        )}

        {error && error.loadingMore && (
          <div className='state-box state-error' role='alert'>
            <p>{error.message}</p>
            <button type='button' className='state-btn' onClick={retry}>Try again</button>
          </div>
        )}

        {hasMore && !(error && error.loadingMore) && (
          <div className='load-more-wrap'>
            <button type='button' className='state-btn' onClick={loadMore} disabled={loadingMore}>
              {loadingMore ? 'Loading...' : 'Load more books'}
            </button>
            {loadingMore && slow && <p className='slow-notice' role='status'>OpenLibrary is responding slowly. Still trying...</p>}
          </div>
        )}
      </div>
    </section>
  )
}

export default CardBuku
