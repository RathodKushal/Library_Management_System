import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { settingsAPI } from '../services/api';
import toast from 'react-hot-toast';
import { Gear, CurrencyInr, SpinnerGap, FloppyDisk, Books, Warning } from '@phosphor-icons/react';

export default function Settings() {
  const [settings, setSettings] = useState({ daily_fine_amount: '1.00', low_stock_threshold: '1' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [resetting, setResetting] = useState(false);

  const handleResetFines = async () => {
    if (!window.confirm('Are you sure you want to reset all collected fines to 0? This cannot be undone.')) return;
    setResetting(true);
    try {
      await settingsAPI.resetFines();
      toast.success('Total fines have been reset to 0');
    } catch (err) {
      toast.error('Failed to reset fines');
    } finally {
      setResetting(false);
    }
  };

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await settingsAPI.get();
        if (res.data.data) {
          setSettings(prev => ({ ...prev, ...res.data.data }));
        }
      } catch (err) {
        toast.error('Failed to load settings');
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await settingsAPI.update(settings);
      toast.success('Settings updated successfully!');
    } catch (err) {
      toast.error('Failed to update settings');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Gear size={28} weight="duotone" color="var(--primary-light)" /> Settings
        </h1>
      </div>

      {loading ? (
        <div className="skeleton" style={{ height: 200, borderRadius: 'var(--radius-lg)', maxWidth: 600 }} />
      ) : (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ maxWidth: 600 }}>
          <div className="card">
            <h4 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <CurrencyInr size={20} color="var(--warning)" /> Fine Configuration
            </h4>
            
            <form onSubmit={handleSave}>
              <div className="form-group" style={{ marginBottom: '2rem' }}>
                <label className="form-label" htmlFor="daily-fine">Daily Fine Amount (₹)</label>
                <div style={{ position: 'relative' }}>
                  <CurrencyInr size={18} style={{
                    position: 'absolute', left: '0.875rem', top: '50%',
                    transform: 'translateY(-50%)', color: 'var(--text-dim)', pointerEvents: 'none'
                  }} />
                  <input
                    id="daily-fine"
                    type="number"
                    step="0.01"
                    min="0"
                    className="form-input"
                    style={{ paddingLeft: '2.75rem' }}
                    value={settings.daily_fine_amount || ''}
                    onChange={(e) => setSettings({ ...settings, daily_fine_amount: e.target.value })}
                    required
                  />
                </div>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                  This amount will be charged per day when a student returns an overdue book.
                </p>
              </div>

              <div className="form-group" style={{ marginBottom: '2.5rem' }}>
                <label className="form-label" htmlFor="low-stock">Low Stock Notification Threshold</label>
                <div style={{ position: 'relative' }}>
                  <Books size={18} style={{
                    position: 'absolute', left: '0.875rem', top: '50%',
                    transform: 'translateY(-50%)', color: 'var(--text-dim)', pointerEvents: 'none'
                  }} />
                  <input
                    id="low-stock"
                    type="number"
                    min="0"
                    step="1"
                    className="form-input"
                    style={{ paddingLeft: '2.75rem' }}
                    value={settings.low_stock_threshold || ''}
                    onChange={(e) => setSettings({ ...settings, low_stock_threshold: e.target.value })}
                    required
                  />
                </div>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                  Books with available copies less than or equal to this number will trigger a low stock alert on the dashboard.
                </p>
              </div>

              <motion.button 
                type="submit" 
                className="btn btn-primary" 
                disabled={saving}
                whileTap={{ scale: 0.97 }}
                style={{ width: '100%', justifyContent: 'center' }}
              >
                {saving ? (
                  <SpinnerGap size={18} style={{ animation: 'spin 1s linear infinite' }} />
                ) : (
                  <><FloppyDisk size={18} weight="bold" /> Save Settings</>
                )}
              </motion.button>
            </form>
          </div>

          <div className="card" style={{ marginTop: '1.5rem', border: '1px solid rgba(248, 113, 113, 0.3)', background: 'linear-gradient(to right, rgba(248, 113, 113, 0.05), transparent)' }}>
            <h4 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--danger)' }}>
              <Warning size={20} weight="fill" /> Danger Zone
            </h4>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <p style={{ fontWeight: 500, fontSize: '0.9375rem', color: 'var(--text-primary)' }}>Reset Total Fines</p>
                <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>This will clear the entire history of collected fines, bringing the total back to 0.</p>
              </div>
              <motion.button 
                type="button" 
                className="btn btn-danger"
                onClick={handleResetFines}
                disabled={resetting}
                whileTap={{ scale: 0.97 }}
              >
                {resetting ? <SpinnerGap size={18} style={{ animation: 'spin 1s linear infinite' }} /> : 'Reset Fines'}
              </motion.button>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
