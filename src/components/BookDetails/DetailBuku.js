// BookDetails.js
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Loading from '../Preloader/Preloader';
import coverImg from '../../assets/gkadacover.jpg';
import './DetailBuku.css';
import { FaArrowLeft, FaBookmark } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { apiJson, describeError } from '../../api';
import { useReadingList, READING_STATUSES } from '../../readinglist';

const URL = 'https://openlibrary.org/works/';

const BookDetails = () => {
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [book, setBook] = useState(null);
  const [similar, setSimilar] = useState([]);
  const [error, setError] = useState('');
  const [attempt, setAttempt] = useState(0);
  const navigate = useNavigate();
  const { setStatus, getStatus } = useReadingList();

  useEffect(() => {
    setLoading(true);
    setSimilar([]);
    setError('');
    setBook(null);
    async function getBookDetails() {
      try {
        const data = await apiJson(`${URL}${id}.json`);

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
            ? await apiJson(`https://openlibrary.org${authorKey}.json`).catch(() => null)
            : null;

          // the API returns description either as a string or as { type, value }
          const descriptionText = !description
            ? 'No description found'
            : typeof description === 'string'
              ? description
              : description.value || 'No description found';

          const subjectList = Array.isArray(subjects) ? subjects : [];
          const newBook = {
            description: descriptionText,
            title: title,
            cover_img: covers ? `https://covers.openlibrary.org/b/id/${covers[0]}-L.jpg` : coverImg,
            subjectList: subjectList,
            subjects: subjectList.length > 0 ? subjectList.slice(0, 10).join(', ') : 'No subjects found',
            author: authorDetails?.name || 'Author details not available',
          };
          setBook(newBook);

          // similar books: same first subject, from the OpenLibrary subjects API
          if (subjectList.length > 0) {
            const slug = encodeURIComponent(subjectList[0].toLowerCase().replace(/\s+/g, '_'));
            apiJson(`https://openlibrary.org/subjects/${slug}.json?limit=7`)
              .then((subjectData) => {
                const works = Array.isArray(subjectData.works) ? subjectData.works : [];
                setSimilar(
                  works
                    .filter((work) => work.key !== `/works/${id}`)
                    .slice(0, 6)
                    .map((work) => ({
                      id: work.key.replace('/works/', ''),
                      title: work.title,
                      author: work.authors?.[0]?.name || 'Unknown Author',
                      cover_img: work.cover_id
                        ? `https://covers.openlibrary.org/b/id/${work.cover_id}-M.jpg`
                        : coverImg,
                    }))
                );
              })
              .catch((error) => console.log('Similar books failed to load:', error));
          }
        } else {
          setBook(null);
        }
        setLoading(false);
      } catch (error) {
        console.log(error);
        setError(describeError(error));
        setLoading(false);
      }
    }
    getBookDetails();
  }, [id, attempt]);

  if (loading) return <Loading />;
  if (error || !book) {
    return (
      <section className="book-details">
        <div className="container">
          <button type="button" className="flex flex-c back-btn" onClick={() => navigate('/')}>
            <FaArrowLeft size={18} />
            <span className="fs-18 fw-6">Back</span>
          </button>
          <div className='state-box state-error' role='alert'>
            <p>{error || 'This book could not be loaded.'}</p>
            <button type='button' className='state-btn' onClick={() => setAttempt((n) => n + 1)}>Try again</button>
          </div>
        </div>
      </section>
    );
  }

  const currentStatus = getStatus(id);
  const listBook = {
    id,
    title: book.title,
    author: book.author,
    cover_img: book.cover_img,
  };

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

            <div className="reading-list-controls" aria-label='Add to reading list'>
              <span className="reading-list-controls-label fw-6">
                <FaBookmark size={14} /> Reading list:
              </span>
              <div className="reading-list-buttons">
                {READING_STATUSES.map(({ key, label }) => (
                  <button
                    key={key}
                    type="button"
                    className={currentStatus === key ? 'shelf-btn active' : 'shelf-btn'}
                    aria-pressed={currentStatus === key}
                    onClick={() => setStatus(listBook, currentStatus === key ? null : key)}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {similar.length > 0 && (
          <div className="similar-books">
            <div className="section-title">
              <h2>Similar Books</h2>
            </div>
            <div className="similar-grid grid">
              {similar.map((item) => (
                <Link key={item.id} to={`/book/${item.id}`} className="similar-card">
                  <img src={item.cover_img} alt={`Cover of ${item.title}`} loading="lazy" />
                  <span className="similar-card-title">{item.title}</span>
                  <span className="similar-card-author">{item.author}</span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default BookDetails;
