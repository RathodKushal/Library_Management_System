import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import {
  House,
  Books,
  Users,
  ArrowsLeftRight,
  ChartBar,
  Tag,
  SignOut,
  CaretLeft,
  BookOpen,
  Warning,
  Gear,
  Sun,
  Moon
} from '@phosphor-icons/react';

const navItems = [
  { path: '/', label: 'Dashboard', icon: House },
  { path: '/books', label: 'Books', icon: Books },
  { path: '/categories', label: 'Collections', icon: Tag },
  { path: '/members', label: 'Students', icon: Users },
  { path: '/issue', label: 'Issue Book', icon: BookOpen },
  { path: '/return', label: 'Return Book', icon: ArrowsLeftRight },
  { path: '/transactions', label: 'Transactions', icon: ArrowsLeftRight },
  { path: '/overdue', label: 'Overdue', icon: Warning },
  { path: '/reports', label: 'Reports', icon: ChartBar },
  { path: '/settings', label: 'Settings', icon: Gear },
];

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [theme, setTheme] = useState(document.body.getAttribute('data-theme') || 'dark');
  const { user, logout } = useAuth();
  const location = useLocation();

  // Ensure body has the data-theme
  if (typeof document !== 'undefined') {
    document.body.setAttribute('data-theme', theme);
  }

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  return (
    <motion.aside
      className="sidebar"
      animate={{ width: collapsed ? 78 : 260 }}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        height: '100dvh',
        background: 'var(--sidebar-bg)',
        backdropFilter: 'blur(24px) saturate(2.0)',
        WebkitBackdropFilter: 'blur(24px) saturate(2.0)',
        borderRight: '1px solid var(--sidebar-border)',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 100,
        overflow: 'hidden',
        boxShadow: '4px 0 24px rgba(0,0,0,0.25)',
      }}
    >
      {/* Logo */}
      <div style={{
        padding: collapsed ? '1.25rem 0.75rem' : '1.25rem 1.25rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.85rem',
        borderBottom: '1px solid var(--sidebar-border)',
        minHeight: '72px',
      }}>
        <div style={{
          width: 38,
          height: 38,
          borderRadius: '12px',
          background: 'linear-gradient(135deg, #1f3a6e, #4a6aa8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          boxShadow: '0 4px 12px rgba(31,58,110,0.3), inset 0 1px 0 rgba(255,255,255,0.2)',
        }}>
          <Books size={22} weight="bold" color="white" />
        </div>
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
            >
              <h4 style={{ 
                fontFamily: '"Fraunces", serif', 
                fontSize: '1.25rem',
                fontWeight: 600,
                letterSpacing: '0.02em',
                whiteSpace: 'nowrap',
                background: 'linear-gradient(135deg, var(--text-main), var(--text-muted))',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                margin: 0
              }}>
                LJKU Library
              </h4>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1, padding: '1rem 0.75rem', overflowY: 'auto' }}>
        <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.35rem', padding: 0, margin: 0 }}>
          {navItems.map((item) => {
            const isActive = item.path === '/' 
              ? location.pathname === '/' 
              : location.pathname.startsWith(item.path);
            const Icon = item.icon;

            return (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.85rem',
                    padding: collapsed ? '0.75rem' : '0.75rem 1rem',
                    borderRadius: '12px',
                    color: isActive ? 'var(--text-main)' : 'var(--text-muted)',
                    background: isActive ? 'var(--sidebar-active-bg)' : 'transparent',
                    borderLeft: isActive ? '3px solid var(--gold)' : '3px solid transparent',
                    borderLeftWidth: collapsed ? 0 : (isActive ? 3 : 0),
                    transition: 'all 0.2s ease',
                    textDecoration: 'none',
                    fontSize: '0.9rem',
                    fontWeight: isActive ? 600 : 500,
                    justifyContent: collapsed ? 'center' : 'flex-start',
                    position: 'relative',
                    cursor: 'pointer',
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
                      e.currentTarget.style.color = 'var(--text-main)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.background = 'transparent';
                      e.currentTarget.style.color = 'var(--text-muted)';
                    }
                  }}
                >
                  <Icon size={22} weight={isActive ? 'duotone' : 'regular'} color={isActive ? 'var(--gold)' : 'var(--text-muted)'} />
                  <AnimatePresence>
                    {!collapsed && (
                      <motion.span
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0, transition: { duration: 0.1 } }}
                        style={{ whiteSpace: 'nowrap' }}
                      >
                        {item.label}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User & Collapse */}
      <div style={{ 
        padding: '1rem 0.75rem', 
        borderTop: '1px solid var(--sidebar-border)',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem',
        background: 'rgba(0,0,0,0.1)',
      }}>
        {/* User info */}
        <AnimatePresence>
          {!collapsed && user && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0, transition: { duration: 0.1 } }}
              style={{ overflow: 'hidden' }}
            >
              <div style={{
                padding: '0.75rem',
                borderRadius: '14px',
                background: 'var(--sidebar-hover)',
                border: '1px solid var(--sidebar-border)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
              }}>
                <div style={{
                  width: 34,
                  height: 34,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #1f3a6e, #4a6aa8)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  color: 'white',
                  flexShrink: 0,
                }}>
                  {user.name?.charAt(0).toUpperCase()}
                </div>
                <div style={{ overflow: 'hidden' }}>
                  <p style={{ 
                    fontSize: '0.85rem', 
                    fontWeight: 600, 
                    color: 'var(--text-main)',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    margin: 0
                  }}>{user.name}</p>
                  <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', margin: 0 }}>{user.role}</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div style={{ display: 'flex', gap: '0.5rem', flexDirection: collapsed ? 'column' : 'row' }}>
          <button
            onClick={logout}
            style={{ 
              flex: collapsed ? 'none' : 1,
              justifyContent: collapsed ? 'center' : 'flex-start',
              color: 'var(--danger)',
              display: 'flex', alignItems: 'center', gap: '0.5rem',
              padding: '0.65rem', borderRadius: '10px',
              border: '1px solid transparent', background: 'transparent',
              cursor: 'pointer', transition: 'all 0.2s',
              fontFamily: 'inherit', fontSize: '0.85rem'
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,77,109,0.1)'; e.currentTarget.style.borderColor = 'rgba(255,77,109,0.2)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'transparent'; }}
            title="Logout"
          >
            <SignOut size={20} />
            <AnimatePresence>
              {!collapsed && (
                <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, transition: { duration: 0.1 } }} style={{ whiteSpace: 'nowrap' }}>
                  Logout
                </motion.span>
              )}
            </AnimatePresence>
          </button>
          
          <button
            onClick={toggleTheme}
            style={{ 
              justifyContent: 'center', 
              padding: collapsed ? '0.65rem' : '0.65rem 0.5rem',
              display: 'flex', alignItems: 'center', gap: '0.5rem',
              borderRadius: '10px',
              border: '1px solid transparent', background: 'transparent',
              cursor: 'pointer', transition: 'all 0.2s',
              color: 'var(--text-muted)'
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--sidebar-hover)'; e.currentTarget.style.color = 'var(--text-main)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)'; }}
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>
      </div>
    </motion.aside>
  );
}
