
export interface Wine {
  id: string;
  name: string;
  shopName?: string;
  shopPlace?: string;
  size: 'Half' | 'Full' | 'Quarter' | '900 ml';
  vintage: string;
  quantity: number;
  price: number;
  sellingPrice: number;
  otherExpense: number;
  sold: number;
  rating: number;
  createdAt: string;
  updatedAt: string;
}

export interface WineStats {
  total: number;
  totalBottles: number;
  totalValue: number;
  totalCost: number;
  totalOtherExpenses: number;
}

export type WineFormData = Omit<Wine, 'id' | 'createdAt' | 'updatedAt'>;

export type SortField = 'name' | 'vintage' | 'price' | 'sellingPrice' | 'quantity' | 'rating';
export type SortOrder = 'asc' | 'desc';

export interface FilterState {
  search: string;
  sortField: SortField;
  sortOrder: SortOrder;
  startDate?: string; // YYYY-MM-DD
  endDate?: string;   // YYYY-MM-DD
}
