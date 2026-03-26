import { useAuth } from '../context/AuthContext.jsx';

const ROLE_CONFIG = {
  admin:             { label: 'Admin',             color: '#68d391' },
  base_commander:    { label: 'Commander',         color: '#f6e05e' },
  logistics_officer: { label: 'Logistics Officer', color: '#76e4f7' },
};

export default function Navbar({ sidebarCollapsed, onMobileMenuClick }) {
  const { user } = useAuth();
  const role = ROLE_CONFIG[user?.role] || ROLE_CONFIG.logistics_officer;

  return (
    <header style={{
      position: 'fixed',
      top: 0,
      right: 0,
      left: 0,
      height: 60,
      backgroundColor: 'var(--bg-navbar)',
      borderBottom: '1px solid var(--border)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 1.25rem',
      zIndex: 40,
    }}>

      {/* Left: mobile menu + title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>

        {/* Mobile hamburger */}
        <button
          onClick={onMobileMenuClick}
          className="mobile-menu-btn"
          style={{
            background: 'none',
            border: '1px solid var(--border)',
            borderRadius: 6,
            padding: '5px 8px',
            cursor: 'pointer',
            color: 'var(--text-secondary)',
            fontSize: '1rem',
            display: 'none',
            transition: 'border-color 0.15s, color 0.15s',
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--border-hover)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
        >
          ☰
        </button>
        <style>{`@media(max-width:768px){ .mobile-menu-btn { display: block !important; } }`}</style>

        <span style={{
          fontFamily: 'var(--font-heading)',
          fontSize: '0.8rem',
          fontWeight: 600,
          color: 'var(--text-muted)',
          letterSpacing: '0.02em',
        }}>
          Military Asset Management
        </span>
      </div>

      {/* Right: user chip */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '5px 12px',
        borderRadius: 8,
        backgroundColor: 'rgba(255,255,255,0.04)',
        border: '1px solid var(--border)',
      }}>
        {/* Avatar */}
        <div style={{
          width: 28,
          height: 28,
          borderRadius: '50%',
          backgroundColor: `${role.color}20`,
          border: `1px solid ${role.color}50`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 700,
          fontSize: '0.75rem',
          color: role.color,
          fontFamily: 'var(--font-heading)',
          flexShrink: 0,
        }}>
          {user?.name?.charAt(0).toUpperCase()}
        </div>

        {/* Name + role */}
        <div className="navbar-user-text">
          <div style={{
            fontWeight: 600,
            fontSize: '0.82rem',
            color: 'var(--text-primary)',
            lineHeight: 1.2,
            whiteSpace: 'nowrap',
          }}>
            {user?.name}
          </div>
          <div style={{
            fontSize: '0.68rem',
            color: role.color,
            fontFamily: 'var(--font-heading)',
            fontWeight: 500,
          }}>
            {role.label}
          </div>
        </div>
        <style>{`@media(max-width:480px){ .navbar-user-text { display: none; } }`}</style>
      </div>
    </header>
  );
}