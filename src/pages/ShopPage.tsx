import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { ProductCard } from '../components/ProductCard';
import { SEOHead } from '../components/SEOHead';
import { useStore } from '../data/store';

export const ShopPage: React.FC = () => {
  const { categoryId } = useParams();
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get('search');
  const navigate = useNavigate();
  const { products, categories, currency, loading } = useStore();
  const [activeCategory, setActiveCategory] = useState(categoryId || 'all');


  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10; // 2 columns x 5 rows on mobile

  useEffect(() => {
    if (categoryId) {
      setActiveCategory(categoryId);
    } else {
      setActiveCategory('all');
    }
    setCurrentPage(1); // Reset to first page on category change
  }, [categoryId, searchQuery]);

  const handleCategoryChange = (id: string) => {
    if (id === 'all') {
      navigate('/shop');
    } else {
      navigate(`/shop/${id}`);
    }
  };

  const filteredProducts = useMemo(() => {
    let filtered = products;

    // Filter by Category
    if (activeCategory !== 'all') {
      filtered = filtered.filter(p => p.categoryId === activeCategory);
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

    return filtered;
  }, [activeCategory, searchQuery, products]);

  // Pagination Logic
  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredProducts.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredProducts, currentPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
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
          <h1><span className="font-brand">TÉFA</span> Collection</h1>

          <div className="shop-filters">
            <button
              onClick={() => handleCategoryChange('all')}
              className={`shop-filter-btn ${activeCategory === 'all' && !searchQuery ? 'active' : ''}`}
            >
              All Pieces
            </button>
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => handleCategoryChange(cat.id)}
                className={`shop-filter-btn ${activeCategory === cat.id ? 'active' : ''}`}
              >
                {cat.name}
              </button>
            ))}
          </div>
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
          padding-top: 120px;
          padding-bottom: var(--space-24);
        }

        .shop-header {
          margin-bottom: var(--space-10);
        }

        .shop-header h1 {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(2.5rem, 5vw, 3.5rem);
          font-weight: 700;
          font-style: italic;
          margin-bottom: var(--space-8);
        }

        .shop-filters {
          display: flex;
          flex-wrap: wrap;
          gap: var(--space-2);
        }

        .shop-filter-btn {
          padding: var(--space-2) var(--space-5);
          background: var(--color-cream-dark);
          color: var(--color-brown);
          border: none;
          border-radius: var(--radius-full);
          font-family: 'Quicksand', sans-serif;
          font-size: 0.875rem;
          font-weight: 600;
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .shop-filter-btn:hover {
          background: var(--color-nude);
        }

        .shop-filter-btn.active {
          background: var(--color-coral);
          color: white;
        }

        .shop-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr); /* 2 columns on mobile */
          column-gap: 4px; /* Reduced horizontal gap */
          row-gap: var(--space-12); /* Increased vertical gap to separate items */
          margin: var(--space-8) 0; /* Add top/bottom margin to the grid container */
        }

        @media (min-width: 1024px) {
          .shop-grid {
            grid-template-columns: repeat(3, 1fr);
            column-gap: 4px; /* Consistent small horizontal gap */
            row-gap: var(--space-16); /* Even more space on larger screens */
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

