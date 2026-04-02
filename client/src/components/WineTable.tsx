import React from 'react';
import { motion } from 'framer-motion';
import { Edit2, Trash2 } from 'lucide-react';
import type { Wine } from '../types/wine';

interface WineTableProps {
  wines: Wine[];
  onEdit: (wine: Wine) => void;
  onDelete: (id: string) => void;
}

export const WineTable: React.FC<WineTableProps> = ({
  wines,
  onEdit,
  onDelete,
}) => {
  if (wines.length === 0) return null;

  return (
    <motion.div
      className="table-wrap"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.2 }}
    >
      <table className="wine-table">
        <thead>
          <tr>
            <th>Shop Name</th>
            <th>Wine</th>
            <th>Date</th>
            <th>Selling Price</th>
            <th>Cost Price</th>
            <th>Other Expense</th>
            <th>Profit</th>
            <th>Quantity</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {wines.map((wine, i) => (
            <motion.tr
              key={wine.id}
              className="table-row"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ delay: i * 0.04 }}
              layout
            >
              <td>{wine.shopName || '-'}</td>
              <td className="td-name">
                {wine.name}
              </td>
              <td>{wine.vintage}</td>
              <td style={{ fontWeight: 600, color: 'var(--primary)' }}>₹{(wine.sellingPrice || 0).toLocaleString('en-IN')}</td>
              <td style={{ fontSize: '0.85em', color: 'var(--text-secondary)' }}>₹{wine.price.toLocaleString('en-IN')}</td>
              <td style={{ fontSize: '0.85em', color: 'var(--gold)' }}>₹{(wine.otherExpense || 0).toLocaleString('en-IN')}</td>
              <td style={{ fontWeight: 700, color: '#27ae60' }}>
                ₹{((wine.quantity * (wine.sellingPrice || 0)) - (wine.quantity * wine.price) - (wine.otherExpense || 0)).toLocaleString('en-IN')}
              </td>
              <td>
                <div className="table-qty">
                  <span className={`qty-value ${wine.quantity === 0 ? 'zero' : wine.quantity <= 2 ? 'low' : ''}`}>
                    {wine.quantity}
                  </span>
                </div>
              </td>
              <td>
                <div className="table-actions">
                  <button className="table-action-btn edit" onClick={() => onEdit(wine)}>
                    <Edit2 size={14} />
                  </button>
                  <button className="table-action-btn delete" onClick={() => onDelete(wine.id)}>
                    <Trash2 size={14} />
                  </button>
                </div>
              </td>
            </motion.tr>
          ))}
        </tbody>
      </table>
    </motion.div>
  );
};
