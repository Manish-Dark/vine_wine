import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wine, Mail, Lock, User, LogIn, UserPlus, AlertCircle } from 'lucide-react';

interface AuthPageProps {
  onLogin: (email: string, password: string) => Promise<void>;
  onRegister: (name: string, email: string, password: string) => Promise<string | void>;
}

export const AuthPage: React.FC<AuthPageProps> = ({ onLogin, onRegister }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfoMessage(null);
    setLoading(true);
    try {
      if (isLogin) {
        await onLogin(formData.email, formData.password);
      } else {
        const msg = await onRegister(formData.name, formData.email, formData.password);
        if (typeof msg === 'string') {
          setInfoMessage(msg);
        }
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="bg-blob blob-1" />
      <div className="bg-blob blob-2" />
      
      <motion.div 
        className="auth-card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="auth-header">
          <div className="auth-logo">
            <Wine size={32} />
          </div>
          <h1>Vino Vault</h1>
          <p>{isLogin ? 'Welcome back to your cellar' : 'Start your premium wine collection'}</p>
        </div>

        <div className="auth-tabs">
          <button 
            className={`auth-tab ${isLogin ? 'active' : ''}`}
            onClick={() => { setIsLogin(true); setError(null); }}
          >
            Login
          </button>
          <button 
            className={`auth-tab ${!isLogin ? 'active' : ''}`}
            onClick={() => { setIsLogin(false); setError(null); }}
          >
            Register
          </button>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <AnimatePresence mode="wait">
            {!isLogin && (
              <motion.div 
                key="name"
                className="form-field"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                <label>Full Name</label>
                <div className="auth-input-wrap">
                  <User size={18} className="auth-input-icon" />
                  <input 
                    type="text" 
                    placeholder="Your Name" 
                    required 
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="form-field">
            <label>Email Address</label>
            <div className="auth-input-wrap">
              <Mail size={18} className="auth-input-icon" />
              <input 
                type="email" 
                placeholder="email@example.com" 
                required 
                value={formData.email}
                onChange={e => setFormData({...formData, email: e.target.value})}
              />
            </div>
          </div>

          <div className="form-field">
            <label>Password</label>
            <div className="auth-input-wrap">
              <Lock size={18} className="auth-input-icon" />
              <input 
                type="password" 
                placeholder="••••••••" 
                required 
                value={formData.password}
                onChange={e => setFormData({...formData, password: e.target.value})}
              />
            </div>
          </div>

          {error && (
            <motion.div 
              className="auth-error"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <AlertCircle size={16} />
              <span>{error}</span>
            </motion.div>
          )}

          <button type="submit" className="btn btn-primary auth-submit" disabled={loading}>
            {loading ? (
              'Processing...'
            ) : isLogin ? (
              <><LogIn size={18} /> Login</>
            ) : (
              <><UserPlus size={18} /> Register</>
            )}
          </button>
        </form>
      </motion.div>

      {/* Success Popup for Registration */}
      <AnimatePresence>
        {infoMessage && (
          <motion.div 
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ zIndex: 1000 }}
          >
            <motion.div 
              className="modal-container"
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              style={{ maxWidth: '400px', textAlign: 'center', padding: '40px 30px' }}
            >
              <div style={{ 
                width: '64px', 
                height: '64px', 
                background: 'rgba(39, 174, 96, 0.1)', 
                borderRadius: '50%', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                margin: '0 auto 20px',
                color: '#27ae60'
              }}>
                <UserPlus size={32} />
              </div>
              <h2 style={{ fontSize: '24px', marginBottom: '12px', color: 'var(--text-primary)' }}>Registration Sent!</h2>
              <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6', marginBottom: '30px' }}>
                {infoMessage}
              </p>
              <button 
                className="btn btn-primary" 
                style={{ width: '100%' }}
                onClick={() => {
                  setInfoMessage(null);
                  setIsLogin(true);
                }}
              >
                Got it, thanks!
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
