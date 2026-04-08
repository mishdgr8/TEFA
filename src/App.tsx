import React, { useState, useRef, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { m, AnimatePresence, LazyMotion, domAnimation, useScroll, useSpring, useMotionValueEvent } from 'framer-motion';
import { ShoppingBag } from 'lucide-react';
import Lenis from 'lenis';

// Components
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { CartDrawer } from './components/CartDrawer';
import { ChatWidget } from './components/ChatWidget';
import { AuthModal } from './components/AuthModal';
import { ProfileModal } from './components/ProfileModal';

// Pages - Lazy loaded for performance
const HomePage = React.lazy(() => import('./pages/HomePage').then(m => ({ default: m.HomePage })));
const ShopPage = React.lazy(() => import('./pages/ShopPage').then(m => ({ default: m.ShopPage })));
const ProductDetailPage = React.lazy(() => import('./pages/ProductDetailPage').then(m => ({ default: m.ProductDetailPage })));
const CheckoutPage = React.lazy(() => import('./pages/CheckoutPage').then(m => ({ default: m.CheckoutPage })));
const AboutPage = React.lazy(() => import('./pages/AboutPage').then(m => ({ default: m.AboutPage })));
const AdminDashboard = React.lazy(() => import('./pages/admin/AdminDashboard').then(m => ({ default: m.AdminDashboard })));
const ProductForm = React.lazy(() => import('./pages/admin/ProductForm').then(m => ({ default: m.ProductForm })));
const OrdersPage = React.lazy(() => import('./pages/OrdersPage').then(m => ({ default: m.OrdersPage })));
const AccountPage = React.lazy(() => import('./pages/AccountPage').then(m => ({ default: m.AccountPage })));

// Support Pages - Lazy loaded
const ContactPage = React.lazy(() => import('./pages/ContactPage').then(m => ({ default: m.ContactPage })));
const ShippingPage = React.lazy(() => import('./pages/ShippingPage').then(m => ({ default: m.ShippingPage })));
const SizeGuidePage = React.lazy(() => import('./pages/SizeGuidePage').then(m => ({ default: m.SizeGuidePage })));
const FAQPage = React.lazy(() => import('./pages/FAQPage').then(m => ({ default: m.FAQPage })));
const NotFoundPage = React.lazy(() => import('./pages/NotFoundPage').then(m => ({ default: m.NotFoundPage })));

// Loading Component
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen bg-cream">
    <div className="w-12 h-12 border-4 border-coral border-t-transparent rounded-full animate-spin"></div>
  </div>
);

// Data
import { useStore } from './data/store';

export const App: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | undefined>(undefined);
  const [isProductFormOpen, setIsProductFormOpen] = useState(false);

  const { cart, updateCartQty, removeFromCart, currency, isAuthModalOpen, setIsAuthModalOpen } = useStore();

  const { scrollYProgress } = useScroll();
  const scaleY = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });
  const lenisRef = useRef<Lenis | null>(null);
  const [isScrolling, setIsScrolling] = useState(false);
  const scrollTimeout = useRef<NodeJS.Timeout | null>(null);

  useMotionValueEvent(scrollYProgress, "change", () => {
    setIsScrolling(true);
    if (scrollTimeout.current) clearTimeout(scrollTimeout.current);
    scrollTimeout.current = setTimeout(() => setIsScrolling(false), 1500);
  });

  // Disable browser scroll restoration
  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
  }, []);

  // Initialize Lenis Smooth Scrolling
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });
    lenisRef.current = lenis;

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  useEffect(() => {
    return () => {
      if (scrollTimeout.current) clearTimeout(scrollTimeout.current);
    };
  }, []);

  // Handle Profile Completion for OAuth
  useEffect(() => {
    const checkProfile = async () => {
      const { getCurrentUser } = await import('./lib/supabaseAuth');
      const user = await getCurrentUser();

      if (user) {
        const { supabase } = await import('./lib/supabase');
        const { data: profile } = await supabase
          .from('profiles')
          .select('phone')
          .eq('id', user.id)
          .single();

        const castProfile = profile as any;
        if (!castProfile || !castProfile.phone) {
          setIsAuthModalOpen(true);
        }
      }
    };

    // Slight delay to ensure store/auth is ready
    const timer = setTimeout(checkProfile, 1000);
    return () => clearTimeout(timer);
  }, [setIsAuthModalOpen]);


  const openProductForm = (productId?: string) => {
    setEditingProductId(productId);
    setIsProductFormOpen(true);
  };

  const closeProductForm = () => {
    setEditingProductId(undefined);
    setIsProductFormOpen(false);
  };

  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <LazyMotion features={domAnimation}>
      <div className="app-wrapper">
        <Header
          onOpenCart={() => setIsCartOpen(true)}
        />

        <AnimatePresence mode="wait">
          <m.main
            key={location.pathname}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <ScrollToTop lenis={lenisRef.current} />
            <React.Suspense fallback={<PageLoader />}>
              <Routes location={location}>
                <Route path="/" element={<HomePage />} />
                <Route path="/shop" element={<ShopPage />} />
                <Route path="/shop/:categoryId" element={<ShopPage />} />
                <Route path="/product/:slug" element={<ProductDetailPage />} />
                <Route path="/checkout" element={<CheckoutPage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/contact" element={<ContactPage />} />
                <Route path="/shipping" element={<ShippingPage />} />
                <Route path="/size-guide" element={<SizeGuidePage />} />
                <Route path="/faq" element={<FAQPage />} />
                <Route path="/admin" element={<AdminDashboard onOpenProductForm={openProductForm} />} />
                <Route path="/orders" element={<OrdersPage />} />
                <Route path="/account" element={<AccountPage />} />
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
              {!isAdminRoute && <Footer />}
            </React.Suspense>
          </m.main>
        </AnimatePresence>

        <CartDrawer
          isOpen={isCartOpen}
          onClose={() => setIsCartOpen(false)}
          items={cart}
          currency={currency}
          onUpdateQty={updateCartQty}
          onRemove={removeFromCart}
          onCheckout={() => {
            setIsCartOpen(false);
            navigate('/checkout');
          }}
        />

        {/* Floating Cart Button (Mobile) */}
        {!isAdminRoute && location.pathname !== '/checkout' && (
          <button
            onClick={() => setIsCartOpen(true)}
            className="floating-cart-btn"
            aria-label="Open cart"
          >
            <ShoppingBag size={24} />
            {cart.length > 0 && (
              <span className="floating-cart-badge">
                {cart.reduce((a, b) => a + b.qty, 0)}
              </span>
            )}
          </button>
        )}

        {/* Product Form Modal */}
        {isProductFormOpen && (
          <ProductForm
            productId={editingProductId}
            onClose={closeProductForm}
          />
        )}

        {/* Chat Widget */}
        {!isAdminRoute && <ChatWidget />}

        {/* Global Auth Modal */}
        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
          onSuccess={() => setIsAuthModalOpen(false)}
        />

        {/* Global Profile Modal */}
        <ProfileModal />

        <m.div
          className="custom-scrollbar-indicator"
          initial={{ opacity: 0 }}
          animate={{ opacity: isScrolling ? 1 : 0 }}
          style={{
            scaleY: scaleY,
            transformOrigin: "top"
          }}
        />

        <style>{`
        .app-wrapper {
          min-height: 100vh;
          background: var(--color-cream);
          color: var(--color-text);
          overflow-x: hidden;
        }

        .floating-cart-btn {
          position: fixed;
          bottom: var(--space-6);
          right: var(--space-6);
          z-index: 40;
          display: flex;
          align-items: center;
          gap: var(--space-2);
          padding: var(--space-4);
          background: var(--color-coral);
          color: white;
          border: none;
          border-radius: var(--radius-full);
          box-shadow: var(--shadow-xl);
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .floating-cart-btn:hover {
          background: var(--color-coral-dark);
          transform: scale(1.05);
        }

        @media (min-width: 1024px) {
          .floating-cart-btn {
            display: none;
          }
        }

        .floating-cart-badge {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 24px;
          height: 24px;
          background: white;
          color: var(--color-coral);
          border-radius: 50%;
          font-size: 0.75rem;
          font-weight: 700;
        }

        .custom-scrollbar-indicator {
          position: fixed;
          top: 0;
          right: 2px;
          width: 4px;
          height: 100%;
          background: var(--color-coral);
          z-index: 9999;
          border-radius: var(--radius-full);
          opacity: 0.6;
          pointer-events: none;
        }
      `}</style>
      </div>
    </LazyMotion>
  );
};

// Reset scroll on route changes - Defined OUTSIDE to prevent re-mounting glitches
const ScrollToTop: React.FC<{ lenis: Lenis | null }> = ({ lenis }) => {
  const { pathname } = useLocation();

  useEffect(() => {
    // Small timeout to ensure the new page layout is calculated
    // and AnimatePresence/Lenis have settled
    const timer = setTimeout(() => {
      if (lenis) {
        lenis.scrollTo(0, { immediate: true });
      }
      window.scrollTo(0, 0);
    }, 100);

    return () => clearTimeout(timer);
  }, [pathname, lenis]);

  return null;
};
