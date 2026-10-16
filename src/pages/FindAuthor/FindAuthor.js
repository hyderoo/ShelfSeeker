// FindAuthor.js
import React, { useState } from 'react';
import './FindAuthor.css';
import { FaSearch } from 'react-icons/fa';
import defaultAuthorImage from '../../assets/gkadacover.jpg'; // Import the default image
import { apiJson, describeError } from '../../api';

const FindingAuthor = () => {
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedAuthor, setSelectedAuthor] = useState(null);
  const [status, setStatus] = useState(null); // null | 'empty' | { error: message }

  const handleSearch = async () => {
    const trimmed = query.trim();
    if (!trimmed) return;
    setStatus(null);
    try {
      const data = await apiJson(`https://openlibrary.org/search/authors.json?q=${encodeURIComponent(trimmed)}`);

      if (data.numFound > 0) {
        setSearchResults(data.docs);
        setSelectedAuthor(null);
      } else {
        setSearchResults([]);
        setStatus('empty');
      }
    } catch (error) {
      console.error('Error fetching authors:', error);
      setSearchResults([]);
      setStatus({ error: describeError(error) });
    }
  };

  const handleAuthorClick = (author) => {
    setSelectedAuthor(author === selectedAuthor ? null : author);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <>
      <div className='header-content flex flex-c text-center text-white'>
        <h2 className='header-title text-capitalize'>Find Authors</h2>
        <p className='header-text fs-18 fw-3'>
          Explore information about your favorite authors. Enter the author's name in the search bar to find details, including birth date and biography.
        </p>
        <div className="search-bar">
          <input
            type="text"
            placeholder="Enter author name"
            aria-label="Enter author name"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <button onClick={handleSearch} aria-label="Search authors">
            <FaSearch size={20} />
          </button>
        </div>
      </div>
      <div className="author-results container">
        {status === 'empty' && (
          <div className='state-box state-empty'><p>No authors found for that name. Check the spelling or try a shorter name.</p></div>
        )}
        {status && status.error && (
          <div className='state-box state-error' role='alert'>
            <p>{status.error}</p>
            <button type='button' className='state-btn' onClick={handleSearch}>Try again</button>
          </div>
        )}
        {searchResults.map((author) => (
          <div
            key={author.key}
            className={selectedAuthor === author ? "author-card selected" : "author-card"}
            onClick={() => handleAuthorClick(author)}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleAuthorClick(author); } }}
            role="button"
            tabIndex={0}
            aria-expanded={selectedAuthor === author}
          >
            <img
              src={`https://covers.openlibrary.org/a/olid/${author.key}-M.jpg`}
              alt={`Portrait of ${author.name}`}
              loading="lazy"
              onError={(e) => { e.target.src = defaultAuthorImage }} // Set default image on error
            />
            <div className="author-details">
              <h3>{author.name}</h3>
              {selectedAuthor === author && (
                <div>
                  <p>Birth Date: {author.birth_date || "Not found"}</p>
                  <p>Top Book: {author.top_work || "Not found"}</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

export default FindingAuthor;
