import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, Loader, BookOpen } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import LibraryCanvasBackground from '../components/ui/LibraryCanvasBackground';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [isShake, setIsShake] = useState(false);
  const [theme, setTheme] = useState('dark');
  const navigate = useNavigate();
  const { login } = useAuth();

  useEffect(() => {
    // Initial theme check
    const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setTheme(isDark ? 'dark' : 'light');
  }, []);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    if (password.length < 6) {
      setError('Your password needs at least 6 characters.');
      setIsSubmitting(false);
      setIsShake(true);
      setTimeout(() => setIsShake(false), 500);
      return;
    }

    try {
      await login(email, password);
      toast.success('Welcome back to the Library!');
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password.');
      setIsShake(true);
      setTimeout(() => setIsShake(false), 500);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={`folio-app ${theme}`} data-theme={theme}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,100..900;1,9..144,100..900&family=Plus+Jakarta+Sans:ital,wght@0,200..800;1,200..800&display=swap');
        
        @property --gradient-angle {
          syntax: '<angle>';
          initial-value: 0deg;
          inherits: false;
        }

        @keyframes rotation {
          0% { --gradient-angle: 0deg; }
          100% { --gradient-angle: 360deg; }
        }

        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-10px); }
          75% { transform: translateX(10px); }
        }

        @keyframes flow {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        :root {
          /* Light Mode */
          --bg-start: #edf1f8;
          --bg-end: #f3eee3;
          --text-main: #0f1c3a;
          --text-muted: #56638a;
          --surface-input: #f1f4fa;
          --surface-card: rgba(255, 255, 255, 0.4);
          
          --navy-primary: #1f3a6e;
          --navy-deep: #12264f;
          --navy-mid: #2c4c8c;
          --navy-steel: #4a6aa8;
          --navy-periwinkle: #6d86bd;
          --navy-light: #8fa3c9;
          
          --gold: #c8a45c;
          --gold-light: #e3cb96;
          --gold-dark: #9a7a2e;
          
          --headline-gradient: linear-gradient(135deg, var(--navy-deep), var(--navy-primary));
          --card-border: rgba(255, 255, 255, 0.5);
          --input-shadow: inset 3px 3px 6px rgba(0,0,0,0.05), inset -3px -3px 6px rgba(255,255,255,0.8);
          --button-shadow: 4px 4px 10px rgba(0,0,0,0.1), -4px -4px 10px rgba(255,255,255,0.8);
        }

        [data-theme="dark"] {
          --bg-start: #0a1330;
          --bg-end: #14244d;
          --text-main: #f6f2e8;
          --text-muted: #a9b6d4;
          --surface-input: #12204a;
          --surface-card: rgba(10, 19, 48, 0.4);
          
          --headline-gradient: linear-gradient(135deg, #f0dba8, #a9c0f2, #c4d3f5);
          --card-border: rgba(255, 255, 255, 0.1);
          --input-shadow: inset 4px 4px 8px rgba(0,0,0,0.4), inset -2px -2px 6px rgba(255,255,255,0.05);
          --button-shadow: 4px 4px 12px rgba(0,0,0,0.5), -2px -2px 8px rgba(255,255,255,0.05);
          --gold-dark: #e3cb96; 
        }

        .folio-app {
          font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;
          background: linear-gradient(135deg, var(--bg-start), var(--bg-end));
          color: var(--text-main);
          min-height: 100vh;
          position: relative;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background 0.5s ease, color 0.5s ease;
        }

        .heading-font {
          font-family: 'Fraunces', serif;
        }

        .theme-toggle {
          position: absolute;
          top: 2rem;
          right: 2rem;
          z-index: 50;
          background: var(--surface-input);
          border: 1px solid var(--card-border);
          padding: 0.5rem 1rem;
          border-radius: 20px;
          color: var(--text-main);
          cursor: pointer;
          font-weight: 500;
          font-size: 0.875rem;
          box-shadow: var(--button-shadow);
          transition: all 0.2s;
        }
        .theme-toggle:hover {
          color: var(--gold);
        }

        /* Centered Layout */
        .layout-container {
          position: relative;
          z-index: 10;
          width: 100%;
          max-width: 430px;
          margin: 0 auto;
          padding: 2rem;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        /* Branding centered above card */
        .logo-container {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 2rem;
        }
        .logo-icon {
          color: var(--gold);
        }
        .logo-text {
          font-size: 2rem;
          font-weight: 700;
          color: var(--text-main);
        }

        /* Card */
        .login-card-wrapper {
          position: relative;
          width: 100%;
          border-radius: 24px;
          padding: 3px; 
          background: conic-gradient(from var(--gradient-angle), var(--navy-deep), var(--gold), var(--navy-steel), var(--navy-deep));
          animation: rotation 10s linear infinite;
          transition: transform 0.3s ease;
        }
        .login-card-wrapper:hover {
          transform: perspective(1000px) rotateX(2deg) rotateY(-2deg);
        }

        .login-card {
          background: var(--surface-card);
          backdrop-filter: blur(26px) saturate(1.6);
          -webkit-backdrop-filter: blur(26px) saturate(1.6);
          border-radius: 21px;
          padding: 2.5rem;
          height: 100%;
          box-shadow: inset 0 0 0 1px var(--card-border);
        }

        .login-card.shake {
          animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) both;
        }

        /* Inputs */
        .input-group {
          margin-bottom: 1.5rem;
        }
        .input-label {
          display: block;
          font-size: 0.875rem;
          font-weight: 600;
          margin-bottom: 0.5rem;
          color: var(--text-main);
        }
        .input-wrapper {
          position: relative;
        }
        .input-icon {
          position: absolute;
          left: 1rem;
          top: 50%;
          transform: translateY(-50%);
          color: var(--text-muted);
          width: 1.25rem;
          height: 1.25rem;
        }
        .neumorphic-input {
          width: 100%;
          padding: 1rem 1rem 1rem 3rem;
          background: var(--surface-input);
          border: none;
          border-radius: 12px;
          color: var(--text-main);
          font-family: inherit;
          font-size: 1rem;
          box-shadow: var(--input-shadow);
          transition: all 0.2s;
        }
        .neumorphic-input:focus {
          outline: none;
          box-shadow: var(--input-shadow), 0 0 0 2px var(--navy-primary), 0 0 0 3px var(--gold);
        }
        .eye-btn {
          position: absolute;
          right: 1rem;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
          padding: 0;
        }
        .eye-btn:hover {
          color: var(--text-main);
        }

        /* Options */
        .options-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
          font-size: 0.875rem;
        }
        .checkbox-label {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: var(--text-muted);
          cursor: pointer;
        }
        .custom-checkbox {
          width: 1.25rem;
          height: 1.25rem;
          border-radius: 4px;
          background: var(--surface-input);
          box-shadow: var(--input-shadow);
          display: flex;
          align-items: center;
          justify-content: center;
          color: transparent;
          transition: all 0.2s;
        }
        input[type="checkbox"]:checked + .custom-checkbox {
          color: var(--gold);
        }
        input[type="checkbox"]:focus + .custom-checkbox {
          box-shadow: var(--input-shadow), 0 0 0 2px var(--navy-primary);
        }
        .forgot-link {
          color: var(--gold-dark);
          text-decoration: none;
          font-weight: 600;
        }
        .forgot-link:hover {
          text-decoration: underline;
        }

        /* Buttons */
        .primary-btn {
          width: 100%;
          padding: 1rem;
          border-radius: 12px;
          border: none;
          color: white;
          font-weight: 600;
          font-size: 1rem;
          cursor: pointer;
          position: relative;
          overflow: hidden;
          box-shadow: var(--button-shadow);
          background: linear-gradient(90deg, var(--navy-primary), var(--navy-mid), var(--navy-deep), var(--navy-primary));
          background-size: 300% 100%;
          animation: flow 8s ease infinite;
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 0.5rem;
          transition: transform 0.1s;
        }
        .primary-btn:active {
          transform: scale(0.98);
        }
        .primary-btn:disabled {
          opacity: 0.8;
          cursor: not-allowed;
        }
        .primary-btn::after {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 50%;
          height: 100%;
          background: linear-gradient(to right, transparent, rgba(255,255,255,0.2), transparent);
          transform: skewX(-20deg);
          transition: 0.5s;
        }
        .primary-btn:hover:not(:disabled)::after {
          left: 150%;
        }

        .error-msg {
          background: rgba(231, 29, 54, 0.1);
          color: #e71d36;
          padding: 0.75rem;
          border-radius: 8px;
          font-size: 0.875rem;
          margin-bottom: 1.5rem;
          border: 1px solid rgba(231, 29, 54, 0.2);
          text-align: center;
        }
        [data-theme="dark"] .error-msg {
          color: #ff4d6d;
        }
      `}</style>

      <button className="theme-toggle" onClick={toggleTheme} aria-label="Toggle theme">
        {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
      </button>

      {/* 2D Canvas Background */}
      <LibraryCanvasBackground isDark={theme === 'dark'} />

      <div className="layout-container">
        
        {/* Centered Logo & Title */}
        <div className="logo-container heading-font">
          <BookOpen className="logo-icon" size={40} />
          <span className="logo-text">LJKU Library</span>
        </div>

        <div className={`login-card-wrapper ${isShake ? 'shake' : ''}`}>
          <div className="login-card">
            
            <div aria-live="polite">
              {error && <div className="error-msg">{error}</div>}
            </div>

            <form onSubmit={handleLogin}>
              <div className="input-group">
                <label className="input-label" htmlFor="email">Email Address</label>
                <div className="input-wrapper">
                  <Mail className="input-icon" />
                  <input
                    id="email"
                    type="email"
                    className="neumorphic-input"
                    placeholder="name@ljku.edu"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="input-group">
                <label className="input-label" htmlFor="password">Password</label>
                <div className="input-wrapper">
                  <Lock className="input-icon" />
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    className="neumorphic-input"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button 
                    type="button" 
                    className="eye-btn"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <div className="options-row">
                <label className="checkbox-label">
                  <div style={{ position: 'relative' }}>
                    <input type="checkbox" className="sr-only" style={{ opacity: 0, position: 'absolute', zIndex: -1 }} />
                    <div className="custom-checkbox">
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="2.5 6 5 8.5 9.5 3.5"></polyline>
                      </svg>
                    </div>
                  </div>
                  Keep me signed in
                </label>
              </div>

              <button type="submit" className="primary-btn" disabled={isSubmitting}>
                {isSubmitting ? (
                  <Loader className="animate-spin" size={20} />
                ) : (
                  'Sign in to my library'
                )}
              </button>
            </form>

          </div>
        </div>
      </div>
    </div>
  );
}
