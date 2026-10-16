import React from 'react';
import { Link } from 'react-router-dom';
import "./CardBuku.css";

const Card = (book) => {
  return (
    <div className='book-item flex flex-column flex-sb'>
      <div className='book-item-img'>
        <img src={book.cover_img} alt={`Cover of ${book.title}`} loading="lazy" />
      </div>
      <div className='book-item-info text-center'>
        <Link to={`/book/${book.id}`} {...book}>
          <div className='book-item-info-item title fw-7 fs-18'>
            <span>{book.title}</span>
          </div>
        </Link>

        <div className='book-item-info-item author fs-15'>
          <span className='text-capitalize fw-7'>Author: </span>
          <span>{book.author ? book.author.join(", ") : "Unknown Author"}</span>
        </div>

        {book.first_publish_year && (
          <div className='book-item-info-item publish-year'>
            <span>First published {book.first_publish_year}</span>
          </div>
        )}
      </div>
    </div>
  )
}

export default Card;
