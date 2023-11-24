// FindAuthor.js
import React, { useState } from 'react';
import './FindAuthor.css';
import { FaSearch } from 'react-icons/fa';
import defaultAuthorImage from '../../assets/gkadacover.jpg'; // Import the default image

const FindingAuthor = () => {
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedAuthor, setSelectedAuthor] = useState(null);

  const handleSearch = async () => {
    try {
      const response = await fetch(`https://openlibrary.org/search/authors.json?q=${query}`);
      const data = await response.json();

      if (data.numFound > 0) {
        setSearchResults(data.docs);
        setSelectedAuthor(null);
      } else {
        setSearchResults([]);
      }
    } catch (error) {
      console.error('Error fetching authors:', error);
    }
  };

  const handleAuthorClick = (author) => {
    setSelectedAuthor(author);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <>
      <div className='header-content flex flex-c text-center text-white'>
        <h2 className='header-title text-capitalize'>Find Authors</h2><br />
        <p className='header-text fs-18 fw-3'>
          Explore information about your favorite authors. Enter the author's name in the search bar to find details, including birth date and biography.
        </p>
        <div className="search-bar">
          <input
            type="text"
            placeholder="Enter author name"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyPress={handleKeyPress}
          />
          <button onClick={handleSearch}>
            <FaSearch className='text-purple' size={32} />
          </button>
        </div>
      </div>
      <div className="author-results">
        {searchResults.map((author) => (
          <div key={author.key} className="author-card" onClick={() => handleAuthorClick(author)}>
            <img
              src={`https://covers.openlibrary.org/a/olid/${author.key}-M.jpg`}
              alt={`${author.name}'s cover`}
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
        {searchResults.length === 0 && query && (
          <p className="not-found-message">Author "{query}" not found</p>
        )}
      </div>
    </>
  );
};

export default FindingAuthor;
