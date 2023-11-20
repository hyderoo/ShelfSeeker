// FindingAuthor.js
import React, { useState } from 'react';
import './FindAuthor.css';

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

  return (
    <div className="finding-author-container">
      <h2>Finding Authors</h2>
      <p>Explore information about your favorite authors. Enter the author's name in the search bar to find details, including birth date and biography.</p>
      <div className="search-bar">
        <input
          type="text"
          placeholder="Enter author name"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button onClick={handleSearch}>Search</button>
      </div>
      <div className="author-results">
        {searchResults.map((author) => (
          <div key={author.key} className="author-card" onClick={() => handleAuthorClick(author)}>
            <img
              src={`https://covers.openlibrary.org/a/olid/${author.key}-M.jpg`}
              alt={`${author.name}'s cover`}
            />
            <div className="author-details">
              <h3>{author.name}</h3>
              {selectedAuthor === author && (
                <div>
                  <p>Birth Date: {author.birth_date || "Not found"}</p>
                  <p>Bio: {author.bio || "Not found"}</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FindingAuthor;
