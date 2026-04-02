import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { LayoutGrid, List, RefreshCw, AlertCircle } from 'lucide-react';
import { useWineStore } from './hooks/useWineStore';
import { Header } from './components/Header';
import { StatsBar } from './components/StatsBar';
import { SearchBar } from './components/SearchBar';
import { FilterBar } from './components/FilterBar';
import { WineCard } from './components/WineCard';
import { WineTable } from './components/WineTable';
import { ReportSection } from './components/ReportSection';
import { WineModal } from './components/WineModal';
import { ConfirmModal } from './components/ConfirmModal';
import type { Wine, WineFormData } from './types/wine';
import './App.css';
import { useAuth } from './hooks/useAuth';
import { AuthPage } from './components/AuthPage';
import { AdminPanel } from './components/AdminPanel';

type ViewMode = 'grid' | 'table';
type Page = 'cellar' | 'reports' | 'admin';

function App() {
  const { user, token, login, register, logout, isAuthenticated } = useAuth();
  const {
    wines,
    filteredWines,
    loading,
    error,
    filter,
    setFilter,
    addWine,
    updateWine,
    deleteWine,
    stats,
    refetch,
  } = useWineStore(token);

  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('theme');
    if (saved === 'dark' || saved === 'light') return saved;
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) return 'dark';
    return 'light';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));

  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [page, setPage] = useState<Page>(() => {
    const saved = localStorage.getItem('currentPage');
    return (saved as Page) || 'cellar';
  });

  useEffect(() => {
    localStorage.setItem('currentPage', page);
  }, [page]);

  // Handle auto-redirection based on role to prevent "Access Denied" for regular users
  useEffect(() => {
    if (isAuthenticated && user?.role !== 'admin' && page === 'admin') {
      setPage('cellar');
    }
  }, [isAuthenticated, user, page]);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingWine, setEditingWine] = useState<Wine | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleAddClick = () => {
    setEditingWine(null);
    setModalOpen(true);
  };

  const handleEdit = (wine: Wine) => {
    setEditingWine(wine);
    setModalOpen(true);
  };

  const handleSave = async (data: WineFormData) => {
    if (editingWine) {
      await updateWine(editingWine.id, data);
    } else {
      await addWine(data);
    }
  };

  const handleDeleteClick = (id: string) => setDeletingId(id);

  const handleDeleteConfirm = async () => {
    if (deletingId) {
      await deleteWine(deletingId);
      setDeletingId(null);
    }
  };

  const deletingWine = deletingId ? wines.find((w) => w.id === deletingId) : null;

  if (!isAuthenticated) {
    return <AuthPage onLogin={login} onRegister={register} />;
  }

  return (
    <div className="app">
      {/* Ambient background blobs */}
      <div className="bg-blob blob-1" />
      <div className="bg-blob blob-2" />
      <div className="bg-blob blob-3" />

      <div className="app-inner">
        <Header 
          onAddWine={handleAddClick} 
          currentPage={page} 
          onPageChange={setPage} 
          theme={theme}
          toggleTheme={toggleTheme}
          user={user}
          onLogout={logout}
        />

        <main className="main-content">
          <AnimatePresence mode="wait">
            {page === 'admin' ? (
              <motion.div
                key="admin"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.3 }}
              >
                <AdminPanel token={token} />
              </motion.div>
            ) : page === 'reports' ? (
              <motion.div
                key="reports"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <ReportSection token={token} />
              </motion.div>
            ) : (
              <motion.div
                key="cellar"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
              >
                <StatsBar stats={stats} />

                <div className="toolbar">
                  <SearchBar filter={filter} onFilterChange={(f) => setFilter((prev) => ({ ...prev, ...f }))} />
                  <div className="view-toggle">
                    <button
                      className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
                      onClick={() => setViewMode('grid')}
                      title="Grid View"
                    >
                      <LayoutGrid size={18} />
                    </button>
                    <button
                      className={`view-btn ${viewMode === 'table' ? 'active' : ''}`}
                      onClick={() => setViewMode('table')}
                      title="Table View"
                    >
                      <List size={18} />
                    </button>
                  </div>
                </div>

                <FilterBar
                  filter={filter}
                  onFilterChange={(f) => setFilter((prev) => ({ ...prev, ...f }))}
                  total={filteredWines.length}
                  filtered={filteredWines.length}
                />

                {/* Loading State */}
                {loading && (
                  <div className="loading-state">
                    <motion.div
                      className="loading-spinner"
                      animate={{ rotate: 360 }}
                      transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                    >
                      <RefreshCw size={32} />
                    </motion.div>
                    <p>Loading your cellar…</p>
                  </div>
                )}

                {/* Error State */}
                {error && !loading && (
                  <motion.div
                    className="error-banner"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <AlertCircle size={20} />
                    <span>{error}</span>
                    <button className="btn btn-ghost" onClick={refetch} style={{ marginLeft: 'auto' }}>
                      <RefreshCw size={14} /> Retry
                    </button>
                  </motion.div>
                )}

                {/* Empty state */}
                {!loading && !error && filteredWines.length === 0 && (
                  <div className="empty-state">
                    <span className="empty-icon">🍷</span>
                    <h3>No wines found</h3>
                    <p>Try adjusting your search or filters, or add a new wine to your cellar.</p>
                  </div>
                )}

                {/* Grid View */}
                {!loading && viewMode === 'grid' && filteredWines.length > 0 && (
                  <div className="wine-grid">
                    <AnimatePresence mode="popLayout">
                      {filteredWines.map((wine) => (
                        <WineCard
                          key={wine.id}
                          wine={wine}
                          onEdit={handleEdit}
                          onDelete={handleDeleteClick}
                        />
                      ))}
                    </AnimatePresence>
                  </div>
                )}

                {/* Table View */}
                {!loading && viewMode === 'table' && filteredWines.length > 0 && (
                  <WineTable
                    wines={filteredWines}
                    onEdit={handleEdit}
                    onDelete={handleDeleteClick}
                  />
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </main>

        <footer className="footer">
          <p style={{ marginBottom: '8px' }}>🍷 Vino Vault — Premium Wine Cellar Management</p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginBottom: '8px' }}>
            <a href="https://github.com/Manish-Dark" target="_blank" rel="noreferrer" style={{ color: 'inherit', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ textDecoration: 'underline' }}>GitHub</span>
            </a>
            <a href="https://www.linkedin.com/in/manish-sharma-426039297" target="_blank" rel="noreferrer" style={{ color: 'inherit', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ textDecoration: 'underline' }}>LinkedIn</span>
            </a>
          </div>
          <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
            Contact: <a href="mailto:mmanishsharma483@gmail.com" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: 600 }}>mmanishsharma483@gmail.com</a>
          </p>
          <p style={{ fontSize: '12px', opacity: 0.7 }}>© 2026 Manish Dark</p>
        </footer>
      </div>

      {/* Modals */}
      <WineModal
        isOpen={modalOpen}
        wine={editingWine}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
      />

      <ConfirmModal
        isOpen={!!deletingId}
        title="Delete Wine"
        message={`Are you sure you want to remove "${deletingWine?.name}" from your cellar? This action cannot be undone.`}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeletingId(null)}
      />
    </div>
  );
}

export default App;
