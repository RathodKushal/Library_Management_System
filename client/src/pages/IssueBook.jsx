import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { booksAPI, membersAPI, transactionsAPI } from '../services/api';
import toast from 'react-hot-toast';
import { BookOpen, User, CalendarBlank, CheckCircle, SpinnerGap, MagnifyingGlass } from '@phosphor-icons/react';

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
    } else { booksAPI.getAll({ limit: 20 }).then(r => setBooks(r.data.data.filter(b => b.available_copies > 0))).catch(() => {}); }
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

  return (
    <div className="page">
      <div className="page-header"><h1>Issue Book</h1></div>

      {/* Steps indicator */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem' }}>
        {[{ num: 1, label: 'Select Book' }, { num: 2, label: 'Select Member' }, { num: 3, label: 'Confirm' }].map(s => (
          <div key={s.num} style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.875rem 1rem', borderRadius: 'var(--radius-md)', background: step >= s.num ? 'rgba(99, 102, 241, 0.1)' : 'var(--bg-surface)', border: `1px solid ${step >= s.num ? 'rgba(99,102,241,0.3)' : 'var(--border)'}`, cursor: 'pointer', transition: 'all 200ms ease' }} onClick={() => { if (s.num <= step || (s.num === 2 && selectedBook) || (s.num === 3 && selectedBook && selectedMember)) setStep(s.num); }}>
            <div style={{ width: 28, height: 28, borderRadius: 'var(--radius-full)', background: step >= s.num ? 'var(--primary)' : 'var(--bg-surface-3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700, color: 'white' }}>{step > s.num ? '✓' : s.num}</div>
            <span style={{ fontSize: '0.875rem', fontWeight: step === s.num ? 600 : 400, color: step >= s.num ? 'var(--text-primary)' : 'var(--text-muted)' }}>{s.label}</span>
          </div>
        ))}
      </div>

      {/* Step 1: Select Book */}
      {step === 1 && (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
          <div className="search-bar" style={{ maxWidth: '100%', marginBottom: '1rem' }}>
            <MagnifyingGlass size={18} className="search-icon" />
            <input className="form-input" placeholder="Search available books..." value={bookSearch} onChange={e => setBookSearch(e.target.value)} style={{ paddingLeft: '2.75rem' }} />
          </div>
          <div className="grid grid-cols-3 gap-3">
            {books.map(b => (
              <motion.div key={b.id} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => { setSelectedBook(b); setStep(2); }} className="card" style={{ cursor: 'pointer', border: selectedBook?.id === b.id ? '2px solid var(--primary)' : undefined, borderLeft: b.category_color ? `4px solid ${b.category_color}` : '4px solid var(--border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.25rem' }}>
                  <h4 style={{ fontSize: '0.9375rem', margin: 0 }}>{b.title}</h4>
                </div>
                <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>{b.author}</p>
                <span className="badge badge-success" style={{ marginTop: '0.5rem' }}>{b.available_copies} available</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Step 2: Select Member */}
      {step === 2 && (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
          {selectedBook && (
            <div className="card" style={{ marginBottom: '1rem', background: 'rgba(99,102,241,0.08)', borderColor: 'rgba(99,102,241,0.2)' }}>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>Selected Book:</p>
              <h4>{selectedBook.title} — {selectedBook.author}</h4>
            </div>
          )}
          <div className="search-bar" style={{ maxWidth: '100%', marginBottom: '1rem' }}>
            <MagnifyingGlass size={18} className="search-icon" />
            <input className="form-input" placeholder="Search students..." value={memberSearch} onChange={e => setMemberSearch(e.target.value)} style={{ paddingLeft: '2.75rem' }} />
          </div>
          <div className="grid grid-cols-3 gap-3">
            {members.map(m => (
              <motion.div key={m.id} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => { setSelectedMember(m); setStep(3); }} className="card" style={{ cursor: 'pointer', border: selectedMember?.id === m.id ? '2px solid var(--primary)' : undefined }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ width: 36, height: 36, borderRadius: 'var(--radius-full)', background: 'linear-gradient(135deg, var(--primary), var(--accent))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.8125rem', color: 'white' }}>{m.name.charAt(0)}</div>
                  <div><h4 style={{ fontSize: '0.9375rem' }}>{m.name}</h4><p style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--text-dim)' }}>{m.membership_id}</p></div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Step 3: Confirm */}
      {step === 3 && (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} style={{ maxWidth: 600 }}>
          <div className="card" style={{ marginBottom: '1.5rem' }}>
            <h4 style={{ marginBottom: '1rem' }}>Issue Summary</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', borderRadius: 'var(--radius-md)', background: 'var(--glass-highlight)' }}>
                <BookOpen size={20} color="var(--primary-light)" />
                <div><p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Book</p><p style={{ fontWeight: 600 }}>{selectedBook?.title}</p></div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', borderRadius: 'var(--radius-md)', background: 'var(--glass-highlight)' }}>
                <User size={20} color="var(--accent)" />
                <div><p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Student</p><p style={{ fontWeight: 600 }}>{selectedMember?.name} ({selectedMember?.membership_id})</p></div>
              </div>
              <div className="form-group"><label className="form-label" htmlFor="due-date"><CalendarBlank size={14} style={{ marginRight: '0.25rem', verticalAlign: 'middle' }} />Due Date</label><input id="due-date" type="date" className="form-input" value={dueDate} onChange={e => setDueDate(e.target.value)} /></div>
              <div className="form-group"><label className="form-label" htmlFor="issue-notes">Notes (optional)</label><textarea id="issue-notes" className="form-input" rows="2" value={notes} onChange={e => setNotes(e.target.value)} placeholder="Any special notes..." /></div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button className="btn btn-secondary" onClick={() => setStep(1)}>Start Over</button>
            <motion.button className="btn btn-primary btn-lg" onClick={handleIssue} disabled={loading} whileTap={{ scale: 0.97 }}>
              {loading ? <SpinnerGap size={20} style={{ animation: 'spin 1s linear infinite' }} /> : <><CheckCircle size={20} weight="bold" /> Issue Book</>}
            </motion.button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
