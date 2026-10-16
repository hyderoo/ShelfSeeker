// ISBNcheck.js
import React, { useState, useRef } from 'react';
import './ISBNcheck.css';
import { FaSearch, FaCamera } from 'react-icons/fa';
import BarcodeScanner, { isBarcodeScanSupported } from '../../components/BarcodeScanner/BarcodeScanner';
import coverImg from '../../assets/gkadacover.jpg';
import { apiJson } from '../../api';

const ISBNCheckPage = () => {
  const [isbn, setIsbn] = useState('');
  const [bookData, setBookData] = useState(null);
  const [authorName, setAuthorName] = useState('');
  const [notFound, setNotFound] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [scanNotice, setScanNotice] = useState('');
  const searchText = useRef(null);

  const scannerSupported = isBarcodeScanSupported();

  const handleInputChange = (e) => {
    setIsbn(e.target.value);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleSearch = (override) => {
    const query = (typeof override === 'string' ? override : isbn).trim();
    if (!query) return;

    apiJson(`https://openlibrary.org/isbn/${encodeURIComponent(query)}.json`)
      .then(data => {
        setBookData(data);
        setAuthorName('');
        setNotFound(false);

        // fetch the first author's name once, in a separate state
        const authorKey = data.authors?.[0]?.key;
        if (authorKey) {
          apiJson(`https://openlibrary.org${authorKey}.json`)
            .then(authorDetails => {
              setAuthorName(authorDetails.name || '');
            })
            .catch(error => {
              console.error('Error fetching author details:', error);
            });
        }
      })
      .catch(error => {
        console.error('Error fetching book data:', error);
        setBookData(null);
        setNotFound(true);
      });
  };

  const handleScanClick = () => {
    if (!scannerSupported) {
      setScanNotice('This browser does not support barcode scanning. Type the ISBN manually below instead.');
      return;
    }
    setScanNotice('');
    setScanning(true);
  };

  const handleDetected = (code) => {
    setScanning(false);
    setIsbn(code);
    handleSearch(code);
  };

  return (
    <>
      <div className='header-content isbn-hero flex flex-c text-center text-white'>
        <h2 className='header-title text-capitalize'>Check the Authenticity</h2>
        <p className='header-text fs-18 fw-3'>
          Make sure you're purchasing an authentic copy of your favorite book.
        </p>
        <div className="search-bar">
          <input
            type="text"
            placeholder="Enter ISBN"
            aria-label="Enter ISBN"
            value={isbn}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            ref={searchText}
          />
          <button onClick={() => handleSearch()} aria-label="Check ISBN">
            <FaSearch size={20} />
          </button>
        </div>
        <button type='button' className='scan-toggle-btn' onClick={handleScanClick}>
          <FaCamera size={18} />
          <span>Scan barcode with camera</span>
        </button>
        {scanNotice && <p className='scan-notice'>{scanNotice}</p>}
        {scanning && (
          <BarcodeScanner
            onDetected={handleDetected}
            onClose={() => setScanning(false)}
          />
        )}
      </div>

      {notFound && (
        <div className="not-found-message">
          <p>Your book may not be an original copy. Please double-check the ISBN.</p>
        </div>
      )}
      {bookData && (
        <div className="isbn-result">
          <div className="book-img">
            <img src={bookData.covers?.[0] ? `https://covers.openlibrary.org/b/id/${bookData.covers[0]}-L.jpg` : coverImg} alt={`Cover of ${bookData.title || 'book'}`} />
          </div>
          <div className="isbn-result-info">
            <h2>{bookData.title}</h2>
            <p><strong>ISBN-13:</strong> {bookData.isbn_13 || 'Not available'}</p>
            <p><strong>ISBN-10:</strong> {bookData.isbn_10 || 'Not available'}</p>
            <p><strong>Author:</strong> {authorName || 'Author details not available'}</p>
            <p><strong>Publisher:</strong> {bookData.publishers?.[0] || 'Publisher details not available'}</p>
            <p><strong>Release Year:</strong> {bookData.publish_date || 'Release Year details not available'}</p>
            <p><strong>Description:</strong> {
              !bookData.description
                ? 'Description details not available'
                : typeof bookData.description === 'string'
                  ? bookData.description
                  : bookData.description.value || 'Description details not available'
            }</p>
          </div>
        </div>
      )}
    </>
  );
};

export default ISBNCheckPage;
