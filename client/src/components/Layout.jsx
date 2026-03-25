import { Outlet } from 'react-router-dom';
export default function Layout() {
  return (
    <div className="min-h-screen bg-grid" style={{ backgroundColor: '#0a0f0d' }}>
      <Outlet />
    </div>
  );
}