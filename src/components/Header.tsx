import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { ShoppingBag, Menu, X, ChevronRight, Search, User, LogOut, ChevronDown, Settings, History, Heart } from 'lucide-react';
import { useScroll, useTransform, motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../data/store';
import { CATEGORIES } from '../data/categories';
import { PageName, PageParams, CURRENCIES } from '../types';
import { AuthModal } from './AuthModal';
import { signOut } from '../lib/auth';

interface HeaderProps {
  onOpenCart: () => void;
}

const motionLink = motion(Link);

export const Header: React.FC<HeaderProps> = ({ onOpenCart }) => {
  const { scrollY } = useScroll();

  // Gucci-style thresholds
  const threshold = 200; // Threshold for the morph completion
  const scrollProgress = useTransform(scrollY, [0, threshold], [0, 1]);

  // Header background opacity: 0 -> 1 from p = 0.55 to 1
  const headerBgOpacity = useTransform(scrollProgress, [0, 0.55, 1], [0, 0, 1]);

  // Local state for navigation items visibility: fade in from p = 0.6 to 1
  const navItemsOpacity = useTransform(scrollProgress, [0, 0.6, 1], [0, 0, 1]);

  // On homepage, strictly hide until the final pixel to prevent duplication
  const logoTextOpacity = useTransform(scrollProgress, [0, 0.99, 1], [0, 0, 1]);
  const logoVisibility = useTransform(scrollProgress, p => p < 0.99 ? 'hidden' : 'visible');

  const headerBgColor = useTransform(
    headerBgOpacity,
    [0, 1],
    ['rgba(255, 255, 255, 0)', 'rgba(255, 255, 255, 0.95)']
  );

  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCurrencyOpen, setIsCurrencyOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const userDropdownRef = useRef<HTMLDivElement>(null);
  const { cart, user, currency, setCurrency, products, isSearchOpen, setIsSearchOpen, isAuthModalOpen, setIsAuthModalOpen } = useStore();
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


  const [searchQuery, setSearchQuery] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Filter products for preview
  const searchPreviews = searchQuery.trim().length > 1
    ? products.filter(p => {
      const lowerQuery = searchQuery.toLowerCase();
      const categoryName = CATEGORIES.find(c => c.id === p.categoryId)?.name.toLowerCase() || '';
      return (
        p.name.toLowerCase().includes(lowerQuery) ||
        categoryName.includes(lowerQuery)
      );
    }).slice(0, 5) // Limit to 5 previews
    : [];

  const handleSearch = () => {
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchOpen(false);
      setSearchQuery('');
    }
  };

  const handlePreviewClick = (slug: string) => {
    navigate(`/product/${slug}`);
    setIsSearchOpen(false);
    setSearchQuery('');
  };

  const handleNavigate = (path: string) => {
    navigate(path);
    setIsMenuOpen(false);
    setIsUserDropdownOpen(false);
  };

  // Scroll detection for transparent header
  const [isScrolled, setIsScrolled] = useState(false);
  const isHome = location.pathname === '/';

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Header classes
  const headerClass = `header ${isHome && !isScrolled ? 'header-transparent' : 'header-solid'}`;

  return (
    <motion.nav
      className={headerClass}
      style={{
        backgroundColor: isHome ? headerBgColor : undefined,
        zIndex: isMenuOpen || isAuthModalOpen ? 10000 : 50
      }}
    >
      <div className="header-inner">
        <button
          onClick={() => setIsMenuOpen(true)}
          className="header-menu-btn"
          aria-label="Open menu"
        >
          <Menu size={24} color={isHome && !isScrolled ? 'white' : '#111111'} />
        </button>

        {/* Desktop Navigation */}
        <motion.div
          className="header-nav-desktop"
          style={{
            opacity: 1,
            pointerEvents: 'auto'
          }}
        >
          <Link to="/shop" className="header-link" style={{ color: isHome && !isScrolled ? 'white' : undefined }}>
            Shop
          </Link>
          <Link to="/about" className="header-link" style={{ color: isHome && !isScrolled ? 'white' : undefined }}>
            About
          </Link>
          {user?.isAdmin && (
            <Link to="/admin" className="header-link header-admin-link" style={{ color: isHome && !isScrolled ? 'rgba(255,255,255,0.7)' : undefined }}>
              Admin
            </Link>
          )}
        </motion.div>

        {/* Logo (Centered) - The Target for FLIP morph */}
        <motion.div
          id="nav-logo-target"
          style={{
            opacity: isHome ? logoTextOpacity : 1,
            visibility: isHome ? logoVisibility : 'visible'
          }}
          className={`header-logo-container ${isSearchOpen ? 'search-active' : ''}`}
        >
          <Link
            to="/"
            className="header-logo"
          >
            {/* Visible logo for non-home pages, invisible measurement target for home page FLIP animation */}
            <span
              style={{
                visibility: isHome ? 'hidden' : 'visible',
                pointerEvents: isHome ? 'none' : 'auto',
                fontFamily: "'Montserrat', sans-serif",
                fontSize: '1.75rem',
                fontWeight: 600,
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                color: isHome && !isScrolled ? 'white' : '#111111',
              }}
            >TÉFA</span>
          </Link>
        </motion.div>

        {/* Right Actions */}
        <div className="header-actions">
          {/* Currency Selector */}
          <div className="currency-selector">
            <button
              className={`currency-btn ${isHome && !isScrolled ? 'transparent-mode' : ''}`}
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

          <div className={`header-search-container ${isSearchOpen ? 'active' : ''} ${isHome && !isScrolled && !isSearchOpen ? 'transparent-mode' : ''}`}>
            <input
              type="text"
              placeholder="Search..."
              className="header-search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              ref={searchInputRef}
            />
            <button
              className="header-search-btn"
              onClick={() => {
                if (isSearchOpen && searchQuery) {
                  handleSearch();
                } else {
                  setIsSearchOpen(!isSearchOpen);
                  if (!isSearchOpen) {
                    setTimeout(() => searchInputRef.current?.focus(), 100);
                  }
                }
              }}
            >
              <Search size={20} color={isHome && !isScrolled && !isSearchOpen ? 'white' : '#111111'} />
            </button>

            {/* Search Previews Dropdown */}
            {isSearchOpen && searchPreviews.length > 0 && (
              <div className="search-preview-dropdown">
                {searchPreviews.map(product => (
                  <button
                    key={product.id}
                    className="search-preview-item"
                    onClick={() => handlePreviewClick(product.slug)}
                  >
                    <div className="search-preview-image">
                      <img src={product.images[0]} alt={product.name} />
                    </div>
                    <div className="search-preview-info">
                      <span className="search-preview-name">{product.name}</span>
                      <span className="search-preview-price">
                        {/* Simple formatting since we might not have formatPrice easily available without changing imports */}
                        {currentCurrency.symbol}{Math.round(product.price * currentCurrency.rate).toLocaleString()}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="user-dropdown-container" ref={userDropdownRef}>
            <button
              className="header-icon-btn user-icon-btn"
              onClick={() => user ? setIsUserDropdownOpen(!isUserDropdownOpen) : setIsAuthModalOpen(true)}
              title={user ? "Profile" : "Sign In"}
            >
              <User size={22} color={isHome && !isScrolled ? 'white' : '#111111'} />
            </button>

            <AnimatePresence>
              {isUserDropdownOpen && user && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="user-dropdown"
                >
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
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <button
            onClick={onOpenCart}
            className="header-icon-btn header-cart-icon"
            title="Cart"
          >
            <ShoppingBag size={20} color={isHome && !isScrolled ? 'white' : '#111111'} />
            {cartCount > 0 && (
              <span className="cart-badge">{cartCount}</span>
            )}
          </button>
        </div>
      </div>

      {/* Auth Modal - No longer rendered here, moved to App.tsx */}

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

                {/* Currency Selector in Mobile Menu */}
                <div className="mobile-menu-currency">
                  <span className="mobile-menu-currency-label">Currency</span>
                  <div className="mobile-menu-currency-options">
                    {CURRENCIES.map(curr => (
                      <button
                        key={curr.code}
                        className={`mobile-currency-btn ${currency === curr.code ? 'active' : ''}`}
                        onClick={() => setCurrency(curr.code)}
                      >
                        <span>{curr.symbol}</span>
                        <span>{curr.code}</span>
                      </button>
                    ))}
                  </div>
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
          transition: background-color var(--transition-base), box-shadow var(--transition-base), padding var(--transition-base);
        }

        .header-transparent {
          background-color: transparent;
          box-shadow: none;
          padding: var(--space-3) 0;
          border-bottom: none;
        }

        .header-solid {
          background-color: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(10px);
          box-shadow: var(--shadow-sm);
          padding: var(--space-2) 0;
          border-bottom: 1px solid var(--color-nude-light);
        }

        .header-inner {
          max-width: 1440px;
          margin: 0 auto;
          padding: 0 var(--space-6);
          display: flex;
          align-items: center;
          justify-content: space-between;
          height: 60px;
          position: relative;
        }

        /* Mobile Menu Button */
        .header-menu-btn {
          display: block;
          background: none;
          border: none;
          cursor: pointer;
          color: #111111;
        }

        .header-menu-btn.text-white {
          color: white;
        }

        @media (min-width: 1024px) {
          .header-menu-btn {
            display: none;
          }
        }

        /* Desktop Nav */
        .header-nav-desktop {
          display: none;
          align-items: center;
          gap: var(--space-8);
          position: absolute;
          left: var(--space-6);
        }

        .header-nav-desktop.nav-hidden {
          opacity: 0;
          pointer-events: none;
        }

        @media (min-width: 1024px) {
          .header-nav-desktop {
            display: flex;
            transition: opacity var(--transition-base);
          }
        }

        .header-link {
          font-family: 'Quicksand', sans-serif;
          font-size: 0.875rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: #111111;
          text-decoration: none;
          position: relative;
          background: none;
          border: none;
          cursor: pointer;
          padding: 0;
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

        .header-logo-container {
          position: absolute;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 10;
          transition: opacity 0.2s ease, visibility 0.2s ease;
        }

        /* Hide logo when search is active */
        .header-logo-container.search-active {
          opacity: 0 !important;
          visibility: hidden !important;
          pointer-events: none;
        }

        .header-logo {
          display: flex;
          flex-direction: column;
          align-items: center;
          background: none;
          border: none;
          cursor: pointer;
          gap: 2px;
        }

        .header-logo.hidden {
          display: none;
        }

        .header-actions {
          display: flex;
          align-items: center;
          gap: var(--space-3);
          margin-left: auto;
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

        .currency-btn.transparent-mode {
          background: rgba(255, 255, 255, 0.2);
          border-color: rgba(255, 255, 255, 0.3);
          color: white;
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
          display: block; /* Always show search trigger on desktop/mobile if needed */
        }
        
        .header-search-container {
          display: flex;
          align-items: center;
          background: var(--color-cream-dark);
          border: 1px solid var(--color-nude);
          border-radius: var(--radius-full);
          padding: 4px 12px;
          transition: all var(--transition-fast);
          position: relative;
        }
        
        .header-search-container.active {
           background: rgba(255, 255, 255, 1);
           backdrop-filter: blur(20px);
           border-color: var(--color-brown);
           z-index: 25;
           position: relative;
        }

        .header-search-container:focus-within {
          border-color: var(--color-brown);
          background: rgba(255, 255, 255, 1);
        }

        .header-search-input {
          border: none;
          background: transparent;
          outline: none;
          padding: 4px 8px;
          font-family: 'Quicksand', sans-serif;
          font-size: 0.875rem;
          color: var(--color-brown-dark);
          width: 0;
          opacity: 0;
          transition: all var(--transition-base);
        }
        
        .header-search-container.active .header-search-input {
          width: 200px;
          opacity: 1;
        }

        /* Expand search on mobile to take more space */
        @media (max-width: 767px) {
          .header-search-container.active {
            position: absolute;
            left: 60px;
            right: 60px;
            width: auto;
          }

          .header-search-container.active .header-search-input {
            width: 100%;
            flex: 1;
          }
        }

        .header-search-btn {
          background: none;
          border: none;
          padding: 4px;
          cursor: pointer;
          color: var(--color-brown);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        /* Transparent mode for search container before scroll */
        .header-search-container.transparent-mode {
          background: transparent;
          border-color: rgba(255, 255, 255, 0.3);
        }

        /* Hide currency selector on mobile */
        @media (max-width: 767px) {
          .currency-selector {
            display: none;
          }
        }

        /* Hide cart icon on mobile (using floating cart instead) */
        @media (max-width: 1023px) {
          .header-cart-icon {
            display: none;
          }
        }

        /* Search Preview Dropdown */
        .search-preview-dropdown {
          position: absolute;
          top: calc(100% + 12px);
          right: 0;
          width: 320px;
          background: white;
          border: 1px solid var(--color-nude);
          border-radius: var(--radius-md);
          box-shadow: var(--shadow-lg);
          z-index: 100;
          overflow: hidden;
          padding: var(--space-2) 0;
        }

        .search-preview-item {
          display: flex;
          align-items: center;
          gap: var(--space-3);
          width: 100%;
          padding: var(--space-2) var(--space-4);
          background: none;
          border: none;
          text-align: left;
          cursor: pointer;
          transition: background var(--transition-fast);
        }

        .search-preview-item:hover {
          background: var(--color-cream-dark);
        }

        .search-preview-image {
          width: 40px;
          height: 50px;
          border-radius: var(--radius-sm);
          overflow: hidden;
          background: var(--color-nude-light);
          flex-shrink: 0;
        }

        .search-preview-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .search-preview-info {
          display: flex;
          flex-direction: column;
          gap: 2px;
          overflow: hidden;
        }

        .search-preview-name {
          font-family: 'Quicksand', sans-serif;
          font-size: 0.875rem;
          font-weight: 600;
          color: var(--color-brown-dark);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .search-preview-price {
          font-family: 'Quicksand', sans-serif;
          font-size: 0.8125rem;
          color: var(--color-coral);
          font-weight: 700;
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
          position: absolute;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          background: rgba(0, 0, 0, 0.6);
          backdrop-filter: blur(8px);
          z-index: 150;
        }

        .mobile-menu {
          position: absolute;
          top: 0;
          left: 0;
          height: 100vh;
          width: 80%;
          max-width: 320px;
          background-color: #FFFFFF !important;
          z-index: 160;
          padding: var(--space-8);
          display: flex;
          flex-direction: column;
          box-shadow: 4px 0 20px rgba(0, 0, 0, 0.15);
          overflow-y: auto;
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
          font-family: 'Montserrat', sans-serif;
          font-size: 2rem;
          font-weight: 800;
          font-style: normal;
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

        /* Mobile Menu Currency Selector */
        .mobile-menu-currency {
          margin-top: var(--space-6);
          padding-top: var(--space-6);
          border-top: 1px solid #EEEEEE;
        }

        .mobile-menu-currency-label {
          display: block;
          font-size: 0.75rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.15em;
          color: #666666;
          margin-bottom: var(--space-3);
        }

        .mobile-menu-currency-options {
          display: flex;
          flex-wrap: wrap;
          gap: var(--space-2);
        }

        .mobile-currency-btn {
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

        .mobile-currency-btn:hover {
          background: var(--color-nude-light);
        }

        .mobile-currency-btn.active {
          background: var(--color-coral);
          color: white;
          border-color: var(--color-coral);
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
    </motion.nav>
  );
};
