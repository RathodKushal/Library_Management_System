import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { transactionsAPI } from '../services/api';
import toast from 'react-hot-toast';
import { ArrowsLeftRight, FunnelSimple } from '@phosphor-icons/react';

export default function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });

  const fetchTransactions = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const res = await transactionsAPI.getAll({ page, limit: 15, status: filter || undefined });
      setTransactions(res.data.data);
      setPagination(res.data.pagination);
    } catch { toast.error('Failed to load'); }
    finally { setLoading(false); }
  }, [filter]);

  useEffect(() => { fetchTransactions(); }, [fetchTransactions]);

  return (
    <div className="page">
      <div className="page-header">
        <h1>Transactions</h1>
        <div className="actions">
          <select className="form-input" style={{ width: 160 }} value={filter} onChange={e => setFilter(e.target.value)}>
            <option value="">All Status</option>
            <option value="issued">Issued</option>
            <option value="returned">Returned</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="skeleton" style={{ height: 400, borderRadius: 'var(--radius-lg)' }} />
      ) : (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>#</th><th>Book</th><th>Student</th><th>Issued By</th><th>Issue Date</th><th>Due Date</th><th>Return Date</th><th>Fine</th><th>Status</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map(t => (
                  <tr key={t.id}>
                    <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem' }}>#{t.id}</td>
                    <td style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{t.book_title}</td>
                    <td>{t.member_name}</td>
                    <td style={{ color: 'var(--text-muted)' }}>{t.librarian_name}</td>
                    <td>{new Date(t.issue_date).toLocaleDateString()}</td>
                    <td style={{ color: t.status === 'issued' && new Date(t.due_date) < new Date() ? 'var(--danger)' : 'inherit' }}>
                      {new Date(t.due_date).toLocaleDateString()}
                    </td>
                    <td>{t.return_date ? new Date(t.return_date).toLocaleDateString() : '—'}</td>
                    <td>{t.fine_amount > 0 ? <span className="badge badge-danger">₹{t.fine_amount.toFixed(2)}</span> : '—'}</td>
                    <td><span className={`badge ${t.status === 'issued' ? 'badge-warning' : 'badge-success'}`}>{t.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {pagination.totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '1.5rem' }}>
              {Array.from({ length: pagination.totalPages }, (_, i) => (
                <button key={i} className={`btn ${pagination.page === i + 1 ? 'btn-primary' : 'btn-secondary'} btn-sm`} onClick={() => fetchTransactions(i + 1)}>{i + 1}</button>
              ))}
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}
