import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { membersAPI, transactionsAPI } from '../services/api';
import { useDebounce } from '../hooks/useDebounce';
import toast from 'react-hot-toast';
import { MagnifyingGlass, Plus, PencilSimple, Trash, X, Users, SpinnerGap, BookOpen } from '@phosphor-icons/react';

const fadeUp = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

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

  const handleView = async (m) => {
    setViewModal({ open: true, data: m, loading: true });
    try {
      const res = await membersAPI.getById(m.id);
      setViewModal({ open: true, data: res.data.data, loading: false });
    } catch {
      toast.error('Failed to load member details');
      setViewModal({ open: false, data: null, loading: false });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      if (modal.mode === 'add') { await membersAPI.create(formData); toast.success('Member added!'); }
      else { await membersAPI.update(modal.data.id, formData); toast.success('Member updated!'); }
      setModal({ open: false, mode: 'add', data: null }); fetchMembers(pagination.page);
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
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete');
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1>Students</h1>
        <div className="actions">
          <div className="search-bar">
            <MagnifyingGlass size={18} className="search-icon" />
            <input className="form-input" placeholder="Search students..." value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft: '2.75rem' }} />
          </div>
          <motion.button className="btn btn-primary" whileTap={{ scale: 0.97 }} onClick={openAdd}><Plus size={18} weight="bold" /> Add Student</motion.button>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-3 gap-4">{[...Array(6)].map((_, i) => <div key={i} className="skeleton" style={{ height: 160, borderRadius: 'var(--radius-lg)' }} />)}</div>
      ) : members.length === 0 ? (
        <div className="empty-state"><Users size={64} weight="duotone" className="empty-icon" /><h3>No students found</h3><p>Add your first student.</p><button className="btn btn-primary" onClick={openAdd}><Plus size={18} /> Add Student</button></div>
      ) : (
        <motion.div className="grid grid-cols-3 gap-4" variants={{ show: { transition: { staggerChildren: 0.04 } } }} initial="hidden" animate="show">
          {members.map(m => (
            <motion.div key={m.id} variants={fadeUp} className="card" onClick={() => handleView(m)} style={{ cursor: 'pointer', transition: 'transform 0.2s', ':hover': { transform: 'translateY(-2px)' } }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ width: 40, height: 40, borderRadius: 'var(--radius-full)', background: 'linear-gradient(135deg, var(--primary), var(--accent))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.875rem', color: 'white', flexShrink: 0 }}>
                    {m.name.charAt(0)}
                  </div>
                  <div>
                    <h4 style={{ fontSize: '0.9375rem', marginBottom: '0.125rem' }}>{m.name}</h4>
                    <p style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--text-dim)' }}>{m.enrollment_no ? `Enr: ${m.enrollment_no}` : m.membership_id}</p>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.25rem' }}>
                  <button className="btn btn-ghost btn-icon sm" onClick={(e) => openEdit(e, m)}><PencilSimple size={16} /></button>
                  <button className="btn btn-ghost btn-icon sm" onClick={(e) => handleDelete(e, m)} style={{ color: 'var(--danger)' }}><Trash size={16} /></button>
                </div>
              </div>
              {m.email && <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>{m.email}</p>}
              {m.phone && <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>{m.phone}</p>}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border)' }}>
                <span className={`badge ${m.status === 'active' ? 'badge-success' : 'badge-warning'}`}>{m.status}</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <BookOpen size={14} /> {m.active_loans || 0} loans
                </span>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}

      {pagination.totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '2rem' }}>
          {Array.from({ length: pagination.totalPages }, (_, i) => (
            <button key={i} className={`btn ${pagination.page === i + 1 ? 'btn-primary' : 'btn-secondary'} btn-sm`} onClick={() => fetchMembers(i + 1)}>{i + 1}</button>
          ))}
        </div>
      )}

      <AnimatePresence>
        {modal.open && (
          <motion.div className="modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setModal({ open: false, mode: 'add', data: null })}>
            <motion.div className="modal" initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} onClick={e => e.stopPropagation()}>
              <div className="modal-header"><h3>{modal.mode === 'add' ? 'Add Student' : 'Edit Student'}</h3><button className="btn btn-ghost btn-icon sm" onClick={() => setModal({ open: false, mode: 'add', data: null })}><X size={18} /></button></div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
                  <div className="form-group"><label className="form-label" htmlFor="m-name">Name *</label><input id="m-name" className="form-input" required value={formData.name} onChange={e => setFormData(p => ({ ...p, name: e.target.value }))} /></div>
                  <div className="form-group"><label className="form-label" htmlFor="m-enroll">Enrollment No. *</label><input id="m-enroll" type="text" className="form-input" required value={formData.enrollment_no} onChange={e => setFormData(p => ({ ...p, enrollment_no: e.target.value }))} /></div>
                  <div className="form-group"><label className="form-label" htmlFor="m-email">Email</label><input id="m-email" type="email" className="form-input" value={formData.email} onChange={e => setFormData(p => ({ ...p, email: e.target.value }))} /></div>
                  <div className="form-group"><label className="form-label" htmlFor="m-phone">Phone</label><input id="m-phone" type="text" className="form-input" pattern="\d{10}" maxLength="10" title="Phone number must be exactly 10 digits" value={formData.phone} onChange={e => setFormData(p => ({ ...p, phone: e.target.value.replace(/\D/g, '') }))} /></div>
                  <div className="form-group"><label className="form-label" htmlFor="m-addr">Address</label><textarea id="m-addr" className="form-input" rows="2" value={formData.address} onChange={e => setFormData(p => ({ ...p, address: e.target.value }))} /></div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setModal({ open: false, mode: 'add', data: null })}>Cancel</button>
                  <motion.button type="submit" className="btn btn-primary" disabled={saving} whileTap={{ scale: 0.97 }}>{saving ? <SpinnerGap size={18} style={{ animation: 'spin 1s linear infinite' }} /> : modal.mode === 'add' ? 'Add Student' : 'Save'}</motion.button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
        {viewModal.open && (
          <motion.div className="modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setViewModal({ open: false, data: null, loading: false })}>
            <motion.div className="modal" style={{ maxWidth: '600px', width: '100%' }} initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <h3>Student Profile</h3>
                <button className="btn btn-ghost btn-icon sm" onClick={() => setViewModal({ open: false, data: null, loading: false })}><X size={18} /></button>
              </div>
              <div className="modal-body">
                {viewModal.loading ? (
                  <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}><SpinnerGap size={32} style={{ animation: 'spin 1s linear infinite' }} /></div>
                ) : viewModal.data && viewModal.data.transactions ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                      <div style={{ width: 64, height: 64, borderRadius: 'var(--radius-full)', background: 'linear-gradient(135deg, var(--primary), var(--accent))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '1.5rem', color: 'white' }}>
                        {viewModal.data.name.charAt(0)}
                      </div>
                      <div>
                        <h3 style={{ margin: 0, fontSize: '1.25rem' }}>{viewModal.data.name}</h3>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '0.25rem' }}>{viewModal.data.email} | {viewModal.data.phone}</p>
                        <p style={{ color: 'var(--text-dim)', fontSize: '0.75rem', fontFamily: 'var(--font-mono)', marginTop: '0.25rem' }}>ID: {viewModal.data.membership_id} {viewModal.data.enrollment_no && `| Enr: ${viewModal.data.enrollment_no}`}</p>
                        {viewModal.data.address && <p style={{ color: 'var(--text-secondary)', fontSize: '0.8125rem', marginTop: '0.25rem' }}>Address: {viewModal.data.address}</p>}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-3">
                      <div className="card" style={{ padding: '1rem', background: 'var(--bg-surface-2)', border: 'none' }}>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Books Borrowed</p>
                        <h4 style={{ fontSize: '1.5rem', color: 'var(--primary-light)', margin: '0.25rem 0' }}>{viewModal.data.transactions.length}</h4>
                      </div>
                      <div className="card" style={{ padding: '1rem', background: 'var(--bg-surface-2)', border: 'none' }}>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>On-Time Returns</p>
                        <h4 style={{ fontSize: '1.5rem', color: 'var(--success)', margin: '0.25rem 0' }}>{viewModal.data.transactions.filter(t => t.status === 'returned' && (t.fine_amount || 0) === 0).length}</h4>
                      </div>
                      <div className="card" style={{ padding: '1rem', background: 'var(--bg-surface-2)', border: 'none' }}>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Total Fines Paid</p>
                        <h4 style={{ fontSize: '1.5rem', color: 'var(--danger)', margin: '0.25rem 0' }}>₹{(viewModal.data.total_fines || 0).toFixed(2)}</h4>
                      </div>
                    </div>

                    <div>
                      <h4 style={{ marginBottom: '0.75rem', fontSize: '0.9375rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>Recent History</h4>
                      {viewModal.data.transactions.length === 0 ? (
                        <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>No borrowing history.</p>
                      ) : (
                        <div style={{ maxHeight: '220px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.5rem', paddingRight: '0.5rem' }}>
                          {viewModal.data.transactions.map(t => (
                            <div key={t.id} style={{ padding: '0.75rem', borderRadius: 'var(--radius-md)', background: 'var(--bg-surface)', border: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <div>
                                <p style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-primary)' }}>{t.book_title}</p>
                                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>{new Date(t.issue_date).toLocaleDateString()} - {t.return_date ? new Date(t.return_date).toLocaleDateString() : new Date(t.due_date).toLocaleDateString()}</p>
                              </div>
                              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                <div style={{ textAlign: 'right' }}>
                                  <span className={`badge ${t.status === 'issued' ? 'badge-warning' : 'badge-success'}`} style={{ marginBottom: '0.25rem', display: 'inline-block' }}>{t.status}</span>
                                  {t.fine_amount > 0 && <p style={{ fontSize: '0.75rem', color: 'var(--danger)', margin: 0 }}>Fine: ₹{t.fine_amount.toFixed(2)}</p>}
                                </div>
                                <button className="btn btn-ghost btn-icon sm" onClick={(e) => handleDeleteTransaction(e, t)} style={{ color: 'var(--danger)', opacity: 0.7, padding: '0.25rem' }} title="Remove from history">
                                  <Trash size={16} />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ) : null}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
