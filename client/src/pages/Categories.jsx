import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { categoriesAPI } from '../services/api';
import toast from 'react-hot-toast';
import { Plus, PencilSimple, Trash, X, Tag, SpinnerGap, Books } from '@phosphor-icons/react';

const PRESET_COLORS = ['var(--gold)', '#8B5CF6', '#EC4899', '#EF4444', '#F97316', '#F59E0B', '#84CC16', '#10B981', '#14B8A6', '#4a6aa8'];

const fadeUp = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] } } };
const stagger = { show: { transition: { staggerChildren: 0.07 } } };

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState({ open: false, mode: 'add', data: null });
  const [formData, setFormData] = useState({ name: '', description: '', color: 'var(--gold)' });
  const [saving, setSaving] = useState(false);

  const fetchCategories = async () => {
    setLoading(true);
    try { const res = await categoriesAPI.getAll(); setCategories(res.data.data); }
    catch { toast.error('Failed to load categories'); }
    finally { setLoading(false); }
  };
  useEffect(() => { fetchCategories(); }, []);

  const openAdd = () => { setFormData({ name: '', description: '', color: 'var(--gold)' }); setModal({ open: true, mode: 'add', data: null }); };
  const openEdit = (c) => { setFormData({ name: c.name, description: c.description || '', color: c.color || 'var(--gold)' }); setModal({ open: true, mode: 'edit', data: c }); };
  const closeModal = () => setModal({ open: false, mode: 'add', data: null });

  const handleSubmit = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      if (modal.mode === 'add') { await categoriesAPI.create(formData); toast.success('Category created!'); }
      else { await categoriesAPI.update(modal.data.id, formData); toast.success('Category updated!'); }
      closeModal(); fetchCategories();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (c) => {
    if (!confirm(`Delete "${c.name}"?`)) return;
    try { await categoriesAPI.delete(c.id); toast.success('Deleted'); fetchCategories(); }
    catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  return (
    <div className="folio-cat-page">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,100..900&family=Plus+Jakarta+Sans:wght@200..800&display=swap');

        .folio-cat-page {
          
          
          --navy-primary: #1f3a6e;
          --navy-mid: #2c4c8c;
          
          
          
          
          
          

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
        .folio-cat-page::before {
          content: '';
          position: absolute;
          top: -15%; left: -10%;
          width: 45%; height: 50%;
          background: radial-gradient(circle, rgba(200,164,92,0.07) 0%, transparent 70%);
          pointer-events: none;
        }
        .folio-cat-page::after {
          content: '';
          position: absolute;
          bottom: -10%; right: -10%;
          width: 50%; height: 50%;
          background: radial-gradient(circle, rgba(31,58,110,0.35) 0%, transparent 70%);
          pointer-events: none;
        }

        /* Header */
        .cat-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
          position: relative;
          z-index: 2;
        }
        .cat-title {
          font-family: 'Fraunces', serif;
          font-size: 1.75rem;
          font-weight: 500;
          background: linear-gradient(135deg, var(--text-main), var(--gold));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
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
          box-shadow: 0 4px 20px rgba(200,164,92,0.2);
          color: #e3cb96;
        }

        /* Grid */
        .cat-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1.25rem;
          position: relative;
          z-index: 2;
        }
        @media (max-width: 1100px) { .cat-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 650px)  { .cat-grid { grid-template-columns: 1fr; } }

        /* Glassmorphism Category Card */
        .cat-card {
          background: var(--card-bg);
          backdrop-filter: blur(20px) saturate(1.4);
          -webkit-backdrop-filter: blur(20px) saturate(1.4);
          border: 1px solid var(--card-border);
          border-radius: 20px;
          padding: 1.5rem;
          position: relative;
          overflow: hidden;
          transition: transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease;
        }
        /* Shimmer top border */
        .cat-card::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0; height: 1px;
          background: linear-gradient(90deg, transparent, var(--accent-color, var(--gold)), transparent);
          opacity: 0.5;
        }
        /* Glowing bottom-right orb */
        .cat-card::after {
          content: '';
          position: absolute;
          bottom: -30px; right: -30px;
          width: 120px; height: 120px;
          background: radial-gradient(circle, var(--accent-color, rgba(200,164,92,0.3)) 0%, transparent 70%);
          opacity: 0.15;
          transition: opacity 0.4s ease;
          pointer-events: none;
        }
        .cat-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 14px 45px rgba(0,0,0,0.3);
          border-color: rgba(200, 164, 92, 0.35);
        }
        .cat-card:hover::after {
          opacity: 0.35;
        }

        .cat-card-inner {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          position: relative;
          z-index: 1;
        }
        .cat-icon-info {
          display: flex;
          align-items: center;
          gap: 1rem;
        }
        .cat-icon-circle {
          width: 48px; height: 48px;
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid;
          flex-shrink: 0;
          box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        }
        .cat-name {
          font-size: 1.05rem;
          font-weight: 600;
          color: var(--text-main);
          margin-bottom: 0.2rem;
        }
        .cat-book-count {
          display: flex;
          align-items: center;
          gap: 0.35rem;
          font-size: 0.8rem;
          color: var(--text-muted);
        }

        .cat-actions {
          display: flex;
          gap: 0.35rem;
          opacity: 0;
          transition: opacity 0.2s;
        }
        .cat-card:hover .cat-actions { opacity: 1; }

        .cat-action-btn {
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 9px;
          padding: 0.35rem;
          cursor: pointer;
          color: var(--text-muted);
          display: flex;
          align-items: center;
          transition: all 0.15s;
        }
        .cat-action-btn:hover {
          background: rgba(200,164,92,0.12);
          border-color: var(--gold);
          color: var(--gold);
        }
        .cat-action-btn.danger:hover {
          background: rgba(255,77,109,0.12);
          border-color: var(--danger);
          color: var(--danger);
        }

        .cat-description {
          font-size: 0.85rem;
          color: var(--text-muted);
          margin-top: 1rem;
          line-height: 1.6;
          padding-top: 0.875rem;
          border-top: 1px solid rgba(255,255,255,0.05);
          position: relative;
          z-index: 1;
        }

        /* Skeleton */
        .folio-skeleton {
          background: linear-gradient(90deg, rgba(255,255,255,0.04) 25%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.04) 75%);
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
          border-radius: 20px;
          height: 130px;
        }
        @keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }

        /* Empty */
        .folio-empty {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 5rem 2rem;
          text-align: center;
          color: var(--text-muted);
          position: relative;
          z-index: 2;
        }
        .folio-empty h3 { font-family: 'Fraunces', serif; font-size: 1.5rem; color: var(--text-main); margin: 1rem 0 0.5rem; }
        .folio-empty p { margin-bottom: 1.5rem; font-size: 0.95rem; }

        /* ── MODAL ── */
        .folio-modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(5,12,30,0.82);
          backdrop-filter: blur(8px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 1rem;
        .folio-modal {
          background: var(--card-bg);
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          border: 1px solid rgba(200,164,92,0.25);
          border-radius: 24px;
          width: 100%;
          max-width: 460px;
          box-shadow: 0 30px 80px rgba(0,0,0,0.5);
          position: relative;
          overflow: hidden;
        }
        .folio-modal::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0; height: 1px;
          background: linear-gradient(90deg, transparent, var(--gold), transparent);
          opacity: 0.6;
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
          font-size: 1.3rem;
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
          display: flex; align-items: center;
          transition: all 0.15s;
        }
        .modal-close-btn:hover { background: rgba(255,77,109,0.12); border-color: var(--danger); color: var(--danger); }

        .folio-modal-body {
          padding: 1.25rem 1.75rem;
          display: flex;
          flex-direction: column;
          gap: 1.1rem;
        }
        .folio-modal-footer {
          padding: 1rem 1.75rem 1.5rem;
          display: flex;
          justify-content: flex-end;
          gap: 0.75rem;
          border-top: 1px solid var(--sidebar-active-bg);
        }

        .folio-form-group { display: flex; flex-direction: column; gap: 0.4rem; }
        .folio-form-label {
          font-size: 0.8rem;
          font-weight: 600;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .folio-form-input {
          background: var(--input-bg);
          border: 1px solid rgba(200,164,92,0.15);
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
        .folio-form-input:focus { border-color: var(--gold); box-shadow: 0 0 0 3px rgba(200,164,92,0.12); }
        .folio-form-input::placeholder { color: var(--text-muted); opacity: 0.6; }

        /* Color swatches */
        .color-swatches { display: flex; gap: 0.5rem; flex-wrap: wrap; }
        .color-swatch {
          width: 32px; height: 32px;
          border-radius: 8px;
          cursor: pointer;
          transition: transform 0.15s, box-shadow 0.15s;
          border: 2px solid transparent;
        }
        .color-swatch:hover { transform: scale(1.18); }
        .color-swatch.selected { border-color: white; box-shadow: 0 0 0 3px rgba(255,255,255,0.2); }

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
        .folio-cancel-btn:hover { background: var(--sidebar-active-bg); color: var(--text-main); }
        .folio-save-btn {
          padding: 0.7rem 1.5rem;
          background: linear-gradient(135deg, var(--navy-primary), var(--navy-mid));
          border: 1px solid rgba(200,164,92,0.35);
          border-radius: 12px;
          color: #e3cb96;
          font-family: inherit;
          font-weight: 600;
          font-size: 0.95rem;
          cursor: pointer;
          transition: all 0.2s;
          display: flex; align-items: center; gap: 0.5rem;
        }
        .folio-save-btn:hover:not(:disabled) { border-color: #e3cb96; box-shadow: 0 4px 20px rgba(200,164,92,0.2); color: #e3cb96; }
        .folio-save-btn:disabled { opacity: 0.7; cursor: not-allowed; }
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      {/* ── Header ── */}
      <div className="cat-header">
        <h1 className="cat-title">Collections</h1>
        <motion.button className="folio-add-btn" whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={openAdd}>
          <Plus size={18} weight="bold" /> Add Category
        </motion.button>
      </div>

      {/* ── Grid ── */}
      {loading ? (
        <div className="cat-grid">
          {[...Array(6)].map((_, i) => <div key={i} className="folio-skeleton" />)}
        </div>
      ) : categories.length === 0 ? (
        <div className="folio-empty">
          <Tag size={64} weight="duotone" color="rgba(200,164,92,0.4)" />
          <h3>No Collections Yet</h3>
          <p>Start organizing your library by adding a category.</p>
          <motion.button className="folio-add-btn" whileTap={{ scale: 0.97 }} onClick={openAdd}>
            <Plus size={18} /> Add Category
          </motion.button>
        </div>
      ) : (
        <motion.div className="cat-grid" variants={stagger} initial="hidden" animate="show">
          {categories.map(c => (
            <motion.div
              key={c.id}
              variants={fadeUp}
              className="cat-card"
              style={{ '--accent-color': c.color }}
            >
              <div className="cat-card-inner">
                <div className="cat-icon-info">
                  <div
                    className="cat-icon-circle"
                    style={{
                      background: `${c.color}20`,
                      borderColor: `${c.color}44`,
                    }}
                  >
                    <Tag size={22} weight="fill" color={c.color} />
                  </div>
                  <div>
                    <h4 className="cat-name">{c.name}</h4>
                    <div className="cat-book-count">
                      <Books size={14} color="var(--text-muted)" />
                      <span>{c.book_count || 0} books</span>
                    </div>
                  </div>
                </div>
                <div className="cat-actions">
                  <button className="cat-action-btn" onClick={() => openEdit(c)} title="Edit">
                    <PencilSimple size={15} />
                  </button>
                  <button className="cat-action-btn danger" onClick={() => handleDelete(c)} title="Delete">
                    <Trash size={15} />
                  </button>
                </div>
              </div>
              {c.description && (
                <p className="cat-description">{c.description}</p>
              )}
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* ── Modal ── */}
      <AnimatePresence>
        {modal.open && (
          <motion.div
            className="folio-modal-overlay"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={closeModal}
          >
            <motion.div
              className="folio-modal"
              initial={{ scale: 0.93, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.93, opacity: 0, y: 20 }}
              transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
              onClick={e => e.stopPropagation()}
            >
              <div className="folio-modal-header">
                <h3 className="folio-modal-title">
                  {modal.mode === 'add' ? 'New Collection' : 'Edit Collection'}
                </h3>
                <button className="modal-close-btn" onClick={closeModal}><X size={18} /></button>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="folio-modal-body">
                  <div className="folio-form-group">
                    <label className="folio-form-label" htmlFor="cat-name">Name *</label>
                    <input id="cat-name" className="folio-form-input" required placeholder="e.g. Science Fiction"
                      value={formData.name} onChange={e => setFormData(p => ({ ...p, name: e.target.value }))} />
                  </div>
                  <div className="folio-form-group">
                    <label className="folio-form-label" htmlFor="cat-desc">Description</label>
                    <textarea id="cat-desc" className="folio-form-input" rows="2" placeholder="Short description..."
                      value={formData.description} onChange={e => setFormData(p => ({ ...p, description: e.target.value }))} />
                  </div>
                  <div className="folio-form-group">
                    <label className="folio-form-label">Accent Color</label>
                    {/* Live preview */}
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: '0.75rem',
                      background: `${formData.color}12`, border: `1px solid ${formData.color}44`,
                      borderRadius: 12, padding: '0.65rem 1rem', marginBottom: '0.75rem'
                    }}>
                      <div style={{ width: 28, height: 28, borderRadius: 8, background: formData.color, flexShrink: 0 }} />
                      <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                        Selected: <strong style={{ color: formData.color }}>{formData.color}</strong>
                      </span>
                    </div>
                    <div className="color-swatches">
                      {PRESET_COLORS.map(clr => (
                        <button
                          type="button"
                          key={clr}
                          className={`color-swatch ${formData.color === clr ? 'selected' : ''}`}
                          style={{ background: clr }}
                          onClick={() => setFormData(p => ({ ...p, color: clr }))}
                        />
                      ))}
                    </div>
                  </div>
                </div>
                <div className="folio-modal-footer">
                  <button type="button" className="folio-cancel-btn" onClick={closeModal}>Cancel</button>
                  <motion.button type="submit" className="folio-save-btn" disabled={saving} whileTap={{ scale: 0.97 }}>
                    {saving ? <SpinnerGap size={18} className="spin" /> : modal.mode === 'add' ? 'Create' : 'Save Changes'}
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
