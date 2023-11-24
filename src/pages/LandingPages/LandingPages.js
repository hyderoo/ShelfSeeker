import React from 'react';
import Header from '../../components/Header/Header';
import BookList from '../../components/Card/CardBuku'; // Import the BookList component
import { Outlet } from 'react-router-dom';

const LandingPages = () => {
  return (
    <main>
      <Header />
      <Outlet />
      {/* Include the BookList component */}
      <BookList />
    </main>
  );
};

export default LandingPages;
