import React, { useMemo, useState } from 'react';
import { useGlobalContext } from '../../appprovider';
import Book from "../Card/Card";
import Loading from "../Preloader/Preloader";
import coverImg from "../../assets/gkadacover.jpg";
import "./CardBuku.css";

const SORT_OPTIONS = [
  { key: 'relevance', label: 'Best match' },
  { key: 'newest', label: 'Newest first' },
  { key: 'oldest', label: 'Oldest first' },
  { key: 'title', label: 'Title A-Z' },
];

const CardBuku = () => {
  const {books, loading, resultTitle} = useGlobalContext();
  const [sort, setSort] = useState('relevance');
  const [language, setLanguage] = useState('all');
  const [subject, setSubject] = useState('all');
  const [yearFrom, setYearFrom] = useState('');

  // distinct languages and the most common subjects in the current result set
  const { languageOptions, subjectOptions } = useMemo(() => {
    const languages = new Set();
    const subjectCounts = new Map();
    books.forEach((book) => {
      (book.languages || []).forEach((l) => languages.add(l));
      (book.subjects || []).slice(0, 8).forEach((s) => {
        subjectCounts.set(s, (subjectCounts.get(s) || 0) + 1);
      });
    });
    const sortedSubjects = [...subjectCounts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 15)
      .map(([name]) => name)
      .sort();
    return {
      languageOptions: [...languages].sort(),
      subjectOptions: sortedSubjects,
    };
  }, [books]);

  const visibleBooks = useMemo(() => {
    let list = books.map((singleBook) => ({
      ...singleBook,
      id: (singleBook.id).replace("/works/", ""),
      cover_img: singleBook.cover_id ? `https://covers.openlibrary.org/b/id/${singleBook.cover_id}-L.jpg` : coverImg
    }));

    if (language !== 'all') {
      list = list.filter((book) => (book.languages || []).includes(language));
    }
    if (subject !== 'all') {
      list = list.filter((book) => (book.subjects || []).includes(subject));
    }
    if (yearFrom.trim() !== '' && !Number.isNaN(Number(yearFrom))) {
      const from = Number(yearFrom);
      list = list.filter((book) => book.first_publish_year && book.first_publish_year >= from);
    }

    if (sort === 'newest') {
      list = [...list].sort((a, b) => (b.first_publish_year || 0) - (a.first_publish_year || 0));
    } else if (sort === 'oldest') {
      list = [...list].sort((a, b) => (a.first_publish_year || 9999) - (b.first_publish_year || 9999));
    } else if (sort === 'title') {
      list = [...list].sort((a, b) => (a.title || '').localeCompare(b.title || ''));
    }
    return list;
  }, [books, sort, language, subject, yearFrom]);

  const filtersActive = language !== 'all' || subject !== 'all' || yearFrom.trim() !== '';
  const resetFilters = () => {
    setLanguage('all');
    setSubject('all');
    setYearFrom('');
  };

  if(loading) return <Loading />;

  return (
    <section className='booklist'>
      <div className='container'>
        <div className='section-title'>
          <h2>{resultTitle}</h2>
        </div>

        {books.length > 0 && (
          <div className='filter-bar' aria-label='Filter and sort results'>
            <label>
              <span>Sort</span>
              <select value={sort} onChange={(e) => setSort(e.target.value)} aria-label='Sort results'>
                {SORT_OPTIONS.map(({ key, label }) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </label>
            <label>
              <span>Language</span>
              <select value={language} onChange={(e) => setLanguage(e.target.value)} aria-label='Filter by language'>
                <option value='all'>All</option>
                {languageOptions.map((l) => (
                  <option key={l} value={l}>{l.toUpperCase()}</option>
                ))}
              </select>
            </label>
            <label>
              <span>Subject</span>
              <select value={subject} onChange={(e) => setSubject(e.target.value)} aria-label='Filter by subject'>
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
                value={yearFrom}
                onChange={(e) => setYearFrom(e.target.value)}
                aria-label='Filter by earliest publish year'
              />
            </label>
            {filtersActive && (
              <button type='button' className='filter-reset' onClick={resetFilters}>
                Reset
              </button>
            )}
            <span className='filter-count' aria-live='polite'>
              {visibleBooks.length} of {books.length} books
            </span>
          </div>
        )}

        {visibleBooks.length === 0 && books.length > 0 ? (
          <p className='filter-empty'>No books match these filters. <button type='button' className='filter-reset' onClick={resetFilters}>Reset filters</button></p>
        ) : (
          <div className='booklist-content grid'>
            {
              visibleBooks.slice(0, 30).map((item, index) => {
                return (
                  <Book key = {index} {...item} />
                )
              })
            }
          </div>
        )}
      </div>
    </section>
  )
}

export default CardBuku
