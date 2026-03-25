import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  GiMilitaryFort, GiTank, GiCrossedSwords,
  GiBullets, GiRadarSweep
} from 'react-icons/gi';
import {
  FiGrid, FiShoppingCart, FiShuffle,
  FiClipboard, FiLogOut, FiChevronLeft,
  FiChevronRight, FiShield
} from 'react-icons/fi';
import { useAuth } from '../context/AuthContext.jsx';

// ── Nav items config ──────────────────────────────────────────────────────────
const NAV_ITEMS = [
  { path: '/dashboard',   label: 'Dashboard',   icon: FiGrid,         militaryIcon: GiRadarSweep  },
  { path: '/purchases',   label: 'Purchases',   icon: FiShoppingCart, militaryIcon: GiTank        },
  { path: '/transfers',   label: 'Transfers',   icon: FiShuffle,      militaryIcon: GiCrossedSwords },
  { path: '/assignments', label: 'Assignments', icon: FiClipboard,    militaryIcon: GiBullets     },
];

// ── Role badge colors ─────────────────────────────────────────────────────────
const ROLE_STYLES = {
  admin:             { color: '#4ade80', bg: 'rgba(74,222,128,0.1)',  label: 'ADMIN'     },
  base_commander:    { color: '#fbbf24', bg: 'rgba(251,191,36,0.1)', label: 'COMMANDER' },
  logistics_officer: { color: '#60a5fa', bg: 'rgba(96,165,250,0.1)', label: 'LOGISTICS' },
};

export default function Sidebar({ collapsed, setCollapsed }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const roleStyle = ROLE_STYLES[user?.role] || ROLE_STYLES.logistics_officer;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <motion.aside
      animate={{ width: collapsed ? 72 : 240 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      style={{
        height: '100vh',
        position: 'fixed',
        top: 0, left: 0,
        background: 'linear-gradient(180deg, #0d1f17 0%, #0a0f0d 100%)',
        borderRight: '1px solid rgba(74,222,128,0.12)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        zIndex: 50,
        flexShrink: 0,
      }}
    >
      {/* ── Logo area ──────────────────────────────────────────────────── */}
      <div style={{
        padding: '1.25rem 1rem',
        borderBottom: '1px solid rgba(74,222,128,0.1)',
        display: 'flex', alignItems: 'center',
        gap: 12, minHeight: 70,
      }}>
        <motion.div
          animate={{ rotate: [0, 5, -5, 0] }}
          transition={{ duration: 5, repeat: Infinity }}
          style={{
            width: 38, height: 38, borderRadius: 10, flexShrink: 0,
            background: 'rgba(74,222,128,0.1)',
            border: '1px solid rgba(74,222,128,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          <GiMilitaryFort size={22} color="#4ade80" />
        </motion.div>

        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
            >
              <div style={{
                fontFamily: 'Orbitron, monospace', color: '#4ade80',
                fontSize: '0.8rem', letterSpacing: '0.15em', lineHeight: 1.2,
              }}>
                MILASSET
              </div>
              <div style={{ color: '#4a5c3a', fontSize: '0.6rem', letterSpacing: '0.1em' }}>
                COMMAND v2.4
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Navigation links ───────────────────────────────────────────── */}
      <nav style={{ flex: 1, padding: '0.75rem 0.5rem', overflowY: 'auto' }}>
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            style={{ textDecoration: 'none', display: 'block', marginBottom: 4 }}
          >
            {({ isActive }) => (
              <motion.div
                whileHover={{ x: 4 }}
                whileTap={{ scale: 0.97 }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '10px 12px', borderRadius: 10,
                  background: isActive ? 'rgba(74,222,128,0.12)' : 'transparent',
                  border: `1px solid ${isActive ? 'rgba(74,222,128,0.25)' : 'transparent'}`,
                  cursor: 'pointer', position: 'relative', overflow: 'hidden',
                  transition: 'background 0.2s, border 0.2s',
                }}
              >
                {/* Active left accent */}
                {isActive && (
                  <motion.div
                    layoutId="activeIndicator"
                    style={{
                      position: 'absolute', left: 0, top: '20%', bottom: '20%',
                      width: 3, borderRadius: 2, background: '#4ade80',
                    }}
                  />
                )}

                {/* Icon */}
                <div style={{ flexShrink: 0, marginLeft: isActive ? 4 : 0 }}>
                  <item.icon
                    size={18}
                    color={isActive ? '#4ade80' : '#94a3b8'}
                    style={{ transition: 'color 0.2s' }}
                  />
                </div>

                {/* Label */}
                <AnimatePresence>
                  {!collapsed && (
                    <motion.span
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -8 }}
                      transition={{ duration: 0.2 }}
                      style={{
                        fontFamily: 'Orbitron, monospace',
                        fontSize: '0.72rem', letterSpacing: '0.08em',
                        color: isActive ? '#4ade80' : '#94a3b8',
                        whiteSpace: 'nowrap',
                        transition: 'color 0.2s',
                      }}
                    >
                      {item.label.toUpperCase()}
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.div>
            )}
          </NavLink>
        ))}
      </nav>

      {/* ── User info + logout ──────────────────────────────────────────── */}
      <div style={{
        padding: '0.75rem 0.5rem',
        borderTop: '1px solid rgba(74,222,128,0.1)',
      }}>
        {/* User card */}
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{
                padding: '10px 12px', borderRadius: 10, marginBottom: 6,
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(74,92,58,0.2)',
              }}
            >
              {/* Role badge */}
              <div style={{
                display: 'inline-block',
                padding: '2px 8px', borderRadius: 4, marginBottom: 6,
                background: roleStyle.bg,
                border: `1px solid ${roleStyle.color}30`,
                color: roleStyle.color,
                fontSize: '0.6rem',
                fontFamily: 'Orbitron, monospace',
                letterSpacing: '0.1em',
              }}>
                <FiShield size={9} style={{ display: 'inline', marginRight: 4 }} />
                {roleStyle.label}
              </div>
              <div style={{ color: '#e2e8f0', fontSize: '0.8rem', fontWeight: 500 }}>
                {user?.name}
              </div>
              <div style={{ color: '#94a3b8', fontSize: '0.7rem', marginTop: 2 }}>
                {user?.base}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Logout button */}
        <motion.button
          whileHover={{ x: 4 }}
          whileTap={{ scale: 0.97 }}
          onClick={handleLogout}
          style={{
            width: '100%', display: 'flex', alignItems: 'center', gap: 12,
            padding: '10px 12px', borderRadius: 10,
            background: 'transparent',
            border: '1px solid transparent',
            cursor: 'pointer', color: '#94a3b8',
            transition: 'all 0.2s',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = 'rgba(239,68,68,0.08)';
            e.currentTarget.style.borderColor = 'rgba(239,68,68,0.2)';
            e.currentTarget.style.color = '#f87171';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.borderColor = 'transparent';
            e.currentTarget.style.color = '#94a3b8';
          }}
        >
          <FiLogOut size={18} style={{ flexShrink: 0 }} />
          <AnimatePresence>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                style={{
                  fontFamily: 'Orbitron, monospace',
                  fontSize: '0.72rem', letterSpacing: '0.08em',
                  whiteSpace: 'nowrap',
                }}
              >
                LOGOUT
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>
      </div>

      {/* ── Collapse toggle button ──────────────────────────────────────── */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setCollapsed(!collapsed)}
        style={{
          position: 'absolute', top: '50%', right: -12,
          transform: 'translateY(-50%)',
          width: 24, height: 24, borderRadius: '50%',
          background: '#1a3a2a',
          border: '1px solid rgba(74,222,128,0.3)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', color: '#4ade80', zIndex: 10,
        }}
      >
        {collapsed
          ? <FiChevronRight size={12} />
          : <FiChevronLeft size={12} />
        }
      </motion.button>
    </motion.aside>
  );
}