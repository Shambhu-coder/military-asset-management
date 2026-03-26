import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Login() {
  const { login } = useAuth();
  const navigate  = useNavigate();
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const result = await login(email, password);
    setLoading(false);
    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.message || 'Login failed. Please try again.');
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: 'var(--bg-base)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1.5rem',
    }}>

      {/* Card */}
      <div style={{
        width: '100%',
        maxWidth: 420,
        backgroundColor: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)',
        padding: '2.5rem 2rem',
        boxShadow: 'var(--shadow-lg)',
      }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>🪖</div>
          <h1 style={{
            fontFamily: 'var(--font-heading)',
            fontSize: '1.5rem',
            fontWeight: 700,
            color: 'var(--text-primary)',
            marginBottom: 6,
          }}>
            MilAsset Command
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            Sign in to access the system
          </p>
        </div>

        {/* Error */}
        {error && (
          <div style={{
            padding: '0.75rem 1rem',
            borderRadius: 8,
            backgroundColor: 'var(--red-bg)',
            border: '1px solid var(--red-border)',
            color: 'var(--red)',
            fontSize: '0.85rem',
            marginBottom: '1.25rem',
          }}>
            ⚠️ {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{
              display: 'block',
              color: 'var(--text-secondary)',
              fontSize: '0.82rem',
              fontWeight: 500,
              marginBottom: 6,
            }}>
              Email address
            </label>
            <input
              className="military-input"
              type="email"
              placeholder="you@military.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>

          <div style={{ marginBottom: '1.75rem' }}>
            <label style={{
              display: 'block',
              color: 'var(--text-secondary)',
              fontSize: '0.82rem',
              fontWeight: 500,
              marginBottom: 6,
            }}>
              Password
            </label>
            <input
              className="military-input"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary"
            style={{
              width: '100%',
              justifyContent: 'center',
              padding: '0.75rem',
              fontSize: '0.9rem',
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? '⏳  Signing in...' : '🔐  Sign In'}
          </button>
        </form>

        {/* Footer note */}
        <p style={{
          textAlign: 'center',
          color: 'var(--text-muted)',
          fontSize: '0.75rem',
          marginTop: '1.5rem',
        }}>
          Authorized personnel only
        </p>
      </div>
    </div>
  );
}