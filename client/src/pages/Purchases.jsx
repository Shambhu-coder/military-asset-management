import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GiTank, GiPistolGun, GiBullets, GiMilitaryFort, GiRadarSweep } from 'react-icons/gi';
import { FiPlus, FiPackage, FiX, FiCheck, FiDollarSign } from 'react-icons/fi';
import API from '../api/axios.js';
import { useAuth } from '../context/AuthContext.jsx';
import toast from 'react-hot-toast';

// ── Constants ─────────────────────────────────────────────────────────────────
const BASES       = ['Base Alpha', 'Base Bravo', 'Base Charlie', 'Base Delta'];
const ASSET_TYPES = ['vehicle', 'weapon', 'ammunition', 'equipment'];

const TYPE_CONFIG = {
  vehicle:    { icon: GiTank,        color: '#60a5fa', label: 'Vehicle'    },
  weapon:     { icon: GiPistolGun,   color: '#f87171', label: 'Weapon'     },
  ammunition: { icon: GiBullets,     color: '#fbbf24', label: 'Ammunition' },
  equipment:  { icon: GiMilitaryFort, color: '#a78bfa', label: 'Equipment' },
};

// ── Asset card ────────────────────────────────────────────────────────────────
const AssetCard = ({ asset, index }) => {
  const cfg   = TYPE_CONFIG[asset.assetType] || TYPE_CONFIG.equipment;
  const Icon  = cfg.icon;
  const color = cfg.color;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06 }}
      className="military-card"
      style={{ padding: '1.25rem', position: 'relative', overflow: 'hidden' }}
    >
      {/* Watermark icon */}
      <div style={{ position: 'absolute', right: -8, bottom: -8, opacity: 0.06 }}>
        <Icon size={80} color={color} />
      </div>

      {/* Type badge */}
      <div style={{
        display: 'inline-flex', alignItems: 'center', gap: 6,
        padding: '3px 10px', borderRadius: 6, marginBottom: 12,
        background: `${color}15`, border: `1px solid ${color}30`,
        color, fontSize: '0.7rem',
        fontFamily: 'Orbitron, monospace', letterSpacing: '0.08em',
      }}>
        <Icon size={12} />
        {cfg.label.toUpperCase()}
      </div>

      {/* Asset name */}
      <div style={{ color: '#e2e8f0', fontWeight: 600, fontSize: '0.95rem', marginBottom: 4 }}>
        {asset.name}
      </div>

      {/* Base */}
      <div style={{ color: '#94a3b8', fontSize: '0.78rem', marginBottom: 12 }}>
        📍 {asset.base}
      </div>

      {/* Stats row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <div style={{ color: '#94a3b8', fontSize: '0.65rem', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            Quantity
          </div>
          <div style={{
            fontFamily: 'Orbitron, monospace', color, fontSize: '1.4rem', fontWeight: 700,
          }}>
            {asset.quantity?.toLocaleString()}
          </div>
        </div>
        {asset.unitCost > 0 && (
          <div style={{ textAlign: 'right' }}>
            <div style={{ color: '#94a3b8', fontSize: '0.65rem', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
              Unit Cost
            </div>
            <div style={{ color: '#4ade80', fontSize: '0.9rem', fontWeight: 600 }}>
              ${asset.unitCost?.toLocaleString()}
            </div>
          </div>
        )}
      </div>

      {/* Bottom accent */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, height: 2,
        background: `linear-gradient(90deg, ${color}50, transparent)`,
      }} />
    </motion.div>
  );
};

// ── Add Asset Modal ───────────────────────────────────────────────────────────
const AddAssetModal = ({ onClose, onSuccess, userBase, isAdmin }) => {
  const [form, setForm] = useState({
    name: '', assetType: 'weapon', quantity: '',
    base: userBase || 'Base Alpha', unitCost: '', description: '',
  });
  const [loading, setLoading] = useState(false);

  const set = (field, value) => setForm(f => ({ ...f, [field]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.quantity) return toast.error('Name and quantity are required');
    setLoading(true);
    try {
      await API.post('/assets', {
        ...form,
        quantity: Number(form.quantity),
        unitCost: Number(form.unitCost) || 0,
      });
      toast.success(`${form.name} added to inventory! 🪖`);
      onSuccess();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add asset');
    } finally {
      setLoading(false);
    }
  };

  const selectedCfg = TYPE_CONFIG[form.assetType];
  const SelectedIcon = selectedCfg.icon;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: 'fixed', inset: 0, zIndex: 100,
        background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '1rem',
      }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        style={{
          width: '100%', maxWidth: 520,
          background: 'linear-gradient(145deg, #1a3a2a, #0a0f0d)',
          border: '1px solid rgba(74,222,128,0.25)',
          borderRadius: 16, overflow: 'hidden',
          boxShadow: '0 25px 60px rgba(0,0,0,0.7)',
        }}
      >
        {/* Modal header */}
        <div style={{
          padding: '1.25rem 1.5rem',
          borderBottom: '1px solid rgba(74,222,128,0.1)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <SelectedIcon size={20} color={selectedCfg.color} />
            <span style={{
              fontFamily: 'Orbitron, monospace', color: '#e2e8f0',
              fontSize: '0.85rem', letterSpacing: '0.1em',
            }}>
              ADD NEW ASSET
            </span>
          </div>
          <motion.button
            whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}
          >
            <FiX size={20} />
          </motion.button>
        </div>

        {/* Modal body */}
        <form onSubmit={handleSubmit} style={{ padding: '1.5rem' }}>

          {/* Asset type selector */}
          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.7rem', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8 }}>
              Asset Type
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
              {ASSET_TYPES.map(type => {
                const cfg  = TYPE_CONFIG[type];
                const TIcon = cfg.icon;
                const active = form.assetType === type;
                return (
                  <motion.button
                    key={type} type="button"
                    whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                    onClick={() => set('assetType', type)}
                    style={{
                      padding: '10px 6px', borderRadius: 8, cursor: 'pointer',
                      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5,
                      background: active ? `${cfg.color}15` : 'rgba(255,255,255,0.02)',
                      border: `1px solid ${active ? cfg.color + '50' : 'rgba(74,92,58,0.2)'}`,
                      transition: 'all 0.2s',
                    }}
                  >
                    <TIcon size={20} color={active ? cfg.color : '#94a3b8'} />
                    <span style={{
                      fontSize: '0.6rem', fontFamily: 'Orbitron, monospace',
                      color: active ? cfg.color : '#94a3b8', letterSpacing: '0.05em',
                    }}>
                      {cfg.label.toUpperCase()}
                    </span>
                  </motion.button>
                );
              })}
            </div>
          </div>

          {/* Name */}
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.7rem', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 6 }}>
              Asset Name *
            </label>
            <input
              className="military-input"
              placeholder="e.g. AK-47 Rifle, Humvee, 5.56mm Rounds"
              value={form.name}
              onChange={e => set('name', e.target.value)}
              required
            />
          </div>

          {/* Quantity + Cost row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: '1rem' }}>
            <div>
              <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.7rem', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 6 }}>
                Quantity *
              </label>
              <input
                className="military-input"
                type="number" min="1"
                placeholder="0"
                value={form.quantity}
                onChange={e => set('quantity', e.target.value)}
                required
              />
            </div>
            <div>
              <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.7rem', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 6 }}>
                Unit Cost ($)
              </label>
              <div style={{ position: 'relative' }}>
                <FiDollarSign size={14} color="#94a3b8" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  className="military-input"
                  type="number" min="0"
                  placeholder="0"
                  value={form.unitCost}
                  onChange={e => set('unitCost', e.target.value)}
                  style={{ paddingLeft: 32 }}
                />
              </div>
            </div>
          </div>

          {/* Base — only admins can choose */}
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.7rem', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 6 }}>
              Base
            </label>
            {isAdmin ? (
              <select
                className="military-input"
                value={form.base}
                onChange={e => set('base', e.target.value)}
              >
                {BASES.map(b => <option key={b} value={b}>{b}</option>)}
              </select>
            ) : (
              <div className="military-input" style={{ opacity: 0.6, cursor: 'not-allowed' }}>
                {form.base}
              </div>
            )}
          </div>

          {/* Description */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.7rem', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 6 }}>
              Description (optional)
            </label>
            <textarea
              className="military-input"
              placeholder="Additional notes about this asset..."
              value={form.description}
              onChange={e => set('description', e.target.value)}
              rows={2}
              style={{ resize: 'vertical' }}
            />
          </div>

          {/* Buttons */}
          <div style={{ display: 'flex', gap: 10 }}>
            <motion.button
              type="button" onClick={onClose}
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              className="btn-outline" style={{ flex: 1 }}
            >
              CANCEL
            </motion.button>
            <motion.button
              type="submit" disabled={loading}
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              className="btn-primary" style={{ flex: 2, opacity: loading ? 0.7 : 1 }}
            >
              {loading ? (
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                  <motion.span
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    style={{ display: 'inline-block', width: 14, height: 14, border: '2px solid #0a0f0d', borderTopColor: 'transparent', borderRadius: '50%' }}
                  />
                  ADDING...
                </span>
              ) : (
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                  <FiCheck size={15} /> CONFIRM PURCHASE
                </span>
              )}
            </motion.button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

// ── Main Purchases Page ───────────────────────────────────────────────────────
export default function Purchases() {
  const { user, isAdmin } = useAuth();
  const [assets,      setAssets]      = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [showModal,   setShowModal]   = useState(false);
  const [filterType,  setFilterType]  = useState('all');
  const [filterBase,  setFilterBase]  = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchAssets = async () => {
    setLoading(true);
    try {
      const res = await API.get('/assets');
      setAssets(res.data.data || []);
    } catch (err) {
      toast.error('Failed to load assets');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAssets(); }, []);

  // ── Filter logic ────────────────────────────────────────────────────────────
  const filtered = assets.filter(a => {
    const matchType   = filterType === 'all' || a.assetType === filterType;
    const matchBase   = filterBase === 'all' || a.base === filterBase;
    const matchSearch = a.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchType && matchBase && matchSearch;
  });

  // ── Summary counts ──────────────────────────────────────────────────────────
  const summary = ASSET_TYPES.map(type => ({
    type,
    count: assets.filter(a => a.assetType === type).length,
    total: assets.filter(a => a.assetType === type).reduce((s, a) => s + a.quantity, 0),
    ...TYPE_CONFIG[type],
  }));

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}>
          <GiRadarSweep size={40} color="#4ade80" />
        </motion.div>
        <span style={{ marginLeft: 14, fontFamily: 'Orbitron, monospace', color: '#4ade80', fontSize: '0.9rem', letterSpacing: '0.15em' }}>
          LOADING INVENTORY...
        </span>
      </div>
    );
  }

  return (
    <div className="bg-grid" style={{ minHeight: '100%' }}>

      {/* ── Header ────────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 16, marginBottom: 28 }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <FiPackage size={16} color="#4ade80" />
            <span style={{ fontFamily: 'Orbitron, monospace', color: '#4ade80', fontSize: '0.65rem', letterSpacing: '0.2em' }}>
              INVENTORY MANAGEMENT
            </span>
          </div>
          <h1 style={{ fontFamily: 'Orbitron, monospace', color: '#e2e8f0', fontSize: '1.6rem', letterSpacing: '0.05em' }}>
            PURCHASES
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginTop: 4 }}>
            {assets.length} assets across all bases
          </p>
        </div>

        <motion.button
          whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
          onClick={() => setShowModal(true)}
          className="btn-primary"
          style={{ display: 'flex', alignItems: 'center', gap: 8 }}
        >
          <FiPlus size={16} /> ADD ASSET
        </motion.button>
      </motion.div>

      {/* ── Summary type cards ─────────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12, marginBottom: 24 }}>
        {summary.map((s, i) => {
          const SIcon = s.icon;
          return (
            <motion.div
              key={s.type}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              onClick={() => setFilterType(filterType === s.type ? 'all' : s.type)}
              style={{
                padding: '1rem', borderRadius: 10, cursor: 'pointer',
                background: filterType === s.type ? `${s.color}15` : 'rgba(255,255,255,0.02)',
                border: `1px solid ${filterType === s.type ? s.color + '40' : 'rgba(74,92,58,0.2)'}`,
                transition: 'all 0.2s', textAlign: 'center',
              }}
            >
              <SIcon size={28} color={filterType === s.type ? s.color : '#94a3b8'} style={{ margin: '0 auto 8px' }} />
              <div style={{ fontFamily: 'Orbitron, monospace', color: filterType === s.type ? s.color : '#94a3b8', fontSize: '1.1rem', fontWeight: 700 }}>
                {s.total.toLocaleString()}
              </div>
              <div style={{ color: '#94a3b8', fontSize: '0.68rem', letterSpacing: '0.08em', textTransform: 'uppercase', marginTop: 2 }}>
                {s.label}s
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* ── Search + base filter ────────────────────────────────────────── */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 20 }}>
        <input
          className="military-input"
          placeholder="🔍  Search assets..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          style={{ flex: 1, minWidth: 200 }}
        />
        <select
          className="military-input"
          value={filterBase}
          onChange={e => setFilterBase(e.target.value)}
          style={{ width: 'auto', minWidth: 160 }}
        >
          <option value="all">All Bases</option>
          {BASES.map(b => <option key={b} value={b}>{b}</option>)}
        </select>
      </div>

      {/* ── Asset grid ────────────────────────────────────────────────── */}
      {filtered.length > 0 ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
          {filtered.map((asset, i) => (
            <AssetCard key={asset._id} asset={asset} index={i} />
          ))}
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{
            textAlign: 'center', padding: '4rem 2rem',
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid rgba(74,92,58,0.2)',
            borderRadius: 12,
          }}
        >
          <GiMilitaryFort size={48} color="#4a5c3a" style={{ margin: '0 auto 16px' }} />
          <p style={{ color: '#94a3b8', fontFamily: 'Orbitron, monospace', fontSize: '0.85rem', letterSpacing: '0.1em' }}>
            NO ASSETS FOUND
          </p>
          <p style={{ color: '#4a5c3a', fontSize: '0.8rem', marginTop: 8 }}>
            {searchQuery ? 'Try a different search term' : 'Click "ADD ASSET" to get started'}
          </p>
        </motion.div>
      )}

      {/* ── Add Asset Modal ────────────────────────────────────────────── */}
      <AnimatePresence>
        {showModal && (
          <AddAssetModal
            onClose={() => setShowModal(false)}
            onSuccess={fetchAssets}
            userBase={user?.base}
            isAdmin={isAdmin}
          />
        )}
      </AnimatePresence>
    </div>
  );
}