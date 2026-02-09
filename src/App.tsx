import React, { useState } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag } from 'lucide-react';

// Components
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { CartDrawer } from './components/CartDrawer';
import { ChatWidget } from './components/ChatWidget';

// Pages
import { HomePage } from './pages/HomePage';
import { ShopPage } from './pages/ShopPage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { AboutPage } from './pages/AboutPage';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { ProductForm } from './pages/admin/ProductForm';

// Data
import { useStore } from './data/store';

export const App: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | undefined>(undefined);
  const [isProductFormOpen, setIsProductFormOpen] = useState(false);

  const { cart, updateCartQty, removeFromCart, currency } = useStore();

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
          <Routes location={location}>
            <Route path="/" element={<HomePage />} />
            <Route path="/shop" element={<ShopPage />} />
            <Route path="/shop/:categoryId" element={<ShopPage />} />
            <Route path="/product/:slug" element={<ProductDetailPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/admin" element={<AdminDashboard onOpenProductForm={openProductForm} />} />
            <Route path="*" element={<HomePage />} />
          </Routes>
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
