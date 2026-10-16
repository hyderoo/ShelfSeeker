import React, { useState, useContext, useEffect } from 'react';
import { useCallback } from 'react';
import { apiJson } from './api';

const URL = "https://openlibrary.org/search.json?title=";

const AppContext = React.createContext();

const AppProvider = ({ children }) => {
  const [searchTerm, setSearchTerm] = useState("Outlander");
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [resultTitle, setResultTitle] = useState("");

  const fetchBooks = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiJson(`${URL}${encodeURIComponent(searchTerm)}`);
      const { docs } = data;

      if (docs) {
        // keep subject and language too - the filter bar needs them
        const newBooks = docs.slice(0, 60).map((bookSingle) => {
          const { key, author_name, cover_i, edition_count, first_publish_year, title, subject, language } = bookSingle;

          return {
            id: key,
            author: author_name,
            cover_id: cover_i,
            edition_count: edition_count,
            first_publish_year: first_publish_year,
            title: title,
            subjects: Array.isArray(subject) ? subject : [],
            languages: Array.isArray(language) ? language : [],
          };
        });

        setBooks(newBooks);

        if (newBooks.length > 0) {
          setResultTitle("Your Search Result");
        } else {
          setResultTitle("No Search Result Found!");
        }
      } else {
        setBooks([]);
        setResultTitle("No Search Result Found!");
      }
      setLoading(false);
    } catch (error) {
      console.log(error);
      setBooks([]);
      setResultTitle("Could not load books. Check your connection and try again.");
      setLoading(false);
    }
  }, [searchTerm]);

  useEffect(() => {
    fetchBooks();
  }, [searchTerm, fetchBooks]);

  return (
    <AppContext.Provider value={{
      loading, books, setSearchTerm, resultTitle, setResultTitle,
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useGlobalContext = () => {
  return useContext(AppContext);
};

export { AppContext, AppProvider };
