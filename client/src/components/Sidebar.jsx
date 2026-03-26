import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const NAV_ITEMS = [
  { path: '/dashboard',   label: 'Dashboard',   emoji: '📊' },
  { path: '/purchases',   label: 'Purchases',   emoji: '🛒' },
  { path: '/transfers',   label: 'Transfers',   emoji: '🔄' },
  { path: '/assignments', label: 'Assignments', emoji: '📋' },
];

const ROLE_CONFIG = {
  admin:             { label: 'Admin',             color: '#68d391', bg: 'rgba(104,211,145,0.12)' },
  base_commander:    { label: 'Base Commander',    color: '#f6e05e', bg: 'rgba(246,224,94,0.12)'  },
  logistics_officer: { label: 'Logistics Officer', color: '#76e4f7', bg: 'rgba(118,228,247,0.12)' },
};

export default function Sidebar({ collapsed, setCollapsed, mobileOpen, setMobileOpen }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const role = ROLE_CONFIG[user?.role] || ROLE_CONFIG.logistics_officer;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const sidebarWidth = collapsed ? 68 : 240;

  // Shared sidebar content
  const content = (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      backgroundColor: 'var(--bg-sidebar)',
      borderRight: '1px solid var(--border)',
      overflow: 'hidden',
    }}>

      {/* Logo */}
      <div style={{
        padding: collapsed ? '1.2rem 0' : '1.2rem 1.1rem',
        borderBottom: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: collapsed ? 'center' : 'space-between',
        minHeight: 64,
      }}>
        {!collapsed && (
          <div>
            <div style={{
              fontFamily: 'var(--font-heading)',
              fontWeight: 700,
              fontSize: '1rem',
              color: 'var(--accent)',
              letterSpacing: '-0.01em',
            }}>
              MilAsset
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 1 }}>
              Command System
            </div>
          </div>
        )}
        {collapsed && (
          <span style={{ fontSize: '1.3rem' }}>🪖</span>
        )}
      </div>

      {/* Nav Links */}
      <nav style={{ flex: 1, padding: '0.75rem 0.5rem', overflowY: 'auto' }}>
        {NAV_ITEMS.map(item => (
          <NavLink
            key={item.path}
            to={item.path}
            onClick={() => setMobileOpen && setMobileOpen(false)}
            style={{ textDecoration: 'none', display: 'block', marginBottom: 2 }}
          >
            {({ isActive }) => (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: collapsed ? '10px 0' : '9px 12px',
                justifyContent: collapsed ? 'center' : 'flex-start',
                borderRadius: 8,
                backgroundColor: isActive ? 'rgba(99,179,237,0.12)' : 'transparent',
                border: `1px solid ${isActive ? 'rgba(99,179,237,0.25)' : 'transparent'}`,
                color: isActive ? 'var(--accent)' : 'var(--text-secondary)',
                cursor: 'pointer',
                transition: 'background-color 0.15s, color 0.15s, border-color 0.15s',
                position: 'relative',
              }}
              onMouseEnter={e => { if (!isActive) { e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = 'var(--text-primary)'; } }}
              onMouseLeave={e => { if (!isActive) { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = 'var(--text-secondary)'; } }}
              >
                {isActive && !collapsed && (
                  <div style={{
                    position: 'absolute', left: 0, top: '20%', bottom: '20%',
                    width: 3, borderRadius: 2,
                    backgroundColor: 'var(--accent)',
                  }} />
                )}
                <span style={{ fontSize: '1rem', flexShrink: 0 }}>{item.emoji}</span>
                {!collapsed && (
                  <span style={{
                    fontFamily: 'var(--font-heading)',
                    fontSize: '0.85rem',
                    fontWeight: isActive ? 600 : 500,
                    whiteSpace: 'nowrap',
                  }}>
                    {item.label}
                  </span>
                )}
              </div>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User info + logout */}
      <div style={{ padding: '0.75rem 0.5rem', borderTop: '1px solid var(--border)' }}>

        {/* User card */}
        {!collapsed && (
          <div style={{
            padding: '0.75rem',
            borderRadius: 8,
            backgroundColor: 'rgba(255,255,255,0.03)',
            border: '1px solid var(--border)',
            marginBottom: 6,
          }}>
            <div style={{
              display: 'inline-block',
              padding: '2px 8px',
              borderRadius: 4,
              backgroundColor: role.bg,
              color: role.color,
              fontSize: '0.68rem',
              fontFamily: 'var(--font-heading)',
              fontWeight: 600,
              marginBottom: 6,
            }}>
              {role.label}
            </div>
            <div style={{ color: 'var(--text-primary)', fontWeight: 600, fontSize: '0.85rem' }}>
              {user?.name}
            </div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: 2 }}>
              {user?.base}
            </div>
          </div>
        )}

        {/* Logout */}
        <button
          onClick={handleLogout}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: collapsed ? 'center' : 'flex-start',
            gap: 8,
            padding: collapsed ? '10px 0' : '9px 12px',
            borderRadius: 8,
            backgroundColor: 'transparent',
            border: '1px solid transparent',
            cursor: 'pointer',
            color: 'var(--text-muted)',
            fontSize: '0.85rem',
            fontFamily: 'var(--font-heading)',
            fontWeight: 500,
            transition: 'all 0.15s',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.backgroundColor = 'rgba(252,129,129,0.08)';
            e.currentTarget.style.borderColor = 'rgba(252,129,129,0.25)';
            e.currentTarget.style.color = 'var(--red)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.borderColor = 'transparent';
            e.currentTarget.style.color = 'var(--text-muted)';
          }}
        >
          <span style={{ fontSize: '1rem' }}>🚪</span>
          {!collapsed && 'Logout'}
        </button>
      </div>

      {/* Collapse toggle (desktop) */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        style={{
          position: 'absolute',
          top: '50%',
          right: -12,
          transform: 'translateY(-50%)',
          width: 24,
          height: 24,
          borderRadius: '50%',
          backgroundColor: 'var(--bg-card)',
          border: '1px solid var(--border)',
          cursor: 'pointer',
          color: 'var(--text-secondary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '0.7rem',
          transition: 'background-color 0.15s, border-color 0.15s',
          zIndex: 10,
        }}
        onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'var(--bg-card-hover)'; e.currentTarget.style.borderColor = 'var(--border-hover)'; }}
        onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'var(--bg-card)'; e.currentTarget.style.borderColor = 'var(--border)'; }}
      >
        {collapsed ? '›' : '‹'}
      </button>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside style={{
        width: sidebarWidth,
        minWidth: sidebarWidth,
        height: '100vh',
        position: 'fixed',
        top: 0, left: 0,
        transition: 'width 0.25s ease',
        zIndex: 50,
        display: 'none',
      }}
      className="desktop-sidebar"
      >
        <style>{`.desktop-sidebar { display: block !important; } @media(max-width:768px){ .desktop-sidebar { display: none !important; } }`}</style>
        <div style={{ position: 'relative', height: '100%' }}>{content}</div>
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: 100,
            backgroundColor: 'rgba(0,0,0,0.6)',
            display: 'none',
          }}
          className="mobile-overlay"
          onClick={() => setMobileOpen(false)}
        >
          <style>{`.mobile-overlay { display: block !important; } @media(min-width:769px){ .mobile-overlay { display: none !important; } }`}</style>
          <div
            style={{ width: 240, height: '100%', position: 'relative' }}
            onClick={e => e.stopPropagation()}
          >
            {content}
          </div>
        </div>
      )}
    </>
  );
}