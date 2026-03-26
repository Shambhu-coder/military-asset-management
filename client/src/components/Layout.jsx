import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar.jsx';
import Navbar from './Navbar.jsx';

export default function Layout() {
  const [collapsed,   setCollapsed]   = useState(false);
  const [mobileOpen,  setMobileOpen]  = useState(false);

  const sidebarWidth = collapsed ? 68 : 240;

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--bg-base)' }}>

      <Sidebar
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />

      {/* Main area */}
      <div
        className="main-wrapper"
        style={{
          marginLeft: sidebarWidth,
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          minWidth: 0,
          transition: 'margin-left 0.25s ease',
        }}
      >
        <style>{`@media(max-width:768px){ .main-wrapper { margin-left: 0 !important; } }`}</style>

        <Navbar
          sidebarCollapsed={collapsed}
          onMobileMenuClick={() => setMobileOpen(true)}
        />

        <main style={{
          flex: 1,
          marginTop: 60,
          padding: '1.5rem',
          minHeight: 'calc(100vh - 60px)',
        }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}