// ISBNcheck.js
import React, { useState, useEffect, useRef } from 'react';
import './ISBNcheck.css';
import { FaSearch } from 'react-icons/fa';

const ISBNCheckPage = () => {
  const [isbn, setIsbn] = useState('');
  const [bookData, setBookData] = useState(null);
  const [notFound, setNotFound] = useState(false);
  const searchText = useRef('');

  const handleInputChange = (e) => {
    setIsbn(e.target.value);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleSearch = () => {
    fetch(`https://openlibrary.org/isbn/${isbn}.json`)
      .then(response => {
        if (!response.ok) {
          throw new Error('Book not found');
        }
        return response.json();
      })
      .then(data => {
        setBookData(data);
        setNotFound(false);
      })
      .catch(error => {
        console.error('Error fetching book data:', error);
        setBookData(null);
        setNotFound(true);
      });
  };

  useEffect(() => {
    if (bookData) {
      const authorKey = bookData.authors?.[0]?.key;
      if (authorKey) {
        fetch(`https://openlibrary.org${authorKey}.json`)
          .then(response => response.json())
          .then(authorDetails => {
            setBookData(prevBookData => ({
              ...prevBookData,
              author: authorDetails.name,
            }));
          })
          .catch(error => {
            console.error('Error fetching author details:', error);
          });
      }
    }
  }, [bookData]);

  return (
    <>
      <div className='header-content flex flex-c text-center text-white'>
        <h2 className='header-title text-capitalize'>Check the Authenticity</h2><br />
        <p className='header-text fs-18 fw-3'>
          Make sure you're purchasing an authentic copy of your favorite book.
          <div className="search-bar">
            <input
              type="text"
              placeholder="Enter ISBN"
              value={isbn}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              ref={searchText}
            />
            <button onClick={handleSearch}>
              <FaSearch className='text-purple' size={32} />
            </button>
          </div>
        </p>
      </div>

      {notFound && (
        <div className="not-found-message">
          <p>Your book may not be an original copy. Please double-check the ISBN.</p>
        </div>
      )}
      {bookData && (
        <div className="book-details">
          {/* Render book details here */}
          <div className="book-img">
            <img src={`https://covers.openlibrary.org/b/id/${bookData.covers?.[0]}-L.jpg`} alt="Book Cover" />
          </div>
          <h2>{bookData.title}</h2>
          <p><strong>ISBN-13:</strong> {bookData.isbn_13}</p>
          <p><strong>ISBN-10:</strong> {bookData.isbn_10}</p>
          <p><strong>Author:</strong> {bookData.author || 'Author details not available'}</p>
          <p><strong>Publisher:</strong> {bookData.publishers?.[0] || 'Publisher details not available'}</p>
          <p><strong>Release Year:</strong> {bookData.publish_date || 'Release Year details not available'}</p>
          <p><strong>Description:</strong> {bookData.description || 'Description details not available'}</p>
        </div>
      )}
    </>
  );
};

export default ISBNCheckPage;
