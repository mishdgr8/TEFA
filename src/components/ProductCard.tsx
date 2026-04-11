import React from 'react';
import { useNavigate } from 'react-router-dom';
import { m } from 'framer-motion';
import { Product } from '../types';
import { OptimizedImage } from './OptimizedImage';
import './ProductCard.css';
import { useStore } from '../data/store';
import { formatPrice, getCategoryName, getProductPrice } from '../utils/shopHelpers';


interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = React.memo(({ product }) => {
  const navigate = useNavigate();
  const { currency, categories } = useStore();

  return (
    <m.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="product-card"
      role="button"
      tabIndex={0}
      aria-label={`View ${product.name}`}
      onKeyDown={(e) => e.key === 'Enter' && navigate(`/product/${product.slug}`)}
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
          {product.name}
        </h3>
        <p className="product-card-price">
          {(() => {
            const { original, sale } = getProductPrice(product, currency);
            return sale ? (
              <>
                <span className="original-price-strike">{formatPrice({ amount: original }, currency)}</span>
                <span className="sale-price">{formatPrice({ amount: sale }, currency)}</span>
              </>
            ) : (
              formatPrice({ amount: original }, currency)
            );
          })()}
        </p>
      </div>
    </m.div>
  );
});
