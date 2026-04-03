import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Wine as WineIcon, Save, Plus, Trash2, Loader2, Info } from 'lucide-react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import type { Wine, WineFormData } from '../types/wine';

interface WineModalProps {
  isOpen: boolean;
  wine?: Wine | null;
  wines: Wine[];
  onClose: () => void;
  onSave: (data: WineFormData | WineFormData[]) => Promise<void> | void;
}

const BOTTLE_SIZES = ['Half', 'Full', 'Quarter', '900 ml'];

const defaultWineEntry = () => ({
  name: '',
  size: 'Full' as any,
  vintage: '',
  quantity: 1,
  price: 0,
  sellingPrice: 0,
  otherExpense: 0,
  rating: 90,
  id_key: Math.random().toString(36).substr(2, 9),
});

export const WineModal: React.FC<WineModalProps> = ({ isOpen, wine, wines, onClose, onSave }) => {
  const [shopName, setShopName] = useState('');
  const [shopPlace, setShopPlace] = useState('');
  const [entries, setEntries] = useState([defaultWineEntry()]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);

  const uniqueShops = Array.from(new Set(wines.map(w => w.shopName).filter(Boolean)));
  const uniquePlaces = Array.from(new Set(wines.map(w => w.shopPlace).filter(Boolean)));

  useEffect(() => {
    if (wine) {
      setShopName(wine.shopName || '');
      setShopPlace(wine.shopPlace || '');
      setEntries([{
        name: wine.name,
        size: wine.size || 'Full',
        vintage: wine.vintage,
        quantity: wine.quantity,
        price: wine.price,
        sellingPrice: wine.sellingPrice,
        otherExpense: wine.otherExpense,
        rating: wine.rating || 90,
        id_key: 'edit-mode'
      }]);
    } else {
      setShopName('');
      setShopPlace('');
      setEntries([defaultWineEntry()]);
    }
    setErrors({});
    setIsSaving(false);
  }, [wine, isOpen]);

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    const dateRegex = /^\d{2}-\d{2}-\d{4}$/;
    
    entries.forEach((entry, idx) => {
      if (!entry.name.trim()) errs[`name-${idx}`] = 'Required';
      if (!dateRegex.test(entry.vintage)) errs[`vintage-${idx}`] = 'Invalid Date';
      if (entry.price < 0) errs[`price-${idx}`] = 'Min 0';
    });

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validate() && !isSaving) {
      setIsSaving(true);
      try {
        const data = entries.map(({ id_key, ...rest }) => ({
          ...rest,
          shopName,
          shopPlace,
        }));

        await onSave(wine ? data[0] : (data as any));
        onClose();
      } catch (err) {
        console.error('Failed to save:', err);
      } finally {
        setIsSaving(false);
      }
    }
  };

  const updateEntry = (idx: number, field: string, value: any) => {
    const newEntries = [...entries];
    (newEntries[idx] as any)[field] = value;
    setEntries(newEntries);
  };

  const addRow = () => setEntries([...entries, defaultWineEntry()]);
  const removeRow = (idx: number) => {
    if (entries.length > 1) {
      setEntries(entries.filter((_, i) => i !== idx));
    }
  };

  const parseVintageDate = (dString: string) => {
    if (!dString || !/^\d{2}-\d{2}-\d{4}$/.test(dString)) return null;
    const [d, m, y] = dString.split('-');
    return new Date(parseInt(y), parseInt(m) - 1, parseInt(d));
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div className="modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
          <motion.div
            className="modal-container bulk-modal"
            style={{ maxWidth: '1000px', width: '95vw', maxHeight: '94vh', display: 'flex', flexDirection: 'column' }}
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="modal-header" style={{ padding: '24px', borderBottom: '1px solid var(--glass-border)' }}>
              <div className="modal-title-group">
                <div className="modal-icon-circle" style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'var(--primary-glow)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
                  <WineIcon size={24} />
                </div>
                <div style={{ marginLeft: '16px' }}>
                  <h2 className="modal-title" style={{ fontSize: '22px', fontWeight: 700 }}>{wine ? 'Edit Wine Details' : 'Add New Shop — Bulk Wine Entry'}</h2>
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>Fill in the shop details once, then add multiple wines.</p>
                </div>
              </div>
              <button className="modal-close" onClick={onClose}><X size={20} /></button>
            </div>

            <form onSubmit={handleSubmit} style={{ overflowY: 'auto', flex: 1, padding: '24px' }}>
              {/* Shop Section */}
              <div className="form-section-card" style={{ marginBottom: '32px', padding: '24px', borderRadius: '18px', background: 'var(--bg-elevated)', border: '1px solid var(--glass-border)', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px', gap: '8px' }}>
                  <Info size={16} color="var(--gold)" />
                  <h3 style={{ fontSize: '13px', textTransform: 'uppercase', color: 'var(--gold)', fontWeight: 700, letterSpacing: '1px' }}>Purchase Location</h3>
                </div>
                <div className="form-grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                  <div className="form-field">
                    <label className="form-label" style={{ marginBottom: '8px' }}>Shop Name</label>
                    <input list="shops" className="form-input" value={shopName} onChange={e => setShopName(e.target.value)} placeholder="e.g. English Liquor" />
                    <datalist id="shops">{uniqueShops.map(s => <option key={s} value={s} />)}</datalist>
                  </div>
                  <div className="form-field">
                    <label className="form-label" style={{ marginBottom: '8px' }}>Shop Place / Location</label>
                    <input list="places" className="form-input" value={shopPlace} onChange={e => setShopPlace(e.target.value)} placeholder="e.g. Bandra, Mumbai" />
                    <datalist id="places">{uniquePlaces.map(p => <option key={p} value={p} />)}</datalist>
                  </div>
                </div>
              </div>

              {/* Wines Section */}
              <div className="entries-list">
                <h3 style={{ fontSize: '13px', textTransform: 'uppercase', color: 'var(--primary)', marginBottom: '16px', fontWeight: 700, letterSpacing: '1px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  Wine Items Breakdown
                </h3>
                {entries.map((entry, idx) => (
                  <div key={entry.id_key} className="entry-row" style={{ padding: '28px', marginBottom: '24px', background: 'var(--bg-elevated)', borderRadius: '18px', border: '1px solid var(--glass-border)', position: 'relative', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
                    {entries.length > 1 && (
                      <button type="button" className="remove-row-btn" onClick={() => removeRow(idx)} style={{ position: 'absolute', top: '15px', right: '15px', color: 'var(--danger-light)', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '8px', background: 'rgba(214, 48, 49, 0.05)' }}>
                        <Trash2 size={16} />
                      </button>
                    )}
                    
                    <div className="form-grid" style={{ gridTemplateColumns: '2fr 1fr 1fr', gap: '20px' }}>
                      <div className="form-field">
                        <label className="form-label">Wine Name</label>
                        <input className={`form-input ${errors[`name-${idx}`] ? 'error' : ''}`} value={entry.name} onChange={e => updateEntry(idx, 'name', e.target.value)} placeholder="e.g. Cabernet Sauvignon" />
                      </div>
                      <div className="form-field">
                        <label className="form-label">Bottle Size</label>
                        <select className="form-input" style={{ appearance: 'auto', paddingRight: '10px' }} value={entry.size} onChange={e => updateEntry(idx, 'size', e.target.value)}>
                          {BOTTLE_SIZES.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </div>
                      <div className="form-field">
                        <label className="form-label">Date *</label>
                        <DatePicker 
                          selected={parseVintageDate(entry.vintage)} 
                          onChange={(date: Date | null) => {
                            if (date) {
                              const d = String(date.getDate()).padStart(2, '0');
                              const m = String(date.getMonth() + 1).padStart(2, '0');
                              const y = date.getFullYear();
                              updateEntry(idx, 'vintage', `${d}-${m}-${y}`);
                            }
                          }}
                          dateFormat="dd-MM-yyyy"
                          className={`form-input ${errors[`vintage-${idx}`] ? 'error' : ''}`}
                          placeholderText="DD-MM-YYYY"
                        />
                      </div>
                    </div>

                    <div className="form-grid numeric-inputs-grid" style={{ 
                      gridTemplateColumns: 'repeat(4, 1fr)', 
                      gap: '20px', 
                      marginTop: '20px', 
                      padding: '20px', 
                      background: 'rgba(0,0,0,0.02)', 
                      borderRadius: '14px',
                      border: '1px solid var(--glass-border)'
                    }}>
                      <div className="form-field">
                        <label className="form-label" style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '8px', display: 'block' }}>Quantity</label>
                        <input type="number" className="form-input numeric-input-box" style={{ height: '48px', width: '100%' }} value={entry.quantity || ''} onChange={e => updateEntry(idx, 'quantity', parseInt(e.target.value) || 0)} />
                      </div>
                      <div className="form-field">
                        <label className="form-label" style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '8px', display: 'block' }}>Cost Price (₹)</label>
                        <input type="number" step="0.1" className="form-input numeric-input-box" style={{ height: '48px', width: '100%' }} value={entry.price || ''} onChange={e => updateEntry(idx, 'price', parseFloat(e.target.value) || 0)} />
                      </div>
                      <div className="form-field">
                        <label className="form-label" style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '8px', display: 'block' }}>Selling (₹)</label>
                        <input type="number" step="0.1" className="form-input numeric-input-box" style={{ height: '48px', width: '100%' }} value={entry.sellingPrice || ''} onChange={e => updateEntry(idx, 'sellingPrice', parseFloat(e.target.value) || 0)} />
                      </div>
                      <div className="form-field">
                        <label className="form-label" style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '8px', display: 'block' }}>Other Exp (₹)</label>
                        <input type="number" step="0.1" className="form-input numeric-input-box" style={{ height: '48px', width: '100%' }} value={entry.otherExpense || ''} onChange={e => updateEntry(idx, 'otherExpense', parseFloat(e.target.value) || 0)} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {!wine && (
                <button type="button" className="btn btn-ghost" onClick={addRow} style={{ width: '100%', border: '2px dashed var(--glass-border)', height: '60px', marginBottom: '40px', borderRadius: '18px', color: 'var(--text-secondary)', background: 'transparent' }}>
                  <Plus size={20} style={{ marginRight: '10px' }} /> <span>Add Another Wine Entry for this Shop</span>
                </button>
              )}
            </form>

            <div className="modal-actions" style={{ padding: '24px', background: 'var(--bg-modal)', borderTop: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'flex-end', gap: '16px', borderRadius: '0 0 20px 20px' }}>
              <button type="button" className="btn btn-ghost" onClick={onClose} disabled={isSaving} style={{ padding: '0 24px' }}>Cancel</button>
              <button type="submit" disabled={isSaving} onClick={handleSubmit} className="btn btn-primary" style={{ padding: '0 48px', height: '52px', borderRadius: '12px', fontSize: '15px' }}>
                {isSaving ? <Loader2 size={20} className="animate-spin" style={{ marginRight: '10px' }} /> : <Save size={20} style={{ marginRight: '10px' }} />}
                {isSaving ? 'Processing...' : wine ? 'Confirm Changes' : `Finalize ${entries.length} Entries`}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
