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
  Gear
} from '@phosphor-icons/react';

const navItems = [
  { path: '/', label: 'Dashboard', icon: House },
  { path: '/books', label: 'Books', icon: Books },
  { path: '/categories', label: 'Categories', icon: Tag },
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
  const { user, logout } = useAuth();
  const location = useLocation();

  return (
    <motion.aside
      className="sidebar"
      animate={{ width: collapsed ? 72 : 260 }}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        height: '100dvh',
        background: 'var(--bg-surface)',
        borderRight: '1px solid var(--border)',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 100,
        overflow: 'hidden',
      }}
    >
      {/* Logo */}
      <div style={{
        padding: collapsed ? '1.25rem 0.75rem' : '1.25rem 1.25rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        borderBottom: '1px solid var(--border)',
        minHeight: '64px',
      }}>
        <div style={{
          width: 36,
          height: 36,
          borderRadius: 'var(--radius-md)',
          background: 'linear-gradient(135deg, var(--primary), var(--accent))',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}>
          <Books size={20} weight="bold" color="white" />
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
                fontFamily: 'var(--font-display)', 
                fontSize: '1.125rem',
                letterSpacing: '-0.02em',
                whiteSpace: 'nowrap',
                background: 'linear-gradient(135deg, var(--primary-light), var(--accent))',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}>
                LJKU Library
              </h4>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1, padding: '0.75rem', overflowY: 'auto' }}>
        <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
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
                    gap: '0.75rem',
                    padding: collapsed ? '0.625rem' : '0.625rem 0.875rem',
                    borderRadius: 'var(--radius-md)',
                    color: isActive ? 'var(--primary-light)' : 'var(--text-secondary)',
                    background: isActive ? 'rgba(99, 102, 241, 0.1)' : 'transparent',
                    transition: 'all 150ms ease',
                    textDecoration: 'none',
                    fontSize: '0.875rem',
                    fontWeight: isActive ? 600 : 400,
                    justifyContent: collapsed ? 'center' : 'flex-start',
                    position: 'relative',
                    cursor: 'pointer',
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.background = 'var(--glass-highlight)';
                      e.currentTarget.style.color = 'var(--text-primary)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.background = 'transparent';
                      e.currentTarget.style.color = 'var(--text-secondary)';
                    }
                  }}
                >
                  <Icon size={20} weight={isActive ? 'fill' : 'regular'} />
                  <AnimatePresence>
                    {!collapsed && (
                      <motion.span
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.15 }}
                        style={{ whiteSpace: 'nowrap' }}
                      >
                        {item.label}
                      </motion.span>
                    )}
                  </AnimatePresence>
                  {isActive && (
                    <motion.div
                      layoutId="sidebar-active-indicator"
                      style={{
                        position: 'absolute',
                        left: 0,
                        top: '50%',
                        transform: 'translateY(-50%)',
                        width: 3,
                        height: 20,
                        borderRadius: 'var(--radius-full)',
                        background: 'var(--primary)',
                      }}
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    />
                  )}
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User & Collapse */}
      <div style={{ 
        padding: '0.75rem', 
        borderTop: '1px solid var(--border)',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem',
      }}>
        {/* User info */}
        {!collapsed && user && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{
              padding: '0.625rem',
              borderRadius: 'var(--radius-md)',
              background: 'var(--glass-highlight)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
            }}
          >
            <div style={{
              width: 32,
              height: 32,
              borderRadius: 'var(--radius-full)',
              background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.8125rem',
              fontWeight: 700,
              color: 'white',
              flexShrink: 0,
            }}>
              {user.name?.charAt(0).toUpperCase()}
            </div>
            <div style={{ overflow: 'hidden' }}>
              <p style={{ 
                fontSize: '0.8125rem', 
                fontWeight: 600, 
                color: 'var(--text-primary)',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}>{user.name}</p>
              <p style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>{user.role}</p>
            </div>
          </motion.div>
        )}

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            onClick={logout}
            className="btn btn-ghost"
            style={{ 
              flex: collapsed ? 'none' : 1,
              justifyContent: collapsed ? 'center' : 'flex-start',
              color: 'var(--danger)',
            }}
            title="Logout"
          >
            <SignOut size={18} />
            {!collapsed && <span style={{ fontSize: '0.8125rem' }}>Logout</span>}
          </button>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="btn btn-ghost"
            style={{ padding: '0.5rem' }}
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <motion.div
              animate={{ rotate: collapsed ? 180 : 0 }}
              transition={{ duration: 0.3 }}
            >
              <CaretLeft size={16} />
            </motion.div>
          </button>
        </div>
      </div>
    </motion.aside>
  );
}
