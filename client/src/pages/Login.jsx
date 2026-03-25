import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { FiMail, FiLock, FiEye, FiEyeOff, FiShield } from 'react-icons/fi';
import { GiMilitaryFort, GiCrossedSwords, GiTank, GiBullets } from 'react-icons/gi';

const FloatingIcon = ({ Icon, style }) => (
  <motion.div
    style={style}
    animate={{ y: [0, -20, 0], rotate: [0, 5, -5, 0], opacity: [0.08, 0.15, 0.08] }}
    transition={{ duration: 6 + Math.random() * 4, repeat: Infinity, ease: 'easeInOut' }}
    className="absolute text-green-400 pointer-events-none"
  >
    <Icon size={style.fontSize || 48} />
  </motion.div>
);

const StatBadge = ({ label, value, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.6 }}
    className="flex flex-col items-center p-3 rounded-lg"
    style={{ background: 'rgba(74,222,128,0.08)', border: '1px solid rgba(74,222,128,0.2)' }}
  >
    <span style={{ fontFamily: 'Orbitron, monospace', color: '#4ade80', fontSize: '1.3rem', fontWeight: 700 }}>
      {value}
    </span>
    <span style={{ color: '#94a3b8', fontSize: '0.65rem', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
      {label}
    </span>
  </motion.div>
);

export default function Login() {
  const [email,       setEmail]       = useState('');
  const [password,    setPassword]    = useState('');
  const [showPass,    setShowPass]    = useState(false);
  const [loading,     setLoading]     = useState(false);
  const [focusedField, setFocusedField] = useState(null);

  const { login } = useAuth();
  const navigate  = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const result = await login(email, password);
    setLoading(false);
    if (result.success) navigate('/dashboard');
  };

  const fillCredentials = (role) => {
    const creds = {
      admin:     { email: 'admin@military.com',    password: 'admin123' },
      commander: { email: 'smith@military.com',    password: 'pass123'  },
      logistics: { email: 'logistics@military.com', password: 'pass123' },
    };
    setEmail(creds[role].email);
    setPassword(creds[role].password);
  };

  return (
    <div
      className="min-h-screen relative overflow-hidden flex items-center justify-center"
      style={{ backgroundColor: '#0a0f0d' }}
    >

      {/* ── Animated grid background ────────────────────────────────────── */}
      <div className="absolute inset-0 bg-grid opacity-60" />

      {/* ── Radial green glow in center ─────────────────────────────────── */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 80% 60% at 50% 50%, rgba(74,222,128,0.06) 0%, transparent 70%)'
        }}
      />

      {/* ── Floating military background icons ──────────────────────────── */}
      <FloatingIcon Icon={GiTank}          style={{ top: '10%',  left: '5%',  fontSize: 80 }} />
      <FloatingIcon Icon={GiMilitaryFort}  style={{ top: '15%',  right: '6%', fontSize: 90 }} />
      <FloatingIcon Icon={GiCrossedSwords} style={{ bottom: '20%', left: '8%', fontSize: 70 }} />
      <FloatingIcon Icon={GiBullets}       style={{ bottom: '15%', right: '5%', fontSize: 75 }} />
      <FloatingIcon Icon={GiTank}          style={{ top: '50%',  left: '2%',  fontSize: 50 }} />
      <FloatingIcon Icon={GiMilitaryFort}  style={{ bottom: '40%', right: '3%', fontSize: 55 }} />

      {/* ── Horizontal scan line ────────────────────────────────────────── */}
      <motion.div
        className="absolute left-0 right-0 h-px pointer-events-none"
        style={{ background: 'linear-gradient(90deg, transparent, #4ade80, transparent)', opacity: 0.3 }}
        animate={{ top: ['0%', '100%'] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
      />

      {/* ── Left panel — branding (hidden on small screens) ─────────────── */}
      <motion.div
        initial={{ opacity: 0, x: -60 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="hidden lg:flex flex-col justify-center px-16 w-1/2 max-w-xl"
      >
        {/* Logo */}
        <div className="flex items-center gap-4 mb-8">
          <motion.div
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ duration: 4, repeat: Infinity }}
            style={{
              width: 64, height: 64, borderRadius: 16,
              background: 'rgba(74,222,128,0.1)',
              border: '2px solid rgba(74,222,128,0.4)',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}
          >
            <GiMilitaryFort size={36} color="#4ade80" />
          </motion.div>
          <div>
            <h1 style={{ fontFamily: 'Orbitron, monospace', color: '#4ade80', fontSize: '1.1rem', letterSpacing: '0.15em' }}>
              MILASSET
            </h1>
            <p style={{ color: '#94a3b8', fontSize: '0.75rem', letterSpacing: '0.1em' }}>
              COMMAND SYSTEM v2.4
            </p>
          </div>
        </div>

        {/* Heading */}
        <h2 style={{ fontFamily: 'Orbitron, monospace', color: '#e2e8f0', fontSize: '2.2rem', lineHeight: 1.2, marginBottom: '1.5rem' }}>
          MILITARY ASSET<br />
          <span style={{ color: '#4ade80' }}>MANAGEMENT</span><br />
          SYSTEM
        </h2>

        <p style={{ color: '#94a3b8', lineHeight: 1.7, marginBottom: '2.5rem', fontSize: '0.95rem' }}>
          Secure command-level access for tracking vehicles, weapons,
          ammunition and equipment across all operational bases.
        </p>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          <StatBadge label="Bases"       value="4"    delay={0.3} />
          <StatBadge label="Asset Types" value="4"    delay={0.4} />
          <StatBadge label="Access Roles" value="3"   delay={0.5} />
        </div>

        {/* Feature list */}
        {[
          'Real-time asset tracking across all bases',
          'Secure JWT-based role access control',
          'Transfer approvals & expenditure logging',
        ].map((feat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 + i * 0.15 }}
            className="flex items-center gap-3 mb-3"
          >
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#4ade80', flexShrink: 0 }} />
            <span style={{ color: '#94a3b8', fontSize: '0.875rem' }}>{feat}</span>
          </motion.div>
        ))}
      </motion.div>

      {/* ── Right panel — login form ─────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, x: 60 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="relative w-full max-w-md mx-4 lg:mx-16"
      >
        {/* Card */}
        <div
          className="relative overflow-hidden rounded-2xl p-8"
          style={{
            background: 'linear-gradient(145deg, rgba(26,58,42,0.9), rgba(10,15,13,0.95))',
            border: '1px solid rgba(74,222,128,0.2)',
            boxShadow: '0 25px 60px rgba(0,0,0,0.6), 0 0 40px rgba(74,222,128,0.05)',
            backdropFilter: 'blur(20px)',
          }}
        >
          {/* Top glow line */}
          <div
            className="absolute top-0 left-0 right-0 h-px"
            style={{ background: 'linear-gradient(90deg, transparent, #4ade80, transparent)' }}
          />

          {/* Mobile logo */}
          <div className="flex items-center gap-3 mb-6 lg:hidden">
            <GiMilitaryFort size={28} color="#4ade80" />
            <span style={{ fontFamily: 'Orbitron, monospace', color: '#4ade80', fontSize: '0.9rem', letterSpacing: '0.15em' }}>
              MILASSET
            </span>
          </div>

          {/* Form header */}
          <div className="mb-7">
            <div className="flex items-center gap-2 mb-2">
              <FiShield color="#4ade80" size={18} />
              <span style={{ fontFamily: 'Orbitron, monospace', color: '#4ade80', fontSize: '0.7rem', letterSpacing: '0.2em' }}>
                SECURE ACCESS
              </span>
            </div>
            <h3 style={{ fontFamily: 'Orbitron, monospace', color: '#e2e8f0', fontSize: '1.4rem', letterSpacing: '0.05em' }}>
              COMMAND LOGIN
            </h3>
            <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginTop: 4 }}>
              Enter your credentials to access the system
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit}>

            {/* Email field */}
            <div className="mb-4">
              <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.75rem', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8 }}>
                Email Address
              </label>
              <div className="relative">
                <FiMail
                  size={16}
                  color={focusedField === 'email' ? '#4ade80' : '#94a3b8'}
                  style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', transition: 'color 0.3s' }}
                />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  onFocus={() => setFocusedField('email')}
                  onBlur={() => setFocusedField(null)}
                  placeholder="commander@military.com"
                  required
                  className="military-input"
                  style={{ paddingLeft: 42 }}
                />
              </div>
            </div>

            {/* Password field */}
            <div className="mb-6">
              <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.75rem', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8 }}>
                Password
              </label>
              <div className="relative">
                <FiLock
                  size={16}
                  color={focusedField === 'password' ? '#4ade80' : '#94a3b8'}
                  style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', transition: 'color 0.3s' }}
                />
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  onFocus={() => setFocusedField('password')}
                  onBlur={() => setFocusedField(null)}
                  placeholder="••••••••"
                  required
                  className="military-input"
                  style={{ paddingLeft: 42, paddingRight: 42 }}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}
                >
                  {showPass ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                </button>
              </div>
            </div>

            {/* Submit button */}
            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full btn-primary"
              style={{ opacity: loading ? 0.7 : 1, fontSize: '0.85rem' }}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <motion.span
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    style={{ display: 'inline-block', width: 14, height: 14, border: '2px solid #0a0f0d', borderTopColor: 'transparent', borderRadius: '50%' }}
                  />
                  AUTHENTICATING...
                </span>
              ) : (
                '⚡ ACCESS SYSTEM'
              )}
            </motion.button>
          </form>

          {/* Demo credentials */}
          <div className="mt-6">
            <p style={{ color: '#94a3b8', fontSize: '0.7rem', letterSpacing: '0.1em', textTransform: 'uppercase', textAlign: 'center', marginBottom: 10 }}>
              — Demo Access —
            </p>
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: 'Admin',     role: 'admin',     color: '#4ade80' },
                { label: 'Commander', role: 'commander', color: '#fbbf24' },
                { label: 'Logistics', role: 'logistics', color: '#60a5fa' },
              ].map(({ label, role, color }) => (
                <motion.button
                  key={role}
                  type="button"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => fillCredentials(role)}
                  style={{
                    background: 'rgba(255,255,255,0.03)',
                    border: `1px solid ${color}40`,
                    color: color,
                    borderRadius: 8,
                    padding: '6px 4px',
                    fontSize: '0.7rem',
                    fontFamily: 'Orbitron, monospace',
                    letterSpacing: '0.05em',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                >
                  {label}
                </motion.button>
              ))}
            </div>
            <p style={{ color: '#4a5c3a', fontSize: '0.65rem', textAlign: 'center', marginTop: 8 }}>
              Click a role to autofill credentials
            </p>
          </div>

          {/* Bottom glow line */}
          <div
            className="absolute bottom-0 left-0 right-0 h-px"
            style={{ background: 'linear-gradient(90deg, transparent, rgba(74,222,128,0.3), transparent)' }}
          />
        </div>

        {/* Corner decorations */}
        {[
          { top: -1, left: -1, borderTop: '2px solid #4ade80', borderLeft: '2px solid #4ade80' },
          { top: -1, right: -1, borderTop: '2px solid #4ade80', borderRight: '2px solid #4ade80' },
          { bottom: -1, left: -1, borderBottom: '2px solid #4ade80', borderLeft: '2px solid #4ade80' },
          { bottom: -1, right: -1, borderBottom: '2px solid #4ade80', borderRight: '2px solid #4ade80' },
        ].map((style, i) => (
          <div key={i} style={{ position: 'absolute', width: 20, height: 20, ...style }} />
        ))}
      </motion.div>
    </div>
  );
}