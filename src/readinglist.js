// readinglist.js - personal reading list stored in localStorage.
// Three shelves: "want" (Want to read), "reading", "done".
import React, { createContext, useContext, useEffect, useState } from 'react';

const STORAGE_KEY = 'shelfseeker-reading-list';

export const READING_STATUSES = [
  { key: 'want', label: 'Want to read' },
  { key: 'reading', label: 'Reading' },
  { key: 'done', label: 'Done' },
];

export const statusLabel = (key) =>
  (READING_STATUSES.find((s) => s.key === key) || {}).label || key;

const ReadingListContext = createContext();

function loadItems() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    return [];
  }
}

export const ReadingListProvider = ({ children }) => {
  const [items, setItems] = useState(loadItems);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch (error) {
      // storage full or unavailable - list stays in memory for the session
    }
  }, [items]);

  // book: { id, title, author, cover_img }. status: 'want' | 'reading' | 'done' | null (null removes)
  const setStatus = (book, status) => {
    setItems((prev) => {
      if (!status) return prev.filter((item) => item.id !== book.id);
      const existing = prev.find((item) => item.id === book.id);
      if (existing) {
        return prev.map((item) => (item.id === book.id ? { ...item, status } : item));
      }
      return [...prev, { ...book, status, addedAt: Date.now() }];
    });
  };

  const getStatus = (id) => {
    const found = items.find((item) => item.id === id);
    return found ? found.status : null;
  };

  return (
    <ReadingListContext.Provider value={{ items, setStatus, getStatus }}>
      {children}
    </ReadingListContext.Provider>
  );
};

export const useReadingList = () => useContext(ReadingListContext);
