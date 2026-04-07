import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Product, CartItem, Category, StoreContextType, AuthUser, CurrencyCode, CURRENCIES, CustomerReview, Order } from '../types';
import { DEFAULT_PRODUCTS } from './products';
import { CATEGORIES } from './categories';
import { onAuthChange, User } from '../lib/supabaseAuth';
import { isSupabaseConfigValid as isFirebaseConfigValid } from '../lib/supabase';
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
  seedProducts,
  subscribeToUserProfile,
  ensureUserProfile,
  subscribeToOrders,
  updateOrderStatusInFirestore,
  deleteOrderFromFirestore,
  updateUserProfile,
  createOrder
} from '../lib/supabaseDb';

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
  const [orders, setOrders] = useState<Order[]>([]);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [currency, setCurrencyState] = useState<CurrencyCode>(() =>
    loadFromStorage(STORAGE_KEYS.CURRENCY, 'NGN') as CurrencyCode
  );
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Subscribe to auth state changes - Delayed to improve TBT and initial LCP
  useEffect(() => {
    if (!isFirebaseConfigValid) {
      console.warn('Auth subscription skipped: Firebase config is missing.');
      return;
    }

    let profileUnsubscribe: (() => void) | null = null;
    let authUnsubscribe: (() => void) | null = null;

    // Delay auth initialization to reduce initial main-thread work and network contention
    const timeoutId = setTimeout(() => {
      authUnsubscribe = onAuthChange(async (firebaseUser: User | null) => {
        if (profileUnsubscribe) {
          profileUnsubscribe();
          profileUnsubscribe = null;
        }

        if (firebaseUser) {
          // Ensure user document exists in Supabase Profiles
          await ensureUserProfile(firebaseUser.id, firebaseUser.email || null, firebaseUser.user_metadata);

          // Subscribe to user profile for Real-time admin/role updates
          profileUnsubscribe = subscribeToUserProfile(firebaseUser.id, (profileData) => {
            setUser({
              uid: firebaseUser.id,
              email: firebaseUser.email || null,
              isAdmin: profileData.isAdmin || false,
              metadata: {
                ...firebaseUser.user_metadata,
                first_name: profileData.first_name || firebaseUser.user_metadata?.first_name,
                last_name: profileData.last_name || firebaseUser.user_metadata?.last_name,
                phone: profileData.phone || firebaseUser.user_metadata?.phone,
                country: profileData.country || firebaseUser.user_metadata?.country,
              }
            });
          });
        } else {
          setUser(null);
        }
      });
    }, 2000);

    return () => {
      clearTimeout(timeoutId);
      if (authUnsubscribe) authUnsubscribe();
      if (profileUnsubscribe) profileUnsubscribe();
    };
  }, []);

  // ═══════════════════════════════════════════════════════════════════════════
  // Geolocation & Currency Detection
  // ═══════════════════════════════════════════════════════════════════════════
  useEffect(() => {
    const detectLocation = async () => {
      // Only auto-detect if the user hasn't manually set a currency yet in this session
      const savedCurrency = localStorage.getItem(STORAGE_KEYS.CURRENCY);
      if (savedCurrency) return;

      try {
        // Use ipapi.co for free geolocation (up to 1k requests/day for free)
        const response = await fetch('https://ipapi.co/json/');
        const data = await response.json();

        if (data && data.country_code) {
          console.log(`🌍 Detected location: ${data.country_name} (${data.country_code})`);

          // If outside Nigeria, default to USD
          if (data.country_code !== 'NG') {
            setCurrencyState('USD');
            saveToStorage(STORAGE_KEYS.CURRENCY, 'USD');
          } else {
            setCurrencyState('NGN');
            saveToStorage(STORAGE_KEYS.CURRENCY, 'NGN');
          }
        }
      } catch (error) {
        console.error('Location detection failed:', error);
      }
    };

    // Slight delay to not compete with initial page load
    const timeoutId = setTimeout(detectLocation, 3000);
    return () => clearTimeout(timeoutId);
  }, []);

  // Load products from Firestore in real-time
  useEffect(() => {
    if (!isFirebaseConfigValid) {
      console.warn('Products subscription skipped: Firebase config is missing.');
      setLoading(false);
      return;
    }

    console.log('Starting products subscription...');
    setLoading(true);

    let unsubscribe: (() => void) | null = null;
    try {
      unsubscribe = subscribeToProducts((firestoreProducts) => {
        console.log('Subscription data received:', firestoreProducts.length, 'products');
        setProducts(firestoreProducts);
        setLoading(false);
      }, (error) => {
        console.error('Store subscription error:', error);
        setLoading(false);
      });
    } catch (err) {
      console.error('Failed to set up products subscription:', err);
      setLoading(false);
    }

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  // Subscribe to categories and auto-seed if empty
  useEffect(() => {
    if (!isFirebaseConfigValid) {
      console.warn('Categories subscription skipped: Firebase config is missing.');
      return;
    }

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

  // Subscribe to orders for admin
  useEffect(() => {
    if (!isFirebaseConfigValid || !user?.isAdmin) return;

    const unsubscribe = subscribeToOrders((newOrders) => {
      setOrders(newOrders);
    });

    return () => unsubscribe();
  }, [user?.isAdmin]);

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

  const updateOrderStatus = async (id: string, status: Order['orderStatus']) => {
    try {
      await updateOrderStatusInFirestore(id, status);
    } catch (error) {
      console.error('Failed to update order status:', error);
    }
  };

  const deleteOrder = async (id: string) => {
    try {
      await deleteOrderFromFirestore(id);
    } catch (error) {
      console.error('Failed to delete order:', error);
    }
  };

  const updateProfile = async (updates: Partial<AuthUser['metadata']>) => {
    if (!user) return;
    try {
      // Sync to profiles table
      await updateUserProfile(user.uid, updates);

      // Local state update happens automatically via the Real-time subscription in useEffect
    } catch (error) {
      console.error('Failed to update profile:', error);
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

  const value = React.useMemo(() => ({
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
    isAuthModalOpen,
    setIsAuthModalOpen,
    isProfileModalOpen,
    setIsProfileModalOpen,
    orders,
    updateOrderStatus,
    deleteOrder,
    updateProfile,
    createOrder,
  }), [
    products,
    categories,
    reviews,
    cart,
    orders,
    user,
    loading,
    currency,
    isSearchOpen,
    isAuthModalOpen,
    isProfileModalOpen
  ]);

  return (
    <StoreContext.Provider value={value}>
      {children}
    </StoreContext.Provider>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// Helper Functions (exported for use in components)
// ═══════════════════════════════════════════════════════════════════════════

export const formatPrice = (
  price: number | { amount: number; isConverted?: boolean },
  currencyCode: CurrencyCode = 'NGN'
): string => {
  const currencyInfo = CURRENCIES.find(c => c.code === currencyCode) || CURRENCIES[0];

  let finalAmount: number;

  if (typeof price === 'object') {
    finalAmount = price.amount;
  } else {
    // Standard path: convert from Naira using the global rate
    finalAmount = price * currencyInfo.rate;
  }

  const fractionDigits = currencyCode === 'NGN' ? 0 : 2;
  return `${currencyInfo.symbol}${finalAmount.toLocaleString(undefined, {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits
  })}`;
};

/**
 * Centrally calculates the price for a product based on active currency, 
 * respecting manual USD price overrides if present.
 */
export const getProductPrice = (product: any, currency: CurrencyCode = 'NGN'): { original: number, sale?: number } => {
  if (currency === 'NGN') {
    return {
      original: product.price,
      sale: product.salePrice
    };
  }

  // Handle USD with potential manual price overrides
  const rate = CURRENCIES.find(c => c.code === 'USD')?.rate || 0.00125;

  // Use product.priceUSD if it exists, otherwise fallback to rate conversion
  const originalUSD = product.priceUSD || (product.price * rate);

  // Calculate sale price in USD
  let saleUSD: number | undefined = undefined;
  if (product.salePrice) {
    if (product.priceUSD) {
      // If we have a custom USD price, we scale the sale price proportionally
      const discountRatio = product.salePrice / product.price;
      saleUSD = product.priceUSD * discountRatio;
    } else {
      saleUSD = product.salePrice * rate;
    }
  }

  return {
    original: originalUSD,
    sale: saleUSD
  };
};

export const getCategoryName = (categoryId: string, categories: Category[] = []): string => {
  // Try finding in the provided live categories first
  const found = categories.find(c => c.id === categoryId);
  if (found) return found.name;

  // Fallback to static CATEGORIES for safety if live list is empty or doesn't match
  return CATEGORIES.find(c => c.id === categoryId)?.name || 'Uncategorized';
};
