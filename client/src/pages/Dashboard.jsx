import { useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';

const BASES       = ['All Bases', 'Base Alpha', 'Base Bravo', 'Base Charlie', 'Base Delta'];
const ASSET_TYPES = ['All Types', 'vehicle', 'weapon', 'ammunition', 'equipment'];
const PIE_COLORS  = ['#63b3ed', '#68d391', '#f6e05e', '#b794f4'];

const TYPE_EMOJI = { vehicle: '🚗', weapon: '🔫', ammunition: '💊', equipment: '⚙️' };

// ── Stat Card ─────────────────────────────────────────────────────────────────
function StatCard({ title, value, emoji, color, subtitle }) {
  return (
    <div className="stat-card" style={{ borderLeft: `3px solid ${color}` }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: '1.6rem' }}>{emoji}</span>
        <span style={{
          fontFamily: 'var(--font-heading)',
          fontSize: '1.8rem',
          fontWeight: 700,
          color,
        }}>
          {typeof value === 'number' ? value.toLocaleString() : value}
        </span>
      </div>
      <div style={{
        fontFamily: 'var(--font-heading)',
        fontSize: '0.8rem',
        fontWeight: 600,
        color: 'var(--text-primary)',
        marginTop: 6,
      }}>
        {title}
      </div>
      {subtitle && (
        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>
          {subtitle}
        </div>
      )}
    </div>
  );
}

// ── Custom Tooltip ────────────────────────────────────────────────────────────
function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      backgroundColor: 'var(--bg-card)',
      border: '1px solid var(--border)',
      borderRadius: 8,
      padding: '10px 14px',
      fontSize: '0.82rem',
      boxShadow: 'var(--shadow-md)',
    }}>
      <p style={{ color: 'var(--accent)', fontWeight: 600, marginBottom: 4 }}>{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color || 'var(--text-primary)' }}>
          {p.name}: <strong>{p.value?.toLocaleString()}</strong>
        </p>
      ))}
    </div>
  );
}

// ── Main Dashboard ────────────────────────────────────────────────────────────
export default function Dashboard() {
  const { user, isAdmin } = useAuth();

  const [assets,       setAssets]       = useState([]);
  const [summary,      setSummary]      = useState(null);
  const [transfers,    setTransfers]    = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [selectedBase, setSelectedBase] = useState('All Bases');
  const [selectedType, setSelectedType] = useState('All Types');
  const [activeTab,    setActiveTab]    = useState('overview');
  const [showFilters,  setShowFilters]  = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = {};
      if (selectedBase !== 'All Bases') params.base = selectedBase;
      if (selectedType !== 'All Types') params.assetType = selectedType;

      const [assetsRes, summaryRes, transfersRes] = await Promise.all([
        API.get('/assets', { params }),
        API.get('/assets/dashboard/summary', { params }),
        API.get('/transfers'),
      ]);
      setAssets(assetsRes.data.data || []);
      setSummary(summaryRes.data.data || null);
      setTransfers(transfersRes.data.data || []);
    } catch (err) {
      console.error('Dashboard fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [selectedBase, selectedType]);

  // Derived stats
  const totalAssets      = assets.reduce((s, a) => s + (a.quantity || 0), 0);
  const totalTypes       = [...new Set(assets.map(a => a.assetType))].length;
  const pendingTransfers = transfers.filter(t => t.status === 'pending').length;
  const criticalAssets   = assets.filter(a => a.quantity <= 10).length;

  // Chart data
  const pieData = ASSET_TYPES.slice(1).map(type => ({
    name: type.charAt(0).toUpperCase() + type.slice(1),
    value: assets.filter(a => a.assetType === type).reduce((s, a) => s + a.quantity, 0),
  })).filter(d => d.value > 0);

  const barData = BASES.slice(1).map(base => ({
    name: base.replace('Base ', ''),
    total: assets.filter(a => a.base === base).reduce((s, a) => s + a.quantity, 0),
  }));

  const recentTransfers = transfers.slice(0, 5);

  const STATUS_STYLE = {
    pending:  { color: 'var(--yellow)', bg: 'var(--yellow-bg)' },
    approved: { color: 'var(--green)',  bg: 'var(--green-bg)'  },
    rejected: { color: 'var(--red)',    bg: 'var(--red-bg)'    },
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', gap: 12 }}>
        <span style={{ fontSize: '1.5rem' }}>⏳</span>
        <span style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-heading)' }}>Loading dashboard...</span>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1400 }}>

      {/* ── Page Header ── */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        gap: 12,
        marginBottom: '1.5rem',
      }}>
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">
            Welcome back, <strong style={{ color: 'var(--text-primary)' }}>{user?.name}</strong> · {user?.base}
          </p>
        </div>

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button
            className="btn-outline"
            onClick={() => setShowFilters(!showFilters)}
            style={{ color: showFilters ? 'var(--accent)' : undefined, borderColor: showFilters ? 'var(--accent)' : undefined }}
          >
            🔽 Filters {showFilters ? '(on)' : ''}
          </button>
          <button className="btn-outline" onClick={fetchData}>
            🔄 Refresh
          </button>
        </div>
      </div>

      {/* ── Filter Panel ── */}
      {showFilters && (
        <div className="military-card" style={{ padding: '1.25rem', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24 }}>

            {/* Base filter */}
            <div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 600, marginBottom: 8, fontFamily: 'var(--font-heading)' }}>
                BASE
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {BASES.map(base => (
                  <button
                    key={base}
                    onClick={() => setSelectedBase(base)}
                    style={{
                      padding: '5px 12px',
                      borderRadius: 6,
                      fontSize: '0.8rem',
                      fontFamily: 'var(--font-heading)',
                      cursor: 'pointer',
                      border: `1px solid ${selectedBase === base ? 'var(--accent)' : 'var(--border)'}`,
                      backgroundColor: selectedBase === base ? 'rgba(99,179,237,0.12)' : 'transparent',
                      color: selectedBase === base ? 'var(--accent)' : 'var(--text-secondary)',
                      transition: 'all 0.15s',
                    }}
                  >
                    {base === 'All Bases' ? 'All' : base.replace('Base ', '')}
                  </button>
                ))}
              </div>
            </div>

            {/* Type filter */}
            <div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 600, marginBottom: 8, fontFamily: 'var(--font-heading)' }}>
                ASSET TYPE
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {ASSET_TYPES.map(type => (
                  <button
                    key={type}
                    onClick={() => setSelectedType(type)}
                    style={{
                      padding: '5px 12px',
                      borderRadius: 6,
                      fontSize: '0.8rem',
                      fontFamily: 'var(--font-heading)',
                      cursor: 'pointer',
                      textTransform: 'capitalize',
                      border: `1px solid ${selectedType === type ? 'var(--accent)' : 'var(--border)'}`,
                      backgroundColor: selectedType === type ? 'rgba(99,179,237,0.12)' : 'transparent',
                      color: selectedType === type ? 'var(--accent)' : 'var(--text-secondary)',
                      transition: 'all 0.15s',
                    }}
                  >
                    {type === 'All Types' ? 'All' : `${TYPE_EMOJI[type]} ${type}`}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Stat Cards ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1rem',
        marginBottom: '1.5rem',
      }}>
        <StatCard title="Total Assets"      value={totalAssets}      emoji="📦" color="var(--accent)"  subtitle="Across all bases"   />
        <StatCard title="Asset Types"       value={totalTypes}       emoji="🗂️" color="var(--green)"   subtitle="Categories in use"  />
        <StatCard title="Pending Transfers" value={pendingTransfers} emoji="🔄" color="var(--yellow)"  subtitle="Awaiting approval"  />
        <StatCard title="Critical Stock"    value={criticalAssets}   emoji="⚠️" color="var(--red)"     subtitle="Below 10 units"     />
      </div>

      {/* ── Tabs ── */}
      <div style={{ display: 'flex', gap: 4, marginBottom: '1.25rem', borderBottom: '1px solid var(--border)', flexWrap: 'wrap' }}>
        {[
          { id: 'overview',  label: '📈 Overview'  },
          { id: 'inventory', label: '📦 Inventory' },
          { id: 'movements', label: '🔄 Movements' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '8px 16px',
              border: 'none',
              borderBottom: `2px solid ${activeTab === tab.id ? 'var(--accent)' : 'transparent'}`,
              backgroundColor: 'transparent',
              color: activeTab === tab.id ? 'var(--accent)' : 'var(--text-secondary)',
              fontFamily: 'var(--font-heading)',
              fontSize: '0.82rem',
              fontWeight: 600,
              cursor: 'pointer',
              marginBottom: -1,
              transition: 'color 0.15s',
            }}
            onMouseEnter={e => { if (activeTab !== tab.id) e.currentTarget.style.color = 'var(--text-primary)'; }}
            onMouseLeave={e => { if (activeTab !== tab.id) e.currentTarget.style.color = 'var(--text-secondary)'; }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Tab: Overview ── */}
      {activeTab === 'overview' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.25rem' }}>

          {/* Bar Chart */}
          <div className="military-card" style={{ padding: '1.25rem' }}>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '1rem' }}>
              Assets by Base
            </h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={barData} margin={{ top: 0, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="total" fill="var(--accent)" radius={[4,4,0,0]} name="Total" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Pie Chart */}
          <div className="military-card" style={{ padding: '1.25rem' }}>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '1rem' }}>
              Asset Type Breakdown
            </h3>
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3} dataKey="value">
                    {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} stroke="none" />)}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend formatter={v => <span style={{ color: 'var(--text-secondary)', fontSize: '0.78rem' }}>{v}</span>} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 220, color: 'var(--text-muted)' }}>
                No data available
              </div>
            )}
          </div>

          {/* Net Movement */}
          {summary && (
            <div className="military-card" style={{ padding: '1.25rem', gridColumn: '1 / -1' }}>
              <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '1rem' }}>
                Net Movement Summary
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.75rem' }}>
                {[
                  { label: 'Purchased',       value: summary.purchased?.reduce((s,p)=>s+p.total,0)||0,     color: 'var(--green)',  emoji: '⬆️' },
                  { label: 'Transferred In',  value: summary.transfersIn?.reduce((s,p)=>s+p.total,0)||0,   color: 'var(--accent)', emoji: '➡️' },
                  { label: 'Transferred Out', value: summary.transfersOut?.reduce((s,p)=>s+p.total,0)||0,  color: 'var(--yellow)', emoji: '⬅️' },
                  { label: 'Assigned',        value: summary.assignments?.reduce((s,p)=>s+p.total,0)||0,   color: 'var(--purple)', emoji: '✅' },
                  { label: 'Expended',        value: summary.expenditures?.reduce((s,p)=>s+p.total,0)||0,  color: 'var(--red)',    emoji: '❌' },
                ].map((item, i) => (
                  <div key={i} style={{
                    padding: '1rem',
                    borderRadius: 8,
                    backgroundColor: 'rgba(255,255,255,0.03)',
                    border: '1px solid var(--border)',
                    textAlign: 'center',
                  }}>
                    <div style={{ fontSize: '1.3rem', marginBottom: 4 }}>{item.emoji}</div>
                    <div style={{ fontFamily: 'var(--font-heading)', color: item.color, fontSize: '1.3rem', fontWeight: 700 }}>
                      {item.value.toLocaleString()}
                    </div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.72rem', marginTop: 3 }}>{item.label}</div>
                  </div>
                ))}
              </div>

              {/* Closing balance */}
              <div style={{
                marginTop: '1rem',
                padding: '0.85rem 1rem',
                borderRadius: 8,
                backgroundColor: 'rgba(99,179,237,0.05)',
                border: '1px solid rgba(99,179,237,0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: 8,
              }}>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                  Closing Balance = Purchased + In − Out − Assigned − Expended
                </span>
                <span style={{ fontFamily: 'var(--font-heading)', color: 'var(--accent)', fontSize: '1.1rem', fontWeight: 700 }}>
                  {(
                    (summary.purchased?.reduce((s,p)=>s+p.total,0)||0) +
                    (summary.transfersIn?.reduce((s,p)=>s+p.total,0)||0) -
                    (summary.transfersOut?.reduce((s,p)=>s+p.total,0)||0) -
                    (summary.assignments?.reduce((s,p)=>s+p.total,0)||0) -
                    (summary.expenditures?.reduce((s,p)=>s+p.total,0)||0)
                  ).toLocaleString()} units
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Tab: Inventory ── */}
      {activeTab === 'inventory' && (
        <div className="military-card" style={{ overflow: 'hidden' }}>
          <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              Current Inventory — {assets.length} assets
            </h3>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table className="military-table" style={{ minWidth: 550 }}>
              <thead>
                <tr>
                  <th>Asset</th>
                  <th>Base</th>
                  <th>Qty</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {assets.length > 0 ? assets.map(asset => {
                  const statusColor = asset.quantity > 50 ? 'var(--green)' : asset.quantity > 10 ? 'var(--yellow)' : 'var(--red)';
                  const statusLabel = asset.quantity > 50 ? 'Sufficient' : asset.quantity > 10 ? 'Low' : 'Critical';
                  return (
                    <tr key={asset._id}>
                      <td>
                        <div style={{ fontWeight: 500 }}>{asset.name}</div>
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'capitalize' }}>
                          {TYPE_EMOJI[asset.assetType]} {asset.assetType}
                        </div>
                      </td>
                      <td style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{asset.base}</td>
                      <td style={{ fontFamily: 'var(--font-heading)', color: 'var(--accent)', fontWeight: 700 }}>
                        {asset.quantity?.toLocaleString()}
                      </td>
                      <td>
                        <span style={{
                          padding: '3px 10px', borderRadius: 99, fontSize: '0.72rem', fontWeight: 600,
                          backgroundColor: `${statusColor}18`, color: statusColor,
                          border: `1px solid ${statusColor}40`,
                        }}>
                          {statusLabel}
                        </span>
                      </td>
                    </tr>
                  );
                }) : (
                  <tr>
                    <td colSpan={4} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                      No assets found. Add some via Purchases.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Tab: Movements ── */}
      {activeTab === 'movements' && (
        <div className="military-card" style={{ overflow: 'hidden' }}>
          <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--border)' }}>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              Recent Transfers
            </h3>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table className="military-table" style={{ minWidth: 650 }}>
              <thead>
                <tr>
                  <th>Asset</th>
                  <th>From</th>
                  <th>To</th>
                  <th>Qty</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {recentTransfers.length > 0 ? recentTransfers.map(t => {
                  const s = STATUS_STYLE[t.status] || STATUS_STYLE.pending;
                  return (
                    <tr key={t._id}>
                      <td>
                        <div style={{ fontWeight: 500 }}>{t.assetName}</div>
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'capitalize' }}>
                          {TYPE_EMOJI[t.assetType]} {t.assetType}
                        </div>
                      </td>
                      <td style={{ color: 'var(--red)', fontSize: '0.85rem' }}>{t.fromBase}</td>
                      <td style={{ color: 'var(--green)', fontSize: '0.85rem' }}>{t.toBase}</td>
                      <td style={{ fontFamily: 'var(--font-heading)', color: 'var(--yellow)', fontWeight: 700 }}>{t.quantity}</td>
                      <td>
                        <span style={{
                          padding: '3px 10px', borderRadius: 99, fontSize: '0.72rem', fontWeight: 600,
                          backgroundColor: s.bg, color: s.color, border: `1px solid ${s.color}40`,
                          display: 'inline-block',
                        }}>
                          {t.status}
                        </span>
                      </td>
                      <td style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>
                        {new Date(t.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  );
                }) : (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                      No transfers yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}