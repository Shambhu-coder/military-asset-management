import { useState, useEffect } from 'react';
import API from '../api/axios.js';
import { useAuth } from '../context/AuthContext.jsx';
import toast from 'react-hot-toast';

const BASES       = ['Base Alpha', 'Base Bravo', 'Base Charlie', 'Base Delta'];
const ASSET_TYPES = ['vehicle', 'weapon', 'ammunition', 'equipment'];
const TYPE_EMOJI  = { vehicle: '🚗', weapon: '🔫', ammunition: '💊', equipment: '⚙️' };
const TYPE_COLOR  = { vehicle: 'var(--accent)', weapon: 'var(--red)', ammunition: 'var(--yellow)', equipment: 'var(--purple)' };

// ── Add Asset Modal ───────────────────────────────────────────────────────────
function AddAssetModal({ onClose, onSuccess, userBase, isAdmin }) {
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
      await API.post('/assets', { ...form, quantity: Number(form.quantity), unitCost: Number(form.unitCost) || 0 });
      toast.success(`${form.name} added to inventory!`);
      onSuccess();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add asset');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 100,
      backgroundColor: 'rgba(0,0,0,0.65)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem',
    }}
    onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div style={{
        width: '100%', maxWidth: 500,
        backgroundColor: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)',
        overflow: 'hidden',
        boxShadow: 'var(--shadow-lg)',
        maxHeight: '90vh',
        overflowY: 'auto',
      }}>
        {/* Header */}
        <div style={{
          padding: '1.1rem 1.4rem',
          borderBottom: '1px solid var(--border)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            Add New Asset
          </h2>
          <button onClick={onClose} style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'var(--text-muted)', fontSize: '1.2rem', padding: '2px 6px', borderRadius: 4,
            transition: 'color 0.15s',
          }}
          onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'}
          onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
          >✕</button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} style={{ padding: '1.4rem' }}>

          {/* Asset Type */}
          <div style={{ marginBottom: '1.1rem' }}>
            <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '0.8rem', fontWeight: 500, marginBottom: 8 }}>
              Asset Type
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
              {ASSET_TYPES.map(type => {
                const active = form.assetType === type;
                const color = TYPE_COLOR[type];
                return (
                  <button
                    key={type} type="button"
                    onClick={() => set('assetType', type)}
                    style={{
                      padding: '10px 6px',
                      borderRadius: 8,
                      cursor: 'pointer',
                      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5,
                      backgroundColor: active ? `${color.replace('var(--', '').replace(')', '')}` ? `rgba(99,179,237,0.12)` : 'transparent' : 'rgba(255,255,255,0.02)',
                      border: `1px solid ${active ? 'rgba(99,179,237,0.4)' : 'var(--border)'}`,
                      transition: 'all 0.15s',
                    }}
                    // simple active highlight using inline override
                    ref={el => {
                      if (el) {
                        if (active) {
                          el.style.backgroundColor = `${color}18`;
                          el.style.borderColor = `${color}50`;
                        }
                      }
                    }}
                  >
                    <span style={{ fontSize: '1.2rem' }}>{TYPE_EMOJI[type]}</span>
                    <span style={{
                      fontSize: '0.65rem',
                      fontFamily: 'var(--font-heading)',
                      color: active ? color : 'var(--text-muted)',
                      textTransform: 'capitalize',
                    }}>
                      {type}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Name */}
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '0.8rem', fontWeight: 500, marginBottom: 6 }}>
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

          {/* Qty + Cost */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: '1rem' }}>
            <div>
              <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '0.8rem', fontWeight: 500, marginBottom: 6 }}>
                Quantity *
              </label>
              <input className="military-input" type="number" min="1" placeholder="0" value={form.quantity} onChange={e => set('quantity', e.target.value)} required />
            </div>
            <div>
              <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '0.8rem', fontWeight: 500, marginBottom: 6 }}>
                Unit Cost ($)
              </label>
              <input className="military-input" type="number" min="0" placeholder="0" value={form.unitCost} onChange={e => set('unitCost', e.target.value)} />
            </div>
          </div>

          {/* Base */}
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '0.8rem', fontWeight: 500, marginBottom: 6 }}>
              Base
            </label>
            {isAdmin ? (
              <select className="military-input" value={form.base} onChange={e => set('base', e.target.value)}>
                {BASES.map(b => <option key={b} value={b}>{b}</option>)}
              </select>
            ) : (
              <div className="military-input" style={{ opacity: 0.6, cursor: 'not-allowed' }}>
                {form.base}
              </div>
            )}
          </div>

          {/* Description */}
          <div style={{ marginBottom: '1.4rem' }}>
            <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '0.8rem', fontWeight: 500, marginBottom: 6 }}>
              Description (optional)
            </label>
            <textarea className="military-input" placeholder="Additional notes..." value={form.description} onChange={e => set('description', e.target.value)} rows={2} style={{ resize: 'vertical' }} />
          </div>

          {/* Buttons */}
          <div style={{ display: 'flex', gap: 10 }}>
            <button type="button" onClick={onClose} className="btn-outline" style={{ flex: 1 }}>Cancel</button>
            <button type="submit" disabled={loading} className="btn-primary" style={{ flex: 2, justifyContent: 'center', opacity: loading ? 0.7 : 1 }}>
              {loading ? '⏳ Adding...' : '✅ Confirm Purchase'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Asset Card ────────────────────────────────────────────────────────────────
function AssetCard({ asset }) {
  const color = TYPE_COLOR[asset.assetType] || 'var(--text-secondary)';
  return (
    <div style={{
      backgroundColor: 'var(--bg-card)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius-lg)',
      padding: '1.2rem',
      borderLeft: `3px solid ${color}`,
      transition: 'border-color 0.15s, box-shadow 0.15s, transform 0.15s',
      cursor: 'default',
      position: 'relative',
    }}
    onMouseEnter={e => { e.currentTarget.style.boxShadow = 'var(--shadow-md)'; e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.borderColor = `${color}80`; }}
    onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'none'; e.currentTarget.style.borderColor = `${color}`; }}
    >
      {/* Badge */}
      <div style={{
        display: 'inline-flex', alignItems: 'center', gap: 5,
        padding: '2px 8px', borderRadius: 5, marginBottom: 10,
        backgroundColor: `${color}15`,
        color, fontSize: '0.72rem',
        fontFamily: 'var(--font-heading)', fontWeight: 600,
        textTransform: 'capitalize',
      }}>
        {TYPE_EMOJI[asset.assetType]} {asset.assetType}
      </div>

      <div style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--text-primary)', marginBottom: 4 }}>
        {asset.name}
      </div>
      <div style={{ color: 'var(--text-muted)', fontSize: '0.78rem', marginBottom: 12 }}>
        📍 {asset.base}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Quantity</div>
          <div style={{ fontFamily: 'var(--font-heading)', color, fontSize: '1.4rem', fontWeight: 700 }}>
            {asset.quantity?.toLocaleString()}
          </div>
        </div>
        {asset.unitCost > 0 && (
          <div style={{ textAlign: 'right' }}>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Unit Cost</div>
            <div style={{ color: 'var(--green)', fontWeight: 600, fontSize: '0.9rem' }}>
              ${asset.unitCost?.toLocaleString()}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main Purchases Page ───────────────────────────────────────────────────────
export default function Purchases() {
  const { user, isAdmin } = useAuth();
  const [assets,       setAssets]       = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [showModal,    setShowModal]    = useState(false);
  const [filterType,   setFilterType]   = useState('all');
  const [filterBase,   setFilterBase]   = useState('all');
  const [searchQuery,  setSearchQuery]  = useState('');

  const fetchAssets = async () => {
    setLoading(true);
    try {
      const res = await API.get('/assets');
      setAssets(res.data.data || []);
    } catch {
      toast.error('Failed to load assets');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAssets(); }, []);

  const filtered = assets.filter(a => {
    const matchType   = filterType === 'all' || a.assetType === filterType;
    const matchBase   = filterBase === 'all' || a.base === filterBase;
    const matchSearch = a.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchType && matchBase && matchSearch;
  });

  const summary = ASSET_TYPES.map(type => ({
    type,
    total: assets.filter(a => a.assetType === type).reduce((s, a) => s + a.quantity, 0),
    count: assets.filter(a => a.assetType === type).length,
  }));

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', gap: 12 }}>
        <span style={{ fontSize: '1.5rem' }}>⏳</span>
        <span style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-heading)' }}>Loading inventory...</span>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1400 }}>

      {/* Header */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: '1.5rem' }}>
        <div>
          <h1 className="page-title">Purchases</h1>
          <p className="page-subtitle">{assets.length} assets across all bases</p>
        </div>
        <button className="btn-primary" onClick={() => setShowModal(true)}>
          ➕ Add Asset
        </button>
      </div>

      {/* Summary type cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.75rem', marginBottom: '1.25rem' }}>
        {summary.map(s => {
          const color = TYPE_COLOR[s.type];
          const active = filterType === s.type;
          return (
            <div
              key={s.type}
              onClick={() => setFilterType(active ? 'all' : s.type)}
              style={{
                padding: '1rem',
                borderRadius: 'var(--radius-md)',
                cursor: 'pointer',
                textAlign: 'center',
                backgroundColor: active ? `${color}12` : 'var(--bg-card)',
                border: `1px solid ${active ? `${color}50` : 'var(--border)'}`,
                transition: 'all 0.15s',
              }}
              onMouseEnter={e => { if (!active) { e.currentTarget.style.borderColor = 'var(--border-hover)'; e.currentTarget.style.backgroundColor = 'var(--bg-card-hover)'; }}}
              onMouseLeave={e => { if (!active) { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.backgroundColor = 'var(--bg-card)'; }}}
            >
              <div style={{ fontSize: '1.5rem', marginBottom: 4 }}>{TYPE_EMOJI[s.type]}</div>
              <div style={{ fontFamily: 'var(--font-heading)', color: active ? color : 'var(--text-primary)', fontSize: '1.1rem', fontWeight: 700 }}>
                {s.total.toLocaleString()}
              </div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.7rem', textTransform: 'capitalize', marginTop: 2 }}>
                {s.type}s
              </div>
            </div>
          );
        })}
      </div>

      {/* Search + base filter */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: '1.25rem' }}>
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

      {/* Asset Grid */}
      {filtered.length > 0 ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1rem' }}>
          {filtered.map(asset => <AssetCard key={asset._id} asset={asset} />)}
        </div>
      ) : (
        <div style={{
          textAlign: 'center', padding: '4rem 2rem',
          backgroundColor: 'var(--bg-card)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-lg)',
        }}>
          <div style={{ fontSize: '3rem', marginBottom: 12 }}>📦</div>
          <p style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-heading)', fontSize: '0.9rem' }}>
            No assets found
          </p>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: 6 }}>
            {searchQuery ? 'Try a different search term' : 'Click "Add Asset" to get started'}
          </p>
        </div>
      )}

      {showModal && (
        <AddAssetModal
          onClose={() => setShowModal(false)}
          onSuccess={fetchAssets}
          userBase={user?.base}
          isAdmin={isAdmin}
        />
      )}
    </div>
  );
}