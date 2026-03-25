import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts';
import {
  GiTank, GiPistolGun, GiBullets, GiMilitaryFort,
  GiCrossedSwords, GiRadarSweep
} from 'react-icons/gi';
import {
  FiArrowUp, FiArrowDown, FiRefreshCw, FiFilter,
  FiTrendingUp, FiPackage, FiShuffle, FiAlertTriangle
} from 'react-icons/fi';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';

// ── Constants ─────────────────────────────────────────────────────────────────
const BASES       = ['All Bases', 'Base Alpha', 'Base Bravo', 'Base Charlie', 'Base Delta'];
const ASSET_TYPES = ['All Types', 'vehicle', 'weapon', 'ammunition', 'equipment'];
const PIE_COLORS  = ['#4ade80', '#fbbf24', '#60a5fa', '#f87171'];

// ── Animated counter hook ─────────────────────────────────────────────────────
const useCounter = (target, duration = 1500) => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let start = 0;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setCount(target); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration]);
  return count;
};

// ── Stat Card ─────────────────────────────────────────────────────────────────
const StatCard = ({ title, value, icon: Icon, color, subtitle, delay, trend }) => {
  const animated = useCounter(typeof value === 'number' ? value : 0);
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
      className="stat-card relative overflow-hidden"
    >
      {/* Background icon watermark */}
      <div style={{ position: 'absolute', right: -10, bottom: -10, opacity: 0.05 }}>
        <Icon size={90} color={color} />
      </div>

      {/* Top row */}
      <div className="flex items-center justify-between mb-3">
        <div style={{
          width: 42, height: 42, borderRadius: 10,
          background: `${color}18`,
          border: `1px solid ${color}30`,
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <Icon size={20} color={color} />
        </div>
        {trend !== undefined && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 4,
            color: trend >= 0 ? '#4ade80' : '#f87171',
            fontSize: '0.75rem', fontWeight: 600
          }}>
            {trend >= 0 ? <FiArrowUp size={13} /> : <FiArrowDown size={13} />}
            {Math.abs(trend)}%
          </div>
        )}
      </div>

      {/* Value */}
      <div style={{
        fontFamily: 'Orbitron, monospace',
        fontSize: '2rem', fontWeight: 700, color,
        lineHeight: 1
      }}>
        {typeof value === 'number' ? animated.toLocaleString() : value}
      </div>

      {/* Title */}
      <div style={{
        fontFamily: 'Orbitron, monospace',
        color: '#e2e8f0', fontSize: '0.65rem',
        letterSpacing: '0.12em', textTransform: 'uppercase', marginTop: 6
      }}>
        {title}
      </div>

      {/* Subtitle */}
      {subtitle && (
        <div style={{ color: '#94a3b8', fontSize: '0.72rem', marginTop: 3 }}>
          {subtitle}
        </div>
      )}

      {/* Bottom accent line */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, height: 2,
        background: `linear-gradient(90deg, ${color}60, transparent)`
      }} />
    </motion.div>
  );
};

// ── Asset Row in table ────────────────────────────────────────────────────────
const AssetRow = ({ asset, index }) => {
  const typeIcons = {
    vehicle:    GiTank,
    weapon:     GiPistolGun,
    ammunition: GiBullets,
    equipment:  GiMilitaryFort,
  };
  const typeColors = {
    vehicle: '#60a5fa', weapon: '#f87171',
    ammunition: '#fbbf24', equipment: '#a78bfa'
  };
  const Icon  = typeIcons[asset.assetType]  || GiCrossedSwords;
  const color = typeColors[asset.assetType] || '#94a3b8';

  return (
    <motion.tr
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <td className="px-4 py-3" style={{ borderBottom: '1px solid rgba(74,92,58,0.2)' }}>
        <div className="flex items-center gap-3">
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: `${color}18`, border: `1px solid ${color}30`,
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
          }}>
            <Icon size={16} color={color} />
          </div>
          <div>
            <div style={{ color: '#e2e8f0', fontWeight: 500, fontSize: '0.875rem' }}>{asset.name}</div>
            <div style={{ color: '#94a3b8', fontSize: '0.72rem', textTransform: 'capitalize' }}>{asset.assetType}</div>
          </div>
        </div>
      </td>
      <td className="px-4 py-3" style={{ borderBottom: '1px solid rgba(74,92,58,0.2)', color: '#94a3b8', fontSize: '0.85rem' }}>
        {asset.base}
      </td>
      <td className="px-4 py-3" style={{ borderBottom: '1px solid rgba(74,92,58,0.2)' }}>
        <span style={{
          fontFamily: 'Orbitron, monospace', color: '#4ade80',
          fontSize: '0.9rem', fontWeight: 700
        }}>
          {asset.quantity?.toLocaleString()}
        </span>
      </td>
      <td className="px-4 py-3" style={{ borderBottom: '1px solid rgba(74,92,58,0.2)' }}>
        <span style={{
          padding: '3px 10px', borderRadius: 999, fontSize: '0.7rem',
          fontWeight: 700,
          background: asset.quantity > 50 ? 'rgba(74,222,128,0.12)' : asset.quantity > 10 ? 'rgba(251,191,36,0.12)' : 'rgba(248,113,113,0.12)',
          color:      asset.quantity > 50 ? '#4ade80'               : asset.quantity > 10 ? '#fbbf24'               : '#f87171',
          border: `1px solid ${asset.quantity > 50 ? 'rgba(74,222,128,0.3)' : asset.quantity > 10 ? 'rgba(251,191,36,0.3)' : 'rgba(248,113,113,0.3)'}`
        }}>
          {asset.quantity > 50 ? 'SUFFICIENT' : asset.quantity > 10 ? 'LOW' : 'CRITICAL'}
        </span>
      </td>
    </motion.tr>
  );
};

// ── Custom Tooltip for charts ─────────────────────────────────────────────────
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: 'rgba(10,15,13,0.95)', border: '1px solid rgba(74,222,128,0.3)',
      borderRadius: 8, padding: '10px 14px', fontSize: '0.8rem'
    }}>
      <p style={{ color: '#4ade80', fontFamily: 'Orbitron, monospace', fontSize: '0.7rem', marginBottom: 6 }}>{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color || '#e2e8f0' }}>
          {p.name}: <strong>{p.value?.toLocaleString()}</strong>
        </p>
      ))}
    </div>
  );
};

// ── Main Dashboard ────────────────────────────────────────────────────────────
export default function Dashboard() {
  const { user, isAdmin } = useAuth();

  const [assets,       setAssets]       = useState([]);
  const [summary,      setSummary]      = useState(null);
  const [transfers,    setTransfers]    = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [refreshing,   setRefreshing]   = useState(false);
  const [selectedBase, setSelectedBase] = useState('All Bases');
  const [selectedType, setSelectedType] = useState('All Types');
  const [activeTab,    setActiveTab]    = useState('overview');
  const [showFilters,  setShowFilters]  = useState(false);

  // ── Fetch all dashboard data ──────────────────────────────────────────────
  const fetchData = async (showRefresh = false) => {
    if (showRefresh) setRefreshing(true);
    else setLoading(true);
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
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchData(); }, [selectedBase, selectedType]);

  // ── Derived stats ─────────────────────────────────────────────────────────
  const totalAssets     = assets.reduce((sum, a) => sum + (a.quantity || 0), 0);
  const totalTypes      = [...new Set(assets.map(a => a.assetType))].length;
  const pendingTransfers = transfers.filter(t => t.status === 'pending').length;
  const criticalAssets  = assets.filter(a => a.quantity <= 10).length;

  // ── Pie chart data ────────────────────────────────────────────────────────
  const pieData = ASSET_TYPES.slice(1).map(type => ({
    name: type.charAt(0).toUpperCase() + type.slice(1),
    value: assets.filter(a => a.assetType === type).reduce((s, a) => s + a.quantity, 0)
  })).filter(d => d.value > 0);

  // ── Bar chart data (by base) ──────────────────────────────────────────────
  const barData = BASES.slice(1).map(base => ({
    name: base.replace('Base ', ''),
    total: assets.filter(a => a.base === base).reduce((s, a) => s + a.quantity, 0),
    types: ASSET_TYPES.slice(1).reduce((acc, type) => ({
      ...acc,
      [type]: assets.filter(a => a.base === base && a.assetType === type).reduce((s, a) => s + a.quantity, 0)
    }), {})
  }));

  // ── Recent transfers ──────────────────────────────────────────────────────
  const recentTransfers = transfers.slice(0, 5);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#0a0f0d' }}>
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}>
          <GiRadarSweep size={48} color="#4ade80" />
        </motion.div>
        <span style={{ marginLeft: 16, fontFamily: 'Orbitron, monospace', color: '#4ade80', fontSize: '1rem', letterSpacing: '0.15em' }}>
          SCANNING ASSETS...
        </span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-grid" style={{ backgroundColor: '#0a0f0d', padding: '2rem' }}>

      {/* ── Page header ──────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-wrap items-center justify-between gap-4 mb-8"
      >
        <div>
          <div className="flex items-center gap-3 mb-1">
            <GiRadarSweep size={24} color="#4ade80" />
            <span style={{ fontFamily: 'Orbitron, monospace', color: '#4ade80', fontSize: '0.7rem', letterSpacing: '0.2em' }}>
              COMMAND OVERVIEW
            </span>
          </div>
          <h1 style={{ fontFamily: 'Orbitron, monospace', color: '#e2e8f0', fontSize: '1.8rem', letterSpacing: '0.05em' }}>
            ASSET DASHBOARD
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginTop: 4 }}>
            Welcome back, <span style={{ color: '#4ade80' }}>{user?.name}</span> —{' '}
            <span style={{ textTransform: 'capitalize' }}>{user?.role?.replace('_', ' ')}</span> · {user?.base}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Filter toggle */}
          <motion.button
            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            onClick={() => setShowFilters(!showFilters)}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              background: showFilters ? 'rgba(74,222,128,0.15)' : 'rgba(255,255,255,0.03)',
              border: `1px solid ${showFilters ? '#4ade80' : 'rgba(74,92,58,0.4)'}`,
              color: showFilters ? '#4ade80' : '#94a3b8',
              borderRadius: 8, padding: '8px 14px',
              fontSize: '0.8rem', cursor: 'pointer',
              fontFamily: 'Orbitron, monospace', letterSpacing: '0.05em'
            }}
          >
            <FiFilter size={14} /> FILTERS
          </motion.button>

          {/* Refresh button */}
          <motion.button
            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            onClick={() => fetchData(true)}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(74,92,58,0.4)',
              color: '#94a3b8', borderRadius: 8, padding: '8px 14px',
              fontSize: '0.8rem', cursor: 'pointer'
            }}
          >
            <motion.span animate={refreshing ? { rotate: 360 } : {}}
              transition={{ duration: 1, repeat: refreshing ? Infinity : 0, ease: 'linear' }}>
              <FiRefreshCw size={14} />
            </motion.span>
          </motion.button>
        </div>
      </motion.div>

      {/* ── Filter panel ─────────────────────────────────────────────────── */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="military-card mb-6 overflow-hidden"
            style={{ padding: '1.25rem 1.5rem' }}
          >
            <div className="flex flex-wrap gap-6 items-end">
              {/* Base filter */}
              <div>
                <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.7rem', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8 }}>
                  Base
                </label>
                <div className="flex flex-wrap gap-2">
                  {BASES.map(base => (
                    <motion.button
                      key={base}
                      whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                      onClick={() => setSelectedBase(base)}
                      style={{
                        padding: '6px 14px', borderRadius: 6, fontSize: '0.78rem',
                        fontFamily: 'Orbitron, monospace', letterSpacing: '0.05em',
                        cursor: 'pointer', transition: 'all 0.2s',
                        background: selectedBase === base ? 'rgba(74,222,128,0.15)' : 'rgba(255,255,255,0.03)',
                        border: `1px solid ${selectedBase === base ? '#4ade80' : 'rgba(74,92,58,0.3)'}`,
                        color: selectedBase === base ? '#4ade80' : '#94a3b8',
                      }}
                    >
                      {base === 'All Bases' ? 'ALL' : base.replace('Base ', '')}
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Type filter */}
              <div>
                <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.7rem', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8 }}>
                  Asset Type
                </label>
                <div className="flex flex-wrap gap-2">
                  {ASSET_TYPES.map(type => (
                    <motion.button
                      key={type}
                      whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                      onClick={() => setSelectedType(type)}
                      style={{
                        padding: '6px 14px', borderRadius: 6, fontSize: '0.78rem',
                        fontFamily: 'Orbitron, monospace', letterSpacing: '0.05em',
                        cursor: 'pointer', transition: 'all 0.2s',
                        background: selectedType === type ? 'rgba(74,222,128,0.15)' : 'rgba(255,255,255,0.03)',
                        border: `1px solid ${selectedType === type ? '#4ade80' : 'rgba(74,92,58,0.3)'}`,
                        color: selectedType === type ? '#4ade80' : '#94a3b8',
                        textTransform: 'capitalize',
                      }}
                    >
                      {type === 'All Types' ? 'ALL' : type}
                    </motion.button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Stat cards row ────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard title="Total Assets"       value={totalAssets}      icon={FiPackage}      color="#4ade80" subtitle="Across all bases"    delay={0.1} trend={12}  />
        <StatCard title="Asset Categories"   value={totalTypes}       icon={GiCrossedSwords} color="#60a5fa" subtitle="Types in inventory"  delay={0.2}             />
        <StatCard title="Pending Transfers"  value={pendingTransfers} icon={FiShuffle}      color="#fbbf24" subtitle="Awaiting approval"   delay={0.3} trend={-3}  />
        <StatCard title="Critical Stock"     value={criticalAssets}   icon={FiAlertTriangle} color="#f87171" subtitle="Below threshold"    delay={0.4}             />
      </div>

      {/* ── Tabs ─────────────────────────────────────────────────────────── */}
      <div className="flex gap-2 mb-6">
        {[
          { id: 'overview',   label: 'OVERVIEW',   icon: FiTrendingUp  },
          { id: 'inventory',  label: 'INVENTORY',  icon: FiPackage     },
          { id: 'movements',  label: 'MOVEMENTS',  icon: FiShuffle     },
        ].map(tab => (
          <motion.button
            key={tab.id}
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            onClick={() => setActiveTab(tab.id)}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '8px 18px', borderRadius: 8, cursor: 'pointer',
              fontFamily: 'Orbitron, monospace', fontSize: '0.72rem', letterSpacing: '0.1em',
              transition: 'all 0.3s',
              background: activeTab === tab.id ? 'rgba(74,222,128,0.15)' : 'transparent',
              border: `1px solid ${activeTab === tab.id ? '#4ade80' : 'rgba(74,92,58,0.3)'}`,
              color: activeTab === tab.id ? '#4ade80' : '#94a3b8',
              position: 'relative', overflow: 'hidden'
            }}
          >
            <tab.icon size={14} />
            {tab.label}
            {activeTab === tab.id && (
              <motion.div
                layoutId="tabIndicator"
                style={{
                  position: 'absolute', bottom: 0, left: 0, right: 0,
                  height: 2, background: '#4ade80'
                }}
              />
            )}
          </motion.button>
        ))}
      </div>

      {/* ── Tab content ──────────────────────────────────────────────────── */}
      <AnimatePresence mode="wait">

        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <motion.div
            key="overview"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-6"
          >
            {/* Bar chart — assets by base */}
            <div className="military-card p-6">
              <h3 style={{ fontFamily: 'Orbitron, monospace', color: '#4ade80', fontSize: '0.75rem', letterSpacing: '0.15em', marginBottom: 20 }}>
                ASSETS BY BASE
              </h3>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={barData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(74,92,58,0.2)" />
                  <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 11, fontFamily: 'Orbitron, monospace' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="total" fill="#4ade80" radius={[4,4,0,0]} name="Total Assets" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Pie chart — asset type distribution */}
            <div className="military-card p-6">
              <h3 style={{ fontFamily: 'Orbitron, monospace', color: '#4ade80', fontSize: '0.75rem', letterSpacing: '0.15em', marginBottom: 20 }}>
                ASSET TYPE DISTRIBUTION
              </h3>
              {pieData.length > 0 ? (
                <ResponsiveContainer width="100%" height={260}>
                  <PieChart>
                    <Pie
                      data={pieData} cx="50%" cy="50%"
                      innerRadius={60} outerRadius={100}
                      paddingAngle={4} dataKey="value"
                    >
                      {pieData.map((_, i) => (
                        <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} stroke="none" />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend
                      formatter={(value) => (
                        <span style={{ color: '#94a3b8', fontSize: '0.78rem', textTransform: 'capitalize' }}>{value}</span>
                      )}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-64">
                  <p style={{ color: '#94a3b8', fontSize: '0.85rem' }}>No asset data available</p>
                </div>
              )}
            </div>

            {/* Net movement summary */}
            {summary && (
              <div className="military-card p-6 lg:col-span-2">
                <h3 style={{ fontFamily: 'Orbitron, monospace', color: '#4ade80', fontSize: '0.75rem', letterSpacing: '0.15em', marginBottom: 20 }}>
                  NET MOVEMENT SUMMARY
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  {[
                    { label: 'Purchased',      value: summary.purchased?.reduce((s,p) => s+p.total,0) || 0,      color: '#4ade80', icon: '↑' },
                    { label: 'Transferred In', value: summary.transfersIn?.reduce((s,p) => s+p.total,0) || 0,    color: '#60a5fa', icon: '→' },
                    { label: 'Transferred Out',value: summary.transfersOut?.reduce((s,p) => s+p.total,0) || 0,   color: '#fbbf24', icon: '←' },
                    { label: 'Assigned',       value: summary.assignments?.reduce((s,p) => s+p.total,0) || 0,    color: '#a78bfa', icon: '✓' },
                    { label: 'Expended',       value: summary.expenditures?.reduce((s,p) => s+p.total,0) || 0,   color: '#f87171', icon: '✕' },
                  ].map((item, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.1 }}
                      style={{
                        background: `${item.color}0d`,
                        border: `1px solid ${item.color}25`,
                        borderRadius: 10, padding: '1rem',
                        textAlign: 'center'
                      }}
                    >
                      <div style={{ fontSize: '1.4rem', color: item.color, marginBottom: 4 }}>{item.icon}</div>
                      <div style={{ fontFamily: 'Orbitron, monospace', color: item.color, fontSize: '1.3rem', fontWeight: 700 }}>
                        {item.value.toLocaleString()}
                      </div>
                      <div style={{ color: '#94a3b8', fontSize: '0.68rem', letterSpacing: '0.08em', textTransform: 'uppercase', marginTop: 4 }}>
                        {item.label}
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Closing balance formula */}
                <div style={{
                  marginTop: '1.5rem', padding: '1rem',
                  background: 'rgba(74,222,128,0.05)',
                  border: '1px solid rgba(74,222,128,0.15)',
                  borderRadius: 8,
                  fontFamily: 'Orbitron, monospace',
                  fontSize: '0.72rem', color: '#94a3b8',
                  letterSpacing: '0.08em', textAlign: 'center'
                }}>
                  CLOSING BALANCE = PURCHASED + TRANSFERRED IN − TRANSFERRED OUT − ASSIGNED − EXPENDED
                  <span style={{ display: 'block', marginTop: 8, color: '#4ade80', fontSize: '1rem' }}>
                    = {(
                        (summary.purchased?.reduce((s,p)=>s+p.total,0)||0) +
                        (summary.transfersIn?.reduce((s,p)=>s+p.total,0)||0) -
                        (summary.transfersOut?.reduce((s,p)=>s+p.total,0)||0) -
                        (summary.assignments?.reduce((s,p)=>s+p.total,0)||0) -
                        (summary.expenditures?.reduce((s,p)=>s+p.total,0)||0)
                      ).toLocaleString()} UNITS
                  </span>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* INVENTORY TAB */}
        {activeTab === 'inventory' && (
          <motion.div
            key="inventory"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="military-card overflow-hidden"
          >
            <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid rgba(74,92,58,0.3)' }}>
              <h3 style={{ fontFamily: 'Orbitron, monospace', color: '#4ade80', fontSize: '0.75rem', letterSpacing: '0.15em' }}>
                CURRENT INVENTORY — {assets.length} ASSETS
              </h3>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table className="military-table" style={{ minWidth: 600 }}>
                <thead>
                  <tr>
                    <th>Asset</th>
                    <th>Base</th>
                    <th>Quantity</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {assets.length > 0
                    ? assets.map((asset, i) => <AssetRow key={asset._id} asset={asset} index={i} />)
                    : (
                      <tr>
                        <td colSpan={4} style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
                          No assets found. Add some via the Purchases page.
                        </td>
                      </tr>
                    )
                  }
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {/* MOVEMENTS TAB */}
        {activeTab === 'movements' && (
          <motion.div
            key="movements"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="military-card overflow-hidden"
          >
            <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid rgba(74,92,58,0.3)' }}>
              <h3 style={{ fontFamily: 'Orbitron, monospace', color: '#4ade80', fontSize: '0.75rem', letterSpacing: '0.15em' }}>
                RECENT TRANSFER MOVEMENTS
              </h3>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table className="military-table" style={{ minWidth: 700 }}>
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
                  {recentTransfers.length > 0
                    ? recentTransfers.map((t, i) => (
                      <motion.tr
                        key={t._id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.06 }}
                      >
                        <td style={{ borderBottom: '1px solid rgba(74,92,58,0.2)', padding: '0.75rem 1rem' }}>
                          <span style={{ color: '#e2e8f0', fontWeight: 500 }}>{t.assetName}</span>
                          <span style={{ display: 'block', color: '#94a3b8', fontSize: '0.72rem', textTransform: 'capitalize' }}>{t.assetType}</span>
                        </td>
                        <td style={{ borderBottom: '1px solid rgba(74,92,58,0.2)', padding: '0.75rem 1rem', color: '#f87171', fontSize: '0.85rem' }}>
                          {t.fromBase}
                        </td>
                        <td style={{ borderBottom: '1px solid rgba(74,92,58,0.2)', padding: '0.75rem 1rem', color: '#4ade80', fontSize: '0.85rem' }}>
                          {t.toBase}
                        </td>
                        <td style={{ borderBottom: '1px solid rgba(74,92,58,0.2)', padding: '0.75rem 1rem', fontFamily: 'Orbitron, monospace', color: '#fbbf24', fontSize: '0.9rem' }}>
                          {t.quantity}
                        </td>
                        <td style={{ borderBottom: '1px solid rgba(74,92,58,0.2)', padding: '0.75rem 1rem' }}>
                          <span className={`badge-${t.status}`}>{t.status.toUpperCase()}</span>
                        </td>
                        <td style={{ borderBottom: '1px solid rgba(74,92,58,0.2)', padding: '0.75rem 1rem', color: '#94a3b8', fontSize: '0.8rem' }}>
                          {new Date(t.createdAt).toLocaleDateString()}
                        </td>
                      </motion.tr>
                    ))
                    : (
                      <tr>
                        <td colSpan={6} style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
                          No transfers found.
                        </td>
                      </tr>
                    )
                  }
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}