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
  // 'invalid' (bad check digit), 'not-found' (valid but not in Open Library),
  // 'network' (lookup request failed), or '' (no error)
  const [errorKind, setErrorKind] = useState('');
  const [scanning, setScanning] = useState(false);
  const [scanNotice, setScanNotice] = useState('');
  const searchText = useRef(null);

  const scannerSupported = isBarcodeScanSupported();

  const handleInputChange = (e) => {
    setIsbn(e.target.value);
  };

  const isValidIsbn = (value) => {
    if (/^\d{13}$/.test(value)) {
      const sum = value.split('').reduce((acc, d, i) => acc + Number(d) * (i % 2 === 0 ? 1 : 3), 0);
      return sum % 10 === 0;
    }
    if (/^\d{9}[\dXx]$/.test(value)) {
      const sum = value.split('').reduce((acc, c, i) => {
        const n = i === 9 && (c === 'X' || c === 'x') ? 10 : Number(c);
        return acc + n * (10 - i);
      }, 0);
      return sum % 11 === 0;
    }
    return false;
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleSearch = (override) => {
    // Accept printed forms: "979-11-993053-0-4" -> "9791199305304", and a clearly
    // delimited EAN-5/EAN-2 supplemental: "9791199305304 (02810)" -> "9791199305304".
    // Digits glued on without a delimiter are NOT trimmed - they fail validation below.
    const raw = typeof override === 'string' ? override : isbn;
    const query = raw.trim().split(/[\s(]/)[0].replace(/-/g, '');
    if (!query) return;

    if (!isValidIsbn(query)) {
      setBookData(null);
      setAuthorName('');
      setErrorKind('invalid');
      return;
    }

    apiJson(`https://openlibrary.org/isbn/${encodeURIComponent(query)}.json`)
      .then(data => {
        setBookData(data);
        setAuthorName('');
        setErrorKind('');

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
        setAuthorName('');
        // Open Library answers 404 when the ISBN simply isn't in its catalog -
        // that says nothing about whether the book is an original copy.
        setErrorKind(error && error.status === 404 ? 'not-found' : 'network');
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
        <h2 className='header-title text-capitalize'>Check a Book's ISBN</h2>
        <p className='header-text fs-18 fw-3'>
          Scan or type a book's ISBN barcode to look it up in the Open Library catalog.
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

      {errorKind === 'invalid' && (
        <div className="not-found-message">
          <p>That ISBN doesn't look valid - double-check the digits. An ISBN-13 has 13 digits; ignore the smaller supplemental barcode printed beside it.</p>
        </div>
      )}
      {errorKind === 'not-found' && (
        <div className="not-found-message">
          <p>This ISBN isn't in the Open Library catalog. That doesn't say anything about whether the book is an original copy - the catalog just doesn't include every published edition.</p>
        </div>
      )}
      {errorKind === 'network' && (
        <div className="not-found-message">
          <p>Couldn't reach the book database. Check your connection and try again.</p>
        </div>
      )}
      {bookData && (
        <div className="isbn-result">
          <div className="book-img">
            <img src={bookData.covers?.[0] ? `https://covers.openlibrary.org/b/id/${bookData.covers[0]}-L.jpg` : coverImg} alt={`Cover of ${bookData.title || 'book'}`} />
          </div>
          <div className="isbn-result-info">
            <p className="isbn-result-source">Found in the Open Library catalog.</p>
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
