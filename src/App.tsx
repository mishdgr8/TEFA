import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag } from 'lucide-react';

// Components
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { CartDrawer } from './components/CartDrawer';

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

// Types
import { PageName, PageParams } from './types';

export const App: React.FC = () => {
    const [currentPage, setCurrentPage] = useState<PageName>('home');
    const [pageParams, setPageParams] = useState<PageParams>({});
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [editingProductId, setEditingProductId] = useState<string | undefined>(undefined);
    const [isProductFormOpen, setIsProductFormOpen] = useState(false);

    const { cart, updateCartQty, removeFromCart } = useStore();

    const navigate = (page: PageName, params: PageParams = {}) => {
        setCurrentPage(page);
        setPageParams(params);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const openProductForm = (productId?: string) => {
        setEditingProductId(productId);
        setIsProductFormOpen(true);
    };

    const closeProductForm = () => {
        setEditingProductId(undefined);
        setIsProductFormOpen(false);
    };

    const renderCurrentPage = () => {
        switch (currentPage) {
            case 'home':
                return <HomePage onNavigate={navigate} />;
            case 'shop':
                return <ShopPage onNavigate={navigate} categoryIdFilter={pageParams.categoryId} />;
            case 'product':
                return <ProductDetailPage slug={pageParams.slug || ''} onNavigate={navigate} />;
            case 'checkout':
                return <CheckoutPage onNavigate={navigate} />;
            case 'about':
                return <AboutPage onNavigate={navigate} />;
            case 'admin':
                return <AdminDashboard onNavigate={navigate} onOpenProductForm={openProductForm} />;
            default:
                return <HomePage onNavigate={navigate} />;
        }
    };

    return (
        <div className="app-wrapper">
            <Header
                onNavigate={navigate}
                onOpenCart={() => setIsCartOpen(true)}
            />

            <AnimatePresence mode="wait">
                <motion.main
                    key={currentPage + JSON.stringify(pageParams)}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                >
                    {renderCurrentPage()}
                </motion.main>
            </AnimatePresence>

            {currentPage !== 'admin' && <Footer onNavigate={navigate} />}

            <CartDrawer
                isOpen={isCartOpen}
                onClose={() => setIsCartOpen(false)}
                items={cart}
                onUpdateQty={updateCartQty}
                onRemove={removeFromCart}
                onCheckout={() => {
                    setIsCartOpen(false);
                    navigate('checkout');
                }}
            />

            {/* Floating Cart Button (Mobile) */}
            {currentPage !== 'admin' && currentPage !== 'checkout' && (
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
