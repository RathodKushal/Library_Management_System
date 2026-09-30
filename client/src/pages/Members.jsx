import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { membersAPI, transactionsAPI } from '../services/api';
import { useDebounce } from '../hooks/useDebounce';
import toast from 'react-hot-toast';
import { MagnifyingGlass, Plus, PencilSimple, Trash, X, Users, SpinnerGap, BookOpen, EnvelopeSimple, Phone } from '@phosphor-icons/react';

const fadeUp = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] } } };
const stagger = { show: { transition: { staggerChildren: 0.06 } } };

// Deterministic avatar gradient from name
const avatarGradient = (name) => {
  const gradients = [
    'linear-gradient(135deg,#1f3a6e,#4a6aa8)',
    'linear-gradient(135deg,#2c4c8c,var(--gold))',
    'linear-gradient(135deg,#12264f,#6d86bd)',
    'linear-gradient(135deg,#1f3a6e,#8fa3c9)',
    'linear-gradient(135deg,#2c4c8c,#4a6aa8)',
  ];
  return gradients[(name?.charCodeAt(0) || 0) % gradients.length];
};

export default function Members() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });
  const [modal, setModal] = useState({ open: false, mode: 'add', data: null });
  const [viewModal, setViewModal] = useState({ open: false, data: null, loading: false });
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', address: '', enrollment_no: '' });
  const [saving, setSaving] = useState(false);
  const debouncedSearch = useDebounce(search, 300);

  const fetchMembers = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const res = await membersAPI.getAll({ page, limit: 12, search: debouncedSearch });
      setMembers(res.data.data);
      setPagination(res.data.pagination);
    } catch { toast.error('Failed to load members'); }
    finally { setLoading(false); }
  }, [debouncedSearch]);

  useEffect(() => { fetchMembers(); }, [fetchMembers]);

  const openAdd = () => { setFormData({ name: '', email: '', phone: '', address: '', enrollment_no: '' }); setModal({ open: true, mode: 'add', data: null }); };
  const openEdit = (e, m) => { e.stopPropagation(); setFormData({ name: m.name, email: m.email || '', phone: m.phone || '', address: m.address || '', enrollment_no: m.enrollment_no || '' }); setModal({ open: true, mode: 'edit', data: m }); };
  const closeModal = () => setModal({ open: false, mode: 'add', data: null });
  const closeView = () => setViewModal({ open: false, data: null, loading: false });

  const handleView = async (m) => {
    setViewModal({ open: true, data: m, loading: true });
    try {
      const res = await membersAPI.getById(m.id);
      setViewModal({ open: true, data: res.data.data, loading: false });
    } catch {
      toast.error('Failed to load member details');
      closeView();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      if (modal.mode === 'add') { await membersAPI.create(formData); toast.success('Student added!'); }
      else { await membersAPI.update(modal.data.id, formData); toast.success('Student updated!'); }
      closeModal(); fetchMembers(pagination.page);
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (e, m) => {
    e.stopPropagation();
    if (!confirm(`Delete "${m.name}"?`)) return;
    try { await membersAPI.delete(m.id); toast.success('Deleted'); fetchMembers(pagination.page); }
    catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const handleDeleteTransaction = async (e, t) => {
    e.stopPropagation();
    if (!confirm(`Delete history for "${t.book_title}"?`)) return;
    try {
      await transactionsAPI.delete(t.id);
      toast.success('History removed');
      const res = await membersAPI.getById(viewModal.data.id);
      setViewModal(prev => ({ ...prev, data: res.data.data }));
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to delete'); }
  };

  return (
    <div className="folio-members-page">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,100..900&family=Plus+Jakarta+Sans:wght@200..800&display=swap');

        .folio-members-page {
          
          
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
        .folio-members-page::before {
          content: '';
          position: absolute;
          top: -15%; right: -10%;
          width: 45%; height: 50%;
          background: radial-gradient(circle, rgba(200,164,92,0.07) 0%, transparent 70%);
          pointer-events: none;
        }
        .folio-members-page::after {
          content: '';
          position: absolute;
          bottom: -10%; left: -10%;
          width: 50%; height: 50%;
          background: radial-gradient(circle, rgba(31,58,110,0.35) 0%, transparent 70%);
          pointer-events: none;
        }

        /* Header */
        .members-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
          position: relative;
          z-index: 2;
          flex-wrap: wrap;
          gap: 1rem;
        }
        .members-title {
          font-family: 'Fraunces', serif;
          font-size: 1.75rem;
          font-weight: 500;
          background: linear-gradient(135deg, var(--text-main), var(--gold));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .members-controls { display: flex; gap: 0.75rem; align-items: center; }

        /* Search */
        .folio-search { position: relative; }
        .folio-search-icon {
          position: absolute; left: 0.875rem; top: 50%;
          transform: translateY(-50%); color: var(--text-muted); pointer-events: none;
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
        .folio-input:focus { border-color: var(--gold); box-shadow: 0 0 0 3px rgba(200,164,92,0.12); }
        .folio-input::placeholder { color: var(--text-muted); }
        .folio-search .folio-input { padding-left: 2.5rem; min-width: 220px; }

        .folio-add-btn {
          display: flex; align-items: center; gap: 0.5rem;
          padding: 0.65rem 1.25rem;
          background: linear-gradient(135deg, var(--navy-primary), var(--navy-mid));
          border: 1px solid rgba(200,164,92,0.3);
          border-radius: 12px;
          color: #e3cb96;
          font-family: inherit; font-weight: 600; font-size: 0.9rem;
          cursor: pointer; transition: all 0.2s;
          box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        }
        .folio-add-btn:hover { border-color: #e3cb96; box-shadow: 0 4px 20px rgba(200,164,92,0.2); color: #e3cb96; }

        /* Grid */
        .members-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1.25rem;
          position: relative; z-index: 2;
        }
        @media (max-width: 1100px) { .members-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 650px)  { .members-grid { grid-template-columns: 1fr; } }

        /* Glassmorphism Student Card */
        .member-card {
          background: var(--card-bg);
          backdrop-filter: blur(24px) saturate(1.6);
          -webkit-backdrop-filter: blur(24px) saturate(1.6);
          border: 1px solid var(--card-border);
          border-radius: 20px;
          padding: 1.35rem;
          position: relative;
          overflow: hidden;
          cursor: pointer;
          transition: transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease;
          box-shadow: 0 8px 32px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.07);
        }
        .member-card::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0; height: 1px;
          background: linear-gradient(90deg, transparent, rgba(200,164,92,0.5), transparent);
        }
        .member-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 16px 48px rgba(0,0,0,0.3);
          border-color: rgba(200,164,92,0.32);
        }

        .member-card-top {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 1rem;
        }
        .member-avatar-info { display: flex; align-items: center; gap: 0.85rem; }
        .member-avatar {
          width: 44px; height: 44px;
          border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          font-weight: 700; font-size: 1rem; color: #fff;
          flex-shrink: 0;
          border: 2px solid rgba(200,164,92,0.3);
          box-shadow: 0 4px 12px rgba(0,0,0,0.25);
        }
        .member-name { font-size: 0.975rem; font-weight: 600; color: var(--text-main); margin-bottom: 0.15rem; }
        .member-enroll { font-size: 0.73rem; font-family: monospace; color: var(--gold); font-weight: 500; }

        .member-action-row {
          display: flex; gap: 0.3rem;
          opacity: 0; transition: opacity 0.2s;
        }
        .member-card:hover .member-action-row { opacity: 1; }
        .m-action-btn {
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 8px; padding: 0.3rem;
          cursor: pointer; color: var(--text-muted);
          display: flex; align-items: center;
          transition: all 0.15s;
        }
        .m-action-btn:hover { background: rgba(200,164,92,0.12); border-color: var(--gold); color: var(--gold); }
        .m-action-btn.danger:hover { background: rgba(255,77,109,0.12); border-color: var(--danger); color: var(--danger); }

        .member-contact { display: flex; flex-direction: column; gap: 0.3rem; margin-bottom: 0.875rem; }
        .member-contact-row {
          display: flex; align-items: center; gap: 0.45rem;
          font-size: 0.8rem; color: var(--text-muted);
        }

        .member-footer {
          display: flex; justify-content: space-between; align-items: center;
          padding-top: 0.75rem;
          border-top: 1px solid rgba(255,255,255,0.05);
        }
        .status-badge {
          padding: 0.3rem 0.7rem; border-radius: 100px;
          font-size: 0.72rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.04em;
        }
        .status-active { background: var(--badge-blue-bg); color: var(--badge-blue-text); border: 1px solid var(--badge-blue-border); }
        .status-inactive { background: rgba(255,77,109,0.12); color: var(--danger); border: 1px solid rgba(255,77,109,0.3); }
        .loans-count {
          display: flex; align-items: center; gap: 0.35rem;
          font-size: 0.78rem; color: var(--text-muted);
        }

        /* Pagination */
        .folio-pagination {
          display: flex; justify-content: center; align-items: center;
          gap: 0.5rem; margin-top: 2rem; position: relative; z-index: 2;
        }
        .page-btn {
          background: var(--card-bg);
          border: 1px solid var(--card-border);
          border-radius: 10px; padding: 0.5rem 0.875rem;
          color: var(--text-muted); cursor: pointer;
          font-family: inherit; font-size: 0.875rem; transition: all 0.2s;
        }
        .page-btn:hover { border-color: var(--gold); color: var(--gold); }
        .page-btn.active {
          background: linear-gradient(135deg, var(--navy-primary), var(--navy-mid));
          border-color: rgba(200,164,92,0.4); color: var(--gold); font-weight: 600;
        }

        /* Skeleton */
        .folio-skeleton {
          background: linear-gradient(90deg, rgba(255,255,255,0.04) 25%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.04) 75%);
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
          border-radius: 20px; height: 175px;
        }
        @keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }

        /* Empty */
        .folio-empty {
          display: flex; flex-direction: column; align-items: center;
          justify-content: center; padding: 5rem 2rem;
          text-align: center; color: var(--text-muted); position: relative; z-index: 2;
        }
        .folio-empty h3 { font-family: 'Fraunces', serif; font-size: 1.5rem; color: var(--text-main); margin: 1rem 0 0.5rem; }
        .folio-empty p { margin-bottom: 1.5rem; }

        /* ── MODAL SHARED ── */
        .folio-modal-overlay {
          position: fixed; inset: 0;
          background: rgba(5,12,30,0.82);
          backdrop-filter: blur(8px);
          display: flex; align-items: center; justify-content: center;
          z-index: 1000; padding: 1rem;
        }
        .folio-modal {
          background: var(--card-bg);
          backdrop-filter: blur(24px);
          border: 1px solid rgba(200,164,92,0.25);
          border-radius: 24px;
          width: 100%; max-width: 500px;
          max-height: 90vh; overflow-y: auto;
          box-shadow: 0 30px 80px rgba(0,0,0,0.5);
          position: relative;
        }
        .folio-modal.wide { max-width: 620px; }
        .folio-modal::before {
          content: '';
          position: absolute; top: 0; left: 0; right: 0; height: 1px;
          background: linear-gradient(90deg, transparent, var(--gold), transparent);
          opacity: 0.55;
        }
        .folio-modal-header {
          display: flex; justify-content: space-between; align-items: center;
          padding: 1.5rem 1.75rem 1rem;
          border-bottom: 1px solid var(--sidebar-active-bg);
        }
        .folio-modal-title { font-family: 'Fraunces', serif; font-size: 1.3rem; color: var(--gold); font-weight: 500; }
        .modal-close-btn {
          background: var(--sidebar-hover); border: 1px solid var(--sidebar-border);
          border-radius: 10px; padding: 0.4rem; cursor: pointer; color: var(--text-muted);
          display: flex; align-items: center; transition: all 0.15s;
        }
        .modal-close-btn:hover { background: rgba(255,77,109,0.12); border-color: var(--danger); color: var(--danger); }
        .folio-modal-body { padding: 1.25rem 1.75rem; display: flex; flex-direction: column; gap: 1rem; }
        .folio-modal-footer {
          padding: 1rem 1.75rem 1.5rem;
          display: flex; justify-content: flex-end; gap: 0.75rem;
          border-top: 1px solid var(--sidebar-active-bg);
        }
        .folio-form-group { display: flex; flex-direction: column; gap: 0.4rem; }
        .folio-form-label { font-size: 0.8rem; font-weight: 600; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em; }
        .folio-form-input {
          background: var(--input-bg);
          border: 1px solid rgba(200,164,92,0.15);
          border-radius: 12px; padding: 0.75rem 1rem;
          color: var(--text-main); font-family: inherit; font-size: 0.95rem;
          outline: none; transition: border-color 0.2s, box-shadow 0.2s;
          width: 100%; box-sizing: border-box;
        }
        .folio-form-input:focus { border-color: var(--gold); box-shadow: 0 0 0 3px rgba(200,164,92,0.12); }
        .folio-form-input::placeholder { color: var(--text-muted); opacity: 0.6; }
        .folio-cancel-btn {
          padding: 0.7rem 1.25rem;
          background: var(--sidebar-hover); border: 1px solid var(--sidebar-border);
          border-radius: 12px; color: var(--text-muted);
          font-family: inherit; font-size: 0.95rem; cursor: pointer; transition: all 0.2s;
        }
        .folio-cancel-btn:hover { background: var(--sidebar-active-bg); color: var(--text-main); }
        .folio-save-btn {
          padding: 0.7rem 1.5rem;
          background: linear-gradient(135deg, var(--navy-primary), var(--navy-mid));
          border: 1px solid rgba(200,164,92,0.35); border-radius: 12px;
          color: #e3cb96; font-family: inherit; font-weight: 600; font-size: 0.95rem;
          cursor: pointer; transition: all 0.2s; display: flex; align-items: center; gap: 0.5rem;
        }
        .folio-save-btn:hover:not(:disabled) { border-color: #e3cb96; box-shadow: 0 4px 20px rgba(200,164,92,0.2); color: #e3cb96; }
        .folio-save-btn:disabled { opacity: 0.7; cursor: not-allowed; }

        /* View Modal */
        .view-avatar {
          width: 68px; height: 68px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          font-weight: 700; font-size: 1.6rem; color: #fff;
          border: 2px solid rgba(200,164,92,0.4);
          box-shadow: 0 6px 20px rgba(0,0,0,0.3);
          flex-shrink: 0;
        }
        .view-stat-card {
          background: var(--input-bg);
          backdrop-filter: blur(12px);
          border: 1px solid var(--card-border);
          border-radius: 14px; padding: 1rem;
          text-align: center;
        }
        .view-stat-label { font-size: 0.72rem; color: var(--text-main); font-weight: 600; opacity: 0.75; text-transform: uppercase; letter-spacing: 0.04em; margin-bottom: 0.35rem; }
        .view-stat-value { font-family: 'Fraunces', serif; font-size: 1.6rem; font-weight: 600; }

        .history-item {
          padding: 0.875rem 1rem; border-radius: 12px;
          background: var(--input-bg);
          border: 1px solid var(--sidebar-active-bg);
          display: flex; justify-content: space-between; align-items: center;
          transition: border-color 0.2s;
        }
        .history-item:hover { border-color: rgba(200,164,92,0.2); }
        .h-badge {
          padding: 0.28rem 0.65rem; border-radius: 100px;
          font-size: 0.7rem; font-weight: 600; text-transform: uppercase;
        }
        .h-issued { background: rgba(200,164,92,0.15); color: var(--gold); border: 1px solid rgba(200,164,92,0.3); }
        .h-returned { background: var(--badge-blue-bg); color: var(--badge-blue-text); border: 1px solid var(--badge-blue-border); }

        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      {/* ── Header ── */}
      <div className="members-header">
        <h1 className="members-title">Students</h1>
        <div className="members-controls">
          <div className="folio-search">
            <MagnifyingGlass size={17} className="folio-search-icon" />
            <input className="folio-input" placeholder="Search students..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <motion.button className="folio-add-btn" whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={openAdd}>
            <Plus size={18} weight="bold" /> Add Student
          </motion.button>
        </div>
      </div>

      {/* ── Cards ── */}
      {loading ? (
        <div className="members-grid">
          {[...Array(6)].map((_, i) => <div key={i} className="folio-skeleton" />)}
        </div>
      ) : members.length === 0 ? (
        <div className="folio-empty">
          <Users size={64} weight="duotone" color="rgba(200,164,92,0.4)" />
          <h3>No Students Found</h3>
          <p>Add your first student to get started.</p>
          <motion.button className="folio-add-btn" whileTap={{ scale: 0.97 }} onClick={openAdd}><Plus size={18} /> Add Student</motion.button>
        </div>
      ) : (
        <>
          <motion.div className="members-grid" variants={stagger} initial="hidden" animate="show">
            {members.map(m => (
              <motion.div key={m.id} variants={fadeUp} className="member-card" onClick={() => handleView(m)}>
                <div className="member-card-top">
                  <div className="member-avatar-info">
                    <div className="member-avatar" style={{ background: avatarGradient(m.name) }}>
                      {m.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="member-name">{m.name}</div>
                      <div className="member-enroll">{m.enrollment_no ? `ENR: ${m.enrollment_no}` : m.membership_id}</div>
                    </div>
                  </div>
                  <div className="member-action-row">
                    <button className="m-action-btn" onClick={e => openEdit(e, m)} title="Edit"><PencilSimple size={15} /></button>
                    <button className="m-action-btn danger" onClick={e => handleDelete(e, m)} title="Delete"><Trash size={15} /></button>
                  </div>
                </div>

                <div className="member-contact">
                  {m.email && <div className="member-contact-row"><EnvelopeSimple size={13} />{m.email}</div>}
                  {m.phone && <div className="member-contact-row"><Phone size={13} />{m.phone}</div>}
                </div>

                <div className="member-footer">
                  <span className={`status-badge ${m.status === 'active' ? 'status-active' : 'status-inactive'}`}>{m.status}</span>
                  <span className="loans-count"><BookOpen size={14} />{m.active_loans || 0} active loans</span>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {pagination.totalPages > 1 && (
            <div className="folio-pagination">
              {Array.from({ length: pagination.totalPages }, (_, i) => (
                <button key={i} className={`page-btn ${pagination.page === i + 1 ? 'active' : ''}`} onClick={() => fetchMembers(i + 1)}>{i + 1}</button>
              ))}
            </div>
          )}
        </>
      )}

      <AnimatePresence>
        {/* ── Add/Edit Modal ── */}
        {modal.open && (
          <motion.div className="folio-modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={closeModal}>
            <motion.div className="folio-modal" initial={{ scale: 0.93, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.93, opacity: 0, y: 20 }} transition={{ duration: 0.25 }} onClick={e => e.stopPropagation()}>
              <div className="folio-modal-header">
                <h3 className="folio-modal-title">{modal.mode === 'add' ? 'Add Student' : 'Edit Student'}</h3>
                <button className="modal-close-btn" onClick={closeModal}><X size={18} /></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="folio-modal-body">
                  <div className="folio-form-group">
                    <label className="folio-form-label" htmlFor="m-name">Full Name *</label>
                    <input id="m-name" className="folio-form-input" required placeholder="Enter full name" value={formData.name} onChange={e => setFormData(p => ({ ...p, name: e.target.value }))} />
                  </div>
                  <div className="folio-form-group">
                    <label className="folio-form-label" htmlFor="m-enroll">Enrollment No. *</label>
                    <input id="m-enroll" className="folio-form-input" required placeholder="e.g. 22CS001" value={formData.enrollment_no} onChange={e => setFormData(p => ({ ...p, enrollment_no: e.target.value }))} />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div className="folio-form-group">
                      <label className="folio-form-label" htmlFor="m-email">Email</label>
                      <input id="m-email" type="email" className="folio-form-input" placeholder="student@ljku.edu" value={formData.email} onChange={e => setFormData(p => ({ ...p, email: e.target.value }))} />
                    </div>
                    <div className="folio-form-group">
                      <label className="folio-form-label" htmlFor="m-phone">Phone</label>
                      <input id="m-phone" className="folio-form-input" placeholder="10-digit number" pattern="\d{10}" maxLength="10" value={formData.phone} onChange={e => setFormData(p => ({ ...p, phone: e.target.value.replace(/\D/g, '') }))} />
                    </div>
                  </div>
                  <div className="folio-form-group">
                    <label className="folio-form-label" htmlFor="m-addr">Address</label>
                    <textarea id="m-addr" className="folio-form-input" rows="2" placeholder="Home address..." value={formData.address} onChange={e => setFormData(p => ({ ...p, address: e.target.value }))} />
                  </div>
                </div>
                <div className="folio-modal-footer">
                  <button type="button" className="folio-cancel-btn" onClick={closeModal}>Cancel</button>
                  <motion.button type="submit" className="folio-save-btn" disabled={saving} whileTap={{ scale: 0.97 }}>
                    {saving ? <SpinnerGap size={18} className="spin" /> : modal.mode === 'add' ? 'Add Student' : 'Save Changes'}
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}

        {/* ── View Profile Modal ── */}
        {viewModal.open && (
          <motion.div className="folio-modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={closeView}>
            <motion.div className="folio-modal wide" initial={{ scale: 0.93, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.93, opacity: 0, y: 20 }} transition={{ duration: 0.25 }} onClick={e => e.stopPropagation()}>
              <div className="folio-modal-header">
                <h3 className="folio-modal-title">Student Profile</h3>
                <button className="modal-close-btn" onClick={closeView}><X size={18} /></button>
              </div>
              <div className="folio-modal-body">
                {viewModal.loading ? (
                  <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
                    <SpinnerGap size={36} className="spin" color="var(--gold)" />
                  </div>
                ) : viewModal.data?.transactions ? (
                  <>
                    {/* Profile header */}
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', padding: '0.5rem 0' }}>
                      <div className="view-avatar" style={{ background: avatarGradient(viewModal.data.name) }}>
                        {viewModal.data.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h3 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--text-main)' }}>{viewModal.data.name}</h3>
                        <p style={{ color: 'var(--text-main)', opacity: 0.85, fontSize: '0.85rem', marginTop: '0.2rem' }}>{viewModal.data.email}{viewModal.data.phone ? ` · ${viewModal.data.phone}` : ''}</p>
                        <p style={{ color: 'var(--gold)', fontSize: '0.75rem', fontWeight: 600, fontFamily: 'monospace', marginTop: '0.2rem' }}>
                          {viewModal.data.membership_id}{viewModal.data.enrollment_no ? ` · ENR: ${viewModal.data.enrollment_no}` : ''}
                        </p>
                      </div>
                    </div>

                    {/* Stats */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
                      <div className="view-stat-card">
                        <div className="view-stat-label">Books Borrowed</div>
                        <div className="view-stat-value" style={{ color: 'var(--gold)' }}>{viewModal.data.transactions.length}</div>
                      </div>
                      <div className="view-stat-card">
                        <div className="view-stat-label">On-Time Returns</div>
                        <div className="view-stat-value" style={{ color: 'var(--badge-blue-text)' }}>{viewModal.data.transactions.filter(t => t.status === 'returned' && (t.fine_amount || 0) === 0).length}</div>
                      </div>
                      <div className="view-stat-card">
                        <div className="view-stat-label">Total Fines</div>
                        <div className="view-stat-value" style={{ color: 'var(--danger)' }}>₹{(viewModal.data.total_fines || 0).toFixed(0)}</div>
                      </div>
                    </div>

                    {/* History */}
                    <div>
                      <h4 style={{ marginBottom: '0.75rem', fontSize: '0.95rem', color: 'var(--text-main)', opacity: 0.8, textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Borrowing History</h4>
                      {viewModal.data.transactions.length === 0 ? (
                        <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>No borrowing history yet.</p>
                      ) : (
                        <div style={{ maxHeight: '240px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.5rem', paddingRight: '0.25rem' }}>
                          {viewModal.data.transactions.map(t => (
                            <div key={t.id} className="history-item">
                              <div>
                                <p style={{ fontSize: '0.9rem', fontWeight: 500, color: 'var(--text-main)', marginBottom: '0.2rem' }}>{t.book_title}</p>
                                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                  {new Date(t.issue_date).toLocaleDateString()} → {t.return_date ? new Date(t.return_date).toLocaleDateString() : new Date(t.due_date).toLocaleDateString()}
                                </p>
                              </div>
                              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                                <div style={{ textAlign: 'right' }}>
                                  <span className={`h-badge ${t.status === 'issued' ? 'h-issued' : 'h-returned'}`}>{t.status}</span>
                                  {t.fine_amount > 0 && <p style={{ fontSize: '0.72rem', color: 'var(--danger)', margin: '0.2rem 0 0', textAlign: 'right' }}>₹{t.fine_amount.toFixed(2)}</p>}
                                </div>
                                <button className="m-action-btn danger" onClick={e => handleDeleteTransaction(e, t)} title="Remove history"><Trash size={14} /></button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </>
                ) : null}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
