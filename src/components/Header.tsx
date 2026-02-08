import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { ShoppingBag, Menu, X, ChevronRight, Search, User, LogOut, ChevronDown, Settings, History, Heart } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../data/store';
import { CATEGORIES } from '../data/categories';
import { PageName, PageParams, CURRENCIES } from '../types';
import { AuthModal } from './AuthModal';
import { signOut } from '../lib/auth';

interface HeaderProps {
  onOpenCart: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenCart }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isCurrencyOpen, setIsCurrencyOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const userDropdownRef = useRef<HTMLDivElement>(null);
  const { cart, user, currency, setCurrency } = useStore();
  const cartCount = cart.reduce((sum, i) => sum + i.qty, 0);

  const currentCurrency = CURRENCIES.find(c => c.code === currency) || CURRENCIES[0];

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target as Node)) {
        setIsUserDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut();
      setIsUserDropdownOpen(false);
    } catch (error) {
      console.error('Sign out failed:', error);
    }
  };

  const handleNavigate = (path: string) => {
    navigate(path);
    setIsMenuOpen(false);
    setIsUserDropdownOpen(false);
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
          <Link to="/shop" className="header-link">
            Shop
          </Link>
          <Link to="/about" className="header-link">
            About
          </Link>
          {user?.isAdmin && (
            <Link to="/admin" className="header-link header-admin-link">
              Admin
            </Link>
          )}
        </div>

        {/* Logo (Centered) */}
        <Link
          to="/"
          className="header-logo"
        >
          <span className="header-logo-top">HOUSE OF</span>
          <span className="header-logo-main">TÉFA</span>
        </Link>

        {/* Right Actions */}
        <div className="header-actions">
          {/* Currency Selector */}
          <div className="currency-selector">
            <button
              className="currency-btn"
              onClick={() => setIsCurrencyOpen(!isCurrencyOpen)}
            >
              <span className="currency-symbol">{currentCurrency.symbol}</span>
              <span className="currency-code">{currentCurrency.code}</span>
              <ChevronDown size={14} className={isCurrencyOpen ? 'rotated' : ''} />
            </button>

            {isCurrencyOpen && (
              <div className="currency-dropdown">
                {CURRENCIES.map(curr => (
                  <button
                    key={curr.code}
                    className={`currency-option ${currency === curr.code ? 'active' : ''}`}
                    onClick={() => {
                      setCurrency(curr.code);
                      setIsCurrencyOpen(false);
                    }}
                  >
                    <span className="currency-option-symbol">{curr.symbol}</span>
                    <span className="currency-option-code">{curr.code}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <button className="header-icon-btn header-search">
            <Search size={22} />
          </button>

          {user ? (
            <div className="user-dropdown-container" ref={userDropdownRef}>
              <button
                className="header-icon-btn user-icon-btn"
                onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                title="Profile"
              >
                <User size={22} />
              </button>

              {isUserDropdownOpen && (
                <div className="user-dropdown">
                  <div className="user-dropdown-header">
                    <div className="user-avatar">
                      <User size={20} />
                    </div>
                    <div className="user-info">
                      <span className="user-name">{user.email?.split('@')[0]}</span>
                      <span className="user-email">{user.email}</span>
                    </div>
                  </div>
                  <div className="user-dropdown-divider" />
                  <button className="user-dropdown-item" onClick={() => handleNavigate('/account')}>
                    <Settings size={16} />
                    <span>Account Settings</span>
                  </button>
                  <button className="user-dropdown-item" onClick={() => handleNavigate('/orders')}>
                    <History size={16} />
                    <span>Purchase History</span>
                  </button>
                  <button className="user-dropdown-item" onClick={() => handleNavigate('/wishlist')}>
                    <Heart size={16} />
                    <span>Wishlist</span>
                  </button>
                  <div className="user-dropdown-divider" />
                  <button className="user-dropdown-item user-dropdown-signout" onClick={handleSignOut}>
                    <LogOut size={16} />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
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
                  onClick={() => handleNavigate('/')}
                  className="mobile-menu-link"
                >
                  Home
                  <ChevronRight size={20} />
                </button>
                <button
                  onClick={() => handleNavigate('/shop')}
                  className="mobile-menu-link"
                >
                  Shop All
                  <ChevronRight size={20} />
                </button>

                <div className="mobile-menu-categories">
                  {CATEGORIES.map(cat => (
                    <button
                      key={cat.id}
                      onClick={() => handleNavigate(`/shop?category=${cat.id}`)}
                      className="mobile-menu-cat-link"
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>

                {user?.isAdmin && (
                  <div className="mobile-menu-footer">
                    <button
                      onClick={() => handleNavigate('/admin')}
                      className="mobile-menu-admin-link"
                    >
                      Admin Panel
                    </button>
                  </div>
                )}
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
          background: #FFFFFF;
          border-bottom: 1px solid #EEEEEE;
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
          color: #111111;
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
          font-family: 'Rethena', serif;
          font-size: 0.9375rem;
          font-weight: 600;
          color: #111111;
          cursor: pointer;
          transition: all var(--transition-fast);
          position: relative;
        }

        .header-link::after {
          content: '';
          position: absolute;
          bottom: -4px;
          left: 0;
          width: 0;
          height: 2px;
          background: #111111;
          transition: width var(--transition-fast);
        }

        .header-link:hover::after {
          width: 100%;
        }

        .header-admin-link {
          color: #666666;
          font-size: 0.8125rem;
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
          gap: 2px;
        }

        .header-logo-top {
          font-family: 'Rethena', serif;
          font-size: 0.625rem;
          text-transform: uppercase;
          letter-spacing: 0.3em;
          color: #666666;
          line-height: 1;
        }

        .header-logo-main {
          font-family: 'Cormorant Garamond', serif;
          font-size: 1.75rem;
          font-weight: 700;
          font-style: italic;
          letter-spacing: 0.15em;
          color: #111111;
          line-height: 1;
        }

        .header-actions {
          display: flex;
          align-items: center;
          gap: var(--space-3);
        }

        .currency-selector {
          position: relative;
        }

        .currency-btn {
          display: flex;
          align-items: center;
          gap: var(--space-1);
          padding: var(--space-2) var(--space-3);
          background: var(--color-cream-dark);
          border: 1px solid var(--color-nude);
          border-radius: var(--radius-md);
          font-family: 'Quicksand', sans-serif;
          font-size: 0.8125rem;
          font-weight: 600;
          color: var(--color-brown);
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .currency-btn:hover {
          background: var(--color-nude-light);
        }

        .currency-symbol {
          font-weight: 700;
        }

        .currency-code {
          display: none;
        }

        @media (min-width: 768px) {
          .currency-code {
            display: inline;
          }
        }

        .currency-btn .rotated {
          transform: rotate(180deg);
        }

        .currency-dropdown {
          position: absolute;
          top: calc(100% + 4px);
          right: 0;
          background: white;
          border: 1px solid var(--color-nude);
          border-radius: var(--radius-md);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          z-index: 100;
          min-width: 100px;
          overflow: hidden;
        }

        .currency-option {
          display: flex;
          align-items: center;
          gap: var(--space-2);
          width: 100%;
          padding: var(--space-3) var(--space-4);
          background: none;
          border: none;
          font-family: 'Quicksand', sans-serif;
          font-size: 0.875rem;
          color: var(--color-brown);
          cursor: pointer;
          transition: background var(--transition-fast);
        }

        .currency-option:hover {
          background: var(--color-cream-dark);
        }

        .currency-option.active {
          background: var(--color-coral);
          color: white;
        }

        .currency-option-symbol {
          font-weight: 700;
          width: 16px;
        }

        .header-icon-btn {
          padding: var(--space-2);
          background: none;
          border: none;
          color: #111111;
          cursor: pointer;
          transition: opacity var(--transition-fast);
        }

        .header-icon-btn:hover {
          opacity: 0.7;
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
          background: #111111;
          color: #FFFFFF;
          border: 1px solid #111111;
          border-radius: var(--radius-full);
          font-family: 'Rethena', serif;
          font-size: 0.875rem;
          font-weight: 600;
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .header-cart-btn:hover {
          background: #FFFFFF;
          color: #111111;
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
          background: #FFFFFF;
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
          color: #111111;
          cursor: pointer;
        }

        .mobile-menu-logo {
          font-family: 'Cormorant Garamond', serif;
          font-size: 1.75rem;
          font-weight: 700;
          font-style: italic;
          color: #111111;
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
          font-family: 'Rethena', serif;
          font-size: 1.125rem;
          font-weight: 600;
          color: #111111;
          cursor: pointer;
          padding: var(--space-2) 0;
          transition: opacity var(--transition-fast);
        }

        .mobile-menu-link:hover {
          opacity: 0.7;
        }

        .mobile-menu-categories {
          padding-top: var(--space-4);
          margin-top: var(--space-4);
          border-top: 1px solid #EEEEEE;
          display: flex;
          flex-direction: column;
          gap: var(--space-3);
        }

        .mobile-menu-cat-link {
          background: none;
          border: none;
          font-family: 'Rethena', serif;
          font-size: 1rem;
          color: #333333;
          cursor: pointer;
          text-align: left;
          transition: opacity var(--transition-fast);
        }

        .mobile-menu-cat-link:hover {
          opacity: 0.7;
        }

        .mobile-menu-footer {
          margin-top: auto;
          padding-top: var(--space-6);
          border-top: 1px solid #EEEEEE;
        }

        .mobile-menu-admin-link {
          background: none;
          border: none;
          font-family: 'Rethena', serif;
          font-size: 0.875rem;
          color: #666666;
          cursor: pointer;
        }

        .mobile-menu-admin-link:hover {
          color: var(--color-coral);
        }

        /* User Dropdown Styles */
        .user-dropdown-container {
          position: relative;
        }

        .user-icon-btn {
          position: relative;
        }

        .user-dropdown {
          position: absolute;
          top: calc(100% + 8px);
          right: 0;
          background: white;
          border: 1px solid var(--color-nude);
          border-radius: var(--radius-lg);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
          z-index: 100;
          min-width: 220px;
          overflow: hidden;
          animation: dropdownFadeIn 0.2s ease;
        }

        @keyframes dropdownFadeIn {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .user-dropdown-header {
          display: flex;
          align-items: center;
          gap: var(--space-3);
          padding: var(--space-4);
          background: var(--color-cream-dark);
        }

        .user-avatar {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: var(--color-coral);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .user-info {
          display: flex;
          flex-direction: column;
          gap: 2px;
          overflow: hidden;
        }

        .user-name {
          font-family: 'Rethena', serif;
          font-size: 0.9375rem;
          font-weight: 600;
          color: var(--color-brown-dark);
          text-transform: capitalize;
        }

        .user-email {
          font-size: 0.75rem;
          color: var(--color-text-muted);
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .user-dropdown-divider {
          height: 1px;
          background: var(--color-nude-light);
        }

        .user-dropdown-item {
          display: flex;
          align-items: center;
          gap: var(--space-3);
          width: 100%;
          padding: var(--space-3) var(--space-4);
          background: none;
          border: none;
          font-family: 'Quicksand', sans-serif;
          font-size: 0.875rem;
          color: var(--color-brown);
          cursor: pointer;
          transition: background var(--transition-fast);
          text-align: left;
        }

        .user-dropdown-item:hover {
          background: var(--color-cream-dark);
        }

        .user-dropdown-signout {
          color: #DC2626;
        }

        .user-dropdown-signout:hover {
          background: #FEE2E2;
        }
      `}</style>
    </nav>
  );
};
