// ReadingList.js - the user's saved books, grouped by shelf.
// Data lives in localStorage, so it keeps working offline.
import React, { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { FaTrash } from 'react-icons/fa';
import { useReadingList, READING_STATUSES, statusLabel } from '../../readinglist';
import { serializeList, parseImport } from '../../readinglistIO';
import './ReadingList.css';

const TABS = [{ key: 'all', label: 'All' }, ...READING_STATUSES];

const ReadingList = () => {
  const { items, setStatus, importItems } = useReadingList();
  const [tab, setTab] = useState('all');
  const [message, setMessage] = useState(null); // { type: 'ok' | 'error', text }
  const fileInput = useRef(null);

  const handleExport = () => {
    const blob = new Blob([serializeList(items)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `shelfseeker-reading-list-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setMessage({ type: 'ok', text: `Exported ${items.length} book${items.length === 1 ? '' : 's'}.` });
  };

  const handleImport = async (event) => {
    const file = event.target.files && event.target.files[0];
    event.target.value = '';
    if (!file) return;
    try {
      const { items: imported, skipped } = parseImport(await file.text());
      const { added, updated } = importItems(imported);
      const parts = [`${added} added`, `${updated} moved to a different shelf`];
      if (skipped > 0) parts.push(`${skipped} skipped (invalid)`);
      setMessage({ type: 'ok', text: `Import done: ${parts.join(', ')}.` });
    } catch (error) {
      setMessage({ type: 'error', text: error.message || 'Could not read that file.' });
    }
  };

  const visible = items
    .filter((item) => tab === 'all' || item.status === tab)
    .sort((a, b) => (b.addedAt || 0) - (a.addedAt || 0));

  return (
    <main className='reading-list'>
      <div className='container'>
        <div className='section-title'>
          <h2>My Reading List</h2>
        </div>

        <div className='list-io'>
          <button type='button' className='state-btn' onClick={handleExport} disabled={items.length === 0}>
            Export list
          </button>
          <button type='button' className='state-btn secondary' onClick={() => fileInput.current && fileInput.current.click()}>
            Import list
          </button>
          <input
            ref={fileInput}
            type='file'
            accept='application/json,.json'
            onChange={handleImport}
            aria-label='Import reading list file'
            hidden
          />
        </div>
        {message && (
          <p className={message.type === 'error' ? 'list-io-message error' : 'list-io-message'} role={message.type === 'error' ? 'alert' : 'status'}>
            {message.text}
          </p>
        )}

        <div className='shelf-tabs' role='tablist' aria-label='Filter by shelf'>
          {TABS.map(({ key, label }) => (
            <button
              key={key}
              type='button'
              role='tab'
              aria-selected={tab === key}
              className={tab === key ? 'shelf-tab active' : 'shelf-tab'}
              onClick={() => setTab(key)}
            >
              {label}
              <span className='shelf-tab-count'>
                {key === 'all' ? items.length : items.filter((i) => i.status === key).length}
              </span>
            </button>
          ))}
        </div>

        {visible.length === 0 ? (
          <div className='reading-list-empty'>
            <p>No books on this shelf yet.</p>
            <p>Open a book and tap <strong>{statusLabel('want')}</strong> to start your list.</p>
            <Link to='/' className='reading-list-browse'>Browse books</Link>
          </div>
        ) : (
          <div className='reading-list-grid grid'>
            {visible.map((item) => (
              <div key={item.id} className='saved-book'>
                <Link to={`/book/${item.id}`} className='saved-book-cover'>
                  <img src={item.cover_img} alt={`Cover of ${item.title}`} loading='lazy' />
                </Link>
                <div className='saved-book-info'>
                  <Link to={`/book/${item.id}`} className='saved-book-title'>
                    {item.title}
                  </Link>
                  <span className='saved-book-author'>{item.author || 'Unknown Author'}</span>
                  <div className='saved-book-actions'>
                    <select
                      aria-label={`Shelf for ${item.title}`}
                      value={item.status}
                      onChange={(e) => setStatus(item, e.target.value)}
                    >
                      {READING_STATUSES.map(({ key, label }) => (
                        <option key={key} value={key}>{label}</option>
                      ))}
                    </select>
                    <button
                      type='button'
                      className='saved-book-remove'
                      aria-label={`Remove ${item.title} from reading list`}
                      onClick={() => setStatus(item, null)}
                    >
                      <FaTrash size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
};

export default ReadingList;
