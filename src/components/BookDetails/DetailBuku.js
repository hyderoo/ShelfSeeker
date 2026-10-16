// BookDetails.js
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Loading from '../Preloader/Preloader';
import coverImg from '../../assets/gkadacover.jpg';
import './DetailBuku.css';
import { FaArrowLeft } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const URL = 'https://openlibrary.org/works/';

const BookDetails = () => {
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [book, setBook] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    async function getBookDetails() {
      try {
        const response = await fetch(`${URL}${id}.json`);
        const data = await response.json();

        if (data) {
          const {
            description,
            title,
            covers,
            subjects,
            authors,
          } = data;
          const authorKey = authors?.[0]?.author?.key || '';
          const authorDetails = authorKey
            ? await fetch(`https://openlibrary.org${authorKey}.json`).then((res) => res.json())
            : null;

          // the API returns description either as a string or as { type, value }
          const descriptionText = !description
            ? 'No description found'
            : typeof description === 'string'
              ? description
              : description.value || 'No description found';

          const newBook = {
            description: descriptionText,
            title: title,
            cover_img: covers ? `https://covers.openlibrary.org/b/id/${covers[0]}-L.jpg` : coverImg,
            subjects: subjects && subjects.length > 0 ? subjects.slice(0, 10).join(', ') : 'No subjects found',
            author: authorDetails?.name || 'Author details not available',
          };
          setBook(newBook);
        } else {
          setBook(null);
        }
        setLoading(false);
      } catch (error) {
        console.log(error);
        setLoading(false);
      }
    }
    getBookDetails();
  }, [id]);

  if (loading || !book) return <Loading />;

  return (
    <section className="book-details">
      <div className="container">
        <button type="button" className="flex flex-c back-btn" onClick={() => navigate('/')}>
          <FaArrowLeft size={18} />
          <span className="fs-18 fw-6">Back</span>
        </button>

        <div className="book-details-content grid">
          <div className="book-details-img">
            <img src={book.cover_img} alt={`Cover of ${book.title}`} />
          </div>
          <div className="book-details-info">
            <div className="book-details-item title">
              <span className="fw-6 fs-24">{book.title}</span>
            </div>
            <div className="book-details-item">
              <span className="fw-6">Author: </span>
              <span>{book.author}</span>
            </div>
            <div className="book-details-item description">
              <span>{book.description}</span>
            </div>
            <div className="book-details-item">
              <span className="fw-6">Subjects: </span>
              <span className="text-italic">{book.subjects}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BookDetails;
