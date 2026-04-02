import React from 'react';
import { motion } from 'framer-motion';
import { ArrowUpDown } from 'lucide-react';
import type { FilterState, SortField } from '../types/wine';

interface FilterBarProps {
  filter: FilterState;
  onFilterChange: (f: Partial<FilterState>) => void;
  total: number;
  filtered: number;
}

// Removed WINE_TYPES as Type field is now hidden

const SORT_OPTIONS: Array<{ value: SortField; label: string }> = [
  { value: 'name', label: 'Name' },
  { value: 'price', label: 'Cost Price' },
  { value: 'sellingPrice', label: 'Selling Price' },
  { value: 'quantity', label: 'Quantity' },
];

export const FilterBar: React.FC<FilterBarProps> = ({ filter, onFilterChange, total, filtered }) => {
  return (
    <motion.div
      className="filter-bar"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.3, duration: 0.4 }}
    >
      <div className="filter-left">
        <h2 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)' }}>Your Cellar</h2>
      </div>

      <div className="filter-right">
        <span className="filter-count">
          {filtered === total ? `${total} wines` : `${filtered} of ${total}`}
        </span>
        <div className="sort-group">
          <select
            className="sort-select"
            value={filter.sortField}
            onChange={(e) => onFilterChange({ sortField: e.target.value as SortField })}
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                Sort: {o.label}
              </option>
            ))}
          </select>
          <button
            className="sort-order-btn"
            onClick={() =>
              onFilterChange({ sortOrder: filter.sortOrder === 'asc' ? 'desc' : 'asc' })
            }
            title={filter.sortOrder === 'asc' ? 'Ascending' : 'Descending'}
          >
            <ArrowUpDown size={16} />
            <span>{filter.sortOrder === 'asc' ? 'ASC' : 'DESC'}</span>
          </button>
        </div>
      </div>
    </motion.div>
  );
};
