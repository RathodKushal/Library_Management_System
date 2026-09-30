import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { reportsAPI } from '../services/api';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { ChartBar, TrendUp, Users, Books } from '@phosphor-icons/react';

const CHART_COLORS = ['#6366F1', '#22D3EE', '#34D399', '#F59E0B', '#EC4899', '#8B5CF6', '#F97316', '#14B8A6', '#EF4444', '#84CC16'];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload) return null;
  return (
    <div style={{ background: 'var(--bg-surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '0.75rem', boxShadow: 'var(--shadow-md)' }}>
      <p style={{ fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.25rem' }}>{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ fontSize: '0.75rem', color: p.color }}>{p.name}: {p.value}</p>
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

  if (loading) return (
    <div className="page">
      <div className="page-header"><h1>Reports</h1></div>
      <div className="grid grid-cols-2 gap-6">{[1,2,3,4].map(i => <div key={i} className="skeleton" style={{ height: 340, borderRadius: 'var(--radius-lg)' }} />)}</div>
    </div>
  );

  return (
    <div className="page">
      <div className="page-header"><h1>Reports & Analytics</h1></div>

      <div className="grid grid-cols-2 gap-6">
        {/* Monthly Trends */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card">
          <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
            <TrendUp size={20} weight="duotone" color="var(--primary-light)" /> Monthly Trends
          </h4>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={monthlyStats}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="month" stroke="var(--text-dim)" fontSize={12} />
              <YAxis stroke="var(--text-dim)" fontSize={12} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Line type="monotone" dataKey="total_issues" name="Issues" stroke="#6366F1" strokeWidth={2} dot={{ r: 4 }} />
              <Line type="monotone" dataKey="total_returns" name="Returns" stroke="#22D3EE" strokeWidth={2} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Category Distribution */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="card">
          <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
            <Books size={20} weight="duotone" color="var(--accent)" /> Category Distribution
          </h4>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={categoryDist} dataKey="book_count" nameKey="name" cx="50%" cy="50%" outerRadius={100} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                {categoryDist.map((entry, i) => <Cell key={i} fill={entry.color || CHART_COLORS[i % CHART_COLORS.length]} />)}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Popular Books */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="card" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
            <ChartBar size={20} weight="duotone" color="var(--success)" /> Most Popular Books
          </h4>
          <div style={{ flex: 1, minHeight: 280 }}>
            <ResponsiveContainer width="100%" height="100%">
            <BarChart data={popularBooks.slice(0, 7)} layout="vertical" margin={{ top: 0, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis type="number" stroke="var(--text-dim)" fontSize={12} allowDecimals={false} />
              <YAxis type="category" dataKey="title" stroke="var(--text-dim)" fontSize={11} width={180} tick={{ fill: 'var(--text-secondary)' }} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="issue_count" name="Times Issued" fill="#6366F1" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Active Students */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="card">
          <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <Users size={20} weight="duotone" color="var(--warning)" /> Most Active Students
          </h4>
          <div className="table-container" style={{ border: 'none' }}>
            <table className="table">
              <thead>
                <tr><th>Student</th><th>Total Borrows</th><th>Current</th><th>Fines</th></tr>
              </thead>
              <tbody>
                {activeMembers.slice(0, 7).map(m => (
                  <tr key={m.id}>
                    <td style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{m.name}</td>
                    <td><span className="badge badge-primary">{m.total_borrows}</span></td>
                    <td>{m.current_borrows || 0}</td>
                    <td>{m.total_fines > 0 ? <span className="badge badge-danger">₹{m.total_fines.toFixed(2)}</span> : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
