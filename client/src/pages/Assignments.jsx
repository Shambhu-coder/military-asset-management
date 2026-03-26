import { useState, useEffect } from 'react';
import API from '../api/axios.js';
import { useAuth } from '../context/AuthContext.jsx';
import toast from 'react-hot-toast';

const TYPE_EMOJI = { vehicle: '🚗', weapon: '🔫', ammunition: '💊', equipment: '⚙️' };
const TYPE_COLOR = { vehicle: 'var(--accent)', weapon: 'var(--red)', ammunition: 'var(--yellow)', equipment: 'var(--purple)' };

const STATUS_CONFIG = {
  active:   { color: 'var(--green)',  bg: 'var(--green-bg)',  label: 'Active'   },
  returned: { color: 'var(--blue)',   bg: 'var(--blue-bg)',   label: 'Returned' },
  expended: { color: 'var(--red)',    bg: 'var(--red-bg)',    label: 'Expended' },
};

function NewAssignmentModal({ onClose, onSuccess, assets }) {
  const [form, setForm] = useState({ assetId: '', assignedTo: '', quantity: '', purpose: '' });
  const [loading, setLoading] = useState(false);
  const set = (field, value) => setForm(f => ({ ...f, [field]: value }));
  const selectedAsset = assets.find(a => a._id?.toString() === form.assetId);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.assetId || !form.assignedTo || !form.quantity) return toast.error('All required fields must be filled');
    if (selectedAsset && Number(form.quantity) > selectedAsset.quantity)
      return toast.error(`Only ${selectedAsset.quantity} units available`);
    setLoading(true);
    try {
      await API.post('/assignment', { assetId: form.assetId.toString(), assignedTo: form.assignedTo, quantity: Number(form.quantity), purpose: form.purpose });
      toast.success(`Assets assigned to ${form.assignedTo}`);
      onSuccess(); onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create assignment');
    } finally { setLoading(false); }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 100, backgroundColor: 'rgba(0,0,0,0.65)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ width: '100%', maxWidth: 480, backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden', boxShadow: 'var(--shadow-lg)', maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ padding: '1.1rem 1.4rem', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>📋 New Assignment</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '1.2rem' }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}>✕</button>
        </div>
        <form onSubmit={handleSubmit} style={{ padding: '1.4rem' }}>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '0.8rem', fontWeight: 500, marginBottom: 6 }}>Select Asset *</label>
            <select className="military-input" value={form.assetId} onChange={e => set('assetId', e.target.value)} required>
              <option value="">— Choose an asset —</option>
              {assets.map(a => <option key={a._id?.toString()} value={a._id?.toString()}>{a.name} ({a.base}) — {a.quantity} available</option>)}
            </select>
          </div>
          {selectedAsset && (
            <div style={{ padding: '0.65rem 0.9rem', borderRadius: 8, marginBottom: '1rem', backgroundColor: 'rgba(99,179,237,0.06)', border: '1px solid rgba(99,179,237,0.15)', fontSize: '0.82rem', color: 'var(--text-secondary)', display: 'flex', justifyContent: 'space-between' }}>
              <span>📍 Base: <strong style={{ color: 'var(--text-primary)' }}>{selectedAsset.base}</strong></span>
              <span>📦 Available: <strong style={{ color: 'var(--accent)' }}>{selectedAsset.quantity}</strong></span>
            </div>
          )}
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '0.8rem', fontWeight: 500, marginBottom: 6 }}>Assign To (Personnel / Unit) *</label>
            <input className="military-input" placeholder="e.g. Sgt. Johnson, Alpha Squad" value={form.assignedTo} onChange={e => set('assignedTo', e.target.value)} required />
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '0.8rem', fontWeight: 500, marginBottom: 6 }}>Quantity *</label>
            <input className="military-input" type="number" min="1" max={selectedAsset?.quantity} placeholder="0" value={form.quantity} onChange={e => set('quantity', e.target.value)} required />
          </div>
          <div style={{ marginBottom: '1.4rem' }}>
            <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '0.8rem', fontWeight: 500, marginBottom: 6 }}>Purpose (optional)</label>
            <textarea className="military-input" rows={2} placeholder="Mission, patrol, training exercise..." value={form.purpose} onChange={e => set('purpose', e.target.value)} style={{ resize: 'vertical' }} />
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button type="button" onClick={onClose} className="btn-outline" style={{ flex: 1 }}>Cancel</button>
            <button type="submit" disabled={loading} className="btn-primary" style={{ flex: 2, justifyContent: 'center', opacity: loading ? 0.7 : 1 }}>
              {loading ? '⏳ Assigning...' : '✅ Confirm Assignment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function AssignmentCard({ assignment }) {
  const color  = TYPE_COLOR[assignment.assetType]  || 'var(--text-secondary)';
  const status = STATUS_CONFIG[assignment.status] || STATUS_CONFIG.active;
  return (
    <div style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '1.2rem', borderLeft: `3px solid ${color}`, transition: 'border-color 0.15s, box-shadow 0.15s, transform 0.15s' }}
      onMouseEnter={e => { e.currentTarget.style.boxShadow = 'var(--shadow-md)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'none'; }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '2px 8px', borderRadius: 5, backgroundColor: `${color}15`, color, fontSize: '0.72rem', fontFamily: 'var(--font-heading)', fontWeight: 600, textTransform: 'capitalize' }}>
          {TYPE_EMOJI[assignment.assetType]} {assignment.assetType}
        </div>
        <span style={{ padding: '3px 10px', borderRadius: 99, fontSize: '0.72rem', fontWeight: 600, backgroundColor: status.bg, color: status.color, border: `1px solid ${status.color}40` }}>
          {status.label}
        </span>
      </div>
      <div style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--text-primary)', marginBottom: 4 }}>{assignment.assetName}</div>
      <div style={{ color: 'var(--accent)', fontSize: '0.82rem', marginBottom: 3 }}>👤 {assignment.assignedTo}</div>
      <div style={{ color: 'var(--text-muted)', fontSize: '0.78rem', marginBottom: assignment.purpose ? 10 : 12 }}>📍 {assignment.base}</div>
      {assignment.purpose && (
        <div style={{ padding: '5px 8px', borderRadius: 6, marginBottom: 12, backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', color: 'var(--text-muted)', fontSize: '0.75rem', fontStyle: 'italic' }}>
          {assignment.purpose}
        </div>
      )}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Quantity</div>
          <div style={{ fontFamily: 'var(--font-heading)', color, fontSize: '1.3rem', fontWeight: 700 }}>{assignment.quantity}</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.72rem' }}>{assignment.assignedBy?.name || '—'}</div>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>{new Date(assignment.createdAt).toLocaleDateString()}</div>
        </div>
      </div>
    </div>
  );
}

export default function Assignments() {
  const { isAdmin, isCommander } = useAuth();
  const [assignments,  setAssignments]  = useState([]);
  const [assets,       setAssets]       = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [showModal,    setShowModal]    = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery,  setSearchQuery]  = useState('');
  const canAssign = isAdmin || isCommander;

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [aRes, assRes] = await Promise.all([API.get('/assets'), API.get('/assignment')]);
      setAssets(aRes.data.data || []);
      setAssignments(assRes.data.data || []);
    } catch { toast.error('Failed to load assignments'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchAll(); }, []);

  const filtered = assignments.filter(a => {
    const matchStatus = filterStatus === 'all' || a.status === filterStatus;
    const matchSearch = a.assetName?.toLowerCase().includes(searchQuery.toLowerCase()) || a.assignedTo?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchStatus && matchSearch;
  });

  const counts = {
    all: assignments.length,
    active:   assignments.filter(a => a.status === 'active').length,
    returned: assignments.filter(a => a.status === 'returned').length,
    expended: assignments.filter(a => a.status === 'expended').length,
  };

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', gap: 12 }}>
      <span style={{ fontSize: '1.5rem' }}>⏳</span>
      <span style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-heading)' }}>Loading assignments...</span>
    </div>
  );

  return (
    <div style={{ maxWidth: 1400 }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: '1.5rem' }}>
        <div>
          <h1 className="page-title">Assignments</h1>
          <p className="page-subtitle">{counts.active} active · {counts.returned} returned · {counts.expended} expended</p>
        </div>
        {canAssign && <button className="btn-primary" onClick={() => setShowModal(true)}>➕ New Assignment</button>}
      </div>

      <div style={{ display: 'flex', gap: 6, marginBottom: '1rem', flexWrap: 'wrap' }}>
        {[
          { key: 'all',      label: 'All',      color: 'var(--text-secondary)' },
          { key: 'active',   label: 'Active',   color: 'var(--green)'  },
          { key: 'returned', label: 'Returned', color: 'var(--blue)'   },
          { key: 'expended', label: 'Expended', color: 'var(--red)'    },
        ].map(tab => (
          <button key={tab.key} onClick={() => setFilterStatus(tab.key)}
            style={{ padding: '6px 14px', borderRadius: 7, cursor: 'pointer', fontFamily: 'var(--font-heading)', fontSize: '0.78rem', fontWeight: 600, border: `1px solid ${filterStatus === tab.key ? tab.color : 'var(--border)'}`, backgroundColor: filterStatus === tab.key ? `${tab.color}15` : 'transparent', color: filterStatus === tab.key ? tab.color : 'var(--text-secondary)', transition: 'all 0.15s' }}
            onMouseEnter={e => { if (filterStatus !== tab.key) { e.currentTarget.style.borderColor = 'var(--border-hover)'; e.currentTarget.style.color = 'var(--text-primary)'; }}}
            onMouseLeave={e => { if (filterStatus !== tab.key) { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}}>
            {tab.label} <span style={{ marginLeft: 5, padding: '1px 6px', borderRadius: 99, fontSize: '0.68rem', backgroundColor: 'rgba(255,255,255,0.06)' }}>{counts[tab.key]}</span>
          </button>
        ))}
      </div>

      <div style={{ marginBottom: '1.25rem' }}>
        <input className="military-input" placeholder="🔍  Search by asset or personnel..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} style={{ maxWidth: 420 }} />
      </div>

      {filtered.length > 0 ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1rem' }}>
          {filtered.map(a => <AssignmentCard key={a._id} assignment={a} />)}
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '4rem 2rem', backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)' }}>
          <div style={{ fontSize: '3rem', marginBottom: 12 }}>📋</div>
          <p style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-heading)', fontSize: '0.9rem' }}>No assignments found</p>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: 6 }}>
            {searchQuery ? 'Try a different search term' : canAssign ? 'Click "New Assignment" to get started' : 'No assignments recorded yet'}
          </p>
        </div>
      )}

      {showModal && <NewAssignmentModal onClose={() => setShowModal(false)} onSuccess={fetchAll} assets={assets} />}
    </div>
  );
}