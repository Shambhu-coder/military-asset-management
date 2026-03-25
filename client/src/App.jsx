import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import Login from './pages/Login.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Purchases from './pages/Purchases.jsx';
import Transfers from './pages/Transfers.jsx';
import Assignments from './pages/Assignments.jsx';
import Layout from './components/Layout.jsx';

const ProtectedRoute = ({ children, roles }) => {
  const { isLoggedIn, user } = useAuth();
  if (!isLoggedIn) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user?.role)) return <Navigate to="/dashboard" replace />;
  return children;
};

const PublicRoute = ({ children }) => {
  const { isLoggedIn } = useAuth();
  return isLoggedIn ? <Navigate to="/dashboard" replace /> : children;
};

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route path="dashboard"   element={<Dashboard />} />
        <Route path="purchases"   element={<Purchases />} />
        <Route path="transfers"   element={<Transfers />} />
        <Route path="assignments" element={<Assignments />} />
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#1a3a2a',
              color: '#e2e8f0',
              border: '1px solid rgba(74,222,128,0.3)',
              fontFamily: 'Inter, sans-serif',
            },
            success: { iconTheme: { primary: '#4ade80', secondary: '#0a0f0d' } },
            error:   { iconTheme: { primary: '#ef4444', secondary: '#0a0f0d' } },
          }}
        />
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;