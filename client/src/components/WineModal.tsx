import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Wine as WineIcon, Save } from 'lucide-react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import type { Wine, WineFormData, WineType } from '../types/wine';

interface WineModalProps {
  isOpen: boolean;
  wine?: Wine | null;
  onClose: () => void;
  onSave: (data: WineFormData) => void;
}


const defaultForm: WineFormData = {
  name: '',
  shopName: '',
  type: 'Other' as WineType,
  region: 'Unknown',
  country: 'Unknown',
  vintage: '',
  quantity: 1,
  price: 0,
  sellingPrice: 0,
  otherExpense: 0,
  rating: 0,
  notes: '',
};

export const WineModal: React.FC<WineModalProps> = ({ isOpen, wine, onClose, onSave }) => {
  const [form, setForm] = useState<WineFormData>(defaultForm);
  const [errors, setErrors] = useState<Partial<Record<keyof WineFormData, string>>>({});

  useEffect(() => {
    if (wine) {
      const { id, createdAt, updatedAt, ...rest } = wine;
      setForm(rest);
    } else {
      setForm(defaultForm);
    }
    setErrors({});
  }, [wine, isOpen]);

  const validate = (): boolean => {
    const errs: Partial<Record<keyof WineFormData, string>> = {};
    const dateRegex = /^\d{2}-\d{2}-\d{4}$/;
    if (!form.name.trim()) errs.name = 'Wine name is required';
    if (!dateRegex.test(form.vintage)) errs.vintage = 'Format must be DD-MM-YYYY';
    if (form.price < 0) errs.price = 'Cost price must be positive';
    if (form.sellingPrice < 0) errs.sellingPrice = 'Selling price must be positive';
    if (form.otherExpense < 0) errs.otherExpense = 'Other expense must be positive';
    if (form.quantity < 0) errs.quantity = 'Quantity must be positive';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSave(form);
      onClose();
    }
  };

  const set = <K extends keyof WineFormData>(key: K, value: WineFormData[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const parseVintageDate = (dString: string) => {
    if (!dString || !/^\d{2}-\d{2}-\d{4}$/.test(dString)) return null;
    const [d, m, y] = dString.split('-');
    return new Date(parseInt(y), parseInt(m) - 1, parseInt(d));
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="modal-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="modal-container"
            initial={{ opacity: 0, scale: 0.85, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.85, y: 40 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="modal-header">
              <div className="modal-title-group">
                <WineIcon size={24} className="modal-icon" />
                <h2 className="modal-title">{wine ? 'Edit Wine' : 'Add New Wine'}</h2>
              </div>
              <button className="modal-close" onClick={onClose}>
                <X size={20} />
              </button>
            </div>

            {/* Form */}
            <form className="modal-form" onSubmit={handleSubmit}>
              <div className="form-grid">
                {/* Wine Shop Name */}
                <div className="form-field full-width">
                  <label className="form-label">Shop Name</label>
                  <input
                    className="form-input"
                    type="text"
                    placeholder="e.g. Local Vintner"
                    value={form.shopName || ''}
                    onChange={(e) => set('shopName', e.target.value)}
                  />
                </div>

                {/* Wine Name */}
                <div className="form-field full-width">
                  <label className="form-label">Wine Name *</label>
                  <input
                    className={`form-input ${errors.name ? 'error' : ''}`}
                    type="text"
                    placeholder="e.g. Château Margaux"
                    value={form.name}
                    onChange={(e) => set('name', e.target.value)}
                  />
                  {errors.name && <span className="form-error">{errors.name}</span>}
                </div>

                {/* Vintage (Date) */}
                <div className="form-field">
                  <label className="form-label">Date (DD-MM-YYYY) *</label>
                  <div className="date-picker-wrapper" style={{ width: '100%' }}>
                    <DatePicker
                      selected={parseVintageDate(form.vintage)}
                      onChange={(date: Date | null) => {
                        if (date) {
                          const d = String(date.getDate()).padStart(2, '0');
                          const m = String(date.getMonth() + 1).padStart(2, '0');
                          const y = date.getFullYear();
                          set('vintage', `${d}-${m}-${y}`);
                        } else {
                          set('vintage', '');
                        }
                      }}
                      dateFormat="dd-MM-yyyy"
                      className={`form-input ${errors.vintage ? 'error' : ''}`}
                      placeholderText="DD-MM-YYYY"
                      wrapperClassName="w-full"
                    />
                  </div>
                  {errors.vintage && <span className="form-error">{errors.vintage}</span>}
                </div>

                {/* Cost Price */}
                <div className="form-field">
                  <label className="form-label">Cost Price (INR) *</label>
                  <input
                    className={`form-input ${errors.price ? 'error' : ''}`}
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    value={form.price}
                    onChange={(e) => set('price', parseFloat(e.target.value) || 0)}
                  />
                  {errors.price && <span className="form-error">{errors.price}</span>}
                </div>

                {/* Selling Price */}
                <div className="form-field">
                  <label className="form-label">Selling Price (INR) *</label>
                  <input
                    className={`form-input ${errors.sellingPrice ? 'error' : ''}`}
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    value={form.sellingPrice}
                    onChange={(e) => set('sellingPrice', parseFloat(e.target.value) || 0)}
                  />
                  {errors.sellingPrice && <span className="form-error">{errors.sellingPrice}</span>}
                </div>

                {/* Other Expense */}
                <div className="form-field">
                  <label className="form-label">Other Expense (INR)</label>
                  <input
                    className={`form-input ${errors.otherExpense ? 'error' : ''}`}
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    value={form.otherExpense}
                    onChange={(e) => set('otherExpense', parseFloat(e.target.value) || 0)}
                  />
                  {errors.otherExpense && <span className="form-error">{errors.otherExpense}</span>}
                </div>

                {/* Quantity */}
                <div className="form-field">
                  <label className="form-label">Quantity</label>
                  <input
                    className={`form-input ${errors.quantity ? 'error' : ''}`}
                    type="number"
                    min="0"
                    value={form.quantity}
                    onChange={(e) => set('quantity', parseInt(e.target.value) || 0)}
                  />
                  {errors.quantity && <span className="form-error">{errors.quantity}</span>}
                </div>

                {/* Notes */}
                <div className="form-field full-width">
                  <label className="form-label">Tasting Notes</label>
                  <textarea
                    className="form-input form-textarea"
                    placeholder="Describe aromas, flavors, finish…"
                    value={form.notes}
                    onChange={(e) => set('notes', e.target.value)}
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="modal-actions">
                <button type="button" className="btn btn-ghost" onClick={onClose}>
                  Cancel
                </button>
                <motion.button
                  type="submit"
                  className="btn btn-primary"
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                >
                  <Save size={16} />
                  {wine ? 'Save Changes' : 'Add Wine'}
                </motion.button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
