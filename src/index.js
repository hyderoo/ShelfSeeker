// index.js
import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom';
import { AppProvider } from './appprovider';
import { ThemeProvider, useTheme } from './theme';
import { ReadingListProvider } from './readinglist';
import * as serviceWorkerRegistration from './serviceWorkerRegistration';
import './index.css';
import Profile from "./pages/ProfilePages/Profile";
import BookDetails from "./components/BookDetails/DetailBuku";
import LandingPages from './pages/LandingPages/LandingPages';
import ISBNCheckPage from './pages/ISBNcheck/ISBNcheck';
import SplashScreen from './pages/SplashScreen/SplashScreen';
import FindingAuthor from './pages/FindAuthor/FindAuthor';
import ReadingList from './pages/ReadingList/ReadingList';
import { HiOutlineHome, HiOutlineSearch, HiOutlineUser, HiOutlineUserGroup, HiOutlineBookmark, HiOutlineMoon, HiOutlineSun } from "react-icons/hi";

const useOnlineStatus = () => {
  const [online, setOnline] = useState(navigator.onLine);
  useEffect(() => {
    const goOnline = () => setOnline(true);
    const goOffline = () => setOnline(false);
    window.addEventListener('online', goOnline);
    window.addEventListener('offline', goOffline);
    return () => {
      window.removeEventListener('online', goOnline);
      window.removeEventListener('offline', goOffline);
    };
  }, []);
  return online;
};

const BottomNavbar = () => {
  const { theme, toggleTheme } = useTheme();
  const links = [
    { to: "/", label: "Home", icon: <HiOutlineHome size={24} />, end: true },
    { to: "/isbn-check", label: "ISBN", icon: <HiOutlineSearch size={24} /> },
    { to: "/find-author", label: "Authors", icon: <HiOutlineUserGroup size={24} /> },
    { to: "/reading-list", label: "My Books", icon: <HiOutlineBookmark size={24} /> },
    { to: "/profile", label: "Profile", icon: <HiOutlineUser size={24} /> },
  ];

  return (
    <nav className='bottom-navbar' aria-label='Main navigation'>
      <div className='bottom-navbar-content'>
        {links.map(({ to, label, icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            aria-label={label}
            className={({ isActive }) => isActive ? 'navbar-link active-link' : 'navbar-link'}
          >
            {icon}
            <span>{label}</span>
          </NavLink>
        ))}
        <button
          type='button'
          className='navbar-link theme-toggle'
          onClick={toggleTheme}
          aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {theme === 'dark' ? <HiOutlineSun size={24} /> : <HiOutlineMoon size={24} />}
          <span>{theme === 'dark' ? 'Light' : 'Dark'}</span>
        </button>
      </div>
    </nav>
  );
};

const OfflineBanner = () => {
  const online = useOnlineStatus();
  if (online) return null;
  return (
    <div className='offline-banner' role='status'>
      You are offline - saved books and pages you visited before still work.
    </div>
  );
};

const App = () => {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <ThemeProvider>
      <AppProvider>
        <ReadingListProvider>
          <BrowserRouter>
            {showSplash ? (
              <SplashScreen />
            ) : (
              <>
                <OfflineBanner />
                <Routes>
                  <Route path="/" element={<LandingPages />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/book/:id" element={<BookDetails />} />
                  <Route path="/isbn-check" element={<ISBNCheckPage />} />
                  <Route path="/find-author" element={<FindingAuthor />} />
                  <Route path="/reading-list" element={<ReadingList />} />
                </Routes>
                <BottomNavbar />
              </>
            )}
          </BrowserRouter>
        </ReadingListProvider>
      </AppProvider>
    </ThemeProvider>
  );
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);

// Enable the PWA service worker: the app shell and previously viewed
// OpenLibrary data keep working offline. Reading list is in localStorage.
serviceWorkerRegistration.register();
