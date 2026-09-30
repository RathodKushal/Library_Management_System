import { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { transactionsAPI } from '../services/api';
import toast from 'react-hot-toast';
import { ArrowsLeftRight, FunnelSimple, CaretLeft, CaretRight, BookOpen, MagnifyingGlass } from '@phosphor-icons/react';

export default function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });
  const searchTimeout = useRef(null);

  const fetchTransactions = useCallback(async (page = 1, search = searchQuery) => {
    setLoading(true);
    try {
      const res = await transactionsAPI.getAll({ page, limit: 15, status: filter || undefined, search: search || undefined });
      setTransactions(res.data.data);
      setPagination(res.data.pagination);
    } catch { toast.error('Failed to load'); }
    finally { setLoading(false); }
  }, [filter, searchQuery]);

  useEffect(() => { fetchTransactions(); }, [filter]); // fetch on filter change

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearchQuery(val);
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => {
      fetchTransactions(1, val);
    }, 500);
  };

  return (
    <div className="folio-trans-page">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,100..900&family=Plus+Jakarta+Sans:wght@200..800&display=swap');

        .folio-trans-page {
          
          
          --navy-primary: #1f3a6e;
          --navy-mid: #2c4c8c;
          
          
          
          
          
          
          --success: #34d399;

          font-family: 'Plus Jakarta Sans', sans-serif;
          background: linear-gradient(135deg, var(--page-bg-start), var(--page-bg-end));
          border-radius: 24px;
          padding: 2.5rem;
          color: var(--text-main);
          min-height: calc(100vh - 6rem);
          position: relative;
          overflow: hidden;
        }

        .folio-trans-page::before {
          content: '';
          position: absolute; top: -15%; left: -10%;
          width: 45%; height: 50%;
          background: radial-gradient(circle, rgba(200,164,92,0.08) 0%, transparent 70%);
          pointer-events: none;
        }

        .header-row {
          display: flex; justify-content: space-between; align-items: center;
          margin-bottom: 2rem; position: relative; z-index: 2; gap: 1rem;
        }
        .page-title {
          font-family: 'Fraunces', serif;
          font-size: 1.75rem; font-weight: 500; margin: 0;
          background: linear-gradient(135deg, var(--text-main), var(--gold));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          white-space: nowrap;
        }

        .controls-row {
          display: flex; align-items: center; gap: 1rem; flex: 1; justify-content: flex-end;
        }

        .search-wrap {
          position: relative; max-width: 300px; width: 100%;
        }
        .search-icon {
          position: absolute; left: 1rem; top: 50%; transform: translateY(-50%);
          color: var(--text-muted); opacity: 0.8; pointer-events: none;
        }
        .search-input {
          width: 100%; box-sizing: border-box;
          background: var(--input-bg);
          border: 1px solid var(--card-border);
          border-radius: 10px; padding: 0.6rem 1rem 0.6rem 2.6rem;
          color: var(--text-main); font-family: inherit; font-size: 0.9rem;
          outline: none; transition: all 0.2s;
        }
        .search-input:focus { border-color: var(--gold); box-shadow: 0 0 0 3px rgba(200,164,92,0.12); }
        .search-input::placeholder { color: var(--text-muted); opacity: 0.6; }

        .folio-select {
          background: var(--input-bg);
          border: 1px solid var(--card-border);
          border-radius: 10px; padding: 0.6rem 1rem;
          color: var(--text-main); font-family: inherit; font-size: 0.9rem;
          outline: none; transition: border-color 0.2s, box-shadow 0.2s;
          cursor: pointer; width: 160px;
        }
        .folio-select:focus { border-color: var(--gold); box-shadow: 0 0 0 3px rgba(200,164,92,0.12); }
        .folio-select option { background: var(--page-bg-start); }

        .glass-table-wrap {
          background: var(--card-bg);
          backdrop-filter: blur(24px) saturate(1.5);
          -webkit-backdrop-filter: blur(24px) saturate(1.5);
          border: 1px solid var(--card-border);
          border-radius: 20px;
          overflow: hidden;
          box-shadow: 0 8px 32px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.07);
          position: relative; z-index: 2;
        }
        .glass-table-wrap::before {
          content: '';
          position: absolute; top: 0; left: 0; right: 0; height: 1px;
          background: linear-gradient(90deg, transparent, rgba(200,164,92,0.5), transparent);
        }

        .folio-table { width: 100%; border-collapse: collapse; text-align: left; }
        .folio-table th {
          padding: 1rem 1.25rem;
          font-size: 0.75rem; font-weight: 600; text-transform: uppercase;
          letter-spacing: 0.05em; color: var(--gold);
          border-bottom: 1px solid var(--sidebar-border);
          background: var(--sidebar-hover);
        }
        .folio-table td {
          padding: 1rem 1.25rem;
          font-size: 0.875rem;
          border-bottom: 1px solid var(--sidebar-border);
          vertical-align: middle;
        }
        .folio-table tbody tr:hover td { background: rgba(255,255,255,0.02); }
        .folio-table tbody tr:last-child td { border-bottom: none; }

        .t-id { font-family: monospace; color: rgba(200,164,92,0.6); }
        .t-book { font-weight: 600; color: var(--text-main); }
        .t-student { color: var(--text-muted); }
        .t-date { font-family: monospace; font-size: 0.82rem; }
        
        .badge-status {
          padding: 0.3rem 0.65rem; border-radius: 100px;
          font-size: 0.72rem; font-weight: 600; text-transform: uppercase;
        }
        .b-issued { background: rgba(200,164,92,0.15); color: var(--gold); border: 1px solid rgba(200,164,92,0.3); }
        .b-returned { background: var(--badge-blue-bg); color: var(--badge-blue-text); border: 1px solid var(--badge-blue-border); }

        .fine-tag {
          background: rgba(255,77,109,0.15); color: var(--danger);
          padding: 0.25rem 0.5rem; border-radius: 6px; font-weight: 600; font-size: 0.75rem;
        }

        /* Pagination */
        .folio-pagination {
          display: flex; justify-content: center; align-items: center;
          gap: 0.5rem; margin-top: 2rem; position: relative; z-index: 2;
        }
        .page-btn {
          background: var(--card-bg);
          backdrop-filter: blur(12px);
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
        .page-btn:disabled { opacity: 0.4; cursor: not-allowed; }

        .folio-skeleton {
          background: linear-gradient(90deg, rgba(255,255,255,0.04) 25%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.04) 75%);
          background-size: 200% 100%; animation: shimmer 1.5s infinite;
          border-radius: 20px; height: 400px;
        }
        @keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
      `}</style>

      <div className="header-row">
        <h1 className="page-title">Transactions</h1>
        
        <div className="controls-row">
          <div className="search-wrap">
            <MagnifyingGlass size={18} className="search-icon" />
            <input
              type="text"
              className="search-input"
              placeholder="Search ID, title, student..."
              value={searchQuery}
              onChange={handleSearchChange}
            />
          </div>
          <select className="folio-select" value={filter} onChange={e => setFilter(e.target.value)}>
            <option value="">All Status</option>
            <option value="issued">Issued</option>
            <option value="returned">Returned</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="folio-skeleton" style={{ position: 'relative', zIndex: 2 }} />
      ) : (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          {transactions.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '4rem 2rem', color: 'var(--text-muted)', background: 'var(--card-bg)', borderRadius: 20, border: '1px solid var(--card-border)' }}>
              <ArrowsLeftRight size={48} opacity={0.4} />
              <p style={{ marginTop: '1rem' }}>No transactions found.</p>
            </div>
          ) : (
            <div className="glass-table-wrap">
              <table className="folio-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Book</th>
                    <th>Student</th>
                    <th>Issued By</th>
                    <th>Issue Date</th>
                    <th>Due Date</th>
                    <th>Return Date</th>
                    <th>Fine</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map(t => (
                    <tr key={t.id}>
                      <td className="t-id">#{t.id}</td>
                      <td className="t-book">{t.book_title}</td>
                      <td className="t-student">{t.member_name}</td>
                      <td style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{t.librarian_name}</td>
                      <td className="t-date">{new Date(t.issue_date).toLocaleDateString()}</td>
                      <td className="t-date" style={{ color: t.status === 'issued' && new Date(t.due_date) < new Date() ? 'var(--danger)' : 'inherit' }}>
                        {new Date(t.due_date).toLocaleDateString()}
                      </td>
                      <td className="t-date">{t.return_date ? new Date(t.return_date).toLocaleDateString() : '—'}</td>
                      <td>{t.fine_amount > 0 ? <span className="fine-tag">₹{t.fine_amount.toFixed(2)}</span> : '—'}</td>
                      <td>
                        <span className={`badge-status ${t.status === 'issued' ? 'b-issued' : 'b-returned'}`}>
                          {t.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {pagination.totalPages > 1 && (
            <div className="folio-pagination">
              <button className="page-btn" onClick={() => fetchTransactions(pagination.page - 1)} disabled={pagination.page === 1}>
                <CaretLeft size={16} />
              </button>
              {Array.from({ length: pagination.totalPages }, (_, i) => (
                <button key={i} className={`page-btn ${pagination.page === i + 1 ? 'active' : ''}`} onClick={() => fetchTransactions(i + 1)}>
                  {i + 1}
                </button>
              ))}
              <button className="page-btn" onClick={() => fetchTransactions(pagination.page + 1)} disabled={pagination.page === pagination.totalPages}>
                <CaretRight size={16} />
              </button>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}
