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
  cart: CartItem[];
  user: AuthUser | null;
  loading: boolean;
}

export interface AuthUser {
  uid: string;
  email: string | null;
}

export interface StoreActions {
  addProduct: (product: Omit<Product, 'id' | 'slug' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateProduct: (id: string, updates: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  addToCart: (item: CartItem) => void;
  updateCartQty: (variantId: string, delta: number) => void;
  removeFromCart: (variantId: string) => void;
  clearCart: () => void;
  refreshProducts: () => Promise<void>;
}

export type StoreContextType = StoreState & StoreActions;
