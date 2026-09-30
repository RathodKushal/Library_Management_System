import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { reportsAPI } from '../services/api';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { ChartBar, TrendUp, Users, Books } from '@phosphor-icons/react';

const CHART_COLORS = ['var(--gold-light)', '#3b82f6', 'var(--gold)', '#1d4ed8', '#93c5fd', '#1e3a8a', '#60a5fa'];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload) return null;
  return (
    <div style={{
      background: 'var(--input-bg)',
      backdropFilter: 'blur(12px)',
      border: '1px solid var(--card-border)',
      borderRadius: '12px',
      padding: '1rem',
      boxShadow: '0 8px 32px rgba(0,0,0,0.3)'
    }}>
      <p style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--text-main)' }}>{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ fontSize: '0.8rem', color: p.color || 'var(--text-muted)', margin: '0.2rem 0' }}>
          {p.name}: <span style={{ fontWeight: 700, color: 'var(--text-main)' }}>{p.value}</span>
        </p>
      ))}
    </div>
  );
};

export default function Reports() {
  const [monthlyStats, setMonthlyStats] = useState([]);
  const [popularBooks, setPopularBooks] = useState([]);
  const [activeMembers, setActiveMembers] = useState([]);
  const [categoryDist, setCategoryDist] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [monthly, popular, active, cats] = await Promise.all([
          reportsAPI.getMonthlyStats(),
          reportsAPI.getPopularBooks(),
          reportsAPI.getActiveMembers(),
          reportsAPI.getCategoryDistribution(),
        ]);
        setMonthlyStats(monthly.data.data);
        setPopularBooks(popular.data.data);
        setActiveMembers(active.data.data);
        setCategoryDist(cats.data.data);
      } catch { /* ignore */ }
      finally { setLoading(false); }
    };
    load();
  }, []);

  const stagger = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } };
  const fadeUp = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.5 } } };

  return (
    <div className="folio-reports-page">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,100..900&family=Plus+Jakarta+Sans:wght@200..800&display=swap');

        .folio-reports-page {
          
          
          --navy-primary: #1f3a6e;
          --navy-mid: #2c4c8c;
          
          
          
          
          

          font-family: 'Plus Jakarta Sans', sans-serif;
          background: linear-gradient(135deg, var(--page-bg-start), var(--page-bg-end));
          border-radius: 24px;
          padding: 2.5rem;
          color: var(--text-main);
          min-height: calc(100vh - 6rem);
          position: relative;
          overflow: hidden;
        }

        .folio-reports-page::before {
          content: '';
          position: absolute; top: -10%; right: -5%;
          width: 50%; height: 50%;
          background: radial-gradient(circle, rgba(200,164,92,0.08) 0%, transparent 70%);
          pointer-events: none;
        }
        .folio-reports-page::after {
          content: '';
          position: absolute; bottom: -10%; left: -10%;
          width: 60%; height: 60%;
          background: radial-gradient(circle, rgba(31,58,110,0.4) 0%, transparent 70%);
          pointer-events: none;
        }

        .page-title {
          font-family: 'Fraunces', serif;
          font-size: 2rem; font-weight: 500;
          background: linear-gradient(135deg, var(--text-main), var(--gold));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          margin-bottom: 2rem;
          position: relative; z-index: 2;
        }

        .folio-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1.5rem;
          position: relative; z-index: 2;
        }
        @media (max-width: 1024px) {
          .folio-grid { grid-template-columns: 1fr; }
        }

        .folio-card {
          background: var(--card-bg);
          backdrop-filter: blur(24px) saturate(1.6);
          -webkit-backdrop-filter: blur(24px) saturate(1.6);
          border: 1px solid var(--card-border);
          border-radius: 20px;
          padding: 1.5rem;
          position: relative;
          overflow: hidden;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.25), inset 0 1px 0 rgba(255,255,255,0.07);
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        .folio-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 40px rgba(0, 0, 0, 0.3);
        }
        .folio-card::before {
          content: ''; position: absolute;
          top: 0; left: 0; right: 0; height: 1px;
          background: linear-gradient(90deg, transparent, rgba(200,164,92,0.6), transparent);
          opacity: 0.5;
        }

        .card-header {
          display: flex; align-items: center; gap: 0.75rem;
          margin-bottom: 1.5rem;
          font-family: 'Fraunces', serif; font-size: 1.25rem;
          color: var(--gold);
          border-bottom: 1px solid var(--sidebar-border);
          padding-bottom: 1rem;
        }

        /* Table */
        .folio-table-container { overflow-x: auto; }
        .folio-table { width: 100%; border-collapse: collapse; text-align: left; }
        .folio-table th {
          padding: 0.8rem 1rem; font-size: 0.75rem; font-weight: 600;
          text-transform: uppercase; letter-spacing: 0.05em; color: var(--gold);
          border-bottom: 1px solid var(--sidebar-border); background: var(--sidebar-hover);
        }
        .folio-table td {
          padding: 1rem; font-size: 0.9rem;
          border-bottom: 1px solid var(--sidebar-border); vertical-align: middle;
        }
        .folio-table tbody tr:hover td { background: rgba(255,255,255,0.03); }
        .folio-table tbody tr:last-child td { border-bottom: none; }

        .badge-count {
          background: rgba(200,164,92,0.15); color: var(--gold);
          padding: 0.25rem 0.6rem; border-radius: 8px; font-weight: 600; font-size: 0.8rem;
          border: 1px solid rgba(200,164,92,0.3);
        }
        .badge-fine {
          background: rgba(255,77,109,0.15); color: var(--danger);
          padding: 0.25rem 0.6rem; border-radius: 8px; font-weight: 600; font-size: 0.8rem;
          border: 1px solid rgba(255,77,109,0.3);
        }

        .folio-skeleton {
          background: linear-gradient(90deg, rgba(255,255,255,0.04) 25%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.04) 75%);
          background-size: 200% 100%; animation: shimmer 1.5s infinite;
          border-radius: 20px; height: 380px;
        }
        @keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
      `}</style>

      <h1 className="page-title">Reports & Analytics</h1>

      {loading ? (
        <div className="folio-grid">
          {[1,2,3,4].map(i => <div key={i} className="folio-skeleton" />)}
        </div>
      ) : (
        <motion.div className="folio-grid" variants={stagger} initial="hidden" animate="show">
          
          {/* Monthly Trends */}
          <motion.div variants={fadeUp} className="folio-card">
            <h4 className="card-header">
              <TrendUp size={24} weight="duotone" color="var(--gold)" />
              Monthly Trends
            </h4>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={monthlyStats} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--sidebar-border)" vertical={false} />
                <XAxis dataKey="month" stroke="var(--text-muted)" fontSize={11} tickMargin={10} />
                <YAxis stroke="var(--text-muted)" fontSize={11} tickMargin={10} />
                <Tooltip content={<CustomTooltip />} />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: '1rem', fontSize: '0.85rem', color: 'var(--text-muted)' }} />
                <Line type="monotone" dataKey="total_issues" name="Issues" stroke="var(--gold-light)" strokeWidth={3} dot={{ r: 4, fill: 'var(--page-bg-start)', strokeWidth: 2 }} activeDot={{ r: 6, fill: 'var(--gold-light)' }} />
                <Line type="monotone" dataKey="total_returns" name="Returns" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4, fill: 'var(--page-bg-start)', strokeWidth: 2 }} activeDot={{ r: 6, fill: '#3b82f6' }} />
              </LineChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Category Distribution */}
          <motion.div variants={fadeUp} className="folio-card">
            <h4 className="card-header">
              <Books size={24} weight="duotone" color="var(--gold)" />
              Collection Distribution
            </h4>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie 
                  data={categoryDist} dataKey="book_count" nameKey="name" 
                  cx="50%" cy="50%" innerRadius={70} outerRadius={110} 
                  paddingAngle={5}
                  label={({ name, percent }) => percent > 0.05 ? `${(percent * 100).toFixed(0)}%` : ''} 
                  labelLine={false}
                >
                  {categoryDist.map((entry, i) => (
                    <Cell key={i} fill={entry.color || CHART_COLORS[i % CHART_COLORS.length]} stroke="rgba(0,0,0,0.2)" strokeWidth={2} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend layout="vertical" verticalAlign="middle" align="right" iconType="circle" wrapperStyle={{ fontSize: '0.8rem', color: 'var(--text-muted)' }} />
              </PieChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Popular Books */}
          <motion.div variants={fadeUp} className="folio-card">
            <h4 className="card-header">
              <ChartBar size={24} weight="duotone" color="var(--gold)" />
              Most Popular Titles
            </h4>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={popularBooks.slice(0, 7)} layout="vertical" margin={{ top: 0, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--sidebar-border)" horizontal={false} />
                <XAxis type="number" stroke="var(--text-muted)" fontSize={11} allowDecimals={false} />
                <YAxis type="category" dataKey="title" stroke="var(--text-muted)" fontSize={11} width={150} tickMargin={10} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'var(--sidebar-hover)' }} />
                <Bar dataKey="issue_count" name="Times Issued" fill="var(--gold-light)" radius={[0, 6, 6, 0]}>
                  {popularBooks.slice(0, 7).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={CHART_COLORS[index % 2]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Active Students */}
          <motion.div variants={fadeUp} className="folio-card">
            <h4 className="card-header">
              <Users size={24} weight="duotone" color="var(--gold)" />
              Most Active Students
            </h4>
            <div className="folio-table-container">
              <table className="folio-table">
                <thead>
                  <tr>
                    <th>Student</th>
                    <th>Total Borrows</th>
                    <th>Current</th>
                    <th>Fines</th>
                  </tr>
                </thead>
                <tbody>
                  {activeMembers.slice(0, 5).map(m => (
                    <tr key={m.id}>
                      <td style={{ fontWeight: 500 }}>{m.name}</td>
                      <td><span className="badge-count">{m.total_borrows}</span></td>
                      <td style={{ color: 'var(--text-muted)' }}>{m.current_borrows || 0}</td>
                      <td>{m.total_fines > 0 ? <span className="badge-fine">₹{m.total_fines.toFixed(2)}</span> : <span style={{ color: 'rgba(255,255,255,0.2)' }}>—</span>}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>

        </motion.div>
      )}
    </div>
  );
}
