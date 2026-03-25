import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar.jsx';
import Navbar  from './Navbar.jsx';

export default function Layout() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#0a0f0d' }}>

      {/* Sidebar */}
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />

      {/* Main content area — shifts right based on sidebar width */}
      <div style={{
        marginLeft: collapsed ? 72 : 240,
        transition: 'margin-left 0.3s ease',
        flex: 1, display: 'flex', flexDirection: 'column',
        minWidth: 0,
      }}>
        {/* Top navbar */}
        <Navbar sidebarCollapsed={collapsed} />

        {/* Page content — padded below navbar */}
        <main style={{
          flex: 1,
          marginTop: 60,
          padding: '2rem',
          minHeight: 'calc(100vh - 60px)',
        }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}