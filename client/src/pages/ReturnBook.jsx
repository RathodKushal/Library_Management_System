import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { transactionsAPI } from '../services/api';
import toast from 'react-hot-toast';
import { ArrowBendUpLeft, SpinnerGap, Book, User, CheckCircle, MagnifyingGlass } from '@phosphor-icons/react';

export default function ReturnBook() {
  const [transactions, setTransactions] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
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

  const filteredTransactions = transactions.filter(t => 
    (t.book_title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (t.member_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (t.member_membership_id || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const stagger = { show: { transition: { staggerChildren: 0.05 } } };
  const fadeUp = { hidden: { opacity: 0, y: 15 }, show: { opacity: 1, y: 0, transition: { duration: 0.3 } } };

  return (
    <div className="folio-return-page">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,100..900&family=Plus+Jakarta+Sans:wght@200..800&display=swap');

        .folio-return-page {
          
          
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

        .folio-return-page::before {
          content: '';
          position: absolute; top: -15%; right: -10%;
          width: 45%; height: 50%;
          background: radial-gradient(circle, rgba(200,164,92,0.08) 0%, transparent 70%);
          pointer-events: none;
        }

        .page-header {
          display: flex; justify-content: space-between; align-items: center;
          margin-bottom: 2rem; position: relative; z-index: 2; gap: 1rem;
        }

        .page-title {
          font-family: 'Fraunces', serif;
          font-size: 1.75rem; font-weight: 500;
          background: linear-gradient(135deg, var(--text-main), var(--gold));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          margin: 0; white-space: nowrap;
        }

        .search-wrap {
          position: relative; max-width: 320px; width: 100%;
        }
        .search-icon {
          position: absolute; left: 1rem; top: 50%; transform: translateY(-50%);
          color: var(--text-muted); opacity: 0.8; pointer-events: none;
        }
        .search-input {
          width: 100%; box-sizing: border-box;
          background: var(--input-bg);
          border: 1px solid rgba(200, 164, 92, 0.25);
          border-radius: 12px; padding: 0.75rem 1rem 0.75rem 2.75rem;
          color: var(--text-main); font-family: inherit; font-size: 0.95rem;
          outline: none; transition: all 0.2s;
        }
        .search-input:focus {
          border-color: var(--gold); background: var(--input-bg);
          box-shadow: 0 0 0 3px rgba(200, 164, 92, 0.12);
        }
        .search-input::placeholder { color: var(--text-muted); opacity: 0.6; }

        .return-card {
          background: var(--card-bg);
          backdrop-filter: blur(24px) saturate(1.5);
          -webkit-backdrop-filter: blur(24px) saturate(1.5);
          border: 1px solid var(--card-border);
          border-radius: 16px;
          padding: 1.25rem 1.5rem;
          margin-bottom: 0.875rem;
          position: relative; overflow: hidden;
          box-shadow: 0 4px 20px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.05);
          display: flex; justify-content: space-between; align-items: center;
          transition: transform 0.2s, box-shadow 0.2s, border-color 0.2s;
        }
        .return-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 30px rgba(0,0,0,0.25);
          border-color: rgba(200,164,92,0.3);
        }
        .return-card::before {
          content: '';
          position: absolute; top: 0; left: 0; right: 0; height: 1px;
          background: linear-gradient(90deg, transparent, rgba(200,164,92,0.4), transparent);
        }

        .status-strip {
          position: absolute; left: 0; top: 0; bottom: 0; width: 4px;
        }
        .strip-safe { background: rgba(74,106,168,0.8); }
        .strip-warn { background: rgba(200,164,92,0.8); }
        .strip-overdue { background: rgba(255,77,109,0.8); }

        .card-content { display: flex; align-items: center; gap: 2rem; flex: 1; margin-left: 0.5rem; }

        .book-info { min-width: 200px; }
        .b-title { display: flex; align-items: center; gap: 0.5rem; font-weight: 600; font-size: 1rem; color: var(--text-main); margin-bottom: 0.25rem; }
        .b-user { display: flex; align-items: center; gap: 0.5rem; font-size: 0.82rem; color: var(--text-muted); }

        .due-info { text-align: center; min-width: 120px; }
        .due-label { font-size: 0.72rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.15rem; }
        .due-date { font-size: 0.95rem; font-weight: 600; font-family: monospace; }
        .due-date.safe { color: var(--text-main); }
        .due-date.overdue { color: var(--danger); }

        .time-badge {
          padding: 0.35rem 0.875rem; border-radius: 100px;
          font-size: 0.75rem; font-weight: 600; white-space: nowrap;
        }
        .time-safe { background: var(--badge-blue-bg); color: var(--badge-blue-text); border: 1px solid var(--badge-blue-border); }
        .time-warn { background: rgba(200,164,92,0.15); color: var(--gold); border: 1px solid rgba(200,164,92,0.3); }
        .time-overdue { background: rgba(255,77,109,0.15); color: var(--danger); border: 1px solid rgba(255,77,109,0.3); }

        .folio-return-btn {
          display: flex; align-items: center; gap: 0.5rem;
          padding: 0.65rem 1.25rem;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.15);
          border-radius: 12px; color: var(--text-main);
          font-family: inherit; font-weight: 600; font-size: 0.9rem;
          cursor: pointer; transition: all 0.2s;
        }
        .folio-return-btn:hover:not(:disabled) {
          background: rgba(200,164,92,0.15); border-color: var(--gold); color: var(--gold);
        }
        .folio-return-btn:disabled { opacity: 0.5; cursor: not-allowed; }

        .folio-skeleton {
          background: linear-gradient(90deg, rgba(255,255,255,0.04) 25%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.04) 75%);
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
          border-radius: 16px; height: 85px; margin-bottom: 0.875rem;
        }
        @keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }

        .folio-empty {
          display: flex; flex-direction: column; align-items: center;
          justify-content: center; padding: 5rem 2rem;
          text-align: center; color: var(--text-muted); position: relative; z-index: 2;
        }
        .folio-empty h3 { font-family: 'Fraunces', serif; font-size: 1.5rem; color: var(--gold); margin: 1rem 0 0.5rem; }
        
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      <div className="page-header">
        <h1 className="page-title">Return Book</h1>
        <div className="search-wrap">
          <MagnifyingGlass size={18} className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="Search by student or book..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div style={{ position: 'relative', zIndex: 2 }}>
          {[1,2,3,4].map(i => <div key={i} className="folio-skeleton" />)}
        </div>
      ) : transactions.length === 0 ? (
        <div className="folio-empty">
          <CheckCircle size={64} weight="duotone" color="rgba(200,164,92,0.4)" />
          <h3>All Clear!</h3>
          <p>There are no active loans to return at this time.</p>
        </div>
      ) : filteredTransactions.length === 0 ? (
        <div className="folio-empty">
          <MagnifyingGlass size={48} weight="duotone" color="rgba(169,182,212,0.4)" />
          <h3 style={{ color: 'var(--text-muted)' }}>No matches found</h3>
          <p>No active loans match "{searchQuery}".</p>
        </div>
      ) : (
        <motion.div variants={stagger} initial="hidden" animate="show" style={{ position: 'relative', zIndex: 2 }}>
          {filteredTransactions.map((t) => {
            const overdue = isOverdue(t.due_date);
            const days = daysUntil(t.due_date);
            const statusType = overdue ? 'overdue' : (days <= 3 ? 'warn' : 'safe');

            return (
              <motion.div key={t.id} variants={fadeUp} className="return-card">
                <div className={`status-strip strip-${statusType}`} />
                <div className="card-content">
                  <div className="book-info">
                    <div className="b-title">
                      <Book size={16} color="var(--gold-light)" />
                      {t.book_title}
                    </div>
                    <div className="b-user">
                      <User size={14} color="var(--text-muted)" />
                      {t.member_name} <span style={{ fontFamily: 'monospace', opacity: 0.7 }}>({t.member_membership_id})</span>
                    </div>
                  </div>
                  
                  <div className="due-info">
                    <div className="due-label">Due Date</div>
                    <div className={`due-date ${overdue ? 'overdue' : 'safe'}`}>
                      {new Date(t.due_date).toLocaleDateString()}
                    </div>
                  </div>

                  <span className={`time-badge time-${statusType}`}>
                    {overdue ? `${Math.abs(days)} days overdue` : `${days} days left`}
                  </span>
                </div>

                <button 
                  className="folio-return-btn"
                  onClick={() => handleReturn(t)}
                  disabled={returning === t.id}
                >
                  {returning === t.id 
                    ? <SpinnerGap size={18} className="spin" /> 
                    : <><ArrowBendUpLeft size={18} weight="bold" /> Return</>
                  }
                </button>
              </motion.div>
            );
          })}
        </motion.div>
      )}
    </div>
  );
}
