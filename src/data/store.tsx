import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Product, CartItem, Category, StoreContextType, AuthUser, CurrencyCode, CURRENCIES, CustomerReview, Order, Promotion } from '../types';
import { DEFAULT_PRODUCTS } from './products';
import { CATEGORIES } from './categories';
import { onAuthChange, User } from '../lib/supabaseAuth';
import { isSupabaseConfigValid } from '../lib/supabase';
import * as db from '../lib/supabaseDb';

// ═══════════════════════════════════════════════════════════════════════════
// Local Storage Keys (for cart only - products now in Supabase)
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
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [currency, setCurrencyState] = useState<CurrencyCode>(() =>
    loadFromStorage(STORAGE_KEYS.CURRENCY, 'NGN') as CurrencyCode
  );
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [exchangeRates, setExchangeRates] = useState<Record<string, number>>({
    NGN: 1,
    USD: 0.00065,
    GBP: 0.00051,
    EUR: 0.00060,
  });
  const [loading, setLoading] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);

  // Subscribe to auth state changes - Delayed to improve TBT and initial LCP
  useEffect(() => {
    if (!isSupabaseConfigValid) {
      console.warn('Auth subscription skipped: Supabase config is missing.');
      return;
    }

    let profileUnsubscribe: (() => void) | null = null;
    let authUnsubscribe: (() => void) | null = null;

    // Remove the artificial 2s delay to fix refresh redirects
    authUnsubscribe = onAuthChange(async (sbUser: User | null) => {
      if (profileUnsubscribe) {
        profileUnsubscribe();
        profileUnsubscribe = null;
      }

      if (sbUser) {
        // Ensure user document exists in Supabase Profiles
        await db.ensureUserProfile(sbUser.id, sbUser.email || null, sbUser.user_metadata);

        profileUnsubscribe = db.subscribeToUserProfile(sbUser.id, (profile) => {
          const authUser: AuthUser = {
            uid: sbUser.id,
            email: sbUser.email || null,
            isAdmin: !!profile?.is_admin,
            metadata: {
              first_name: profile?.first_name || '',
              last_name: profile?.last_name || '',
              phone: profile?.phone || '',
              country: profile?.country || ''
            }
          };
          setUser(authUser);
          setAuthLoading(false);
        });
      } else {
        setUser(null);
        setAuthLoading(false);
      }
    });

    return () => {
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

  // ═══════════════════════════════════════════════════════════════════════════
  // Live Currency Rates Fetching
  // ═══════════════════════════════════════════════════════════════════════════
  useEffect(() => {
    const fetchRates = async () => {
      try {
        const response = await fetch('https://open.er-api.com/v6/latest/NGN');
        const data = await response.json();

        if (data && data.result === 'success' && data.rates) {
          console.log('✅ Live currency rates updated');
          setExchangeRates({
            NGN: 1,
            USD: data.rates.USD || 0.00065,
            GBP: data.rates.GBP || 0.00051,
            EUR: data.rates.EUR || 0.00060,
          });
        }
      } catch (error) {
        console.error('Failed to fetch live currency rates:', error);
      }
    };

    fetchRates();
    // Refresh every 6 hours
    const intervalId = setInterval(fetchRates, 6 * 60 * 60 * 1000);
    return () => clearInterval(intervalId);
  }, []);

  // Load products from Supabase in real-time
  useEffect(() => {
    if (!isSupabaseConfigValid) {
      console.warn('Products subscription skipped: Supabase config is missing.');
      setLoading(false);
      return;
    }

    console.log('Starting products subscription...');
    setLoading(true);

    let unsubscribe: (() => void) | null = null;
    try {
      unsubscribe = db.subscribeToProducts((sbProducts) => {
        console.log('Subscription data received:', sbProducts.length, 'products');
        setProducts(sbProducts);
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
    if (!isSupabaseConfigValid) {
      console.warn('Categories subscription skipped: Supabase config is missing.');
      return;
    }

    const unsubscribe = db.subscribeToCategories(async (sbCategories) => {
      if (sbCategories.length > 0) {
        setCategories(sbCategories);
      } else {
        console.log('No categories in Supabase, seeding initial data...');
        try {
          await db.seedCategories(CATEGORIES);
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
    const unsubscribe = db.subscribeToReviews((sbReviews) => {
      setReviews(sbReviews);
    });
    return () => unsubscribe();
  }, []);

  // Auto-seed products if Supabase is empty
  useEffect(() => {
    const checkAndSeedProducts = async () => {
      // We check if products are empty after initial loading from Supabase
      // The subscribeToProducts already sets loading to false
      if (!loading && products.length === 0) {
        console.log('No products in Supabase, seeding default products...');
        try {
          await db.seedProducts(DEFAULT_PRODUCTS);
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
    if (!isSupabaseConfigValid || !user?.isAdmin) return;

    const unsubscribe = db.subscribeToOrders((newOrders) => {
      setOrders(newOrders);
    });

    return () => unsubscribe();
  }, [user?.isAdmin]);

  // Subscribe to promotions
  useEffect(() => {
    if (!isSupabaseConfigValid) return;

    const unsubscribe = db.subscribeToPromotions((newPromos) => {
      setPromotions(newPromos);
    });

    return () => unsubscribe.unsubscribe();
  }, []);

  // ─── Product Actions (Supabase) ───
  const addProduct = async (productData: Omit<Product, 'id' | 'slug' | 'createdAt' | 'updatedAt'>) => {
    try {
      await db.addProduct(productData);
    } catch (error) {
      console.error('Failed to add product:', error);
      throw error;
    }
  };

  const updateProduct = async (id: string, updates: Partial<Product>) => {
    try {
      await db.updateProduct(id, updates);
    } catch (error) {
      console.error('Failed to update product:', error);
      throw error;
    }
  };

  const deleteProduct = async (id: string) => {
    try {
      await db.deleteProduct(id);
    } catch (error) {
      console.error('Failed to delete product:', error);
      throw error;
    }
  };

  // --- Category Actions ---
  const addCategory = async (data: Omit<Category, 'id' | 'slug' | 'createdAt'>) => {
    try {
      await db.addCategory(data);
    } catch (error) {
      console.error('Failed to add category:', error);
      throw error;
    }
  };

  const updateCategory = async (id: string, updates: Partial<Category>) => {
    try {
      await db.updateCategory(id, updates);
    } catch (error) {
      console.error('Failed to update category:', error);
      throw error;
    }
  };

  const deleteCategory = async (id: string) => {
    try {
      await db.deleteCategory(id);
    } catch (error) {
      console.error('Failed to delete category:', error);
      throw error;
    }
  };

  // --- Review Actions ---
  const addReview = async (data: Omit<CustomerReview, 'id' | 'createdAt'>) => {
    try {
      await db.addReview(data);
    } catch (error) {
      console.error('Failed to add review:', error);
      throw error;
    }
  };

  const updateReview = async (id: string, updates: Partial<CustomerReview>) => {
    try {
      await db.updateReview(id, updates);
    } catch (error) {
      console.error('Failed to update review:', error);
      throw error;
    }
  };

  const deleteReview = async (id: string) => {
    try {
      await db.deleteReview(id);
    } catch (error) {
      console.error('Failed to delete review:', error);
      throw error;
    }
  };

  const updateOrderStatus = async (id: string, status: Order['orderStatus']) => {
    try {
      await db.updateOrderStatus(id, status);
    } catch (error) {
      console.error('Failed to update order status:', error);
    }
  };

  const deleteOrder = async (id: string) => {
    try {
      await db.deleteOrder(id);
    } catch (error) {
      console.error('Failed to delete order:', error);
    }
  };

  const updateProfile = async (updates: Partial<AuthUser['metadata']>) => {
    if (!user) return;
    try {
      // Sync to profiles table
      await db.updateUserProfile(user.uid, updates);

      // Local state update happens automatically via the Real-time subscription in useEffect
    } catch (error) {
      console.error('Failed to update profile:', error);
      throw error;
    }
  };

  const addPromotion = async (promo: Promotion) => {
    try {
      await db.addPromotion(promo);
    } catch (error) {
      console.error('Failed to add promotion:', error);
      throw error;
    }
  };

  const updatePromotion = async (code: string, updates: Partial<Promotion>) => {
    try {
      await db.updatePromotion(code, updates);
    } catch (error) {
      console.error('Failed to update promotion:', error);
      throw error;
    }
  };

  const deletePromotion = async (code: string) => {
    try {
      await db.deletePromotion(code);
    } catch (error) {
      console.error('Failed to delete promotion:', error);
      throw error;
    }
  };

  const migrateCategories = async () => {
    try {
      await db.seedCategories(CATEGORIES);
      console.log('Categories migrated to Supabase successfully');
    } catch (error) {
      console.error('Failed to migrate categories:', error);
    }
  };

  const createOrder = async (orderData: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>) => {
    return await db.createOrder(orderData);
  };

  const refreshProducts = async () => {
    console.log('Manually refreshing products from Supabase...');
    setLoading(true);
    try {
      const supabaseProducts = await db.getProducts();
      console.log('Products fetched:', supabaseProducts.length);
      setProducts(supabaseProducts);
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
    authLoading,
    exchangeRates,
    createOrder,
    promotions,
    updatePromotion,
    deletePromotion,
    addPromotion,
  }), [
    products,
    categories,
    reviews,
    cart,
    orders,
    user,
    loading,
    authLoading,
    currency,
    isSearchOpen,
    isAuthModalOpen,
    isProfileModalOpen,
    exchangeRates,
    promotions,
  ]);

  return (
    <StoreContext.Provider value={value}>
      {children}
    </StoreContext.Provider>
  );
};


// ═══════════════════════════════════════════════════════════════════════════
// End of Store Provider
// ═══════════════════════════════════════════════════════════════════════════

