import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Product } from '../types';
import { OptimizedImage } from './OptimizedImage';
import './ProductCard.css';
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
        <OptimizedImage
          src={product.images[0]}
          alt={product.name}
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          quality={75}
        />
        <div className="product-card-overlay" />

        {/* Tags */}
        <div className="product-card-tags">
          {product.soldOut && (
            <span className="product-card-tag sold-out-tag">SOLD OUT</span>
          )}
          {!product.soldOut && product.salePrice && product.salePrice < product.price && (
            <span className="product-card-tag sale-tag">
              {Math.round(((product.price - product.salePrice) / product.price) * 100)}% OFF
            </span>
          )}
          {!product.soldOut && !product.salePrice && product.tags.length > 0 && (
            product.tags.slice(0, 2).map(tag => (
              <span key={tag} className="product-card-tag">{tag}</span>
            ))
          )}
        </div>

      </div>

      <div className="product-card-content">
        <h3 className="product-card-title">
          {product.name} <span className="separator">-</span> {getCategoryName(product.categoryId, categories)}
        </h3>
        <p className="product-card-price">
          {product.salePrice && product.salePrice < product.price ? (
            <>
              <span className="original-price-strike">{formatPrice(product.price, currency)}</span>
              <span className="sale-price">{formatPrice(product.salePrice, currency)}</span>
            </>
          ) : (
            formatPrice(product.price, currency)
          )}
        </p>
      </div>



    </motion.div>
  );
};
