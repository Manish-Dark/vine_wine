import { useState, useEffect, useCallback } from 'react';
import type { Wine, WineFormData, FilterState } from '../types/wine';

const API_BASE = 'http://localhost:5000/api/wines';

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

export function useWineStore(token?: string | null) {
  const [wines, setWines] = useState<Wine[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [filter, setFilter] = useState<FilterState>({
    search: '',
    type: 'All',
    sortField: 'name',
    sortOrder: 'asc',
  });

  // ── Fetch wines from API ───────────────────────────────────────────────────
  const fetchWines = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams();
      if (filter.search) params.set('search', filter.search);
      if (filter.type !== 'All') params.set('type', filter.type);
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
    if (token) fetchWines();
  }, [fetchWines, token]);

  // ── Stats (computed locally from fetched wines) ───────────────────────────
  const stats = {
    total: wines.length,
    totalValue: wines.reduce((sum, w) => sum + (w.sellingPrice || 0) * w.quantity, 0),
    totalBottles: wines.reduce((sum, w) => sum + w.quantity, 0),
    totalCost: wines.reduce((sum, w) => sum + (w.price || 0) * w.quantity, 0),
    totalOtherExpenses: wines.reduce((sum, w) => sum + (w.otherExpense || 0), 0),
  };

  // ── CRUD operations ───────────────────────────────────────────────────────
  const addWine = useCallback(async (data: WineFormData) => {
    const newWine = await apiFetch<Wine>(API_BASE, {
      method: 'POST',
      body: JSON.stringify(data),
    }, token);
    setWines((prev) => [newWine, ...prev]);
  }, [token]);

  const updateWine = useCallback(async (id: string, data: Partial<WineFormData>) => {
    const updated = await apiFetch<Wine>(`${API_BASE}/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }, token);
    setWines((prev) => prev.map((w) => (w.id === id ? updated : w)));
  }, [token]);

  const deleteWine = useCallback(async (id: string) => {
    await apiFetch(`${API_BASE}/${id}`, { method: 'DELETE' }, token);
    setWines((prev) => prev.filter((w) => w.id !== id));
  }, [token]);

  const updateQuantity = useCallback(async (id: string, delta: number) => {
    const updated = await apiFetch<Wine>(`${API_BASE}/${id}/quantity`, {
      method: 'PATCH',
      body: JSON.stringify({ delta }),
    }, token);
    setWines((prev) => prev.map((w) => (w.id === id ? updated : w)));
  }, [token]);

  return {
    wines,
    filteredWines: wines, // filtering is done server-side
    loading,
    error,
    filter,
    setFilter,
    addWine,
    updateWine,
    deleteWine,
    updateQuantity,
    stats,
    refetch: fetchWines,
  };
}
