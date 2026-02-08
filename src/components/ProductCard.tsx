import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Product } from '../types';
import { formatPrice, getCategoryName, useStore } from '../data/store';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const navigate = useNavigate();
  const { currency, categories } = useStore();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="product-card"
      onClick={() => navigate(`/product/${product.slug}`)}
    >
      <div className="product-card-image">
        <img
          src={product.images[0]}
          alt={product.name}
          loading="lazy"
        />
        <div className="product-card-overlay" />

        {/* Tags */}
        <div className="product-card-tags">
          {product.soldOut && (
            <span className="product-card-tag sold-out-tag">SOLD OUT</span>
          )}
          {!product.soldOut && product.tags.length > 0 && (
            product.tags.slice(0, 2).map(tag => (
              <span key={tag} className="product-card-tag">{tag}</span>
            ))
          )}
        </div>
      </div>

      <div className="product-card-content">
        <div className="product-card-info">
          <h3 className="product-card-title">{product.name}</h3>
          <p className="product-card-category">{getCategoryName(product.categoryId, categories)}</p>
        </div>
        <p className="product-card-price">{formatPrice(product.price, currency)}</p>
      </div>

      <style>{`
        .product-card {
          cursor: pointer;
          transition: transform var(--transition-base);
        }

        .product-card:hover {
          transform: translateY(-6px);
        }

        .product-card-image {
          position: relative;
          aspect-ratio: 3 / 4;
          overflow: hidden;
          border-radius: var(--radius-xl);
          background: var(--color-nude-light);
        }

        .product-card-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.7s ease;
        }

        .product-card:hover .product-card-image img {
          transform: scale(1.08);
        }

        .product-card-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(to top, rgba(0, 0, 0, 0.3), transparent 40%);
          opacity: 0;
          transition: opacity var(--transition-base);
        }

        .product-card:hover .product-card-overlay {
          opacity: 1;
        }

        .product-card-tags {
          position: absolute;
          top: var(--space-4);
          left: var(--space-4);
          display: flex;
          gap: var(--space-2);
        }

        .product-card-tag {
          font-size: 0.5625rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          padding: 4px 8px;
          border-radius: var(--radius-sm);
          background: white;
          color: var(--color-brown-dark);
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .sold-out-tag {
          background: #DC2626 !important;
          color: white !important;
          font-size: 0.625rem;
          padding: 6px 10px;
        }

        .product-card-content {
          margin-top: var(--space-4);
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: var(--space-4);
        }

        .product-card-info {
          flex: 1;
          min-width: 0;
        }

        .product-card-title {
          font-family: 'Quicksand', sans-serif;
          font-size: 1.0625rem;
          font-weight: 600;
          color: var(--color-brown-dark);
          transition: color var(--transition-fast);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .product-card:hover .product-card-title {
          color: var(--color-coral);
        }

        .product-card-category {
          font-size: 0.8125rem;
          color: var(--color-text-muted);
          margin-top: 2px;
        }

        .product-card-price {
          font-family: 'Quicksand', sans-serif;
          font-size: 1rem;
          font-weight: 700;
          color: var(--color-coral);
          white-space: nowrap;
        }
      `}</style>
    </motion.div>
  );
};
