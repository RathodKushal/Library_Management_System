import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { reportsAPI } from '../services/api';
import { Books, Users, ArrowsLeftRight, Warning, TrendUp, CurrencyInr, Tag, ChartBar } from '@phosphor-icons/react';

const stagger = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } };
const fadeUp = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] } } };

function AnimatedCounter({ value, duration = 1.5, prefix = '' }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let start = 0;
    const end = Number(value) || 0;
    if (end === 0) { setCount(0); return; }
    const step = Math.ceil(end / (duration * 60));
    const timer = setInterval(() => {
      start += step;
      if (start >= end) { setCount(end); clearInterval(timer); }
      else setCount(start);
    }, 1000 / 60);
    return () => clearInterval(timer);
  }, [value, duration]);
  return <span>{prefix}{count}</span>;
}

function StatCard({ icon: Icon, label, value, prefix = '' }) {
  return (
    <motion.div variants={fadeUp} className="folio-card stat-card-hover stat-card-layout">
      <div className="stat-icon-wrapper">
        <Icon size={24} weight="duotone" color="var(--gold)" />
      </div>
      <div>
        <div className="stat-value heading-font"><AnimatedCounter value={value} prefix={prefix} /></div>
        <div className="stat-label">{label}</div>
      </div>
      {/* Decorative background glow */}
      <div className="card-glow"></div>
    </motion.div>
  );
}

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await reportsAPI.getDashboard();
        setData(res.data.data);
      } catch (err) {
        console.error('Dashboard fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', minHeight: '60vh' }}>
        <div className="animate-spin" style={{ width: 40, height: 40, border: '3px solid rgba(200, 164, 92, 0.2)', borderTopColor: '#c8a45c', borderRadius: '50%' }}></div>
      </div>
    );
  }

  const stats = data?.stats || {};

  return (
    <div className="folio-dashboard">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,100..900;1,9..144,100..900&family=Plus+Jakarta+Sans:ital,wght@0,200..800;1,200..800&display=swap');
        
        .folio-dashboard {
          --navy-primary: #1f3a6e;
          --navy-deep: #12264f;
          --navy-steel: #4a6aa8;
          --gold: #c8a45c;
          --gold-light: #e3cb96;
          --text-main: #f6f2e8;
          --text-muted: #a9b6d4;
          --card-bg: rgba(18, 38, 79, 0.5);
          --card-border: rgba(200, 164, 92, 0.2);
          
          font-family: 'Plus Jakarta Sans', sans-serif;
          background: linear-gradient(135deg, #0a1330, #14244d);
          border-radius: 24px;
          padding: 2.5rem;
          color: var(--text-main);
          box-shadow: 0 20px 40px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.05);
          position: relative;
          overflow: hidden;
          min-height: calc(100vh - 6rem);
        }

        /* Ambient Background Glows */
        .folio-dashboard::before {
          content: '';
          position: absolute;
          top: -10%; left: -10%;
          width: 50%; height: 50%;
          background: radial-gradient(circle, rgba(200, 164, 92, 0.1) 0%, transparent 70%);
          pointer-events: none;
        }
        .folio-dashboard::after {
          content: '';
          position: absolute;
          bottom: -10%; right: -10%;
          width: 60%; height: 60%;
          background: radial-gradient(circle, rgba(31, 58, 110, 0.4) 0%, transparent 70%);
          pointer-events: none;
        }

        .heading-font {
          font-family: 'Fraunces', serif;
        }

        .dashboard-header {
          margin-bottom: 3rem;
          position: relative;
          z-index: 2;
        }
        .dashboard-title {
          font-size: 2.5rem;
          font-weight: 500;
          color: var(--gold-light);
          margin-bottom: 0.5rem;
          background: linear-gradient(135deg, #f0dba8, #c8a45c);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .dashboard-subtitle {
          color: var(--text-muted);
          font-size: 1.1rem;
        }

        .folio-card {
          background: var(--card-bg);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 1px solid var(--card-border);
          border-radius: 20px;
          padding: 1.5rem;
          position: relative;
          overflow: hidden;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
          z-index: 2;
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        .folio-card::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0; height: 1px;
          background: linear-gradient(90deg, transparent, var(--gold), transparent);
          opacity: 0.3;
        }
        
        .stat-card-layout {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1.25rem;
        }

        .stat-card-hover:hover {
          transform: translateY(-5px);
          box-shadow: 0 12px 40px rgba(0, 0, 0, 0.25);
        }
        .stat-card-hover:hover .card-glow {
          opacity: 1;
        }
        
        .card-glow {
          position: absolute;
          bottom: -20px; right: -20px;
          width: 100px; height: 100px;
          background: radial-gradient(circle, rgba(200, 164, 92, 0.15) 0%, transparent 70%);
          opacity: 0;
          transition: opacity 0.5s ease;
          pointer-events: none;
        }

        .stat-icon-wrapper {
          background: rgba(200, 164, 92, 0.1);
          border: 1px solid rgba(200, 164, 92, 0.2);
          border-radius: 12px;
          padding: 0.75rem;
          display: inline-flex;
          flex-shrink: 0;
          box-shadow: inset 0 2px 4px rgba(255,255,255,0.05);
        }
        .stat-value {
          font-size: 1.75rem;
          font-weight: 600;
          color: var(--text-main);
          margin-bottom: 0.125rem;
          line-height: 1.1;
        }
        .stat-label {
          font-size: 0.8rem;
          color: var(--text-muted);
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        /* Table */
        .folio-table-container {
          overflow-x: auto;
          margin-top: 1rem;
        }
        .folio-table {
          width: 100%;
          border-collapse: collapse;
        }
        .folio-table th {
          text-align: left;
          padding: 1rem;
          color: var(--text-muted);
          font-weight: 600;
          font-size: 0.8rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          border-bottom: 1px solid var(--card-border);
        }
        .folio-table td {
          padding: 1.25rem 1rem;
          color: var(--text-main);
          border-bottom: 1px solid rgba(255,255,255,0.03);
          font-size: 0.95rem;
        }
        .folio-table tr:hover td {
          background: rgba(255,255,255,0.02);
        }
        
        .folio-badge {
          padding: 0.35rem 0.75rem;
          border-radius: 100px;
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .folio-badge-warning {
          background: rgba(200, 164, 92, 0.15);
          color: var(--gold-light);
          border: 1px solid rgba(200, 164, 92, 0.3);
        }
        .folio-badge-success {
          background: rgba(74, 106, 168, 0.2);
          color: #a9c0f2;
          border: 1px solid rgba(74, 106, 168, 0.4);
        }
        .folio-badge-danger {
          background: rgba(231, 29, 54, 0.15);
          color: #ff4d6d;
          border: 1px solid rgba(231, 29, 54, 0.3);
        }

        .card-header {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 1.5rem;
          font-size: 1.25rem;
          color: var(--gold-light);
          border-bottom: 1px solid rgba(255,255,255,0.05);
          padding-bottom: 1rem;
        }
        
        .grid-container {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1.5rem;
          margin-bottom: 2rem;
          position: relative;
          z-index: 2;
        }
        
        .grid-2-col {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 1.5rem;
          position: relative;
          z-index: 2;
        }

        @media (max-width: 1024px) {
          .grid-container { grid-template-columns: repeat(2, 1fr); }
          .grid-2-col { grid-template-columns: 1fr; }
        }
        @media (max-width: 640px) {
          .grid-container { grid-template-columns: 1fr; }
        }
      `}</style>



      {/* KPI Cards Row 1 */}
      <motion.div className="grid-container" variants={stagger} initial="hidden" animate="show">
        <StatCard icon={Books} label="Total Titles" value={stats.totalBooks} />
        <StatCard icon={Users} label="Registered Students" value={stats.totalMembers} />
        <StatCard icon={ArrowsLeftRight} label="Active Issues" value={stats.activeIssues} />
        <StatCard icon={Warning} label="Overdue Books" value={stats.overdueBooks} />
      </motion.div>

      {/* KPI Cards Row 2 */}
      <motion.div className="grid-container" variants={stagger} initial="hidden" animate="show">
        <StatCard icon={TrendUp} label="Total Transactions" value={stats.totalTransactions} />
        <StatCard icon={Tag} label="Collections" value={stats.totalCategories} />
        <StatCard icon={Users} label="Active Readers" value={stats.activeMembers} />
        <StatCard icon={CurrencyInr} label="Fines Collected" value={(stats.totalFines || 0).toFixed(0)} prefix="₹" />
      </motion.div>

      <div className="grid-2-col">
        {/* Recent Transactions */}
        <motion.div variants={fadeUp} initial="hidden" animate="show" className="folio-card">
          <h4 className="card-header heading-font">
            <ArrowsLeftRight size={24} weight="duotone" color="var(--gold)" />
            Recent Activity
          </h4>
          <div className="folio-table-container">
            <table className="folio-table">
              <thead>
                <tr>
                  <th>Book Title</th>
                  <th>Student Name</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {(data?.recentTransactions || []).slice(0, 6).map((t) => (
                  <tr key={t.id}>
                    <td style={{ fontWeight: 500 }}>{t.book_title}</td>
                    <td style={{ color: 'var(--text-muted)' }}>{t.member_name}</td>
                    <td>
                      <span className={`folio-badge ${t.status === 'issued' ? 'folio-badge-warning' : 'folio-badge-success'}`}>
                        {t.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Low Stock & Overdue */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          <motion.div variants={fadeUp} initial="hidden" animate="show" className="folio-card">
            <h4 className="card-header heading-font">
              <Warning size={24} weight="duotone" color="var(--gold)" />
              Low Stock Alert
            </h4>
            {(data?.lowStockBooks || []).length === 0 ? (
              <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                All collections are currently well stocked.
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '250px', overflowY: 'auto', paddingRight: '0.5rem' }}>
                {data.lowStockBooks.map(b => (
                  <div key={b.id} style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '0.75rem 1rem', borderRadius: '12px',
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.05)'
                  }}>
                    <span style={{ fontSize: '0.95rem', fontWeight: 500 }}>{b.title}</span>
                    <span className="folio-badge folio-badge-danger">{b.available_copies} / {b.total_copies}</span>
                  </div>
                ))}
              </div>
            )}
          </motion.div>

          <motion.div variants={fadeUp} initial="hidden" animate="show" className="folio-card" style={{
            background: 'linear-gradient(135deg, rgba(200, 164, 92, 0.1), rgba(18, 38, 79, 0.4))',
            borderColor: 'rgba(200, 164, 92, 0.3)'
          }}>
            <h4 className="card-header heading-font" style={{ borderBottom: 'none', marginBottom: '0.5rem', color: 'var(--text-main)' }}>
              <ChartBar size={24} weight="duotone" color="var(--gold)" />
              Library Status
            </h4>
            <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)', lineHeight: 1.7 }}>
              The archives currently house <strong style={{ color: 'var(--gold-light)' }}>{stats.totalBooks}</strong> curated titles across{' '}
              <strong style={{ color: 'var(--gold-light)' }}>{stats.totalCategories}</strong> distinct collections, serving{' '}
              <strong style={{ color: 'var(--gold-light)' }}>{stats.activeMembers}</strong> active readers.
              {stats.overdueBooks > 0 && (
                <span style={{ color: '#ff4d6d', display: 'block', marginTop: '0.75rem', fontWeight: 500 }}>
                  Attention: {stats.overdueBooks} book(s) are currently overdue.
                </span>
              )}
            </p>
          </motion.div>

        </div>
      </div>
    </div>
  );
}
