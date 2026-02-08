// ═══════════════════════════════════════════════════════════════════════════
// TÉFA - Type Definitions
// ═══════════════════════════════════════════════════════════════════════════

export interface Product {
  id: string;
  slug: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  images: string[];
  galleryImages?: string[];  // Additional product views
  videoUrl?: string;         // Optional product video
  quantity: number;          // Stock quantity
  soldOut?: boolean;         // Manual sold out override
  stockStatus?: 'in_stock' | 'low_stock' | 'out_of_stock';
  categoryId: string;
  tags: string[];
  sizes: string[];
  colors: ProductColor[];
  createdAt?: number;
  updatedAt?: number;
}

export interface ProductColor {
  name: string;
  hex: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  image: string;
  hoverImage?: string;
  createdAt?: number;
}

export interface CustomerReview {
  id: string;
  username: string;
  thumbnail: string;
  videoUrl?: string;
  externalLink?: string;
  platform: 'instagram' | 'tiktok' | 'other';
  createdAt?: number;
}

export interface CartItem {
  productId: string;
  variantId: string;
  name: string;
  price: number;
  qty: number;
  selectedSize: string;
  selectedColor: string;
  image: string;
  slug: string;
  isExpress?: boolean;
}

export interface CustomerInfo {
  name: string;
  phone: string;
  location: string;
  note: string;
}

// Navigation
export type PageName = 'home' | 'shop' | 'product' | 'checkout' | 'about' | 'admin';

export interface PageParams {
  categoryId?: string;
  slug?: string;
}

// Store Context
export interface StoreState {
  products: Product[];
  categories: Category[];
  reviews: CustomerReview[];
  cart: CartItem[];
  user: AuthUser | null;
  loading: boolean;
}

export interface AuthUser {
  uid: string;
  email: string | null;
  isAdmin?: boolean;
}

export interface StoreActions {
  addProduct: (product: Omit<Product, 'id' | 'slug' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateProduct: (id: string, updates: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;

  addCategory: (category: Omit<Category, 'id' | 'slug' | 'createdAt'>) => Promise<void>;
  updateCategory: (id: string, updates: Partial<Category>) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;

  addReview: (review: Omit<CustomerReview, 'id' | 'createdAt'>) => Promise<void>;
  updateReview: (id: string, updates: Partial<CustomerReview>) => Promise<void>;
  deleteReview: (id: string) => Promise<void>;

  addToCart: (item: CartItem) => void;
  updateCartQty: (variantId: string, delta: number) => void;
  removeFromCart: (variantId: string) => void;
  clearCart: () => void;
  refreshProducts: () => Promise<void>;
  setCurrency: (currency: CurrencyCode) => void;
}

// Currency types
export type CurrencyCode = 'NGN' | 'USD' | 'GBP' | 'EUR';

export interface CurrencyInfo {
  code: CurrencyCode;
  symbol: string;
  name: string;
  rate: number; // Exchange rate relative to NGN
}

export const CURRENCIES: CurrencyInfo[] = [
  { code: 'NGN', symbol: '₦', name: 'Nigerian Naira', rate: 1 },
  { code: 'USD', symbol: '$', name: 'US Dollar', rate: 0.00065 },
  { code: 'GBP', symbol: '£', name: 'British Pound', rate: 0.00051 },
  { code: 'EUR', symbol: '€', name: 'Euro', rate: 0.00060 },
];

export type StoreContextType = StoreState & StoreActions & {
  currency: CurrencyCode;
};
