import { createContext, useContext, useState, useEffect } from 'react';
import API from '../api/axios';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user,    setUser]    = useState(null);
  const [token,   setToken]   = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    const savedUser  = localStorage.getItem('user');
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const res = await API.post('/auth/login', { email, password });
      const { token, user } = res.data;
      setToken(token);
      setUser(user);
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      toast.success(`Welcome back, ${user.name}! 🪖`);
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed';
      toast.error(message);
      return { success: false, message };
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    toast.success('Logged out successfully');
  };

  const hasRole = (...roles) => user && roles.includes(user.role);

  const value = {
    user, token, loading, login, logout, hasRole,
    isAdmin:             user?.role === 'admin',
    isCommander:         user?.role === 'base_commander',
    isLogisticsOfficer:  user?.role === 'logistics_officer',
    isLoggedIn:          !!user,
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center"
           style={{ backgroundColor: '#0a0f0d' }}>
        <div style={{ color: '#4ade80', fontFamily: 'Orbitron, monospace',
                      fontSize: '1.2rem', letterSpacing: '0.2em' }}
             className="animate-pulse">
          ⚡ INITIALIZING SYSTEM...
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider');
  return context;
};

export default AuthContext;