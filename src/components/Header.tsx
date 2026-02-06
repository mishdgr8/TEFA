import React, { useState } from 'react';
import { ShoppingBag, Menu, X, ChevronRight, Search, User, LogOut } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../data/store';
import { CATEGORIES } from '../data/categories';
import { PageName, PageParams } from '../types';
import { AuthModal } from './AuthModal';
import { signOut } from '../lib/auth';

interface HeaderProps {
  onNavigate: (page: PageName, params?: PageParams) => void;
  onOpenCart: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onNavigate, onOpenCart }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const { cart, user } = useStore();
  const cartCount = cart.reduce((sum, i) => sum + i.qty, 0);

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Sign out failed:', error);
    }
  };

  return (
    <nav className="header">
      <div className="header-inner">
        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsMenuOpen(true)}
          className="header-menu-btn"
          aria-label="Open menu"
        >
          <Menu size={24} />
        </button>

        {/* Desktop Navigation */}
        <div className="header-nav-desktop">
          <button onClick={() => onNavigate('shop')} className="header-link">
            Shop
          </button>
          <button onClick={() => onNavigate('about')} className="header-link">
            About
          </button>
          <button onClick={() => onNavigate('admin')} className="header-link header-admin-link">
            Admin
          </button>
        </div>

        {/* Logo (Centered) */}
        <button
          onClick={() => onNavigate('home')}
          className="header-logo"
        >
          <span className="header-logo-main">TÉFA</span>
          <span className="header-logo-sub">Africana</span>
        </button>

        {/* Right Actions */}
        <div className="header-actions">
          <button className="header-icon-btn header-search">
            <Search size={22} />
          </button>

          {user ? (
            <div className="header-user-menu">
              <span className="header-user-email">{user.email?.split('@')[0]}</span>
              <button onClick={handleSignOut} className="header-icon-btn" title="Sign Out">
                <LogOut size={18} />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="header-icon-btn"
              title="Sign In"
            >
              <User size={22} />
            </button>
          )}

          <button
            onClick={onOpenCart}
            className="header-cart-btn"
          >
            <ShoppingBag size={18} />
            <span>{cartCount}</span>
          </button>
        </div>
      </div>

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={() => setIsAuthModalOpen(false)}
      />

      {/* Mobile Menu Drawer */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMenuOpen(false)}
              className="mobile-menu-overlay"
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="mobile-menu"
            >
              <div className="mobile-menu-header">
                <span className="mobile-menu-logo">TÉFA</span>
                <button onClick={() => setIsMenuOpen(false)}>
                  <X size={24} />
                </button>
              </div>

              <div className="mobile-menu-nav">
                <button
                  onClick={() => { onNavigate('home'); setIsMenuOpen(false); }}
                  className="mobile-menu-link"
                >
                  Home
                  <ChevronRight size={20} />
                </button>
                <button
                  onClick={() => { onNavigate('shop'); setIsMenuOpen(false); }}
                  className="mobile-menu-link"
                >
                  Shop All
                  <ChevronRight size={20} />
                </button>

                <div className="mobile-menu-categories">
                  {CATEGORIES.map(cat => (
                    <button
                      key={cat.id}
                      onClick={() => {
                        onNavigate('shop', { categoryId: cat.id });
                        setIsMenuOpen(false);
                      }}
                      className="mobile-menu-cat-link"
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>

                <div className="mobile-menu-footer">
                  <button
                    onClick={() => { onNavigate('admin'); setIsMenuOpen(false); }}
                    className="mobile-menu-admin-link"
                  >
                    Admin Panel
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <style>{`
        .header {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 50;
          background: var(--color-cream);
          border-bottom: 1px solid var(--color-nude-light);
        }

        .header-inner {
          max-width: 1280px;
          margin: 0 auto;
          padding: 0 var(--space-4);
          height: 80px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .header-menu-btn {
          padding: var(--space-2);
          background: none;
          border: none;
          color: var(--color-brown);
          cursor: pointer;
        }

        @media (min-width: 1024px) {
          .header-menu-btn { display: none; }
        }

        .header-nav-desktop {
          display: none;
          gap: var(--space-8);
        }

        @media (min-width: 1024px) {
          .header-nav-desktop { display: flex; }
        }

        .header-link {
          background: none;
          border: none;
          font-family: 'Quicksand', sans-serif;
          font-size: 0.9375rem;
          font-weight: 600;
          color: var(--color-brown);
          cursor: pointer;
          transition: color var(--transition-fast);
        }

        .header-link:hover {
          color: var(--color-coral);
        }

        .header-admin-link {
          color: var(--color-text-muted);
          font-size: 0.8125rem;
        }

        .header-admin-link:hover {
          color: var(--color-coral);
        }

        .header-logo {
          position: absolute;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          flex-direction: column;
          align-items: center;
          background: none;
          border: none;
          cursor: pointer;
        }

        .header-logo-main {
          font-family: 'Cormorant Garamond', serif;
          font-size: 2rem;
          font-weight: 700;
          font-style: italic;
          letter-spacing: 0.15em;
          color: var(--color-brown-dark);
        }

        .header-logo-sub {
          font-family: 'Quicksand', sans-serif;
          font-size: 0.625rem;
          text-transform: uppercase;
          letter-spacing: 0.4em;
          color: var(--color-brown-light);
          margin-top: -4px;
        }

        .header-actions {
          display: flex;
          align-items: center;
          gap: var(--space-3);
        }

        .header-icon-btn {
          padding: var(--space-2);
          background: none;
          border: none;
          color: var(--color-brown);
          cursor: pointer;
        }

        .header-search {
          display: none;
        }

        @media (min-width: 640px) {
          .header-search { display: block; }
        }

        .header-cart-btn {
          display: flex;
          align-items: center;
          gap: var(--space-2);
          padding: var(--space-2) var(--space-4);
          background: var(--color-brown-dark);
          color: white;
          border: none;
          border-radius: var(--radius-full);
          font-family: 'Quicksand', sans-serif;
          font-size: 0.875rem;
          font-weight: 600;
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .header-cart-btn:hover {
          background: var(--color-coral);
        }

        /* Mobile Menu */
        .mobile-menu-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.4);
          backdrop-filter: blur(4px);
          z-index: 60;
        }

        .mobile-menu {
          position: fixed;
          top: 0;
          left: 0;
          bottom: 0;
          width: 80%;
          max-width: 320px;
          background: var(--color-cream);
          z-index: 70;
          padding: var(--space-8);
          display: flex;
          flex-direction: column;
        }

        .mobile-menu-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: var(--space-12);
        }

        .mobile-menu-header button {
          background: none;
          border: none;
          color: var(--color-brown);
          cursor: pointer;
        }

        .mobile-menu-logo {
          font-family: 'Cormorant Garamond', serif;
          font-size: 1.75rem;
          font-weight: 700;
          font-style: italic;
          color: var(--color-brown-dark);
        }

        .mobile-menu-nav {
          display: flex;
          flex-direction: column;
          gap: var(--space-4);
        }

        .mobile-menu-link {
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: none;
          border: none;
          font-family: 'Quicksand', sans-serif;
          font-size: 1.125rem;
          font-weight: 600;
          color: var(--color-brown-dark);
          cursor: pointer;
          padding: var(--space-2) 0;
        }

        .mobile-menu-link:hover {
          color: var(--color-coral);
        }

        .mobile-menu-categories {
          padding-top: var(--space-4);
          margin-top: var(--space-4);
          border-top: 1px solid var(--color-nude-light);
          display: flex;
          flex-direction: column;
          gap: var(--space-3);
        }

        .mobile-menu-cat-link {
          background: none;
          border: none;
          font-family: 'Quicksand', sans-serif;
          font-size: 1rem;
          color: var(--color-text-light);
          cursor: pointer;
          text-align: left;
          transition: color var(--transition-fast);
        }

        .mobile-menu-cat-link:hover {
          color: var(--color-coral);
        }

        .mobile-menu-footer {
          margin-top: auto;
          padding-top: var(--space-6);
          border-top: 1px solid var(--color-nude-light);
        }

        .mobile-menu-admin-link {
          background: none;
          border: none;
          font-family: 'Quicksand', sans-serif;
          font-size: 0.875rem;
          color: var(--color-text-muted);
          cursor: pointer;
        }

        .mobile-menu-admin-link:hover {
          color: var(--color-coral);
        }
      `}</style>
    </nav>
  );
};
