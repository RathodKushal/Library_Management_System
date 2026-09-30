import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { transactionsAPI } from '../services/api';
import toast from 'react-hot-toast';
import { Warning, ArrowBendUpLeft, SpinnerGap, Clock } from '@phosphor-icons/react';

export default function Overdue() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [returning, setReturning] = useState(null);

  const fetchOverdue = async () => {
    setLoading(true);
    try { const res = await transactionsAPI.getOverdue(); setTransactions(res.data.data); }
    catch { toast.error('Failed to load'); }
    finally { setLoading(false); }
  };
  useEffect(() => { fetchOverdue(); }, []);

  const handleReturn = async (t) => {
    setReturning(t.id);
    try { const res = await transactionsAPI.return(t.id); toast.success(res.data.message); fetchOverdue(); }
    catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setReturning(null); }
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Warning size={28} weight="duotone" color="var(--danger)" /> Overdue Books
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>{transactions.length} book(s) past due date</p>
        </div>
      </div>

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 90, borderRadius: 'var(--radius-lg)' }} />)}
        </div>
      ) : transactions.length === 0 ? (
        <div className="empty-state" style={{ background: 'var(--success-bg)', borderRadius: 'var(--radius-lg)', border: '1px solid rgba(52,211,153,0.2)' }}>
          <h3 style={{ color: 'var(--success)' }}>No overdue books!</h3>
          <p>All issued books are within their due dates.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {transactions.map(t => (
            <motion.div key={t.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="card"
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderLeft: '3px solid var(--danger)', background: 'rgba(248, 113, 113, 0.03)' }}>
              <div style={{ display: 'flex', gap: '2rem', alignItems: 'center', flex: 1 }}>
                <div>
                  <h4 style={{ fontSize: '0.9375rem' }}>{t.book_title}</h4>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>{t.book_author}</p>
                </div>
                <div>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Student</p>
                  <p style={{ fontSize: '0.875rem', fontWeight: 500 }}>{t.member_name}</p>
                  <p style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--text-dim)' }}>{t.member_membership_id}</p>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Due Date</p>
                  <p style={{ fontSize: '0.875rem', color: 'var(--danger)', fontWeight: 600 }}>{new Date(t.due_date).toLocaleDateString()}</p>
                </div>
                <span className="badge badge-danger" style={{ fontSize: '0.8125rem', padding: '0.375rem 0.75rem' }}>
                  <Clock size={14} style={{ marginRight: '0.25rem' }} />
                  {t.days_overdue} days overdue
                </span>
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                {t.member_phone && <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{t.member_phone}</span>}
                <motion.button className="btn btn-danger" whileTap={{ scale: 0.97 }} onClick={() => handleReturn(t)} disabled={returning === t.id}>
                  {returning === t.id ? <SpinnerGap size={18} style={{ animation: 'spin 1s linear infinite' }} /> : <><ArrowBendUpLeft size={18} /> Return</>}
                </motion.button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
