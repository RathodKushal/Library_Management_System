import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { booksAPI, membersAPI, transactionsAPI } from '../services/api';
import toast from 'react-hot-toast';
import { BookOpen, User, CalendarBlank, CheckCircle, SpinnerGap, MagnifyingGlass, ArrowLeft } from '@phosphor-icons/react';

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

export default function IssueBook() {
  const [books, setBooks] = useState([]);
  const [members, setMembers] = useState([]);
  const [selectedBook, setSelectedBook] = useState(null);
  const [selectedMember, setSelectedMember] = useState(null);
  const [dueDate, setDueDate] = useState('');
  const [notes, setNotes] = useState('');
  const [bookSearch, setBookSearch] = useState('');
  const [memberSearch, setMemberSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);

  useEffect(() => {
    const defaultDue = new Date();
    defaultDue.setDate(defaultDue.getDate() + 14);
    setDueDate(defaultDue.toISOString().split('T')[0]);
  }, []);

  useEffect(() => {
    if (bookSearch.length >= 2) {
      booksAPI.search(bookSearch).then(r => setBooks(r.data.data.filter(b => b.available_copies > 0))).catch(() => {});
    } else {
      booksAPI.getAll({ limit: 20 }).then(r => setBooks(r.data.data.filter(b => b.available_copies > 0))).catch(() => {});
    }
  }, [bookSearch]);

  useEffect(() => {
    membersAPI.getAll({ limit: 50, search: memberSearch, status: 'active' }).then(r => setMembers(r.data.data)).catch(() => {});
  }, [memberSearch]);

  const handleIssue = async () => {
    if (!selectedBook || !selectedMember || !dueDate) { toast.error('Please complete all fields'); return; }
    setLoading(true);
    try {
      await transactionsAPI.issue({ book_id: selectedBook.id, member_id: selectedMember.id, due_date: new Date(dueDate).toISOString(), notes: notes || undefined });
      toast.success('Book issued successfully!');
      setBooks(prev => prev.map(b => b.id === selectedBook.id ? { ...b, available_copies: b.available_copies - 1 } : b));
      setSelectedBook(null); setSelectedMember(null); setStep(1); setNotes('');
    } catch (err) { toast.error(err.response?.data?.message || 'Issue failed'); }
    finally { setLoading(false); }
  };

  const steps = [
    { num: 1, label: 'Select Book', icon: BookOpen },
    { num: 2, label: 'Select Student', icon: User },
    { num: 3, label: 'Confirm & Issue', icon: CheckCircle },
  ];

  const canGoToStep = (n) => {
    if (n <= step) return true;
    if (n === 2 && selectedBook) return true;
    if (n === 3 && selectedBook && selectedMember) return true;
    return false;
  };

  return (
    <div className="folio-issue-page">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,100..900&family=Plus+Jakarta+Sans:wght@200..800&display=swap');

        .folio-issue-page {
          
          
          --navy-primary: #1f3a6e;
          --navy-mid: #2c4c8c;
          --navy-steel: #4a6aa8;
          
          
          
          
          
          

          font-family: 'Plus Jakarta Sans', sans-serif;
          background: linear-gradient(135deg, var(--page-bg-start), var(--page-bg-end));
          border-radius: 24px;
          padding: 2rem 2.5rem;
          color: var(--text-main);
          min-height: calc(100vh - 6rem);
          position: relative;
          overflow: hidden;
        }
        .folio-issue-page::before {
          content: '';
          position: absolute; top: -15%; right: -10%;
          width: 45%; height: 50%;
          background: radial-gradient(circle, rgba(200,164,92,0.07) 0%, transparent 70%);
          pointer-events: none;
        }
        .folio-issue-page::after {
          content: '';
          position: absolute; bottom: -10%; left: -10%;
          width: 50%; height: 50%;
          background: radial-gradient(circle, rgba(31,58,110,0.35) 0%, transparent 70%);
          pointer-events: none;
        }

        /* Page title */
        .issue-title {
          font-family: 'Fraunces', serif;
          font-size: 1.75rem;
          font-weight: 500;
          background: linear-gradient(135deg, var(--text-main), var(--gold));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          margin-bottom: 2rem;
          position: relative; z-index: 2;
        }

        /* Steps indicator */
        .steps-bar {
          display: flex;
          gap: 0;
          margin-bottom: 2rem;
          position: relative; z-index: 2;
          background: var(--card-bg);
          backdrop-filter: blur(20px) saturate(1.5);
          border: 1px solid rgba(200,164,92,0.15);
          border-radius: 12px;
          padding: 0.25rem;
          overflow: hidden;
        }
        .step-item {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          padding: 0.65rem 1rem;
          border-radius: 10px;
          cursor: pointer;
          transition: all 0.3s ease;
          position: relative;
        }
        .step-item.active {
          background: var(--sidebar-active-bg);
          box-shadow: 0 4px 16px rgba(0,0,0,0.05);
        }
        .step-item.done {
          background: rgba(200,164,92,0.05);
        }
        .step-num {
          width: 24px; height: 24px;
          border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          font-size: 0.7rem; font-weight: 700;
          flex-shrink: 0;
          transition: all 0.3s;
        }
        .step-num.pending { background: var(--sidebar-hover); color: var(--text-muted); border: 1px solid var(--sidebar-border); }
        .step-num.active-num { background: linear-gradient(135deg, var(--navy-primary), var(--navy-steel)); color: #e3cb96; border: 1px solid rgba(200,164,92,0.35); }
        .step-num.done-num { background: rgba(200,164,92,0.15); color: var(--gold); border: 1px solid rgba(200,164,92,0.3); }
        .step-label {
          font-size: 0.875rem;
          transition: color 0.3s;
        }
        .step-label.pending { color: var(--text-muted); }
        .step-label.active-label { color: var(--text-main); font-weight: 600; }
        .step-label.done-label { color: var(--gold); font-weight: 500; }

        /* Connector line between steps */
        .step-connector {
          width: 1px; background: var(--sidebar-border);
          align-self: stretch; margin: 0.5rem 0;
          flex-shrink: 0;
        }

        /* Search */
        .folio-search { position: relative; margin-bottom: 1.25rem; }
        .folio-search-icon { position: absolute; left: 1rem; top: 50%; transform: translateY(-50%); color: var(--text-muted); pointer-events: none; }
        .folio-input {
          width: 100%; box-sizing: border-box;
          background: var(--input-bg);
          border: 1px solid var(--card-border);
          border-radius: 12px; padding: 0.8rem 1rem 0.8rem 2.75rem;
          color: var(--text-main); font-family: inherit; font-size: 0.95rem;
          outline: none; transition: border-color 0.2s, box-shadow 0.2s;
        }
        .folio-input:focus { border-color: var(--gold); box-shadow: 0 0 0 3px rgba(200,164,92,0.12); }
        .folio-input::placeholder { color: var(--text-muted); opacity: 0.6; }
        .folio-input-plain {
          width: 100%; box-sizing: border-box;
          background: var(--input-bg);
          border: 1px solid var(--card-border);
          border-radius: 12px; padding: 0.8rem 1rem;
          color: var(--text-main); font-family: inherit; font-size: 0.95rem;
          outline: none; transition: border-color 0.2s, box-shadow 0.2s;
        }
        .folio-input-plain:focus { border-color: var(--gold); box-shadow: 0 0 0 3px rgba(200,164,92,0.12); }
        .folio-input-plain::placeholder { color: var(--text-muted); opacity: 0.6; }

        /* Cards grid */
        .select-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1rem;
          position: relative; z-index: 2;
        }
        @media (max-width: 1100px) { .select-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 650px) { .select-grid { grid-template-columns: 1fr; } }

        /* Selectable glass card */
        .select-card {
          background: var(--card-bg);
          backdrop-filter: blur(24px) saturate(1.5);
          -webkit-backdrop-filter: blur(24px) saturate(1.5);
          border: 1px solid var(--card-border);
          border-radius: 16px;
          padding: 1.1rem 1.25rem;
          cursor: pointer;
          position: relative; overflow: hidden;
          transition: transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease;
          box-shadow: 0 4px 20px rgba(0,0,0,0.15), inset 0 1px 0 var(--sidebar-active-bg);
        }
        .select-card::before {
          content: '';
          position: absolute; top: 0; left: 0; right: 0; height: 1px;
          background: linear-gradient(90deg, transparent, rgba(200,164,92,0.4), transparent);
        }
        .select-card:hover {
          transform: translateY(-3px);
          border-color: rgba(200,164,92,0.3);
          box-shadow: 0 10px 32px rgba(0,0,0,0.25);
        }
        .select-card.selected {
          border-color: rgba(200,164,92,0.6);
          background: rgba(200,164,92,0.08);
          box-shadow: 0 0 0 1px rgba(200,164,92,0.3), 0 10px 32px rgba(0,0,0,0.2);
        }
        .select-card .left-strip {
          position: absolute; left: 0; top: 0; bottom: 0; width: 4px;
          border-radius: 16px 0 0 16px;
        }
        .book-title { font-size: 0.95rem; font-weight: 600; color: var(--text-main); margin-bottom: 0.25rem; line-height: 1.3; }
        .book-author { font-size: 0.82rem; color: var(--text-muted); margin-bottom: 0.6rem; }
        .avail-tag {
          display: inline-block;
          padding: 0.25rem 0.65rem; border-radius: 100px;
          font-size: 0.72rem; font-weight: 600;
          background: var(--badge-blue-bg); color: var(--badge-blue-text);
          border: 1px solid var(--badge-blue-border);
        }

        .member-avatar {
          width: 40px; height: 40px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          font-weight: 700; font-size: 0.95rem; color: #fff;
          border: 1.5px solid rgba(200,164,92,0.25); flex-shrink: 0;
        }
        .member-name { font-size: 0.95rem; font-weight: 600; color: var(--text-main); margin-bottom: 0.1rem; }
        .member-id { font-size: 0.72rem; font-family: monospace; color: rgba(200,164,92,0.6); }

        /* Confirm step */
        .confirm-wrap {
          max-width: 620px;
          position: relative; z-index: 2;
        }
        .folio-glass-card {
          background: var(--card-bg);
          backdrop-filter: blur(24px) saturate(1.5);
          -webkit-backdrop-filter: blur(24px) saturate(1.5);
          border: 1px solid var(--card-border);
          border-radius: 20px;
          padding: 1.75rem;
          position: relative; overflow: hidden;
          box-shadow: 0 8px 32px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.07);
          margin-bottom: 1.5rem;
        }
        .folio-glass-card::before {
          content: '';
          position: absolute; top: 0; left: 0; right: 0; height: 1px;
          background: linear-gradient(90deg, transparent, rgba(200,164,92,0.5), transparent);
        }
        .confirm-card-title {
          font-family: 'Fraunces', serif;
          font-size: 1.1rem; color: var(--gold);
          margin-bottom: 1.25rem;
          display: flex; align-items: center; gap: 0.6rem;
        }
        .summary-row {
          display: flex; align-items: center; gap: 0.875rem;
          padding: 0.875rem 1rem;
          background: var(--input-bg);
          border: 1px solid var(--sidebar-active-bg);
          border-radius: 12px;
          margin-bottom: 0.75rem;
        }
        .summary-icon {
          width: 40px; height: 40px;
          background: rgba(200,164,92,0.1);
          border: 1px solid rgba(200,164,92,0.2);
          border-radius: 10px;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }
        .summary-sublabel { font-size: 0.72rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.2rem; }
        .summary-value { font-size: 0.95rem; font-weight: 600; color: var(--text-main); }

        .folio-form-label {
          display: block; font-size: 0.8rem; font-weight: 600;
          color: var(--text-muted); text-transform: uppercase;
          letter-spacing: 0.05em; margin-bottom: 0.45rem;
        }

        /* Buttons */
        .btn-row { display: flex; gap: 0.875rem; }
        .folio-back-btn {
          display: flex; align-items: center; gap: 0.5rem;
          padding: 0.8rem 1.25rem;
          background: var(--sidebar-hover);
          border: 1px solid var(--sidebar-border);
          border-radius: 12px; color: var(--text-muted);
          font-family: inherit; font-size: 0.95rem; cursor: pointer; transition: all 0.2s;
        }
        .folio-back-btn:hover { background: var(--sidebar-active-bg); color: var(--text-main); }
        .folio-issue-btn {
          display: flex; align-items: center; gap: 0.6rem;
          padding: 0.8rem 2rem;
          background: linear-gradient(135deg, var(--navy-primary), var(--navy-mid));
          border: 1px solid rgba(200,164,92,0.35);
          border-radius: 12px; color: #e3cb96;
          font-family: inherit; font-weight: 700; font-size: 1rem;
          cursor: pointer; transition: all 0.2s;
          box-shadow: 0 4px 16px rgba(0,0,0,0.25);
        }
        .folio-issue-btn:hover:not(:disabled) {
          border-color: #e3cb96;
          box-shadow: 0 6px 24px rgba(200,164,92,0.2);
          color: #e3cb96;
        }
        .folio-issue-btn:disabled { opacity: 0.7; cursor: not-allowed; }

        /* Selected banner */
        .selected-banner {
          background: rgba(200,164,92,0.08);
          border: 1px solid rgba(200,164,92,0.2);
          border-radius: 14px; padding: 0.875rem 1.1rem;
          margin-bottom: 1.25rem;
          display: flex; align-items: center; gap: 0.75rem;
          position: relative; z-index: 2;
        }
        .selected-banner-label { font-size: 0.72rem; color: var(--gold); text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 0.15rem; }
        .selected-banner-value { font-size: 0.95rem; font-weight: 600; color: var(--text-main); }

        .step-content { position: relative; z-index: 2; }

        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      <h1 className="issue-title">Issue Book</h1>

      {/* ── Steps Bar ── */}
      <div className="steps-bar">
        {steps.map((s, idx) => {
          const state = step === s.num ? 'active' : step > s.num ? 'done' : 'pending';
          return (
            <>
              {idx > 0 && <div key={`conn-${s.num}`} className="step-connector" />}
              <div
                key={s.num}
                className={`step-item ${state}`}
                onClick={() => canGoToStep(s.num) && setStep(s.num)}
              >
                <div className={`step-num ${state === 'active' ? 'active-num' : state === 'done' ? 'done-num' : 'pending'}`}>
                  {state === 'done' ? '✓' : s.num}
                </div>
                <span className={`step-label ${state === 'active' ? 'active-label' : state === 'done' ? 'done-label' : 'pending'}`}>
                  {s.label}
                </span>
              </div>
            </>
          );
        })}
      </div>

      {/* ── Step 1: Select Book ── */}
      {step === 1 && (
        <motion.div className="step-content" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }}>
          <div className="folio-search">
            <MagnifyingGlass size={18} className="folio-search-icon" />
            <input className="folio-input" placeholder="Search available books by title or author..." value={bookSearch} onChange={e => setBookSearch(e.target.value)} />
          </div>
          <div className="select-grid">
            {books.map(b => (
              <motion.div
                key={b.id}
                className={`select-card ${selectedBook?.id === b.id ? 'selected' : ''}`}
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                onClick={() => { setSelectedBook(b); setStep(2); }}
              >
                <div className="left-strip" style={{ background: b.category_color || 'rgba(200,164,92,0.5)' }} />
                <div style={{ paddingLeft: '0.5rem' }}>
                  <div className="book-title">{b.title}</div>
                  <div className="book-author">{b.author}</div>
                  <span className="avail-tag">{b.available_copies} available</span>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* ── Step 2: Select Student ── */}
      {step === 2 && (
        <motion.div className="step-content" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }}>
          {selectedBook && (
            <div className="selected-banner">
              <div className="summary-icon"><BookOpen size={20} color="var(--gold)" /></div>
              <div>
                <div className="selected-banner-label">Selected Book</div>
                <div className="selected-banner-value">{selectedBook.title} — <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>{selectedBook.author}</span></div>
              </div>
            </div>
          )}
          <div className="folio-search">
            <MagnifyingGlass size={18} className="folio-search-icon" />
            <input className="folio-input" placeholder="Search active students..." value={memberSearch} onChange={e => setMemberSearch(e.target.value)} />
          </div>
          <div className="select-grid">
            {members.map(m => (
              <motion.div
                key={m.id}
                className={`select-card ${selectedMember?.id === m.id ? 'selected' : ''}`}
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                onClick={() => { setSelectedMember(m); setStep(3); }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                  <div className="member-avatar" style={{ background: avatarGradient(m.name) }}>
                    {m.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="member-name">{m.name}</div>
                    <div className="member-id">{m.enrollment_no ? `ENR: ${m.enrollment_no}` : m.membership_id}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* ── Step 3: Confirm ── */}
      {step === 3 && (
        <motion.div className="confirm-wrap" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }}>
          <div className="folio-glass-card">
            <div className="confirm-card-title">
              <CheckCircle size={22} weight="duotone" color="var(--gold)" />
              Issue Summary
            </div>

            <div className="summary-row">
              <div className="summary-icon"><BookOpen size={20} color="var(--gold)" /></div>
              <div>
                <div className="summary-sublabel">Book</div>
                <div className="summary-value">{selectedBook?.title}</div>
              </div>
            </div>

            <div className="summary-row">
              <div className="summary-icon"><User size={20} color="var(--gold)" /></div>
              <div>
                <div className="summary-sublabel">Student</div>
                <div className="summary-value">{selectedMember?.name} <span style={{ color: 'var(--text-muted)', fontWeight: 400, fontSize: '0.85rem' }}>({selectedMember?.membership_id})</span></div>
              </div>
            </div>

            <div style={{ marginTop: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label className="folio-form-label" htmlFor="due-date">
                  <CalendarBlank size={13} style={{ marginRight: '0.3rem', verticalAlign: 'middle' }} />
                  Due Date
                </label>
                <input id="due-date" type="date" className="folio-input-plain" value={dueDate} onChange={e => setDueDate(e.target.value)} />
              </div>
              <div>
                <label className="folio-form-label" htmlFor="issue-notes">Notes (Optional)</label>
                <textarea id="issue-notes" className="folio-input-plain" rows="2" value={notes} onChange={e => setNotes(e.target.value)} placeholder="Any special instructions or notes..." />
              </div>
            </div>
          </div>

          <div className="btn-row">
            <button className="folio-back-btn" onClick={() => setStep(1)}>
              <ArrowLeft size={17} /> Start Over
            </button>
            <motion.button className="folio-issue-btn" onClick={handleIssue} disabled={loading} whileTap={{ scale: 0.97 }}>
              {loading
                ? <SpinnerGap size={20} className="spin" />
                : <><CheckCircle size={20} weight="bold" /> Issue Book</>
              }
            </motion.button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
