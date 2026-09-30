import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { categoriesAPI } from '../services/api';
import toast from 'react-hot-toast';
import { Plus, PencilSimple, Trash, X, Tag, SpinnerGap, Books } from '@phosphor-icons/react';

const PRESET_COLORS = ['#6366F1', '#8B5CF6', '#EC4899', '#EF4444', '#F97316', '#F59E0B', '#84CC16', '#10B981', '#14B8A6', '#06B6D4'];

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState({ open: false, mode: 'add', data: null });
  const [formData, setFormData] = useState({ name: '', description: '', color: '#6366F1' });
  const [saving, setSaving] = useState(false);

  const fetchCategories = async () => {
    setLoading(true);
    try { const res = await categoriesAPI.getAll(); setCategories(res.data.data); }
    catch { toast.error('Failed to load categories'); }
    finally { setLoading(false); }
  };
  useEffect(() => { fetchCategories(); }, []);

  const openAdd = () => { setFormData({ name: '', description: '', color: '#6366F1' }); setModal({ open: true, mode: 'add', data: null }); };
  const openEdit = (c) => { setFormData({ name: c.name, description: c.description || '', color: c.color || '#6366F1' }); setModal({ open: true, mode: 'edit', data: c }); };

  const handleSubmit = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      if (modal.mode === 'add') { await categoriesAPI.create(formData); toast.success('Category created!'); }
      else { await categoriesAPI.update(modal.data.id, formData); toast.success('Category updated!'); }
      setModal({ open: false, mode: 'add', data: null }); fetchCategories();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (c) => {
    if (!confirm(`Delete "${c.name}"?`)) return;
    try { await categoriesAPI.delete(c.id); toast.success('Deleted'); fetchCategories(); }
    catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1>Categories</h1>
        <motion.button className="btn btn-primary" whileTap={{ scale: 0.97 }} onClick={openAdd}><Plus size={18} weight="bold" /> Add Category</motion.button>
      </div>

      {loading ? (
        <div className="grid grid-cols-3 gap-4">{[...Array(6)].map((_, i) => <div key={i} className="skeleton" style={{ height: 120, borderRadius: 'var(--radius-lg)' }} />)}</div>
      ) : categories.length === 0 ? (
        <div className="empty-state"><Tag size={64} weight="duotone" className="empty-icon" /><h3>No categories</h3><p>Create your first category.</p></div>
      ) : (
        <motion.div className="grid grid-cols-3 gap-4" variants={{ show: { transition: { staggerChildren: 0.05 } } }} initial="hidden" animate="show">
          {categories.map(c => (
            <motion.div key={c.id} variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }} className="card" style={{ borderLeft: `3px solid ${c.color}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ width: 36, height: 36, borderRadius: 'var(--radius-md)', background: `${c.color}22`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Tag size={18} weight="fill" color={c.color} />
                  </div>
                  <div>
                    <h4 style={{ fontSize: '1rem' }}>{c.name}</h4>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', marginTop: '0.125rem' }}>
                      <Books size={14} color="var(--text-dim)" />
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{c.book_count || 0} books</span>
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.25rem' }}>
                  <button className="btn btn-ghost btn-icon sm" onClick={() => openEdit(c)}><PencilSimple size={16} /></button>
                  <button className="btn btn-ghost btn-icon sm" onClick={() => handleDelete(c)} style={{ color: 'var(--danger)' }}><Trash size={16} /></button>
                </div>
              </div>
              {c.description && <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '0.75rem' }}>{c.description}</p>}
            </motion.div>
          ))}
        </motion.div>
      )}

      <AnimatePresence>
        {modal.open && (
          <motion.div className="modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setModal({ open: false, mode: 'add', data: null })}>
            <motion.div className="modal" initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} onClick={e => e.stopPropagation()}>
              <div className="modal-header"><h3>{modal.mode === 'add' ? 'Add Category' : 'Edit Category'}</h3><button className="btn btn-ghost btn-icon sm" onClick={() => setModal({ open: false, mode: 'add', data: null })}><X size={18} /></button></div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
                  <div className="form-group"><label className="form-label" htmlFor="cat-name">Name *</label><input id="cat-name" className="form-input" required value={formData.name} onChange={e => setFormData(p => ({ ...p, name: e.target.value }))} /></div>
                  <div className="form-group"><label className="form-label" htmlFor="cat-desc">Description</label><textarea id="cat-desc" className="form-input" rows="2" value={formData.description} onChange={e => setFormData(p => ({ ...p, description: e.target.value }))} /></div>
                  <div className="form-group">
                    <label className="form-label">Color</label>
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                      {PRESET_COLORS.map(clr => (
                        <button type="button" key={clr} onClick={() => setFormData(p => ({ ...p, color: clr }))}
                          style={{ width: 32, height: 32, borderRadius: 'var(--radius-sm)', background: clr, border: formData.color === clr ? '2px solid white' : '2px solid transparent', cursor: 'pointer', transition: 'transform 150ms ease' }}
                          onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.15)'}
                          onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'} />
                      ))}
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setModal({ open: false, mode: 'add', data: null })}>Cancel</button>
                  <motion.button type="submit" className="btn btn-primary" disabled={saving} whileTap={{ scale: 0.97 }}>{saving ? <SpinnerGap size={18} style={{ animation: 'spin 1s linear infinite' }} /> : modal.mode === 'add' ? 'Create' : 'Save'}</motion.button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
