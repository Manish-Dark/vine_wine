import React from 'react';
import { motion } from 'framer-motion';
import { Edit2, Trash2, Calendar, IndianRupee, Store } from 'lucide-react';
import type { Wine } from '../types/wine';

interface WineCardProps {
  wine: Wine;
  onEdit: (wine: Wine) => void;
  onDelete: (id: string) => void;
}

export const WineCard: React.FC<WineCardProps> = ({
  wine,
  onEdit,
  onDelete,
}) => {

  return (
    <motion.div
      className="wine-card"
      layout
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9, y: -20 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      whileHover={{ y: -6, transition: { duration: 0.2 } }}
    >
      {/* Top stripe */}
      <div className="card-stripe" style={{ background: 'linear-gradient(90deg, var(--primary), transparent)' }} />

      {/* Shop Name */}
      {wine.shopName && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginTop: '12px', marginBottom: '2px' }}>
          <Store size={11} style={{ color: 'var(--gold)' }} />
          <span style={{ fontSize: '11px', color: 'var(--gold)', fontWeight: 600, letterSpacing: '0.4px', textTransform: 'uppercase' }}>
            {wine.shopName}
          </span>
        </div>
      )}

      {/* Wine name */}
      <h3 className="card-name" style={{ marginTop: wine.shopName ? '2px' : '12px' }}>{wine.name}</h3>

      {/* Meta info */}
      <div className="card-meta">
        <span className="card-meta-item">
          <Calendar size={12} />
          {wine.vintage}
        </span>
      </div>

      {/* Notes */}
      {wine.notes && (
        <p className="card-notes">{wine.notes}</p>
      )}

      {/* Price, quantity, and profit breakdown */}
      <div className="card-footer">
        <div className="card-price" style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {/* Main Selling Price */}
          <div style={{ display: 'flex', alignItems: 'center', color: 'var(--primary)', gap: '6px' }}>
            <IndianRupee size={16} />
            <span style={{ fontWeight: 800, fontSize: '18px' }}>{(wine.sellingPrice || 0).toLocaleString('en-IN')}</span>
          </div>
          
          {/* Breakdown Row */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', opacity: 0.8 }}>
            <span style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>Cost: ₹{wine.price.toLocaleString('en-IN')}</span>
            <span style={{ fontSize: '10px', color: 'var(--gold)' }}>Exp: ₹{(wine.otherExpense || 0).toLocaleString('en-IN')}</span>
          </div>

          {/* Profit Row - The new "column" */}
          <div style={{ 
            marginTop: '4px',
            padding: '4px 8px',
            background: 'rgba(39, 174, 96, 0.08)',
            border: '1px solid rgba(39, 174, 96, 0.2)',
            borderRadius: '6px',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            <span style={{ fontSize: '10px', fontWeight: 700, color: '#27ae60', textTransform: 'uppercase' }}>Profit:</span>
            <span style={{ fontSize: '13px', fontWeight: 800, color: '#27ae60' }}>
              ₹{((wine.quantity * (wine.sellingPrice || 0)) - (wine.quantity * wine.price) - (wine.otherExpense || 0)).toLocaleString('en-IN')}
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', justifyContent: 'space-between' }}>
          <div className="card-quantity">
            <span className={`qty-value ${wine.quantity === 0 ? 'zero' : wine.quantity <= 2 ? 'low' : ''}`}>
              Qty: {wine.quantity}
            </span>
          </div>
        </div>
      </div>

      {/* Low stock warning */}
      {wine.quantity <= 2 && wine.quantity > 0 && (
        <div className="card-low-stock">⚠️ Low stock</div>
      )}
      {wine.quantity === 0 && (
        <div className="card-out-stock">❌ Out of stock</div>
      )}

      {/* Actions */}
      <div className="card-actions">
        <motion.button
          className="card-action-btn edit"
          onClick={() => onEdit(wine)}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <Edit2 size={14} />
        </motion.button>
        <motion.button
          className="card-action-btn delete"
          onClick={() => onDelete(wine.id)}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <Trash2 size={14} />
        </motion.button>
      </div>
    </motion.div>
  );
};
