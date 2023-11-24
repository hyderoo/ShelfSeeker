// index.js
import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
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
  return (
    <nav className='bottom-navbar'>
      <div className='container bottom-navbar-content flex'>
        <Link to="/" className='navbar-link'activeClassName='active-link'>
          <HiOutlineHome size={30} />
        </Link>
        <Link to="isbn-check" className='navbar-link'activeClassName='active-link'>
          <HiOutlineSearch size={30} />
        </Link>
        <Link to="find-author" className='navbar-link'activeClassName='active-link'>
          <HiOutlineUserGroup size={30} />
        </Link>
        <Link to="profile" className='navbar-link'activeClassName='active-link'>
          <HiOutlineUser size={30} />
        </Link>
      </div>
    </nav>
  );
};

const App = () => {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setShowSplash(false);
    }, 2000);
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
