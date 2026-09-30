import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { booksAPI, categoriesAPI } from '../services/api';
import { useDebounce } from '../hooks/useDebounce';
import toast from 'react-hot-toast';
import {
  MagnifyingGlass, Plus, PencilSimple, Trash, X, Book,
  SpinnerGap, BookOpen, CaretLeft, CaretRight
} from '@phosphor-icons/react';

const fadeUp = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] } } };
const stagger = { show: { transition: { staggerChildren: 0.06 } } };

export default function BooksPage() {
  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });
  const [modal, setModal] = useState({ open: false, mode: 'add', data: null });
  const [formData, setFormData] = useState({ title: '', author: '', isbn: '', category_id: '', publisher: '', year: '', total_copies: 1, description: '' });
  const [saving, setSaving] = useState(false);
  const debouncedSearch = useDebounce(search, 300);

  const fetchBooks = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const res = await booksAPI.getAll({ page, limit: 12, search: debouncedSearch, category_id: categoryFilter || undefined });
      setBooks(res.data.data);
      setPagination(res.data.pagination);
    } catch { toast.error('Failed to load books'); }
    finally { setLoading(false); }
  }, [debouncedSearch, categoryFilter]);

  useEffect(() => { fetchBooks(); }, [fetchBooks]);

  useEffect(() => {
    categoriesAPI.getAll().then(r => setCategories(r.data.data)).catch(() => {});
  }, []);

  const openAdd = () => {
    setFormData({ title: '', author: '', isbn: '', category_id: '', publisher: '', year: '', total_copies: 1, description: '' });
    setModal({ open: true, mode: 'add', data: null });
  };

  const openEdit = (book) => {
    setFormData({
      title: book.title, author: book.author, isbn: book.isbn || '', category_id: book.category_id || '',
      publisher: book.publisher || '', year: book.year || '', total_copies: book.total_copies, description: book.description || ''
    });
    setModal({ open: true, mode: 'edit', data: book });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { ...formData, category_id: formData.category_id || null, total_copies: Number(formData.total_copies), year: formData.year ? Number(formData.year) : null };
      if (modal.mode === 'add') {
        await booksAPI.create(payload);
        toast.success('Book added successfully!');
      } else {
        await booksAPI.update(modal.data.id, payload);
        toast.success('Book updated successfully!');
      }
      setModal({ open: false, mode: 'add', data: null });
      fetchBooks(pagination.page);
    } catch (err) { toast.error(err.response?.data?.message || 'Operation failed'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (book) => {
    if (!confirm(`Delete "${book.title}"?`)) return;
    try {
      await booksAPI.delete(book.id);
      toast.success('Book deleted');
      fetchBooks(pagination.page);
    } catch (err) { toast.error(err.response?.data?.message || 'Delete failed'); }
  };

  const closeModal = () => setModal({ open: false, mode: 'add', data: null });

  return (
    <div className="folio-books-page">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,100..900;1,9..144,100..900&family=Plus+Jakarta+Sans:ital,wght@0,200..800;1,200..800&display=swap');

        .folio-books-page {
          --navy-primary: #1f3a6e;
          --navy-deep: #12264f;
          --navy-mid: #2c4c8c;
          --navy-steel: #4a6aa8;
          
          
          
          
          
          
          
          

          font-family: 'Plus Jakarta Sans', sans-serif;
          background: linear-gradient(135deg, var(--page-bg-start), var(--page-bg-end));
          border-radius: 24px;
          padding: 2rem 2.5rem;
          color: var(--text-main);
          min-height: calc(100vh - 6rem);
          position: relative;
          overflow: hidden;
        }

        /* Ambient glows */
        .folio-books-page::before {
          content: '';
          position: absolute;
          top: -15%; right: -10%;
          width: 45%; height: 50%;
          background: radial-gradient(circle, rgba(200, 164, 92, 0.08) 0%, transparent 70%);
          pointer-events: none;
        }
        .folio-books-page::after {
          content: '';
          position: absolute;
          bottom: -10%; left: -10%;
          width: 50%; height: 50%;
          background: radial-gradient(circle, rgba(31, 58, 110, 0.35) 0%, transparent 70%);
          pointer-events: none;
        }

        .books-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
          position: relative;
          z-index: 2;
          flex-wrap: wrap;
          gap: 1rem;
        }
        .books-title {
          font-family: 'Fraunces', serif;
          font-size: 1.75rem;
          font-weight: 500;
          background: linear-gradient(135deg, var(--text-main), var(--gold));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .books-controls {
          display: flex;
          gap: 0.75rem;
          align-items: center;
          flex-wrap: wrap;
        }

        /* Search bar */
        .folio-search {
          position: relative;
        }
        .folio-search-icon {
          position: absolute;
          left: 0.875rem;
          top: 50%;
          transform: translateY(-50%);
          color: var(--text-muted);
          pointer-events: none;
        }
        .folio-input {
          background: var(--input-bg);
          border: 1px solid var(--card-border);
          border-radius: 12px;
          padding: 0.65rem 1rem;
          color: var(--text-main);
          font-family: inherit;
          font-size: 0.9rem;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .folio-input:focus {
          border-color: var(--gold);
          box-shadow: 0 0 0 3px rgba(200, 164, 92, 0.15);
        }
        .folio-input::placeholder {
          color: var(--text-muted);
        }
        .folio-input option {
          background: var(--page-bg-start);
          color: var(--text-main);
        }
        .folio-search .folio-input {
          padding-left: 2.5rem;
          min-width: 220px;
        }

        /* Add Book Button */
        .folio-add-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.65rem 1.25rem;
          background: linear-gradient(135deg, var(--navy-primary), var(--navy-mid));
          border: 1px solid rgba(200, 164, 92, 0.3);
          border-radius: 12px;
          color: #e3cb96;
          font-family: inherit;
          font-weight: 600;
          font-size: 0.9rem;
          cursor: pointer;
          transition: all 0.2s;
          box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        }
        .folio-add-btn:hover {
          border-color: #e3cb96;
          box-shadow: 0 4px 20px rgba(200, 164, 92, 0.2);
          color: #e3cb96;
        }

        /* Book Cards Grid */
        .books-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1.25rem;
          position: relative;
          z-index: 2;
        }
        @media (max-width: 1100px) { .books-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 650px) { .books-grid { grid-template-columns: 1fr; } }

        .book-card {
          background: var(--card-bg);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 1px solid var(--card-border);
          border-radius: 18px;
          padding: 1.25rem;
          position: relative;
          overflow: hidden;
          transition: transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease;
          cursor: default;
        }
        .book-card::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0; height: 1px;
          background: linear-gradient(90deg, transparent, rgba(200, 164, 92, 0.4), transparent);
        }
        .book-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 40px rgba(0, 0, 0, 0.3);
          border-color: rgba(200, 164, 92, 0.35);
        }

        /* Left accent strip */
        .book-card-accent {
          position: absolute;
          left: 0; top: 0; bottom: 0;
          width: 4px;
          border-radius: 18px 0 0 18px;
        }

        .book-card-top {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 0.75rem;
        }
        .book-category-badge {
          padding: 0.3rem 0.65rem;
          border-radius: 100px;
          font-size: 0.7rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.04em;
          border: 1px solid;
        }
        .book-actions {
          display: flex;
          gap: 0.25rem;
          opacity: 0;
          transition: opacity 0.2s;
        }
        .book-card:hover .book-actions {
          opacity: 1;
        }
        .book-action-btn {
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 8px;
          padding: 0.3rem;
          cursor: pointer;
          color: var(--text-muted);
          display: flex;
          align-items: center;
          transition: all 0.15s;
        }
        .book-action-btn:hover {
          background: rgba(200, 164, 92, 0.1);
          border-color: var(--gold);
          color: var(--gold);
        }
        .book-action-btn.danger:hover {
          background: rgba(255, 77, 109, 0.1);
          border-color: var(--danger);
          color: var(--danger);
        }

        .book-title {
          font-size: 1rem;
          font-weight: 600;
          color: var(--text-main);
          margin-bottom: 0.25rem;
          line-height: 1.35;
        }
        .book-author {
          font-size: 0.825rem;
          color: var(--text-muted);
          margin-bottom: 0.65rem;
        }
        .book-isbn {
          font-size: 0.72rem;
          font-family: monospace;
          color: rgba(200, 164, 92, 0.5);
          margin-bottom: 0.5rem;
        }
        .book-card-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-top: 0.75rem;
          border-top: 1px solid rgba(255,255,255,0.05);
          margin-top: 0.5rem;
        }
        .avail-badge {
          padding: 0.3rem 0.7rem;
          border-radius: 100px;
          font-size: 0.75rem;
          font-weight: 600;
        }
        .avail-yes {
          background: var(--badge-blue-bg);
          color: var(--badge-blue-text);
          border: 1px solid var(--badge-blue-border);
        }
        .avail-no {
          background: rgba(255, 77, 109, 0.15);
          color: var(--danger);
          border: 1px solid rgba(255, 77, 109, 0.3);
        }
        .total-copies {
          font-size: 0.75rem;
          color: var(--text-muted);
        }

        /* Pagination */
        .folio-pagination {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 0.5rem;
          margin-top: 2rem;
          position: relative;
          z-index: 2;
        }
        .page-btn {
          background: var(--card-bg);
          border: 1px solid var(--card-border);
          border-radius: 10px;
          padding: 0.5rem 0.875rem;
          color: var(--text-muted);
          cursor: pointer;
          font-family: inherit;
          font-size: 0.875rem;
          transition: all 0.2s;
        }
        .page-btn:hover {
          border-color: var(--gold);
          color: var(--gold);
        }
        .page-btn.active {
          background: linear-gradient(135deg, var(--navy-primary), var(--navy-mid));
          border-color: rgba(200, 164, 92, 0.4);
          color: var(--gold);
          font-weight: 600;
        }
        .page-btn:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }

        /* Empty State */
        .folio-empty {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 5rem 2rem;
          color: var(--text-muted);
          text-align: center;
          position: relative;
          z-index: 2;
        }
        .folio-empty h3 {
          font-family: 'Fraunces', serif;
          font-size: 1.5rem;
          color: var(--text-main);
          margin: 1.25rem 0 0.5rem;
        }
        .folio-empty p { font-size: 0.95rem; margin-bottom: 1.5rem; }

        /* Skeleton */
        .folio-skeleton {
          background: linear-gradient(90deg, rgba(255,255,255,0.04) 25%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.04) 75%);
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
          border-radius: 18px;
          height: 190px;
        }
        @keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }

        /* ───── MODAL ───── */
        .folio-modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(5, 12, 30, 0.8);
          backdrop-filter: blur(6px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 1rem;
        }
        .folio-modal {
          background: var(--card-bg);
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          border: 1px solid rgba(200, 164, 92, 0.25);
          border-radius: 24px;
          width: 100%;
          max-width: 560px;
          max-height: 90vh;
          overflow: auto;
          box-shadow: 0 30px 80px rgba(0,0,0,0.5);
          position: relative;
        }
        .folio-modal::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0; height: 1px;
          background: linear-gradient(90deg, transparent, var(--gold), transparent);
          opacity: 0.5;
        }
        .folio-modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.5rem 1.75rem 1rem;
          border-bottom: 1px solid var(--sidebar-active-bg);
        }
        .folio-modal-title {
          font-family: 'Fraunces', serif;
          font-size: 1.35rem;
          color: var(--gold);
          font-weight: 500;
        }
        .modal-close-btn {
          background: var(--sidebar-hover);
          border: 1px solid var(--sidebar-border);
          border-radius: 10px;
          padding: 0.4rem;
          cursor: pointer;
          color: var(--text-muted);
          display: flex;
          align-items: center;
          transition: all 0.15s;
        }
        .modal-close-btn:hover {
          background: rgba(255, 77, 109, 0.1);
          border-color: var(--danger);
          color: var(--danger);
        }
        .folio-modal-body {
          padding: 1.25rem 1.75rem;
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        .folio-modal-footer {
          padding: 1rem 1.75rem 1.5rem;
          display: flex;
          justify-content: flex-end;
          gap: 0.75rem;
          border-top: 1px solid var(--sidebar-active-bg);
        }
        .folio-form-group {
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
        }
        .folio-form-label {
          font-size: 0.82rem;
          font-weight: 600;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .folio-form-input {
          background: var(--input-bg);
          border: 1px solid rgba(200, 164, 92, 0.15);
          border-radius: 12px;
          padding: 0.75rem 1rem;
          color: var(--text-main);
          font-family: inherit;
          font-size: 0.95rem;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
          width: 100%;
          box-sizing: border-box;
        }
        .folio-form-input:focus {
          border-color: var(--gold);
          box-shadow: 0 0 0 3px rgba(200, 164, 92, 0.12);
        }
        .folio-form-input::placeholder { color: var(--text-muted); opacity: 0.6; }
        .folio-form-input option { background: var(--page-bg-start); }

        .folio-cancel-btn {
          padding: 0.7rem 1.25rem;
          background: var(--sidebar-hover);
          border: 1px solid var(--sidebar-border);
          border-radius: 12px;
          color: var(--text-muted);
          font-family: inherit;
          font-size: 0.95rem;
          cursor: pointer;
          transition: all 0.2s;
        }
        .folio-cancel-btn:hover {
          background: var(--sidebar-active-bg);
          color: var(--text-main);
        }
        .folio-save-btn {
          padding: 0.7rem 1.5rem;
          background: linear-gradient(135deg, var(--navy-primary), var(--navy-mid));
          border: 1px solid rgba(200, 164, 92, 0.35);
          border-radius: 12px;
          color: #e3cb96;
          font-family: inherit;
          font-weight: 600;
          font-size: 0.95rem;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .folio-save-btn:hover:not(:disabled) {
          border-color: #e3cb96;
          box-shadow: 0 4px 20px rgba(200, 164, 92, 0.2);
          color: #e3cb96;
        }
        .folio-save-btn:disabled { opacity: 0.7; cursor: not-allowed; }
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      {/* ── Header ── */}
      <div className="books-header">
        <h1 className="books-title">Books Collection</h1>
        <div className="books-controls">
          <div className="folio-search">
            <MagnifyingGlass size={17} className="folio-search-icon" />
            <input
              className="folio-input"
              placeholder="Search books..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <select
            className="folio-input"
            style={{ minWidth: 160 }}
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
          >
            <option value="">All Categories</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <motion.button
            className="folio-add-btn"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={openAdd}
          >
            <Plus size={18} weight="bold" /> Add Book
          </motion.button>
        </div>
      </div>

      {/* ── Cards / Skeleton / Empty ── */}
      {loading ? (
        <div className="books-grid">
          {[...Array(6)].map((_, i) => <div key={i} className="folio-skeleton" />)}
        </div>
      ) : books.length === 0 ? (
        <div className="folio-empty">
          <BookOpen size={64} weight="duotone" color="rgba(200,164,92,0.4)" />
          <h3>No books found</h3>
          <p>Add your first book or adjust the filters.</p>
          <motion.button className="folio-add-btn" whileTap={{ scale: 0.97 }} onClick={openAdd}>
            <Plus size={18} /> Add Book
          </motion.button>
        </div>
      ) : (
        <>
          <motion.div className="books-grid" variants={stagger} initial="hidden" animate="show">
            {books.map(book => (
              <motion.div key={book.id} variants={fadeUp} className="book-card">
                {/* Left color accent */}
                <div className="book-card-accent" style={{ background: book.category_color || 'rgba(200, 164, 92, 0.5)' }} />

                <div className="book-card-top" style={{ paddingLeft: '0.5rem' }}>
                  <span
                    className="book-category-badge"
                    style={{
                      background: book.category_color ? `${book.category_color}22` : 'rgba(200,164,92,0.1)',
                      color: book.category_color || 'var(--gold)',
                      borderColor: book.category_color ? `${book.category_color}55` : 'rgba(200,164,92,0.3)',
                    }}
                  >
                    {book.category_name || 'Uncategorized'}
                  </span>
                  <div className="book-actions">
                    <button className="book-action-btn" onClick={() => openEdit(book)} title="Edit">
                      <PencilSimple size={15} />
                    </button>
                    <button className="book-action-btn danger" onClick={() => handleDelete(book)} title="Delete">
                      <Trash size={15} />
                    </button>
                  </div>
                </div>

                <div style={{ paddingLeft: '0.5rem' }}>
                  <h4 className="book-title">{book.title}</h4>
                  <p className="book-author">{book.author}</p>
                  {book.isbn && <p className="book-isbn">ISBN: {book.isbn}</p>}
                </div>

                <div className="book-card-footer" style={{ paddingLeft: '0.5rem' }}>
                  <span className={`avail-badge ${book.available_copies > 0 ? 'avail-yes' : 'avail-no'}`}>
                    {book.available_copies > 0 ? `${book.available_copies} Available` : 'Unavailable'}
                  </span>
                  <span className="total-copies">{book.total_copies} total copies</span>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="folio-pagination">
              <button
                className="page-btn"
                onClick={() => fetchBooks(pagination.page - 1)}
                disabled={pagination.page === 1}
              >
                <CaretLeft size={16} />
              </button>
              {Array.from({ length: pagination.totalPages }, (_, i) => (
                <button
                  key={i}
                  className={`page-btn ${pagination.page === i + 1 ? 'active' : ''}`}
                  onClick={() => fetchBooks(i + 1)}
                >
                  {i + 1}
                </button>
              ))}
              <button
                className="page-btn"
                onClick={() => fetchBooks(pagination.page + 1)}
                disabled={pagination.page === pagination.totalPages}
              >
                <CaretRight size={16} />
              </button>
            </div>
          )}
        </>
      )}

      {/* ── Modal ── */}
      <AnimatePresence>
        {modal.open && (
          <motion.div
            className="folio-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeModal}
          >
            <motion.div
              className="folio-modal"
              initial={{ scale: 0.94, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.94, opacity: 0, y: 20 }}
              transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
              onClick={e => e.stopPropagation()}
            >
              <div className="folio-modal-header">
                <h3 className="folio-modal-title">
                  {modal.mode === 'add' ? 'Add New Book' : 'Edit Book'}
                </h3>
                <button className="modal-close-btn" onClick={closeModal}><X size={18} /></button>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="folio-modal-body">
                  <div className="folio-form-group">
                    <label className="folio-form-label" htmlFor="book-title">Title *</label>
                    <input id="book-title" className="folio-form-input" required placeholder="Enter book title"
                      value={formData.title} onChange={e => setFormData(p => ({ ...p, title: e.target.value }))} />
                  </div>
                  <div className="folio-form-group">
                    <label className="folio-form-label" htmlFor="book-author">Author *</label>
                    <input id="book-author" className="folio-form-input" required placeholder="Enter author name"
                      value={formData.author} onChange={e => setFormData(p => ({ ...p, author: e.target.value }))} />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div className="folio-form-group">
                      <label className="folio-form-label" htmlFor="book-isbn">ISBN</label>
                      <input id="book-isbn" className="folio-form-input" placeholder="978-..."
                        value={formData.isbn} onChange={e => setFormData(p => ({ ...p, isbn: e.target.value }))} />
                    </div>
                    <div className="folio-form-group">
                      <label className="folio-form-label" htmlFor="book-category">Category</label>
                      <select id="book-category" className="folio-form-input"
                        value={formData.category_id} onChange={e => setFormData(p => ({ ...p, category_id: e.target.value }))}>
                        <option value="">None</option>
                        {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                      </select>
                    </div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                    <div className="folio-form-group">
                      <label className="folio-form-label" htmlFor="book-publisher">Publisher</label>
                      <input id="book-publisher" className="folio-form-input" placeholder="Publisher"
                        value={formData.publisher} onChange={e => setFormData(p => ({ ...p, publisher: e.target.value }))} />
                    </div>
                    <div className="folio-form-group">
                      <label className="folio-form-label" htmlFor="book-year">Year</label>
                      <input id="book-year" type="number" className="folio-form-input" placeholder="2024"
                        value={formData.year} onChange={e => setFormData(p => ({ ...p, year: e.target.value }))} />
                    </div>
                    <div className="folio-form-group">
                      <label className="folio-form-label" htmlFor="book-copies">Copies</label>
                      <input id="book-copies" type="number" min="1" className="folio-form-input"
                        value={formData.total_copies} onChange={e => setFormData(p => ({ ...p, total_copies: e.target.value }))} />
                    </div>
                  </div>
                  <div className="folio-form-group">
                    <label className="folio-form-label" htmlFor="book-desc">Description</label>
                    <textarea id="book-desc" className="folio-form-input" rows="2" placeholder="Short description..."
                      value={formData.description} onChange={e => setFormData(p => ({ ...p, description: e.target.value }))} />
                  </div>
                </div>
                <div className="folio-modal-footer">
                  <button type="button" className="folio-cancel-btn" onClick={closeModal}>Cancel</button>
                  <motion.button type="submit" className="folio-save-btn" disabled={saving} whileTap={{ scale: 0.97 }}>
                    {saving
                      ? <SpinnerGap size={18} className="spin" />
                      : modal.mode === 'add' ? 'Add Book' : 'Save Changes'
                    }
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
