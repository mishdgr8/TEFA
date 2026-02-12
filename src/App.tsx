import React, { useState } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag } from 'lucide-react';

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

// Support Pages - Lazy loaded
const ContactPage = React.lazy(() => import('./pages/ContactPage').then(m => ({ default: m.ContactPage })));
const ShippingPage = React.lazy(() => import('./pages/ShippingPage').then(m => ({ default: m.ShippingPage })));
const SizeGuidePage = React.lazy(() => import('./pages/SizeGuidePage').then(m => ({ default: m.SizeGuidePage })));
const FAQPage = React.lazy(() => import('./pages/FAQPage').then(m => ({ default: m.FAQPage })));
const NotFoundPage = React.lazy(() => import('./pages/NotFoundPage').then(m => ({ default: m.NotFoundPage })));

// Loading Component
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-[60vh]">
    <div className="w-8 h-8 border-4 border-coral border-t-transparent rounded-full animate-spin"></div>
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
    <div className="app-wrapper">
      <Header
        onOpenCart={() => setIsCartOpen(true)}
      />

      <AnimatePresence mode="wait">
        <motion.main
          key={location.pathname}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
        >
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
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </React.Suspense>
        </motion.main>
      </AnimatePresence>

      {!isAdminRoute && <Footer />}

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
      `}</style>
    </div>
  );
};
