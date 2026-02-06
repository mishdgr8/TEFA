import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Product, CartItem, Category, StoreContextType, AuthUser } from '../types';
import { DEFAULT_PRODUCTS } from './products';
import { CATEGORIES } from './categories';
import { onAuthChange, User } from '../lib/auth';
import {
  getProducts,
  addProductToFirestore,
  updateProductInFirestore,
  deleteProductFromFirestore
} from '../lib/firestore';

// ═══════════════════════════════════════════════════════════════════════════
// Local Storage Keys (for cart only - products now in Firestore)
// ═══════════════════════════════════════════════════════════════════════════

const STORAGE_KEYS = {
  CART: 'tefa_cart',
};

// ═══════════════════════════════════════════════════════════════════════════
// Utility Functions
// ═══════════════════════════════════════════════════════════════════════════

const loadFromStorage = <T,>(key: string, fallback: T): T => {
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : fallback;
  } catch {
    return fallback;
  }
};

const saveToStorage = <T,>(key: string, data: T): void => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error('Failed to save to localStorage:', e);
  }
};

// ═══════════════════════════════════════════════════════════════════════════
// Store Context
// ═══════════════════════════════════════════════════════════════════════════

const StoreContext = createContext<StoreContextType | null>(null);

export const useStore = (): StoreContextType => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};

interface StoreProviderProps {
  children: ReactNode;
}

export const StoreProvider: React.FC<StoreProviderProps> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>(() =>
    loadFromStorage(STORAGE_KEYS.CART, [])
  );
  const [categories] = useState<Category[]>(CATEGORIES);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Subscribe to auth state changes
  useEffect(() => {
    const unsubscribe = onAuthChange((firebaseUser: User | null) => {
      if (firebaseUser) {
        setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email
        });
      } else {
        setUser(null);
      }
    });

    return () => unsubscribe();
  }, []);

  // Load products from Firestore on mount
  useEffect(() => {
    const loadProducts = async () => {
      try {
        const firestoreProducts = await getProducts();
        if (firestoreProducts.length > 0) {
          setProducts(firestoreProducts);
        } else {
          // No products in Firestore, use defaults
          setProducts(DEFAULT_PRODUCTS);
        }
      } catch (error) {
        console.error('Failed to load products from Firestore:', error);
        // Fallback to default products
        setProducts(DEFAULT_PRODUCTS);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

  // Persist cart to localStorage
  useEffect(() => {
    saveToStorage(STORAGE_KEYS.CART, cart);
  }, [cart]);

  // ─── Product Actions (Firestore) ───
  const addProduct = async (productData: Omit<Product, 'id' | 'slug' | 'createdAt' | 'updatedAt'>) => {
    try {
      const newId = await addProductToFirestore(productData);
      await refreshProducts();
      console.log('Product added with ID:', newId);
    } catch (error) {
      console.error('Failed to add product:', error);
      throw error;
    }
  };

  const updateProduct = async (id: string, updates: Partial<Product>) => {
    try {
      await updateProductInFirestore(id, updates);
      await refreshProducts();
    } catch (error) {
      console.error('Failed to update product:', error);
      throw error;
    }
  };

  const deleteProduct = async (id: string) => {
    try {
      await deleteProductFromFirestore(id);
      setProducts(prev => prev.filter(p => p.id !== id));
    } catch (error) {
      console.error('Failed to delete product:', error);
      throw error;
    }
  };

  const refreshProducts = async () => {
    try {
      const firestoreProducts = await getProducts();
      setProducts(firestoreProducts);
    } catch (error) {
      console.error('Failed to refresh products:', error);
    }
  };

  // ─── Cart Actions ───
  const addToCart = (item: CartItem) => {
    setCart(prev => {
      const existing = prev.find(i => i.variantId === item.variantId);
      if (existing) {
        return prev.map(i =>
          i.variantId === item.variantId
            ? { ...i, qty: i.qty + item.qty }
            : i
        );
      }
      return [...prev, item];
    });
  };

  const updateCartQty = (variantId: string, delta: number) => {
    setCart(prev =>
      prev.map(i =>
        i.variantId === variantId
          ? { ...i, qty: Math.max(1, i.qty + delta) }
          : i
      )
    );
  };

  const removeFromCart = (variantId: string) => {
    setCart(prev => prev.filter(i => i.variantId !== variantId));
  };

  const clearCart = () => {
    setCart([]);
  };

  const value: StoreContextType = {
    products,
    categories,
    cart,
    user,
    loading,
    addProduct,
    updateProduct,
    deleteProduct,
    addToCart,
    updateCartQty,
    removeFromCart,
    clearCart,
    refreshProducts,
  };

  return (
    <StoreContext.Provider value={value}>
      {children}
    </StoreContext.Provider>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// Helper Functions (exported for use in components)
// ═══════════════════════════════════════════════════════════════════════════

export const formatPrice = (price: number, currency: string = '₦'): string => {
  return `${currency}${price.toLocaleString()}`;
};

export const getCategoryName = (categoryId: string): string => {
  return CATEGORIES.find(c => c.id === categoryId)?.name || 'Uncategorized';
};
