import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Product, CartItem, Category, StoreContextType, AuthUser, CurrencyCode, CURRENCIES, CustomerReview } from '../types';
import { DEFAULT_PRODUCTS } from './products';
import { CATEGORIES } from './categories';
import { onAuthChange, User } from '../lib/auth';
import {
  getProducts,
  subscribeToProducts,
  addProductToFirestore,
  updateProductInFirestore,
  deleteProductFromFirestore,
  subscribeToCategories,
  addCategoryToFirestore,
  updateCategoryInFirestore,
  deleteCategoryFromFirestore,
  subscribeToReviews,
  addReviewToFirestore,
  updateReviewInFirestore,
  deleteReviewFromFirestore,
  seedCategories,
  seedProducts
} from '../lib/firestore';

// ═══════════════════════════════════════════════════════════════════════════
// Local Storage Keys (for cart only - products now in Firestore)
// ═══════════════════════════════════════════════════════════════════════════

const STORAGE_KEYS = {
  CART: 'tefa_cart',
  CURRENCY: 'tefa_currency',
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
  // Initialize with default products immediately for instant display
  const [products, setProducts] = useState<Product[]>(DEFAULT_PRODUCTS);
  const [categories, setCategories] = useState<Category[]>(CATEGORIES);
  const [reviews, setReviews] = useState<CustomerReview[]>([]);
  const [cart, setCart] = useState<CartItem[]>(() =>
    loadFromStorage(STORAGE_KEYS.CART, [])
  );
  const [user, setUser] = useState<AuthUser | null>(null);
  const [currency, setCurrencyState] = useState<CurrencyCode>(() =>
    loadFromStorage(STORAGE_KEYS.CURRENCY, 'NGN') as CurrencyCode
  );
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Subscribe to auth state changes
  useEffect(() => {
    const adminEmails = ['admin@houseoftefa.com', 'mishdgr8@gmail.com', 'golfwang0x@gmail.com', 'mishaelmordi@gmail.com'];

    const unsubscribe = onAuthChange((firebaseUser: User | null) => {
      if (firebaseUser) {
        setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          isAdmin: firebaseUser.email ? adminEmails.includes(firebaseUser.email.toLowerCase()) : false
        });
      } else {
        setUser(null);
      }
    });

    return () => unsubscribe();
  }, []);

  // Load products from Firestore in real-time
  useEffect(() => {
    console.log('Starting products subscription...');
    setLoading(true);
    const unsubscribe = subscribeToProducts((firestoreProducts) => {
      console.log('Subscription data received:', firestoreProducts.length, 'products');
      setProducts(firestoreProducts);
      setLoading(false);
    }, (error) => {
      console.error('Store subscription error:', error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Subscribe to categories and auto-seed if empty
  useEffect(() => {
    const unsubscribe = subscribeToCategories(async (firestoreCategories) => {
      if (firestoreCategories.length > 0) {
        setCategories(firestoreCategories);
      } else {
        console.log('No categories in Firestore, seeding initial data...');
        try {
          await seedCategories(CATEGORIES);
          console.log('Categories seeded successfully.');
        } catch (error) {
          console.error('Failed to seed categories:', error);
        }
      }
    });
    return () => unsubscribe();
  }, []);

  // Subscribe to reviews
  useEffect(() => {
    const unsubscribe = subscribeToReviews((firestoreReviews) => {
      setReviews(firestoreReviews);
    });
    return () => unsubscribe();
  }, []);

  // Auto-seed products if Firestore is empty
  useEffect(() => {
    const checkAndSeedProducts = async () => {
      // We check if products are empty after initial loading from Firestore
      // The subscribeToProducts already sets loading to false
      if (!loading && products.length === 0) {
        console.log('No products in Firestore, seeding default products...');
        try {
          await seedProducts(DEFAULT_PRODUCTS);
          console.log('Products seeded successfully.');
        } catch (error) {
          console.error('Failed to seed products:', error);
        }
      }
    };

    // Only run this check if we are on the Spark/Blaze plan and database is active
    if (!loading) {
      checkAndSeedProducts();
    }
  }, [loading, products.length]);

  // Persist cart to localStorage
  useEffect(() => {
    saveToStorage(STORAGE_KEYS.CART, cart);
  }, [cart]);

  // ─── Product Actions (Firestore) ───
  const addProduct = async (productData: Omit<Product, 'id' | 'slug' | 'createdAt' | 'updatedAt'>) => {
    try {
      await addProductToFirestore(productData);
    } catch (error) {
      console.error('Failed to add product:', error);
      throw error;
    }
  };

  const updateProduct = async (id: string, updates: Partial<Product>) => {
    try {
      await updateProductInFirestore(id, updates);
    } catch (error) {
      console.error('Failed to update product:', error);
      throw error;
    }
  };

  const deleteProduct = async (id: string) => {
    try {
      await deleteProductFromFirestore(id);
    } catch (error) {
      console.error('Failed to delete product:', error);
      throw error;
    }
  };

  // --- Category Actions ---
  const addCategory = async (data: Omit<Category, 'id' | 'slug' | 'createdAt'>) => {
    try {
      await addCategoryToFirestore(data);
    } catch (error) {
      console.error('Failed to add category:', error);
      throw error;
    }
  };

  const updateCategory = async (id: string, updates: Partial<Category>) => {
    try {
      await updateCategoryInFirestore(id, updates);
    } catch (error) {
      console.error('Failed to update category:', error);
      throw error;
    }
  };

  const deleteCategory = async (id: string) => {
    try {
      await deleteCategoryFromFirestore(id);
    } catch (error) {
      console.error('Failed to delete category:', error);
      throw error;
    }
  };

  // --- Review Actions ---
  const addReview = async (data: Omit<CustomerReview, 'id' | 'createdAt'>) => {
    try {
      await addReviewToFirestore(data);
    } catch (error) {
      console.error('Failed to add review:', error);
      throw error;
    }
  };

  const updateReview = async (id: string, updates: Partial<CustomerReview>) => {
    try {
      await updateReviewInFirestore(id, updates);
    } catch (error) {
      console.error('Failed to update review:', error);
      throw error;
    }
  };

  const deleteReview = async (id: string) => {
    try {
      await deleteReviewFromFirestore(id);
    } catch (error) {
      console.error('Failed to delete review:', error);
      throw error;
    }
  };

  const migrateCategories = async () => {
    try {
      await seedCategories(CATEGORIES);
      console.log('Categories migrated to Firestore successfully');
    } catch (error) {
      console.error('Failed to migrate categories:', error);
    }
  };

  const refreshProducts = async () => {
    console.log('Manually refreshing products from Firestore...');
    setLoading(true);
    try {
      const firestoreProducts = await getProducts();
      console.log('Products fetched:', firestoreProducts.length);
      setProducts(firestoreProducts);
    } catch (error) {
      console.error('Failed to refresh products:', error);
    } finally {
      setLoading(false);
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

  const setCurrency = (newCurrency: CurrencyCode) => {
    setCurrencyState(newCurrency);
    saveToStorage(STORAGE_KEYS.CURRENCY, newCurrency);
  };

  const value: StoreContextType = {
    products,
    categories,
    reviews,
    cart,
    user,
    loading,
    currency,
    addProduct,
    updateProduct,
    deleteProduct,
    addCategory,
    updateCategory,
    deleteCategory,
    addReview,
    updateReview,
    deleteReview,
    addToCart,
    updateCartQty,
    removeFromCart,
    clearCart,
    refreshProducts,
    setCurrency,
    isSearchOpen,
    setIsSearchOpen,
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

export const formatPrice = (price: number, currencyCode: CurrencyCode = 'NGN'): string => {
  const currencyInfo = CURRENCIES.find(c => c.code === currencyCode) || CURRENCIES[0];
  const convertedPrice = price * currencyInfo.rate;
  return `${currencyInfo.symbol}${convertedPrice.toLocaleString(undefined, { minimumFractionDigits: currencyCode === 'NGN' ? 0 : 2, maximumFractionDigits: currencyCode === 'NGN' ? 0 : 2 })}`;
};

export const getCategoryName = (categoryId: string, categories: Category[] = []): string => {
  // Try finding in the provided live categories first
  const found = categories.find(c => c.id === categoryId);
  if (found) return found.name;

  // Fallback to static CATEGORIES for safety if live list is empty or doesn't match
  return CATEGORIES.find(c => c.id === categoryId)?.name || 'Uncategorized';
};
