import React from 'react';
import Navbar from "../SideNavbar/SideNavbar";
import SearchForm from "../SearchBar/SearchBar";
import "./Header.css";

const Header = () => {
  return (
    <div className='holder'>
        <header className='header'>
            <Navbar />
            <div className='header-content flex flex-c text-center text-white'>
                <h2 className='header-title text-capitalize'>Discover Your Next Read</h2><br />
                <p className='header-text fs-18 fw-3'>Explore a world of knowledge and adventure. Find the perfect book that suits your taste and imagination</p>
                <SearchForm />
            </div>
        </header>
    </div>
  )
}

export default Header