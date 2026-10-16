import React, { useState, useContext, useEffect, useCallback, useRef, useMemo } from 'react';
import { apiJson, describeError } from './api';
import { buildSearchUrl, mapDocs, buildFacets, EMPTY_FILTERS, filtersActive, PAGE_SIZE } from './search';

const AppContext = React.createContext();

const AppProvider = ({ children }) => {
  const [searchTerm, setSearchTerm] = useState('Outlander');
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [books, setBooks] = useState([]);
  const [numFound, setNumFound] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [slow, setSlow] = useState(false);
  const [error, setError] = useState(null); // { message, loadingMore }
  const [resultTitle, setResultTitle] = useState('');
  const [facets, setFacets] = useState({ languages: [], subjects: [] });
  const requestId = useRef(0);
  const slowTimer = useRef(null);

  const clearSlow = () => {
    clearTimeout(slowTimer.current);
    setSlow(false);
  };

  const fetchPage = useCallback(async (nextPage) => {
    const id = ++requestId.current;
    const append = nextPage > 1;
    if (append) setLoadingMore(true); else setLoading(true);
    setError(null);
    clearTimeout(slowTimer.current);
    slowTimer.current = setTimeout(() => setSlow(true), 6000);
    try {
      const data = await apiJson(buildSearchUrl(searchTerm, filters, nextPage));
      if (id !== requestId.current) return; // a newer request replaced this one
      const docs = Array.isArray(data.docs) ? data.docs : [];
      const mapped = mapDocs(docs);
      setBooks((prev) => (append ? [...prev, ...mapped] : mapped));
      setNumFound(typeof data.numFound === 'number' ? data.numFound : mapped.length);
      setPage(nextPage);
      setResultTitle(!append && mapped.length === 0 ? 'No Search Result Found!' : 'Your Search Result');
      if (!append && !filtersActive(filters)) setFacets(buildFacets(mapped));
    } catch (err) {
      if (id !== requestId.current) return;
      console.log(err);
      setError({ message: describeError(err), loadingMore: append });
      if (!append) {
        setBooks([]);
        setNumFound(0);
        setResultTitle('');
      }
    } finally {
      if (id === requestId.current) {
        clearSlow();
        setLoading(false);
        setLoadingMore(false);
      }
    }
  }, [searchTerm, filters]);

  useEffect(() => {
    fetchPage(1);
  }, [fetchPage]);

  useEffect(() => () => clearTimeout(slowTimer.current), []);

  // a new search starts with clean filters
  const startSearch = (term) => {
    setFilters(EMPTY_FILTERS);
    setSearchTerm(term);
  };

  const loadMore = () => fetchPage(page + 1);
  const retry = () => fetchPage(error && error.loadingMore ? page + 1 : 1);
  const hasMore = books.length > 0 && books.length < numFound && books.length >= page * PAGE_SIZE;

  const value = useMemo(() => ({
    loading, loadingMore, slow, error, books, numFound, hasMore,
    searchTerm, setSearchTerm: startSearch, filters, setFilters, facets,
    resultTitle, setResultTitle, loadMore, retry,
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [loading, loadingMore, slow, error, books, numFound, hasMore, searchTerm, filters, facets, resultTitle, page]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useGlobalContext = () => {
  return useContext(AppContext);
};

export { AppContext, AppProvider };
