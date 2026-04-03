import React, { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import type { Wine, WineFormData, FilterState } from '../types/wine';
import { API_BASE_URL } from '../constants';

const API_BASE = `${API_BASE_URL}/api/wines`;

interface WineContextType {
  wines: Wine[];
  loading: boolean;
  error: string | null;
  filter: FilterState;
  setFilter: React.Dispatch<React.SetStateAction<FilterState>>;
  addWine: (data: WineFormData | WineFormData[]) => Promise<void>;
  updateWine: (id: string, data: Partial<WineFormData>) => Promise<void>;
  deleteWine: (id: string) => Promise<void>;
  updateQuantity: (id: string, delta: number) => Promise<void>;
  stats: any;
  refetch: () => Promise<void>;
}

const WineContext = createContext<WineContextType | undefined>(undefined);

async function apiFetch<T>(url: string, options?: RequestInit, token?: string | null): Promise<T> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(url, {
    ...options,
    headers: { ...headers, ...options?.headers },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: 'Unknown error' }));
    throw new Error(err.message || `HTTP ${res.status}`);
  }
  return res.json();
}

export const WineProvider: React.FC<{ children: ReactNode; token: string | null }> = ({ children, token }) => {
  const [wines, setWines] = useState<Wine[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [filter, setFilter] = useState<FilterState>({
    search: '',
    sortField: 'name',
    sortOrder: 'asc',
  });

  const fetchWines = useCallback(async () => {
    if (!token) return;
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams();
      if (filter.search) params.set('search', filter.search);
      // Removed filter.type checks as it's hidden now
      if (filter.startDate) params.set('startDate', filter.startDate);
      if (filter.endDate) params.set('endDate', filter.endDate);
      params.set('sortField', filter.sortField);
      params.set('sortOrder', filter.sortOrder);

      const data = await apiFetch<Wine[]>(`${API_BASE}?${params.toString()}`, {}, token);
      setWines(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load wines');
    } finally {
      setLoading(false);
    }
  }, [filter, token]);

  useEffect(() => {
    fetchWines();
  }, [fetchWines]);

  const stats = {
    total: wines.length,
    totalBottles: wines.reduce((sum, w) => sum + w.quantity, 0),
    totalValue: wines.reduce((sum, w) => sum + (w.sellingPrice || 0) * w.quantity, 0),
    totalCost: wines.reduce((sum, w) => sum + (w.price || 0) * w.quantity, 0),
    totalOtherExpenses: wines.reduce((sum, w) => sum + (w.otherExpense || 0), 0),
    totalFull: wines.filter(w => w.size === 'Full').reduce((sum, w) => sum + w.quantity, 0),
    totalHalf: wines.filter(w => w.size === 'Half').reduce((sum, w) => sum + w.quantity, 0),
    totalQuarter: wines.filter(w => w.size === 'Quarter').reduce((sum, w) => sum + w.quantity, 0),
    total900ml: wines.filter(w => w.size === '900 ml').reduce((sum, w) => sum + w.quantity, 0),
    totalSoldFull: wines.filter(w => w.size === 'Full').reduce((sum, w) => sum + (w.sold || 0), 0),
    totalSoldHalf: wines.filter(w => w.size === 'Half').reduce((sum, w) => sum + (w.sold || 0), 0),
    totalSoldQuarter: wines.filter(w => w.size === 'Quarter').reduce((sum, w) => sum + (w.sold || 0), 0),
    totalSold900ml: wines.filter(w => w.size === '900 ml').reduce((sum, w) => sum + (w.sold || 0), 0),
  };

  const addWine = async (data: WineFormData | WineFormData[]) => {
    const result = await apiFetch<Wine | Wine[]>(API_BASE, {
      method: 'POST',
      body: JSON.stringify(data),
    }, token);
    
    setWines((prev) => {
      if (Array.isArray(result)) return [...result, ...prev];
      return [result, ...prev];
    });
  };

  const updateWine = async (id: string, data: Partial<WineFormData>) => {
    const updated = await apiFetch<Wine>(`${API_BASE}/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }, token);
    setWines((prev) => prev.map((w) => (w.id === id ? updated : w)));
  };

  const deleteWine = async (id: string) => {
    await apiFetch(`${API_BASE}/${id}`, { method: 'DELETE' }, token);
    setWines((prev) => prev.filter((w) => w.id !== id));
  };

  const updateQuantity = async (id: string, delta: number) => {
    const updated = await apiFetch<Wine>(`${API_BASE}/${id}/quantity`, {
      method: 'PATCH',
      body: JSON.stringify({ delta }),
    }, token);
    
    // Broadcast update to the local state immediately
    setWines((prev) => prev.map((w) => (w.id === id ? updated : w)));
  };

  return (
    <WineContext.Provider value={{
      wines,
      loading,
      error,
      filter,
      setFilter,
      addWine,
      updateWine,
      deleteWine,
      updateQuantity,
      stats,
      refetch: fetchWines
    }}>
      {children}
    </WineContext.Provider>
  );
};

export const useWine = () => {
  const context = useContext(WineContext);
  if (context === undefined) {
    throw new Error('useWine must be used within a WineProvider');
  }
  return context;
};
