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
        console.log(data);

        if (data) {
          const {
            description,
            title,
            covers,
            subjects,
            authors,
          } = data;
          const authorKey = authors?.[0]?.author?.key || '';
          const authorDetails = await fetch(
            `https://openlibrary.org${authorKey}.json`
          ).then((res) => res.json());

          const newBook = {
            description: description ? description.value : 'No description found',
            title: title,
            cover_img: covers ? `https://covers.openlibrary.org/b/id/${covers[0]}-L.jpg` : coverImg,
            subjects: subjects ? subjects.join(', ') : 'No subjects found',
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

  if (loading) return <Loading />;

  return (
    <section className="book-details">
      <div className="container">
        <button type="button" className="flex flex-c back-btn" onClick={() => navigate('/book')}>
          <FaArrowLeft size={22} />
          <span className="fs-18 fw-6">Back</span>
        </button>

        <div className="book-details-content grid">
          <div className="book-details-img">
            <img src={book?.cover_img} alt="cover img" />
          </div>
          <div className="book-details-info">
            <div className="book-details-item title">
              <span className="fw-6 fs-24">{book?.title}</span>
            </div>
            <div className="book-details-item">
              <span className="fw-6">Author: </span>
              <span>{book?.author}</span>
            </div>
            <div className="book-details-item description">
              <span>{book?.description}</span>
            </div>
            <div className="book-details-item">
              <span className="fw-6">Subjects: </span>
              <span className="text-italic">{book?.subjects}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BookDetails;
