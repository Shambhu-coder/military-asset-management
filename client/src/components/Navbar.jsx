import { useState } from 'react';
import { motion } from 'framer-motion';
import { FiBell, FiClock } from 'react-icons/fi';
import { GiCrossedSwords } from 'react-icons/gi';
import { useAuth } from '../context/AuthContext.jsx';

// ── Live clock ────────────────────────────────────────────────────────────────
const LiveClock = () => {
  const [time, setTime] = useState(new Date());
  useState(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  });

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <FiClock size={13} color="#4a5c3a" />
      <span style={{
        fontFamily: 'Orbitron, monospace',
        fontSize: '0.7rem', color: '#4a5c3a', letterSpacing: '0.1em',
      }}>
        {time.toLocaleTimeString('en-US', { hour12: false })}
      </span>
    </div>
  );
};

export default function Navbar({ sidebarCollapsed }) {
  const { user } = useAuth();

  const ROLE_COLORS = {
    admin:             '#4ade80',
    base_commander:    '#fbbf24',
    logistics_officer: '#60a5fa',
  };
  const roleColor = ROLE_COLORS[user?.role] || '#94a3b8';

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        position: 'fixed', top: 0, right: 0, zIndex: 40,
        left: sidebarCollapsed ? 72 : 240,
        transition: 'left 0.3s ease',
        height: 60,
        background: 'rgba(10,15,13,0.9)',
        borderBottom: '1px solid rgba(74,222,128,0.1)',
        backdropFilter: 'blur(12px)',
        display: 'flex', alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 1.5rem',
      }}
    >
      {/* Left — page indicator */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <GiCrossedSwords size={16} color="#4a5c3a" />
        <span style={{
          fontFamily: 'Orbitron, monospace',
          fontSize: '0.65rem', color: '#4a5c3a', letterSpacing: '0.15em',
        }}>
          MILITARY ASSET MANAGEMENT SYSTEM
        </span>
      </div>

      {/* Right — clock, alerts, user */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
        <LiveClock />

        {/* Notification bell */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          style={{
            position: 'relative', background: 'none', border: 'none',
            cursor: 'pointer', color: '#94a3b8',
          }}
        >
          <FiBell size={17} />
          <span style={{
            position: 'absolute', top: -3, right: -3,
            width: 8, height: 8, borderRadius: '50%',
            background: '#ef4444',
            border: '1px solid #0a0f0d',
          }} />
        </motion.button>

        {/* User chip */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '5px 12px', borderRadius: 20,
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(74,92,58,0.3)',
        }}>
          {/* Avatar */}
          <div style={{
            width: 26, height: 26, borderRadius: '50%',
            background: `${roleColor}20`,
            border: `1px solid ${roleColor}40`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'Orbitron, monospace',
            fontSize: '0.65rem', color: roleColor, fontWeight: 700,
          }}>
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <div style={{ color: '#e2e8f0', fontSize: '0.78rem', fontWeight: 500, lineHeight: 1.2 }}>
              {user?.name}
            </div>
            <div style={{
              fontSize: '0.6rem', color: roleColor,
              fontFamily: 'Orbitron, monospace', letterSpacing: '0.05em',
              textTransform: 'uppercase',
            }}>
              {user?.role?.replace('_', ' ')}
            </div>
          </div>
        </div>
      </div>
    </motion.header>
  );
}