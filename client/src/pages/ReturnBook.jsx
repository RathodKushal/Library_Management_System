import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { transactionsAPI } from '../services/api';
import toast from 'react-hot-toast';
import { ArrowBendUpLeft, SpinnerGap, Book, User, CurrencyDollar, CheckCircle } from '@phosphor-icons/react';

export default function ReturnBook() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [returning, setReturning] = useState(null);

  const fetchActive = async () => {
    setLoading(true);
    try {
      const res = await transactionsAPI.getAll({ status: 'issued', limit: 50 });
      setTransactions(res.data.data);
    } catch { toast.error('Failed to load'); }
    finally { setLoading(false); }
  };
  useEffect(() => { fetchActive(); }, []);

  const handleReturn = async (t) => {
    setReturning(t.id);
    try {
      const res = await transactionsAPI.return(t.id);
      toast.success(res.data.message);
      fetchActive();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setReturning(null); }
  };

  const isOverdue = (dueDate) => new Date(dueDate) < new Date();
  const daysUntil = (dueDate) => {
    const diff = Math.ceil((new Date(dueDate) - new Date()) / (1000 * 60 * 60 * 24));
    return diff;
  };

  return (
    <div className="page">
      <div className="page-header"><h1>Return Book</h1></div>

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {[1,2,3,4].map(i => <div key={i} className="skeleton" style={{ height: 80, borderRadius: 'var(--radius-lg)' }} />)}
        </div>
      ) : transactions.length === 0 ? (
        <div className="empty-state"><CheckCircle size={64} weight="duotone" style={{ color: 'var(--success)' }} /><h3>No active loans</h3><p>All books have been returned!</p></div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {transactions.map((t) => {
            const overdue = isOverdue(t.due_date);
            const days = daysUntil(t.due_date);
            return (
              <motion.div key={t.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderLeft: `3px solid ${overdue ? 'var(--danger)' : 'var(--success)'}` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flex: 1 }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                      <Book size={16} color="var(--primary-light)" />
                      <span style={{ fontWeight: 600 }}>{t.book_title}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <User size={14} color="var(--text-dim)" />
                      <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>{t.member_name} ({t.member_membership_id})</span>
                    </div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Due</p>
                    <p style={{ fontSize: '0.8125rem', fontWeight: 600, color: overdue ? 'var(--danger)' : 'var(--text-primary)' }}>{new Date(t.due_date).toLocaleDateString()}</p>
                  </div>
                  <span className={`badge ${overdue ? 'badge-danger' : days <= 3 ? 'badge-warning' : 'badge-success'}`}>
                    {overdue ? `${Math.abs(days)} days overdue` : `${days} days left`}
                  </span>
                </div>
                <motion.button className="btn btn-primary" whileTap={{ scale: 0.97 }} onClick={() => handleReturn(t)} disabled={returning === t.id}>
                  {returning === t.id ? <SpinnerGap size={18} style={{ animation: 'spin 1s linear infinite' }} /> : <><ArrowBendUpLeft size={18} /> Return</>}
                </motion.button>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
