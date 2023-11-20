// index.js
import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppProvider } from './appprovider';
import './index.css';
import Profile from "./pages/ProfilePages/Profile";
import BookList from "./components/Card/CardBuku";
import BookDetails from "./components/BookDetails/DetailBuku";
import LandingPages from './pages/LandingPages/LandingPages';
import ISBNCheckPage from './pages/ISBNcheck/ISBNcheck'; // Import ISBNCheckPage
import SplashScreen from './pages/SplashScreen/SplashScreen';
import FindingAuthor from './pages/FindAuthor/FindAuthor';

const App = () => {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    // Simulate loading time, then hide the SplashScreen
    setTimeout(() => {
      setShowSplash(false);
    }, 2000); // Adjust the duration as needed
  }, []);

  return (
    <AppProvider>
      <BrowserRouter>
        {showSplash ? (
          <SplashScreen />
        ) : (
          <Routes>
            <Route path="/" element={<LandingPages />}>
              <Route path="profile" element={<Profile />} />
              <Route path="book" element={<BookList />} />
              <Route path="/book/:id" element={<BookDetails />} />
              <Route path="isbn-check" element={<ISBNCheckPage />} />
              <Route path="find-author" element={<FindingAuthor />} />
            </Route>
          </Routes>
        )}
      </BrowserRouter>
    </AppProvider>
  );
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
