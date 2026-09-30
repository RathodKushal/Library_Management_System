import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Suspense, lazy } from 'react';
import { SpinnerGap } from '@phosphor-icons/react';

// Layout
import DashboardLayout from './components/layout/DashboardLayout';

// Pages
const Login = lazy(() => import('./pages/Login'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Books = lazy(() => import('./pages/Books'));
const Categories = lazy(() => import('./pages/Categories'));
const Members = lazy(() => import('./pages/Members'));
const IssueBook = lazy(() => import('./pages/IssueBook'));
const ReturnBook = lazy(() => import('./pages/ReturnBook'));
const Transactions = lazy(() => import('./pages/Transactions'));
const Overdue = lazy(() => import('./pages/Overdue'));
const Reports = lazy(() => import('./pages/Reports'));
const Settings = lazy(() => import('./pages/Settings'));

// Protected Route Wrapper
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div style={{ display: 'flex', height: '100dvh', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-deep)' }}>
        <SpinnerGap size={32} color="var(--primary)" style={{ animation: 'spin 1s linear infinite' }} />
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

// Loading fallback for Suspense
const PageLoader = () => (
  <div style={{ display: 'flex', height: '100%', minHeight: '60vh', alignItems: 'center', justifyContent: 'center' }}>
    <SpinnerGap size={24} color="var(--primary)" style={{ animation: 'spin 1s linear infinite' }} />
  </div>
);

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/login" element={<Login />} />
            
            <Route path="/" element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }>
              <Route index element={<Dashboard />} />
              <Route path="books" element={<Books />} />
              <Route path="categories" element={<Categories />} />
              <Route path="members" element={<Members />} />
              <Route path="issue" element={<IssueBook />} />
              <Route path="return" element={<ReturnBook />} />
              <Route path="transactions" element={<Transactions />} />
              <Route path="overdue" element={<Overdue />} />
              <Route path="reports" element={<Reports />} />
              <Route path="settings" element={<Settings />} />
            </Route>
            
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
      
      {/* Toast Notifications */}
      <Toaster 
        position="top-right"
        toastOptions={{
          style: {
            background: 'var(--bg-surface-2)',
            color: 'var(--text-primary)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-md)',
            boxShadow: 'var(--shadow-md)',
            fontSize: '0.875rem'
          },
          success: {
            iconTheme: { primary: 'var(--success)', secondary: '#fff' }
          },
          error: {
            iconTheme: { primary: 'var(--danger)', secondary: '#fff' }
          }
        }}
      />
    </AuthProvider>
  );
}

export default App;
