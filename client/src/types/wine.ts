export type WineType = 'Red' | 'White' | 'Rosé' | 'Sparkling' | 'Dessert' | 'Fortified';

export interface Wine {
  id: string;
  name: string;
  shopName?: string;
  type: WineType;
  region: string;
  country: string;
  vintage: string;
  quantity: number;
  price: number;
  sellingPrice: number;
  otherExpense: number;
  rating: number;
  notes: string;
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
  type: WineType | 'All';
  sortField: SortField;
  sortOrder: SortOrder;
  startDate?: string; // YYYY-MM-DD
  endDate?: string;   // YYYY-MM-DD
}
