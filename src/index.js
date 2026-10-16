// index.js
import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom';
import { AppProvider } from './appprovider';
import './index.css';
import Profile from "./pages/ProfilePages/Profile";
import BookDetails from "./components/BookDetails/DetailBuku";
import LandingPages from './pages/LandingPages/LandingPages';
import ISBNCheckPage from './pages/ISBNcheck/ISBNcheck';
import SplashScreen from './pages/SplashScreen/SplashScreen';
import FindingAuthor from './pages/FindAuthor/FindAuthor';
import { HiOutlineHome, HiOutlineSearch, HiOutlineUser, HiOutlineUserGroup } from "react-icons/hi";

const BottomNavbar = () => {
  const links = [
    { to: "/", label: "Home", icon: <HiOutlineHome size={24} />, end: true },
    { to: "/isbn-check", label: "ISBN", icon: <HiOutlineSearch size={24} /> },
    { to: "/find-author", label: "Authors", icon: <HiOutlineUserGroup size={24} /> },
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
      </div>
    </nav>
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
    <AppProvider>
      <BrowserRouter>
        {showSplash ? (
          <SplashScreen />
        ) : (
          <>
            <Routes>
              <Route path="/" element={<LandingPages />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/book/:id" element={<BookDetails />} />
              <Route path="/isbn-check" element={<ISBNCheckPage />} />
              <Route path="/find-author" element={<FindingAuthor />} />
            </Routes>
            <BottomNavbar />
          </>
        )}
      </BrowserRouter>
    </AppProvider>
  );
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
