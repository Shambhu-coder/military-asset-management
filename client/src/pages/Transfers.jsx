import { useState, useEffect } from 'react';
import API from '../api/axios.js';
import { useAuth } from '../context/AuthContext.jsx';
import toast from 'react-hot-toast';

const BASES      = ['Base Alpha', 'Base Bravo', 'Base Charlie', 'Base Delta'];
const TYPE_EMOJI = { vehicle: '🚗', weapon: '🔫', ammunition: '💊', equipment: '⚙️' };

const STATUS_CONFIG = {
  pending:  { color: 'var(--yellow)', bg: 'var(--yellow-bg)', label: 'Pending'  },
  approved: { color: 'var(--green)',  bg: 'var(--green-bg)',  label: 'Approved' },
  rejected: { color: 'var(--red)',    bg: 'var(--red-bg)',    label: 'Rejected' },
};

function NewTransferModal({ onClose, onSuccess, assets }) {
  const [form, setForm] = useState({ assetId: '', toBase: '', quantity: '', notes: '' });
  const [loading, setLoading] = useState(false);
  const set = (field, value) => setForm(f => ({ ...f, [field]: value }));

  const selectedAsset  = assets.find(a => a._id?.toString() === form.assetId);
  const availableBases = BASES.filter(b => b !== selectedAsset?.base);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.assetId || !form.toBase || !form.quantity) return toast.error('All fields are required');
    if (selectedAsset && Number(form.quantity) > selectedAsset.quantity)
      return toast.error(`Only ${selectedAsset.quantity} units available`);
    setLoading(true);
    try {
      await API.post('/transfers', { assetId: form.assetId.toString(), toBase: form.toBase, quantity: Number(form.quantity), notes: form.notes });
      toast.success('Transfer request submitted — awaiting approval');
      onSuccess(); onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create transfer');
    } finally { setLoading(false); }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 100, backgroundColor: 'rgba(0,0,0,0.65)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ width: '100%', maxWidth: 480, backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden', boxShadow: 'var(--shadow-lg)', maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ padding: '1.1rem 1.4rem', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>🔄 New Transfer Request</h2>
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
              <span>📍 From: <strong style={{ color: 'var(--text-primary)' }}>{selectedAsset.base}</strong></span>
              <span>📦 Available: <strong style={{ color: 'var(--accent)' }}>{selectedAsset.quantity}</strong></span>
            </div>
          )}
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '0.8rem', fontWeight: 500, marginBottom: 6 }}>Transfer To *</label>
            <select className="military-input" value={form.toBase} onChange={e => set('toBase', e.target.value)} required>
              <option value="">— Destination base —</option>
              {(selectedAsset ? availableBases : BASES).map(b => <option key={b} value={b}>{b}</option>)}
            </select>
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '0.8rem', fontWeight: 500, marginBottom: 6 }}>Quantity *</label>
            <input className="military-input" type="number" min="1" max={selectedAsset?.quantity} placeholder="0" value={form.quantity} onChange={e => set('quantity', e.target.value)} required />
          </div>
          <div style={{ marginBottom: '1.4rem' }}>
            <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '0.8rem', fontWeight: 500, marginBottom: 6 }}>Notes (optional)</label>
            <textarea className="military-input" rows={2} placeholder="Reason for transfer..." value={form.notes} onChange={e => set('notes', e.target.value)} style={{ resize: 'vertical' }} />
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button type="button" onClick={onClose} className="btn-outline" style={{ flex: 1 }}>Cancel</button>
            <button type="submit" disabled={loading} className="btn-primary" style={{ flex: 2, justifyContent: 'center', opacity: loading ? 0.7 : 1 }}>
              {loading ? '⏳ Submitting...' : '✅ Submit Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Transfers() {
  const { isAdmin, isCommander } = useAuth();
  const [transfers,    setTransfers]    = useState([]);
  const [assets,       setAssets]       = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [showModal,    setShowModal]    = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');
  const canApprove = isAdmin || isCommander;

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [tRes, aRes] = await Promise.all([API.get('/transfers'), API.get('/assets')]);
      setTransfers(tRes.data.data || []);
      setAssets(aRes.data.data || []);
    } catch { toast.error('Failed to load transfers'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchAll(); }, []);

  const handleAction = async (id, action) => {
    try {
      await API.put(`/transfers/${id}/${action}`);
      toast.success(`Transfer ${action}d`);
      fetchAll();
    } catch (err) { toast.error(err.response?.data?.message || `Failed to ${action}`); }
  };

  const filtered = filterStatus === 'all' ? transfers : transfers.filter(t => t.status === filterStatus);
  const counts = {
    all: transfers.length,
    pending:  transfers.filter(t => t.status === 'pending').length,
    approved: transfers.filter(t => t.status === 'approved').length,
    rejected: transfers.filter(t => t.status === 'rejected').length,
  };

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', gap: 12 }}>
      <span style={{ fontSize: '1.5rem' }}>⏳</span>
      <span style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-heading)' }}>Loading transfers...</span>
    </div>
  );

  return (
    <div style={{ maxWidth: 1400 }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: '1.5rem' }}>
        <div>
          <h1 className="page-title">Transfers</h1>
          <p className="page-subtitle">{counts.pending} pending · {counts.approved} approved</p>
        </div>
        <button className="btn-primary" onClick={() => setShowModal(true)}>➕ New Transfer</button>
      </div>

      {canApprove && counts.pending > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '0.75rem 1rem', borderRadius: 8, marginBottom: '1.1rem', backgroundColor: 'var(--yellow-bg)', border: '1px solid var(--yellow-border)', color: 'var(--yellow)', fontSize: '0.85rem' }}>
          ⚠️ <strong>{counts.pending}</strong> transfer{counts.pending > 1 ? 's' : ''} awaiting your approval
        </div>
      )}

      <div style={{ display: 'flex', gap: 6, marginBottom: '1.1rem', flexWrap: 'wrap' }}>
        {[
          { key: 'all', label: 'All', color: 'var(--text-secondary)' },
          { key: 'pending', label: 'Pending', color: 'var(--yellow)' },
          { key: 'approved', label: 'Approved', color: 'var(--green)' },
          { key: 'rejected', label: 'Rejected', color: 'var(--red)' },
        ].map(tab => (
          <button key={tab.key} onClick={() => setFilterStatus(tab.key)}
            style={{ padding: '6px 14px', borderRadius: 7, cursor: 'pointer', fontFamily: 'var(--font-heading)', fontSize: '0.78rem', fontWeight: 600, border: `1px solid ${filterStatus === tab.key ? tab.color : 'var(--border)'}`, backgroundColor: filterStatus === tab.key ? `${tab.color}15` : 'transparent', color: filterStatus === tab.key ? tab.color : 'var(--text-secondary)', transition: 'all 0.15s' }}
            onMouseEnter={e => { if (filterStatus !== tab.key) { e.currentTarget.style.borderColor = 'var(--border-hover)'; e.currentTarget.style.color = 'var(--text-primary)'; }}}
            onMouseLeave={e => { if (filterStatus !== tab.key) { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}}>
            {tab.label} <span style={{ marginLeft: 5, padding: '1px 6px', borderRadius: 99, fontSize: '0.68rem', backgroundColor: 'rgba(255,255,255,0.06)' }}>{counts[tab.key]}</span>
          </button>
        ))}
      </div>

      <div className="military-card" style={{ overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table className="military-table" style={{ minWidth: 700 }}>
            <thead>
              <tr>
                <th>Asset</th><th>Route</th><th>Qty</th><th>Requested By</th><th>Status</th><th>Date</th>
                {canApprove && <th>Action</th>}
              </tr>
            </thead>
            <tbody>
              {filtered.length > 0 ? filtered.map(t => {
                const status = STATUS_CONFIG[t.status] || STATUS_CONFIG.pending;
                return (
                  <tr key={t._id}>
                    <td>
                      <div style={{ fontWeight: 500 }}>{TYPE_EMOJI[t.assetType]} {t.assetName}</div>
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'capitalize' }}>{t.assetType}</div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.83rem' }}>
                        <span style={{ color: 'var(--red)' }}>{t.fromBase}</span>
                        <span style={{ color: 'var(--text-muted)' }}>→</span>
                        <span style={{ color: 'var(--green)' }}>{t.toBase}</span>
                      </div>
                    </td>
                    <td style={{ fontFamily: 'var(--font-heading)', color: 'var(--yellow)', fontWeight: 700 }}>{t.quantity}</td>
                    <td style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{t.transferredBy?.name || '—'}</td>
                    <td><span style={{ padding: '3px 10px', borderRadius: 99, fontSize: '0.72rem', fontWeight: 600, backgroundColor: status.bg, color: status.color, border: `1px solid ${status.color}40`, display: 'inline-block' }}>{status.label}</span></td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>{new Date(t.createdAt).toLocaleDateString()}</td>
                    {canApprove && (
                      <td>
                        {t.status === 'pending' ? (
                          <div style={{ display: 'flex', gap: 6 }}>
                            <button onClick={() => handleAction(t._id, 'approve')}
                              style={{ padding: '4px 10px', borderRadius: 5, fontSize: '0.72rem', cursor: 'pointer', fontWeight: 600, backgroundColor: 'var(--green-bg)', border: '1px solid var(--green-border)', color: 'var(--green)', transition: 'background 0.15s' }}
                              onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(104,211,145,0.2)'}
                              onMouseLeave={e => e.currentTarget.style.backgroundColor = 'var(--green-bg)'}>✓ Approve</button>
                            <button onClick={() => handleAction(t._id, 'reject')}
                              style={{ padding: '4px 10px', borderRadius: 5, fontSize: '0.72rem', cursor: 'pointer', fontWeight: 600, backgroundColor: 'var(--red-bg)', border: '1px solid var(--red-border)', color: 'var(--red)', transition: 'background 0.15s' }}
                              onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(252,129,129,0.2)'}
                              onMouseLeave={e => e.currentTarget.style.backgroundColor = 'var(--red-bg)'}>✕ Reject</button>
                          </div>
                        ) : (
                          <span style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>{t.approvedBy?.name || '—'}</span>
                        )}
                      </td>
                    )}
                  </tr>
                );
              }) : (
                <tr><td colSpan={canApprove ? 7 : 6} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                  <div style={{ fontSize: '2rem', marginBottom: 8 }}>🔄</div>
                  No {filterStatus !== 'all' ? filterStatus : ''} transfers found.
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && <NewTransferModal onClose={() => setShowModal(false)} onSuccess={fetchAll} assets={assets} />}
    </div>
  );
}