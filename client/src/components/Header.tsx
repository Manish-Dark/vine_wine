import { Wine, Plus, Moon, Sun, LayoutGrid, FileText, LogIn, ShieldAlert, ShoppingCart } from 'lucide-react';
import { motion } from 'framer-motion';

interface HeaderProps {
  onAddWine: () => void;
  currentPage: 'cellar' | 'reports' | 'sales' | 'admin';
  onPageChange: (page: 'cellar' | 'reports' | 'sales' | 'admin') => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  user: { name: string; role: 'user' | 'admin' } | null;
  onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({ 
  onAddWine, 
  currentPage, 
  onPageChange, 
  theme, 
  toggleTheme, 
  user, 
  onLogout 
}) => {
  return (
    <motion.header
      className="header"
      initial={{ opacity: 0, y: -30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
    >
      <div className="header-brand">
        <div className="header-logo">
          <Wine size={28} />
        </div>
        <div className="header-title-group">
          <h1 className="header-title">Vino Vault</h1>
          <span className="header-subtitle">Premium Wine Cellar Management</span>
        </div>
      </div>

      <nav className="header-nav">
        {currentPage !== 'admin' && (
          <>
            <button 
              className={`nav-link ${currentPage === 'cellar' ? 'active' : ''}`}
              onClick={() => onPageChange('cellar')}
            >
              <LayoutGrid size={18} />
              <span>Cellar</span>
            </button>
            <button 
              className={`nav-link ${currentPage === 'sales' ? 'active' : ''}`}
              onClick={() => onPageChange('sales')}
            >
              <ShoppingCart size={18} />
              <span>Sales (POS)</span>
            </button>
            <button 
              className={`nav-link ${currentPage === 'reports' ? 'active' : ''}`}
              onClick={() => onPageChange('reports')}
            >
              <FileText size={18} />
              <span>Reports</span>
            </button>
          </>
        )}
        {user?.role === 'admin' && (
          <button 
            className={`nav-link ${currentPage === 'admin' ? 'active' : ''}`}
            onClick={() => onPageChange('admin')}
            style={{ color: 'var(--gold)' }}
          >
            <ShieldAlert size={18} />
            <span>Admin Panel</span>
          </button>
        )}
      </nav>

      <div className="header-actions">
        {user && (
          <div className="header-user-welcome" style={{ marginRight: '16px', fontSize: '14px', color: 'var(--text-secondary)' }}>
            Welcome, <strong>{user.name}</strong>
          </div>
        )}
        <button 
          className="header-badge" 
          onClick={toggleTheme}
          style={{ cursor: 'pointer', outline: 'none' }}
        >
          {theme === 'dark' ? (
             <>
               <Moon size={14} />
               <span>Dark Mode</span>
             </>
          ) : (
             <>
               <Sun size={14} />
               <span>Light Mode</span>
             </>
          )}
        </button>
        
        {currentPage !== 'admin' && (
          <motion.button
            className="btn btn-primary"
            onClick={onAddWine}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
          >
            <Plus size={18} />
            <span>Add Shop</span>
          </motion.button>
        )}

        {user && (
          <button 
            className="btn btn-ghost logout-btn" 
            onClick={onLogout}
            style={{ padding: '8px', minWidth: 'auto', marginLeft: '8px' }}
            title="Logout"
          >
            <LogIn size={18} style={{ transform: 'rotate(180deg)' }} />
          </button>
        )}
      </div>
    </motion.header>
  );
};
