import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { X, SlidersHorizontal } from 'lucide-react';
import { m, AnimatePresence } from 'framer-motion';
import { ProductCard } from '../components/ProductCard';
import { SEOHead } from '../components/SEOHead';
import { useStore } from '../data/store';
import { formatPrice, getProductPrice } from '../utils/shopHelpers';


export const ShopPage: React.FC = () => {
  const { categoryId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const searchQuery = searchParams.get('search');
  const currentPage = parseInt(searchParams.get('page') || '1');
  const navigate = useNavigate();
  const { products, categories, currency, loading } = useStore();
  const [sortBy, setSortBy] = useState('newest');
  const [activeCategory, setActiveCategory] = useState(categoryId || 'all');
  const [openFilter, setOpenFilter] = useState<string | null>(null);
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [availability, setAvailability] = useState(['in-stock']);
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
  const filterSectionRef = useRef<HTMLDivElement>(null);

  // Close filter on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (filterSectionRef.current && !filterSectionRef.current.contains(event.target as Node)) {
        setOpenFilter(null);
      }
    };

    if (openFilter) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [openFilter]);

  const maxPrice = useMemo(() => {
    if (products.length === 0) return 0;
    const prices = products.map(p => {
      const { original } = getProductPrice(p, currency);
      return original;
    });
    return Math.max(...prices);
  }, [products, currency]);

  const ITEMS_PER_PAGE = 20; // Show more items in the clean grid

  useEffect(() => {
    setActiveCategory(categoryId || 'all');
  }, [categoryId]);

  const handleCategoryChange = (id: string) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', '1');
    if (id === 'all') {
      navigate(`/shop?${params.toString()}`);
    } else {
      navigate(`/shop/${id}?${params.toString()}`);
    }
  };

  const filteredProducts = useMemo(() => {
    let filtered = [...products];

    // Filter by Category
    const catId = categoryId || 'all';
    if (catId !== 'all') {
      filtered = filtered.filter(p => p.categoryId === catId);
    }

    // Filter by Search
    if (searchQuery) {
      const lowerQuery = searchQuery.toLowerCase();
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(lowerQuery) ||
        p.description?.toLowerCase().includes(lowerQuery) ||
        p.tags?.some(tag => tag.toLowerCase().includes(lowerQuery))
      );
    }

    // Filter by Availability
    if (availability.length > 0) {
      filtered = filtered.filter(p => {
        if (availability.includes('in-stock') && !p.soldOut) return true;
        if (availability.includes('out-of-stock') && p.soldOut) return true;
        return false;
      });
    }

    // Filter by Price Range
    if (priceRange.min || priceRange.max) {
      const min = parseFloat(priceRange.min) || 0;
      const max = parseFloat(priceRange.max) || Infinity;

      filtered = filtered.filter(p => {
        const { original } = getProductPrice(p, currency);
        return original >= min && original <= max;
      });
    }

    // Sort
    if (sortBy === 'price-asc') {
      filtered.sort((a, b) => {
        const p1 = getProductPrice(a, currency).original;
        const p2 = getProductPrice(b, currency).original;
        return p1 - p2;
      });
    } else if (sortBy === 'price-desc') {
      filtered.sort((a, b) => {
        const p1 = getProductPrice(a, currency).original;
        const p2 = getProductPrice(b, currency).original;
        return p2 - p1;
      });
    } else if (sortBy === 'newest') {
      filtered.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
    }

    return filtered;
  }, [activeCategory, searchQuery, products, categoryId, sortBy, priceRange, availability, currency]);

  // Pagination Logic
  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredProducts.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredProducts, currentPage]);

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', page.toString());
    setSearchParams(params);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="shop-page">
      <SEOHead
        title={activeCategory !== 'all' ? `${categories.find(c => c.id === activeCategory)?.name || 'Shop'} Collection` : 'Shop All Collections'}
        description="Browse the full TÉFA collection — handcrafted kaftans, ankara sets, gowns, and accessories. Premium African fashion from Lagos, Nigeria."
        path={categoryId ? `/shop/${categoryId}` : '/shop'}
      />
      <div className="container">
        <div className="shop-header">
          <div className="category-dropdown">
            <select
              value={activeCategory}
              onChange={(e) => handleCategoryChange(e.target.value)}
              className="category-select"
            >
              <option value="all">All Pieces</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>

          <div className="shop-controls-bar desktop-only">
            <div className="filters-left" ref={filterSectionRef}>
              <span className="control-label">Filter:</span>

              <div className="dropdown-container">
                <div
                  className={`dropdown-filter ${openFilter === 'availability' ? 'active' : ''}`}
                  onClick={() => setOpenFilter(openFilter === 'availability' ? null : 'availability')}
                >
                  <span className={availability.length > 0 ? 'filter-underlined' : ''}>Availability</span>
                  <svg width="10" height="6" viewBox="0 0 10 6" fill="none"><path d="M1 1l4 4 4-4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                </div>
                {openFilter === 'availability' && (
                  <div className="filter-popover">
                    <div className="popover-header">
                      <span>{availability.length} selected</span>
                      <button className="reset-btn" onClick={() => setAvailability([])}>Reset</button>
                    </div>
                    <div className="popover-content">
                      <label className="checkbox-item">
                        <input
                          type="checkbox"
                          checked={availability.includes('in-stock')}
                          onChange={() => {
                            setAvailability(prev =>
                              prev.includes('in-stock')
                                ? prev.filter(item => item !== 'in-stock')
                                : [...prev, 'in-stock']
                            );
                          }}
                        />
                        <span>In stock ({products.filter(p => !p.soldOut).length})</span>
                      </label>
                      <label className="checkbox-item">
                        <input
                          type="checkbox"
                          checked={availability.includes('out-of-stock')}
                          onChange={() => {
                            setAvailability(prev =>
                              prev.includes('out-of-stock')
                                ? prev.filter(item => item !== 'out-of-stock')
                                : [...prev, 'out-of-stock']
                            );
                          }}
                        />
                        <span>Out of stock ({products.filter(p => p.soldOut).length})</span>
                      </label>
                    </div>
                  </div>
                )}
              </div>

              <div className="dropdown-container">
                <div
                  className={`dropdown-filter ${openFilter === 'price' ? 'active' : ''}`}
                  onClick={() => setOpenFilter(openFilter === 'price' ? null : 'price')}
                >
                  <span>Price</span>
                  <svg width="10" height="6" viewBox="0 0 10 6" fill="none"><path d="M1 1l4 4 4-4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                </div>
                {openFilter === 'price' && (
                  <div className="filter-popover price-popover">
                    <div className="popover-header">
                      <span>The highest price is {formatPrice({ amount: maxPrice }, currency)}</span>
                      <button className="reset-btn" onClick={() => setPriceRange({ min: '', max: '' })}>Reset</button>
                    </div>
                    <div className="popover-content price-inputs">
                      <div className="input-group">
                        <span className="currency-symbol">{currency === 'NGN' ? '₦' : '$'}</span>
                        <input type="text" placeholder="From" value={priceRange.min} onChange={(e) => setPriceRange({ ...priceRange, min: e.target.value })} />
                      </div>
                      <div className="input-group">
                        <span className="currency-symbol">{currency === 'NGN' ? '₦' : '$'}</span>
                        <input type="text" placeholder="To" value={priceRange.max} onChange={(e) => setPriceRange({ ...priceRange, max: e.target.value })} />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="filters-right">
              <div className="sort-group">
                <span className="control-label">Sort by:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="sort-select"
                >
                  <option value="newest">Date, new to old</option>
                  <option value="price-asc">Price, low to high</option>
                  <option value="price-desc">Price, high to low</option>
                </select>
              </div>
              <span className="product-count">{filteredProducts.length} products</span>
            </div>
          </div>

          {/* Mobile Filter Bar */}
          <div className="shop-controls-bar mobile-only">
            <button
              className="mobile-filter-trigger"
              onClick={() => setIsMobileFiltersOpen(true)}
            >
              <SlidersHorizontal size={14} />
              <span>Filter & Sort</span>
              {(availability.length > 0 || priceRange.min || priceRange.max) && (
                <span className="filter-badge" />
              )}
            </button>
            <span className="product-count">{filteredProducts.length} items</span>
          </div>

          {/* Mobile Filter Drawer */}
          <AnimatePresence>
            {isMobileFiltersOpen && (
              <>
                <m.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setIsMobileFiltersOpen(false)}
                  className="mobile-filter-overlay"
                />
                <m.div
                  initial={{ x: '100%' }}
                  animate={{ x: 0 }}
                  exit={{ x: '100%' }}
                  transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                  className="mobile-filter-drawer"
                >
                  <div className="drawer-header">
                    <h3>Filter & Sort</h3>
                    <button onClick={() => setIsMobileFiltersOpen(false)}>
                      <X size={24} />
                    </button>
                  </div>

                  <div className="drawer-content">
                    {/* Sort Section */}
                    <div className="drawer-section">
                      <h4 className="section-title">Sort By</h4>
                      <div className="sort-options-list">
                        {[
                          { value: 'newest', label: 'Date, new to old' },
                          { value: 'price-asc', label: 'Price, low to high' },
                          { value: 'price-desc', label: 'Price, high to low' }
                        ].map(option => (
                          <label key={option.value} className="radio-item">
                            <input
                              type="radio"
                              name="mobile-sort"
                              value={option.value}
                              checked={sortBy === option.value}
                              onChange={(e) => setSortBy(e.target.value)}
                            />
                            <span>{option.label}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Availability Section */}
                    <div className="drawer-section">
                      <h4 className="section-title">Availability</h4>
                      <div className="checkbox-list">
                        <label className="checkbox-item">
                          <input
                            type="checkbox"
                            checked={availability.includes('in-stock')}
                            onChange={() => {
                              setAvailability(prev =>
                                prev.includes('in-stock')
                                  ? prev.filter(item => item !== 'in-stock')
                                  : [...prev, 'in-stock']
                              );
                            }}
                          />
                          <span>In stock ({products.filter(p => !p.soldOut).length})</span>
                        </label>
                        <label className="checkbox-item">
                          <input
                            type="checkbox"
                            checked={availability.includes('out-of-stock')}
                            onChange={() => {
                              setAvailability(prev =>
                                prev.includes('out-of-stock')
                                  ? prev.filter(item => item !== 'out-of-stock')
                                  : [...prev, 'out-of-stock']
                              );
                            }}
                          />
                          <span>Out of stock ({products.filter(p => p.soldOut).length})</span>
                        </label>
                      </div>
                    </div>

                    {/* Price Section */}
                    <div className="drawer-section">
                      <div className="section-header">
                        <h4 className="section-title">Price Range</h4>
                        {(priceRange.min || priceRange.max) && (
                          <button className="reset-link" onClick={() => setPriceRange({ min: '', max: '' })}>Reset</button>
                        )}
                      </div>
                      <div className="price-inputs-grid">
                        <div className="input-field">
                          <label>From</label>
                          <div className="input-with-symbol">
                            <span className="symbol">{currency === 'NGN' ? '₦' : '$'}</span>
                            <input
                              type="number"
                              placeholder="0"
                              value={priceRange.min}
                              onChange={(e) => setPriceRange({ ...priceRange, min: e.target.value })}
                            />
                          </div>
                        </div>
                        <div className="input-field">
                          <label>To</label>
                          <div className="input-with-symbol">
                            <span className="symbol">{currency === 'NGN' ? '₦' : '$'}</span>
                            <input
                              type="number"
                              placeholder={maxPrice.toString()}
                              value={priceRange.max}
                              onChange={(e) => setPriceRange({ ...priceRange, max: e.target.value })}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="drawer-footer">
                    <button
                      className="clear-all-btn"
                      onClick={() => {
                        setAvailability(['in-stock']);
                        setPriceRange({ min: '', max: '' });
                        setSortBy('newest');
                      }}
                    >
                      Clear All
                    </button>
                    <button
                      className="apply-btn"
                      onClick={() => setIsMobileFiltersOpen(false)}
                    >
                      Show {filteredProducts.length} Products
                    </button>
                  </div>
                </m.div>
              </>
            )}
          </AnimatePresence>
        </div>

        {loading ? (
          <div className="shop-loading">
            <div className="loading-spinner" />
            <p>Gathering our collection...</p>
          </div>
        ) : filteredProducts.length > 0 ? (
          <>
            <div className="shop-grid">
              {paginatedProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="pagination">
                <button
                  className="pagination-btn"
                  disabled={currentPage === 1}
                  onClick={() => handlePageChange(currentPage - 1)}
                >
                  Previous
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    className={`pagination-number ${currentPage === page ? 'active' : ''}`}
                    onClick={() => handlePageChange(page)}
                  >
                    {page}
                  </button>
                ))}

                <button
                  className="pagination-btn"
                  disabled={currentPage === totalPages}
                  onClick={() => handlePageChange(currentPage + 1)}
                >
                  Next
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="shop-empty">
            <p>No products found in this category.</p>
          </div>
        )}
      </div>

      <style>{`
        .shop-loading {
          padding: var(--space-24) 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: var(--space-4);
          animation: fadeIn 0.4s ease forwards;
        }

        .loading-spinner {
          width: 40px;
          height: 40px;
          border: 3px solid var(--color-nude);
          border-top-color: var(--color-coral);
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        .shop-page {
          padding-top: 140px;
          padding-bottom: var(--space-24);
        }

        .shop-page .container {
          max-width: 1400px;
          padding: 0 var(--space-12);
        }

        @media (max-width: 768px) {
          .shop-page .container {
            padding: 0 var(--space-1);
          }
        }

        .shop-header {
          margin-bottom: var(--space-12);
          display: flex;
          flex-direction: column;
          gap: var(--space-8);
        }

        @media (max-width: 768px) {
          .shop-header {
            margin-bottom: var(--space-6);
          }
        }

        .category-dropdown {
          display: flex;
          justify-content: flex-start;
        }

        .category-select {
          font-family: 'Montserrat', sans-serif;
          font-size: clamp(1.5rem, 4vw, 2.25rem);
          font-weight: 700;
          text-transform: uppercase;
          border: none;
          background: transparent;
          cursor: pointer;
          color: var(--color-brown-dark);
          padding: 0;
          outline: none;
          display: block;
          appearance: none;
          -webkit-appearance: none;
        }

        .shop-controls-bar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: var(--space-4) 0;
          border-top: 1px solid rgba(0,0,0,0.08);
          border-bottom: 1px solid rgba(0,0,0,0.08);
          font-family: 'Quicksand', sans-serif;
          font-size: 0.8125rem;
          color: var(--color-brown);
        }

        .desktop-only {
          display: flex !important;
        }
        .mobile-only {
          display: none !important;
        }

        @media (max-width: 768px) {
          .desktop-only {
            display: none !important;
          }
          .mobile-only {
            display: flex !important;
          }
        }

        .filters-left, .filters-right {
          display: flex;
          align-items: center;
          gap: var(--space-6);
        }

        .control-label {
          font-weight: 700;
          color: #111;
        }

        .dropdown-container {
          position: relative;
        }

        .filter-underlined {
          text-decoration: underline;
          text-underline-offset: 4px;
        }

        .dropdown-filter {
          display: flex;
          align-items: center;
          gap: 6px;
          cursor: pointer;
        }

        .dropdown-filter.active svg {
          transform: rotate(180deg);
        }

        .filter-popover {
          position: absolute;
          top: 100%;
          left: 0;
          width: 300px;
          background: white;
          border: 1px solid #E5E5E5;
          margin-top: 10px;
          z-index: 100;
          box-shadow: 0 10px 30px rgba(0,0,0,0.1);
        }

        .popover-header {
          display: flex;
          justify-content: space-between;
          padding: 15px 20px;
          border-bottom: 1px solid #F0F0F0;
          color: #111;
        }

        .reset-btn {
          background: none;
          border: none;
          color: #333;
          text-decoration: underline;
          cursor: pointer;
          font-weight: 500;
        }

        .popover-content {
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .checkbox-item {
          display: flex;
          align-items: center;
          gap: 12px;
          cursor: pointer;
        }

        .checkbox-item.disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }

        .price-inputs {
          display: flex;
          flex-direction: row;
          gap: 15px;
          padding: 20px;
        }

        .input-group {
          position: relative;
          flex: 1;
        }

        .currency-symbol {
          position: absolute;
          left: 10px;
          top: 50%;
          transform: translateY(-50%);
          color: #666;
        }

        .input-group input {
          width: 100%;
          padding: 10px 10px 10px 25px;
          border: 1px solid #999;
          font-family: inherit;
          outline: none;
        }

        .sort-group {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .sort-select {
          border: 1px solid #ccc;
          background: white;
          padding: 6px 12px;
          font-size: 0.8125rem;
          cursor: pointer;
          outline: none;
        }

        .mobile-filter-trigger {
          display: flex;
          align-items: center;
          gap: 8px;
          background: white;
          border: 1px solid var(--color-nude-dark);
          padding: 8px 16px;
          border-radius: 4px;
          font-family: inherit;
          font-size: 0.8125rem;
          font-weight: 600;
          color: var(--color-brown-dark);
          cursor: pointer;
          position: relative;
        }

        .filter-badge {
          width: 6px;
          height: 6px;
          background: var(--color-coral);
          border-radius: 50%;
          position: absolute;
          top: 6px;
          right: 6px;
        }

        .mobile-filter-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.5);
          z-index: 1000;
          backdrop-filter: blur(2px);
        }

        .mobile-filter-drawer {
          position: fixed;
          top: 0;
          right: 0;
          bottom: 0;
          width: 85%;
          max-width: 400px;
          background: white;
          z-index: 1001;
          display: flex;
          flex-direction: column;
          box-shadow: -5px 0 25px rgba(0,0,0,0.1);
        }

        .drawer-header {
          padding: 20px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px solid #eee;
        }

        .drawer-header h3 {
          font-family: 'Montserrat', sans-serif;
          font-size: 1.125rem;
          font-weight: 700;
          text-transform: uppercase;
          margin: 0;
          color: var(--color-brown-dark);
        }

        .drawer-header button {
          background: none;
          border: none;
          padding: 5px;
          cursor: pointer;
          color: #666;
        }

        .drawer-content {
          flex: 1;
          overflow-y: auto;
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 32px;
        }

        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
        }

        .section-title {
          font-family: 'Montserrat', sans-serif;
          font-size: 0.875rem;
          font-weight: 700;
          text-transform: uppercase;
          color: var(--color-brown-dark);
          margin: 0;
        }

        .reset-link {
          background: none;
          border: none;
          color: #666;
          text-decoration: underline;
          font-size: 0.75rem;
          cursor: pointer;
        }

        .sort-options-list, .checkbox-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .radio-item, .checkbox-item {
          display: flex;
          align-items: center;
          gap: 12px;
          font-size: 0.9375rem;
          color: #333;
          cursor: pointer;
        }

        .radio-item input, .checkbox-item input {
          width: 20px;
          height: 20px;
          accent-color: var(--color-coral);
        }

        .price-inputs-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }

        .input-field {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .input-field label {
          font-size: 0.75rem;
          color: #666;
        }

        .input-with-symbol {
          position: relative;
          display: flex;
          align-items: center;
        }

        .input-with-symbol .symbol {
          position: absolute;
          left: 10px;
          color: #999;
          font-size: 0.875rem;
        }

        .input-with-symbol input {
          width: 100%;
          padding: 10px 10px 10px 25px;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 0.875rem;
          outline: none;
        }

        .drawer-footer {
          padding: 20px;
          display: grid;
          grid-template-columns: 1fr 2fr;
          gap: 12px;
          border-top: 1px solid #eee;
          background: white;
        }

        .clear-all-btn {
          background: transparent;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 0.875rem;
          font-weight: 600;
          cursor: pointer;
          color: #666;
        }

        .apply-btn {
          background: var(--color-brown-dark);
          color: white;
          border: none;
          padding: 14px;
          border-radius: 4px;
          font-size: 0.875rem;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.2s;
        }

        .apply-btn:active {
          background: #000;
        }

        .product-count {
          color: #666;
          font-weight: 700;
          font-family: 'Cormorant Garamond', serif;
          font-style: normal;
          font-size: 1rem;
        }

        .shop-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          column-gap: 2px; 
          row-gap: var(--space-10);
          margin: var(--space-12) 0;
        }

        @media (max-width: 768px) {
          .shop-grid {
            margin: var(--space-6) 0;
            row-gap: var(--space-6);
          }
        }

        @media (min-width: 1024px) {
          .shop-grid {
            grid-template-columns: repeat(4, 1fr);
            column-gap: 2px;
            row-gap: var(--space-16);
          }
        }

        .shop-empty {
          padding: var(--space-24) 0;
          text-align: center;
        }

        .shop-empty p {
          color: var(--color-text-muted);
          font-size: 1.125rem;
        }

        /* Pagination Styles */
        .pagination {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: var(--space-4);
          margin-top: var(--space-12);
          font-family: 'Quicksand', sans-serif;
        }

        .pagination-btn {
          padding: var(--space-2) var(--space-4);
          border: 1px solid var(--color-nude-dark);
          background: white;
          border-radius: var(--radius-sm);
          font-size: 0.875rem;
          font-weight: 600;
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .pagination-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .pagination-btn:not(:disabled):hover {
          background: var(--color-nude);
        }

        .pagination-number {
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: none;
          background: transparent;
          font-weight: 600;
          border-radius: 50%;
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .pagination-number.active {
          background: var(--color-coral);
          color: white;
        }

        .pagination-number:hover:not(.active) {
          background: var(--color-nude);
        }
      `}</style>
    </div>
  );
};

