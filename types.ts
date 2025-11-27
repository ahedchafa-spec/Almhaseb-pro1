
export interface Product {
  id: string;
  name: string;
  price: number;
  cost: number;
  stock: number;
  category: string;
  barcode?: string;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface Transaction {
  id: string;
  date: string;
  type: 'debt' | 'payment' | 'invoice';
  amount: number;
  note?: string;
  invoiceId?: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  balance: number; // Positive means they owe us (debt)
  transactions?: Transaction[];
}

export interface Invoice {
  id: string;
  date: string; // ISO string
  items: CartItem[];
  totalAmount: number;
  discount: number;
  finalAmount: number;
  paidAmount: number;
  customerId?: string; // null if Walk-in customer
  customerName?: string;
  paymentType: 'cash' | 'credit' | 'partial';
  note?: string;
}

export interface Expense {
  id: string;
  date: string;
  category: string;
  amount: number;
  description?: string;
}

export interface DashboardStats {
  totalSales: number;
  totalProfit: number;
  totalDebt: number;
  lowStockCount: number;
}

export interface BusinessInfo {
  name: string;
  address: string;
  phone: string;
  email?: string;
  taxNumber?: string;
  logoUrl?: string;
  footerText?: string;
  // Visibility flags
  showLogo?: boolean;
  showAddress?: boolean;
  showPhone?: boolean;
  showEmail?: boolean;
  showTaxNumber?: boolean;
  showFooter?: boolean;
}

export interface DashboardWidgetConfig {
  stats_sales: boolean;
  stats_debts: boolean;
  stats_stock: boolean;
  shortcuts: boolean;
  chart: boolean;
  recent: boolean;
}

export interface SecurityConfig {
  isEnabled: boolean;
  pin: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  password?: string;
  avatar?: string;
  isGoogleAuth?: boolean;
}

export enum View {
  DASHBOARD = 'DASHBOARD',
  POS = 'POS',
  INVENTORY = 'INVENTORY',
  INVOICES = 'INVOICES',
  DEBTS = 'DEBTS',
  EXPENSES = 'EXPENSES',
  REPORTS = 'REPORTS',
  AI_ASSISTANT = 'AI_ASSISTANT',
  SETTINGS = 'SETTINGS',
  WHATSAPP = 'WHATSAPP'
}