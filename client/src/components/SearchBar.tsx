import React from 'react';
import { Search, X } from 'lucide-react';
import { motion } from 'framer-motion';
import type { FilterState } from '../types/wine';

interface SearchBarProps {
  filter: FilterState;
  onFilterChange: (f: Partial<FilterState>) => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({ filter, onFilterChange }) => {
  return (
    <motion.div
      className="search-bar"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2, duration: 0.4 }}
    >
      <div className="search-input-wrap">
        <Search size={18} className="search-icon" />
        <input
          type="text"
          className="search-input"
          placeholder="Search wine name or shop name…"
          value={filter.search}
          onChange={(e) => onFilterChange({ search: e.target.value })}
        />
        {filter.search && (
          <motion.button
            className="search-clear"
            onClick={() => onFilterChange({ search: '' })}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
          >
            <X size={14} />
          </motion.button>
        )}
      </div>
    </motion.div>
  );
};
