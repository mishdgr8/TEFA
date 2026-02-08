import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ProductCard } from '../components/ProductCard';
import { useStore } from '../data/store';

export const ShopPage: React.FC = () => {
  const { categoryId } = useParams();
  const navigate = useNavigate();
  const { products, categories, currency, loading } = useStore();
  const [activeCategory, setActiveCategory] = useState(categoryId || 'all');

  useEffect(() => {
    if (categoryId) {
      setActiveCategory(categoryId);
    } else {
      setActiveCategory('all');
    }
  }, [categoryId]);

  const handleCategoryChange = (id: string) => {
    if (id === 'all') {
      navigate('/shop');
    } else {
      navigate(`/shop/${id}`);
    }
  };

  const filteredProducts = useMemo(() => {
    if (activeCategory === 'all') return products;
    return products.filter(p => p.categoryId === activeCategory);
  }, [activeCategory, products]);

  return (
    <div className="shop-page">
      <div className="container">
        <div className="shop-header">
          <h1>The Collection</h1>

          <div className="shop-filters">
            <button
              onClick={() => setActiveCategory('all')}
              className={`shop-filter-btn ${activeCategory === 'all' ? 'active' : ''}`}
            >
              All Pieces
            </button>
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
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
          <div className="shop-grid">
            {filteredProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
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
          grid-template-columns: 1fr;
          gap: var(--space-8);
        }

        @media (min-width: 640px) {
          .shop-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (min-width: 1024px) {
          .shop-grid {
            grid-template-columns: repeat(3, 1fr);
            gap: var(--space-10);
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
      `}</style>
    </div>
  );
};
