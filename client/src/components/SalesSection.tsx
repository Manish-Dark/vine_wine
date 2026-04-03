import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ShoppingCart, Package, AlertTriangle, CheckCircle2, TrendingDown, IndianRupee } from 'lucide-react';
import { useWineStore } from '../hooks/useWineStore';

interface SalesSectionProps {
  token: string | null;
}

export const SalesSection: React.FC<SalesSectionProps> = ({ token }) => {
  const { wines, updateQuantity, loading, stats } = useWineStore(token);
  const [searchTerm, setSearchTerm] = useState('');
  const [saleLoading, setSaleLoading] = useState<string | null>(null);
  const [lastSale, setLastSale] = useState<string | null>(null);

  const filteredWines = wines.filter(w => 
    w.quantity > 0 && 
    (w.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (w.shopName && w.shopName.toLowerCase().includes(searchTerm.toLowerCase())))
  );

  const handleSell = async (wineId: string) => {
    setSaleLoading(wineId);
    try {
      await updateQuantity(wineId, -1);
      setLastSale(wineId);
      setTimeout(() => setLastSale(null), 2000);
    } catch (err) {
      console.error('Failed to sell wine:', err);
    } finally {
      setSaleLoading(null);
    }
  };

  return (
    <div className="sales-section">
      <div className="view-header" style={{ marginBottom: '32px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
          <h2 className="view-title">Point of Sale</h2>
          <div className="search-bar" style={{ maxWidth: '400px', flex: 1, margin: '0 24px' }}>
            <div className="search-input-wrap">
              <Search size={18} className="search-icon" />
              <input
                type="text"
                className="search-input"
                placeholder="Search wine to sell..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Sales Stats Breakdown */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', 
          gap: '16px',
          width: '100%'
        }}>
          {/* Main Stats */}
          <div style={{ padding: '16px 20px', background: 'var(--bg-surface)', border: '1px solid var(--glass-border)', borderRadius: '18px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'rgba(39, 174, 96, 0.1)', color: '#27ae60', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ShoppingCart size={18} />
            </div>
            <div>
              <div style={{ fontSize: '18px', fontWeight: 800 }}>{stats.totalBottles + stats.totalSoldFull + stats.totalSoldHalf + stats.totalSoldQuarter + stats.totalSold900ml} Sold</div>
              <div style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Lifetime Sales</div>
            </div>
          </div>

          {/* Individual Size Sales */}
          <div style={{ padding: '16px', background: 'var(--bg-surface)', border: '1px solid var(--glass-border)', borderRadius: '18px', textAlign: 'center' }}>
            <div style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '4px' }}>Full Sold</div>
            <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--primary)' }}>{stats.totalSoldFull}</div>
          </div>
          <div style={{ padding: '16px', background: 'var(--bg-surface)', border: '1px solid var(--glass-border)', borderRadius: '18px', textAlign: 'center' }}>
            <div style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '4px' }}>Half Sold</div>
            <div style={{ fontSize: '20px', fontWeight: 800, color: '#e67e22' }}>{stats.totalSoldHalf}</div>
          </div>
          <div style={{ padding: '16px', background: 'var(--bg-surface)', border: '1px solid var(--glass-border)', borderRadius: '18px', textAlign: 'center' }}>
            <div style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '4px' }}>Quarter Sold</div>
            <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--gold)' }}>{stats.totalSoldQuarter}</div>
          </div>
          <div style={{ padding: '16px', background: 'var(--bg-surface)', border: '1px solid var(--glass-border)', borderRadius: '18px', textAlign: 'center' }}>
            <div style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '4px' }}>900ml Sold</div>
            <div style={{ fontSize: '20px', fontWeight: 800, color: '#8e44ad' }}>{stats.totalSold900ml}</div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="loading-state">Loading inventory...</div>
      ) : filteredWines.length === 0 ? (
        <div className="empty-state" style={{ padding: '80px 0' }}>
          <Package size={48} style={{ opacity: 0.2, marginBottom: '16px' }} />
          <h3>No wines found</h3>
          <p>Try a different search term to find a wine to sell.</p>
        </div>
      ) : (
        <div className="sales-grid" style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', 
          gap: '24px' 
        }}>
          <AnimatePresence>
            {filteredWines.map((wine) => (
              <motion.div
                key={wine.id}
                layout
                className="sales-card"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                style={{
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--glass-border)',
                  borderRadius: '24px',
                  padding: '24px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '16px',
                  position: 'relative',
                  overflow: 'hidden',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.03)'
                }}
              >
                {/* Sale Success Overlay */}
                {lastSale === wine.id && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    style={{
                      position: 'absolute',
                      inset: 0,
                      background: 'rgba(39, 174, 96, 0.95)',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      zIndex: 10,
                      color: '#fff',
                      backdropFilter: 'blur(4px)'
                    }}
                  >
                    <motion.div initial={{ scale: 0.5 }} animate={{ scale: 1 }} transition={{ type: 'spring' }}>
                      <CheckCircle2 size={48} />
                    </motion.div>
                    <span style={{ fontWeight: 800, fontSize: '20px', marginTop: '12px' }}>Transaction Success!</span>
                  </motion.div>
                )}

                <div>
                  <h3 style={{ margin: 0, fontSize: '20px', fontWeight: 800, color: 'var(--text-primary)' }}>{wine.name}</h3>
                  <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px', fontWeight: 500 }}>
                     {wine.size} • {wine.shopName || 'Main Cellar'}
                  </div>
                </div>

                {/* Primary Quantity Metrics */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div style={{ padding: '16px', background: wine.quantity === 0 ? 'rgba(214, 48, 49, 0.05)' : 'rgba(39, 174, 96, 0.05)', borderRadius: '16px', textAlign: 'center', border: '1px solid var(--glass-border)' }}>
                    <div style={{ fontSize: '24px', fontWeight: 900, color: wine.quantity === 0 ? 'var(--danger-light)' : '#27ae60' }}>{wine.quantity}</div>
                    <div style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginTop: '4px' }}>Available</div>
                  </div>
                  <div style={{ padding: '16px', background: 'rgba(201, 169, 110, 0.05)', borderRadius: '16px', textAlign: 'center', border: '1px solid var(--glass-border)' }}>
                    <div style={{ fontSize: '24px', fontWeight: 900, color: 'var(--gold)' }}>{wine.sold || 0}</div>
                    <div style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginTop: '4px' }}>Total Sold</div>
                  </div>
                </div>

                <div style={{ borderTop: '1px solid var(--glass-border)', paddingTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--primary)', fontWeight: 800, fontSize: '22px' }}>
                    <IndianRupee size={18} />
                    {wine.sellingPrice?.toLocaleString('en-IN')}
                  </div>
                  
                  <button
                    disabled={wine.quantity === 0 || saleLoading === wine.id}
                    onClick={() => handleSell(wine.id)}
                    className="btn btn-primary"
                    style={{ 
                      padding: '12px 28px', 
                      height: '52px',
                      borderRadius: '14px',
                      fontSize: '15px',
                      boxShadow: wine.quantity === 0 ? 'none' : '0 4px 15px var(--primary-glow)',
                      opacity: wine.quantity === 0 ? 0.3 : 1
                    }}
                  >
                    {saleLoading === wine.id ? (
                       <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }}>
                         <TrendingDown size={20} />
                       </motion.div>
                    ) : (
                      <>
                        <ShoppingCart size={20} />
                        <span>Sell Bottle</span>
                      </>
                    )}
                  </button>
                </div>

                {wine.quantity <= 2 && wine.quantity > 0 && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#f39c12', fontWeight: 700, background: 'rgba(243, 156, 18, 0.05)', padding: '8px', borderRadius: '8px' }}>
                    <AlertTriangle size={14} /> Critical Stock Alert
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};
