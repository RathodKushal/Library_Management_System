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

  const stagger = { show: { transition: { staggerChildren: 0.1 } } };
  const fadeUp = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

  return (
    <div className="folio-settings-page">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,100..900&family=Plus+Jakarta+Sans:wght@200..800&display=swap');

        .folio-settings-page {
          
          
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

        .folio-settings-page::before {
          content: ''; position: absolute; top: -15%; right: -10%;
          width: 50%; height: 50%;
          background: radial-gradient(circle, rgba(200,164,92,0.08) 0%, transparent 70%);
          pointer-events: none;
        }
        .folio-settings-page::after {
          content: ''; position: absolute; bottom: -10%; left: -10%;
          width: 60%; height: 60%;
          background: radial-gradient(circle, rgba(31,58,110,0.4) 0%, transparent 70%);
          pointer-events: none;
        }

        .page-title {
          font-family: 'Fraunces', serif;
          font-size: 2rem; font-weight: 500;
          display: flex; align-items: center; gap: 0.75rem;
          background: linear-gradient(135deg, var(--text-main), var(--gold));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          margin-bottom: 2.5rem; position: relative; z-index: 2;
        }

        .folio-card {
          background: var(--card-bg);
          backdrop-filter: blur(24px) saturate(1.6);
          -webkit-backdrop-filter: blur(24px) saturate(1.6);
          border: 1px solid var(--card-border);
          border-radius: 20px; padding: 2rem; margin-bottom: 1.5rem;
          position: relative; overflow: hidden;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.25), inset 0 1px 0 rgba(255,255,255,0.07);
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        .folio-card::before {
          content: ''; position: absolute; top: 0; left: 0; right: 0; height: 1px;
          background: linear-gradient(90deg, transparent, rgba(200,164,92,0.6), transparent);
          opacity: 0.5;
        }
        .folio-card:hover { box-shadow: 0 12px 40px rgba(0,0,0,0.3); }

        .card-header {
          display: flex; align-items: center; gap: 0.75rem;
          margin-bottom: 2rem;
          font-family: 'Fraunces', serif; font-size: 1.35rem; color: var(--gold);
        }

        .folio-form-group { margin-bottom: 2rem; }
        .folio-form-label {
          display: block; font-size: 0.85rem; font-weight: 600;
          color: var(--gold); text-transform: uppercase; letter-spacing: 0.05em;
          margin-bottom: 0.5rem;
        }
        .folio-input-wrap { position: relative; }
        .folio-input-icon {
          position: absolute; left: 1rem; top: 50%; transform: translateY(-50%);
          color: var(--text-muted); opacity: 0.8; pointer-events: none;
        }
        .folio-input {
          width: 100%; box-sizing: border-box;
          background: var(--input-bg); border: 1px solid rgba(200,164,92,0.25);
          border-radius: 12px; padding: 0.8rem 1rem 0.8rem 2.85rem;
          color: var(--text-main); font-family: inherit; font-size: 1rem;
          outline: none; transition: all 0.2s;
        }
        .folio-input:focus { border-color: var(--gold); box-shadow: 0 0 0 3px rgba(200,164,92,0.12); }
        .folio-hint { font-size: 0.8rem; color: var(--text-muted); margin-top: 0.5rem; line-height: 1.4; }

        .folio-save-btn {
          display: flex; justify-content: center; align-items: center; gap: 0.6rem;
          width: 100%; padding: 0.9rem;
          background: linear-gradient(135deg, var(--navy-primary), var(--navy-mid));
          border: 1px solid rgba(200,164,92,0.35); border-radius: 12px;
          color: #e3cb96; font-family: inherit; font-weight: 700; font-size: 1rem;
          cursor: pointer; transition: all 0.2s; box-shadow: 0 4px 16px rgba(0,0,0,0.25);
        }
        .folio-save-btn:hover:not(:disabled) { border-color: #e3cb96; color: #e3cb96; box-shadow: 0 6px 24px rgba(200,164,92,0.2); }
        .folio-save-btn:disabled { opacity: 0.7; cursor: not-allowed; }

        .folio-danger-card {
          background: rgba(255,77,109,0.03); border: 1px solid rgba(255,77,109,0.2);
          border-left: 4px solid var(--danger);
        }
        .folio-danger-card::before { display: none; }
        
        .folio-danger-btn {
          padding: 0.75rem 1.25rem;
          background: rgba(255,77,109,0.1); border: 1px solid rgba(255,77,109,0.3);
          border-radius: 12px; color: var(--danger);
          font-family: inherit; font-weight: 600; font-size: 0.95rem; cursor: pointer; transition: all 0.2s;
        }
        .folio-danger-btn:hover:not(:disabled) { background: var(--danger); color: white; }

        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      <h1 className="page-title">
        <Gear size={32} weight="duotone" color="var(--gold)" />
        System Settings
      </h1>

      {loading ? (
        <div style={{ maxWidth: 650, position: 'relative', zIndex: 2 }}>
          <div style={{ height: 250, background: 'rgba(255,255,255,0.05)', borderRadius: 20, animation: 'pulse 2s infinite' }} />
        </div>
      ) : (
        <motion.div variants={stagger} initial="hidden" animate="show" style={{ maxWidth: 650, position: 'relative', zIndex: 2 }}>
          
          <motion.div variants={fadeUp} className="folio-card">
            <h4 className="card-header">
              <CurrencyInr size={24} weight="duotone" color="var(--gold)" /> 
              Fine Configuration
            </h4>
            
            <form onSubmit={handleSave}>
              <div className="folio-form-group">
                <label className="folio-form-label" htmlFor="daily-fine">Daily Fine Amount (₹)</label>
                <div className="folio-input-wrap">
                  <CurrencyInr size={20} className="folio-input-icon" />
                  <input
                    id="daily-fine"
                    type="number"
                    step="0.01"
                    min="0"
                    className="folio-input"
                    value={settings.daily_fine_amount || ''}
                    onChange={(e) => setSettings({ ...settings, daily_fine_amount: e.target.value })}
                    required
                  />
                </div>
                <p className="folio-hint">
                  This amount will be charged per day when a student returns an overdue book.
                </p>
              </div>

              <div className="folio-form-group">
                <label className="folio-form-label" htmlFor="low-stock">Low Stock Threshold</label>
                <div className="folio-input-wrap">
                  <Books size={20} className="folio-input-icon" />
                  <input
                    id="low-stock"
                    type="number"
                    min="0"
                    step="1"
                    className="folio-input"
                    value={settings.low_stock_threshold || ''}
                    onChange={(e) => setSettings({ ...settings, low_stock_threshold: e.target.value })}
                    required
                  />
                </div>
                <p className="folio-hint">
                  Books with available copies less than or equal to this number will trigger a low stock alert on the dashboard.
                </p>
              </div>

              <button type="submit" className="folio-save-btn" disabled={saving}>
                {saving ? <SpinnerGap size={20} className="spin" /> : <><FloppyDisk size={20} weight="bold" /> Save Settings</>}
              </button>
            </form>
          </motion.div>

          <motion.div variants={fadeUp} className="folio-card folio-danger-card">
            <h4 className="card-header" style={{ color: 'var(--danger)', borderBottomColor: 'rgba(255,77,109,0.2)', marginBottom: '1.5rem' }}>
              <Warning size={24} weight="duotone" /> 
              Danger Zone
            </h4>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ paddingRight: '2rem' }}>
                <p style={{ fontWeight: 600, fontSize: '1rem', color: 'var(--text-main)', marginBottom: '0.25rem' }}>Reset Total Fines</p>
                <p className="folio-hint" style={{ marginTop: 0 }}>This will clear the entire history of collected fines, bringing the total back to 0. This action cannot be undone.</p>
              </div>
              <button type="button" className="folio-danger-btn" onClick={handleResetFines} disabled={resetting}>
                {resetting ? <SpinnerGap size={20} className="spin" /> : 'Reset Fines'}
              </button>
            </div>
          </motion.div>

        </motion.div>
      )}
    </div>
  );
}
