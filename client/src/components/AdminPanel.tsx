import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../constants';
import { motion, AnimatePresence } from 'framer-motion';
import { User, ShieldCheck, ShieldAlert, Trash2, Edit3, Search, Mail, Key, CheckCircle2, XCircle } from 'lucide-react';

interface UserData {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: 'user' | 'admin';
  isApproved: boolean;
  createdAt: string;
}

interface AdminPanelProps {
  token: string | null;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ token }) => {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [forbidden, setForbidden] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingUser, setEditingUser] = useState<UserData | null>(null);
  const [editForm, setEditForm] = useState({ name: '', email: '', password: '', role: 'user' as 'user' | 'admin' });

  const SUPER_ADMIN_EMAIL = 'mmanishsharma483@gmail.com';

  const fetchUsers = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/users`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (res.status === 403) {
        setForbidden(true);
        setLoading(false);
        return;
      }

      const data = await res.json();
      if (Array.isArray(data)) {
        setUsers(data);
        setForbidden(false);
      } else {
        setUsers([]);
      }
    } catch (err) {
      console.error('Failed to fetch users:', err);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchUsers();
  }, [token]);

  const handleToggleApproval = async (userId: string) => {
    // Optimistic UI update for instant feedback
    setUsers(prev => prev.map(u => 
      u.id === userId ? { ...u, isApproved: !u.isApproved } : u
    ));

    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/users/${userId}/approve`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) {
        // Rollback on error
        fetchUsers();
      }
    } catch (err) {
      console.error('Failed to toggle approval:', err);
      fetchUsers(); // Rollback
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!window.confirm('Are you sure you want to delete this user? All their data will be lost.')) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) fetchUsers();
    } catch (err) {
      console.error('Failed to delete user:', err);
    }
  };

  const handleEditClick = (u: UserData) => {
    setEditingUser(u);
    setEditForm({ name: u.name, email: u.email, password: '', role: u.role });
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/users/${editingUser.id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify(editForm)
      });
      if (res.ok) {
        setEditingUser(null);
        fetchUsers();
      }
    } catch (err) {
      console.error('Failed to update user:', err);
    }
  };

  // Sort users so the Super Admin is always at the bottom
  const sortedUsers = [...users].sort((a, b) => {
    if (a.email === SUPER_ADMIN_EMAIL) return 1;
    if (b.email === SUPER_ADMIN_EMAIL) return -1;
    return 0;
  });

  const filteredUsers = sortedUsers.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (forbidden) {
    return (
      <div className="admin-view">
        <div className="glass-panel" style={{ padding: '40px', textAlign: 'center' }}>
          <ShieldAlert size={48} color="var(--danger-light)" style={{ marginBottom: '20px' }} />
          <h2 style={{ color: 'var(--primary)' }}>Access Denied</h2>
          <p style={{ color: 'var(--text-muted)', maxWidth: '400px', margin: '0 auto 20px' }}>
            You do not have administrative privileges to view this page, or your session has expired.
          </p>
          <button 
            className="btn-primary-premium" 
            style={{ padding: '12px 24px', height: 'auto' }}
            onClick={() => window.location.reload()}
          >
            Retry / Log In Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-view">
      <div className="view-header" style={{ marginBottom: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 className="view-title" style={{ margin: 0 }}>User Management</h2>
        <div className="admin-search-container">
          <Search size={18} className="admin-search-icon" />
          <input 
            type="text" 
            placeholder="Search users by name or email..." 
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="admin-search-bar"
          />
        </div>
      </div>

      {loading ? (
        <div className="loading-state">Loading users...</div>
      ) : (
        <div className="table-wrap glass-panel admin-table-panel">
          <table className="wine-table">
            <thead>
              <tr>
                <th>Status</th>
                <th>User Identity</th>
                <th style={{ textAlign: 'center' }}>Role</th>
                <th>Password</th>
                <th>Access Control</th>
                <th>Date Joined</th>
                <th style={{ textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                      <User size={48} style={{ opacity: 0.2, marginBottom: '8px' }} />
                      <div style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)' }}>No Users Found</div>
                      <p style={{ fontSize: '14px', maxWidth: '300px' }}>
                        When other users register for an account, they will appear here for your approval.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredUsers.map(user => {
                  const isSuperAdmin = user.email === SUPER_ADMIN_EMAIL;
                  return (
                    <tr key={user.id} className="table-row">
                      <td>
                        <div className={`status-chip-fixed ${user.isApproved ? 'approved' : 'pending'}`}>
                          {user.isApproved ? <ShieldCheck size={14} /> : <ShieldAlert size={14} />}
                          {user.isApproved ? 'Approved' : 'Pending'}
                        </div>
                      </td>
                      <td>
                        <div className="admin-user-info">
                          <div className="admin-user-name">{user.name}</div>
                          <div className="admin-user-email">{user.email}</div>
                        </div>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <span className={`role-badge ${user.role}`}>
                          {user.role.toUpperCase()}
                        </span>
                      </td>
                      <td>
                        <code style={{ fontSize: '10px', opacity: 0.6, background: 'rgba(255,255,255,0.05)', padding: '4px 8px', borderRadius: '4px' }}>
                          {user.password ? `${user.password.substring(0, 15)}...` : 'N/A'}
                        </code>
                      </td>
                      <td>
                        {isSuperAdmin ? (
                          <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontStyle: 'italic' }}>System Managed</span>
                        ) : user.isApproved ? (
                          <button 
                            className="btn-revoke-inline"
                            onClick={() => handleToggleApproval(user.id)}
                          >
                            Revoke Access
                          </button>
                        ) : (
                          <motion.button 
                            className="btn-approve-primary"
                            onClick={() => handleToggleApproval(user.id)}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <CheckCircle2 size={14} />
                            Approve
                          </motion.button>
                        )}
                      </td>
                      <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                      <td className="actions-cell" style={{ justifyContent: 'center' }}>
                        {!isSuperAdmin && (
                          <>
                            <button className="admin-action-icon edit" onClick={() => handleEditClick(user)} title="Edit User">
                              <Edit3 size={16} />
                            </button>
                            <button className="admin-action-icon delete" onClick={() => handleDeleteUser(user.id)} title="Delete User">
                              <Trash2 size={16} />
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Edit Modal */}
      <AnimatePresence>
        {editingUser && (
          <div className="modal-overlay">
            <motion.div 
              className="modal-content admin-modal-premium"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <div className="modal-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div className="header-icon-circle">
                    <User size={20} />
                  </div>
                  <div>
                    <h3 style={{ margin: 0 }}>Configure User</h3>
                    <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0 }}>ID: {editingUser.id}</p>
                  </div>
                </div>
                <button className="close-btn" onClick={() => setEditingUser(null)}>
                  <XCircle size={24} />
                </button>
              </div>

              <form onSubmit={handleUpdateUser} className="premium-form">
                <div className="form-group">
                  <label>Full Name</label>
                  <div className="premium-input-wrap">
                    <User size={18} className="input-icon" />
                    <input 
                      type="text" 
                      value={editForm.name} 
                      onChange={e => setEditForm({...editForm, name: e.target.value})} 
                      required 
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Email Address</label>
                  <div className="premium-input-wrap">
                    <Mail size={18} className="input-icon" />
                    <input 
                      type="email" 
                      value={editForm.email} 
                      onChange={e => setEditForm({...editForm, email: e.target.value})} 
                      required 
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Account Role</label>
                  <div className="premium-input-wrap">
                    <ShieldCheck size={18} className="input-icon" />
                    <select 
                      value={editForm.role} 
                      onChange={e => setEditForm({...editForm, role: e.target.value as 'user' | 'admin'})}
                      className="premium-select"
                    >
                      <option value="user">User - Normal Access</option>
                      <option value="admin">Admin - Full Control</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label>Reset Password <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(Optional)</span></label>
                  <div className="premium-input-wrap">
                    <Key size={18} className="input-icon" />
                    <input 
                      type="password" 
                      placeholder="••••••••"
                      value={editForm.password} 
                      onChange={e => setEditForm({...editForm, password: e.target.value})} 
                    />
                  </div>
                </div>

                <div className="modal-actions-premium">
                  <button type="button" className="btn-secondary-premium" onClick={() => setEditingUser(null)}>Cancel</button>
                  <button type="submit" className="btn-primary-premium">Update Account</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
