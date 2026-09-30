import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { transactionsAPI } from '../services/api';
import toast from 'react-hot-toast';
import { Warning, ArrowBendUpLeft, SpinnerGap, Clock, Phone, User, Book, } from '@phosphor-icons/react';

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

  const stagger = { show: { transition: { staggerChildren: 0.05 } } };
  const fadeUp = { hidden: { opacity: 0, x: -10 }, show: { opacity: 1, x: 0, transition: { duration: 0.3 } } };

  return (
    <div className="folio-overdue-page">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,100..900&family=Plus+Jakarta+Sans:wght@200..800&display=swap');

        .folio-overdue-page {
          
          
          --navy-primary: #1f3a6e;
          --navy-mid: #2c4c8c;
          
          
          
          
          
          --danger-bg: rgba(255, 77, 109, 0.06);

          font-family: 'Plus Jakarta Sans', sans-serif;
          background: linear-gradient(135deg, var(--page-bg-start), var(--page-bg-end));
          border-radius: 24px;
          padding: 2.5rem;
          color: var(--text-main);
          min-height: calc(100vh - 6rem);
          position: relative;
          overflow: hidden;
        }

        .folio-overdue-page::before {
          content: '';
          position: absolute; top: -15%; right: -10%;
          width: 45%; height: 50%;
          background: radial-gradient(circle, rgba(255,77,109,0.08) 0%, transparent 70%);
          pointer-events: none;
        }

        .page-header {
          margin-bottom: 2rem; position: relative; z-index: 2;
        }
        .page-title {
          font-family: 'Fraunces', serif;
          font-size: 1.75rem; font-weight: 500; margin: 0;
          display: flex; align-items: center; gap: 0.6rem;
          color: var(--danger);
        }

        .overdue-card {
          background: var(--card-bg);
          backdrop-filter: blur(24px) saturate(1.5);
          -webkit-backdrop-filter: blur(24px) saturate(1.5);
          border: 1px solid rgba(255,77,109,0.3);
          border-left: 4px solid var(--danger);
          border-radius: 16px;
          padding: 1.25rem 1.5rem;
          margin-bottom: 0.875rem;
          position: relative; overflow: hidden;
          box-shadow: 0 4px 20px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.05);
          display: flex; justify-content: space-between; align-items: center;
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .overdue-card::after {
          content: ''; position: absolute; inset: 0;
          background: linear-gradient(90deg, rgba(255,77,109,0.05), transparent);
          pointer-events: none;
        }
        .overdue-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 30px rgba(255,77,109,0.15);
        }

        .card-content { display: flex; align-items: center; gap: 2rem; flex: 1; margin-left: 0.5rem; }

        .book-info { min-width: 200px; }
        .b-title { display: flex; align-items: center; gap: 0.5rem; font-weight: 600; font-size: 1rem; color: var(--text-main); margin-bottom: 0.25rem; }
        .b-author { font-size: 0.82rem; color: var(--text-muted); padding-left: 1.5rem; }

        .user-info { min-width: 180px; }
        .u-name { display: flex; align-items: center; gap: 0.5rem; font-weight: 500; font-size: 0.9rem; color: var(--text-main); margin-bottom: 0.2rem; }
        .u-id { font-family: monospace; font-size: 0.75rem; color: rgba(200,164,92,0.6); padding-left: 1.5rem; }

        .due-info { text-align: center; min-width: 120px; }
        .due-label { font-size: 0.72rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.15rem; }
        .due-date { font-size: 0.95rem; font-weight: 600; font-family: monospace; color: var(--danger); }

        .days-badge {
          display: flex; align-items: center; gap: 0.3rem;
          padding: 0.35rem 0.875rem; border-radius: 100px;
          font-size: 0.75rem; font-weight: 600; white-space: nowrap;
          background: rgba(255,77,109,0.15); color: var(--danger); border: 1px solid rgba(255,77,109,0.3);
        }

        .action-area { display: flex; align-items: center; gap: 1.25rem; }
        .phone-text { display: flex; align-items: center; gap: 0.3rem; font-size: 0.8rem; color: var(--text-muted); }

        .folio-return-btn {
          display: flex; align-items: center; gap: 0.5rem;
          padding: 0.65rem 1.25rem;
          background: rgba(255,77,109,0.1); border: 1px solid rgba(255,77,109,0.3);
          border-radius: 12px; color: var(--danger);
          font-family: inherit; font-weight: 600; font-size: 0.9rem;
          cursor: pointer; transition: all 0.2s; white-space: nowrap;
        }
        .folio-return-btn:hover:not(:disabled) { background: var(--danger); color: white; box-shadow: 0 4px 15px rgba(255,77,109,0.4); }
        .folio-return-btn:disabled { opacity: 0.5; cursor: not-allowed; }

        .folio-skeleton {
          background: linear-gradient(90deg, rgba(255,255,255,0.04) 25%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.04) 75%);
          background-size: 200% 100%; animation: shimmer 1.5s infinite;
          border-radius: 16px; height: 95px; margin-bottom: 0.875rem;
        }
        @keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }

        .folio-empty {
          background: rgba(52,211,153,0.05); border: 1px solid rgba(52,211,153,0.2);
          border-radius: 20px; padding: 4rem 2rem; text-align: center; position: relative; z-index: 2;
        }
        
        

        .folio-empty h3 { color: #34d399; font-family: 'Fraunces', serif; font-size: 1.5rem; margin-bottom: 0.5rem; }
        .folio-empty p { color: var(--text-muted); }

        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      <div className="page-header">
        <h1 className="page-title">
          <Warning size={28} weight="duotone" /> Overdue Books
        </h1>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginTop: '0.4rem' }}>
          {transactions.length} book(s) past their due date
        </p>
      </div>

      {loading ? (
        <div style={{ position: 'relative', zIndex: 2 }}>
          {[1,2,3].map(i => <div key={i} className="folio-skeleton" />)}
        </div>
      ) : transactions.length === 0 ? (
        <div className="folio-empty">
          <h3>No overdue books!</h3>
          <p>All issued books are within their due dates.</p>
        </div>
      ) : (
        <motion.div variants={stagger} initial="hidden" animate="show" style={{ position: 'relative', zIndex: 2 }}>
          {transactions.map(t => (
            <motion.div key={t.id} variants={fadeUp} className="overdue-card">
              <div className="card-content">
                <div className="book-info">
                  <div className="b-title">
                    <Book size={16} color="var(--danger)" />
                    {t.book_title}
                  </div>
                  <div className="b-author">{t.book_author}</div>
                </div>

                <div className="user-info">
                  <div className="u-name">
                    <User size={14} color="var(--text-muted)" />
                    {t.member_name}
                  </div>
                  <div className="u-id">{t.member_membership_id}</div>
                </div>

                <div className="due-info">
                  <div className="due-label">Due Date</div>
                  <div className="due-date">{new Date(t.due_date).toLocaleDateString()}</div>
                </div>

                <div className="days-badge">
                  <Clock size={14} />
                  {t.days_overdue} days overdue
                </div>
              </div>

              <div className="action-area">
                {t.member_phone && (
                  <div className="phone-text">
                    <Phone size={14} /> {t.member_phone}
                  </div>
                )}
                <button className="folio-return-btn" onClick={() => handleReturn(t)} disabled={returning === t.id}>
                  {returning === t.id 
                    ? <SpinnerGap size={18} className="spin" /> 
                    : <><ArrowBendUpLeft size={18} weight="bold" /> Return</>
                  }
                </button>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}

    </div>
  );
}
