import React, { useState } from 'react';
import { ChevronLeft, ShoppingBag, Plus, Minus, Sparkles, Truck } from 'lucide-react';
import { useStore, formatPrice } from '../data/store';
import { PageName, CartItem } from '../types';

interface ProductDetailPageProps {
    slug: string;
    onNavigate: (page: PageName) => void;
}

export const ProductDetailPage: React.FC<ProductDetailPageProps> = ({ slug, onNavigate }) => {
    const { products, addToCart } = useStore();
    const product = products.find(p => p.slug === slug);

    const [selectedSize, setSelectedSize] = useState('');
    const [selectedColor, setSelectedColor] = useState(product?.colors[0]?.name || '');
    const [qty, setQty] = useState(1);

    if (!product) {
        return (
            <div className="product-not-found">
                <p>Product not found.</p>
                <button onClick={() => onNavigate('shop')}>Back to Shop</button>
            </div>
        );
    }

    const handleAddToCart = () => {
        if (!selectedSize) {
            alert("Please select a size first.");
            return;
        }

        const item: CartItem = {
            productId: product.id,
            variantId: `${product.id}-${selectedSize}-${selectedColor}`,
            name: product.name,
            price: product.price,
            qty,
            selectedSize,
            selectedColor,
            image: product.images[0],
            slug: product.slug,
        };
        addToCart(item);
    };

    const handleDirectChat = () => {
        if (!selectedSize) {
            alert("Please select a size first.");
            return;
        }
        const msg = encodeURIComponent(
            `Hi TÉFA! I want to order the ${product.name} (Size: ${selectedSize}, Color: ${selectedColor}). Is it available?`
        );
        window.open(`https://wa.me/2340000000000?text=${msg}`, '_blank');
    };

    return (
        <div className="product-detail">
            <div className="container">
                <button onClick={() => onNavigate('shop')} className="back-btn">
                    <ChevronLeft size={16} /> Back to Collection
                </button>

                <div className="product-grid">
                    {/* Gallery */}
                    <div className="product-gallery">
                        <div className="product-main-image">
                            <img src={product.images[0]} alt={product.name} />
                        </div>
                        {product.images.length > 1 && (
                            <div className="product-thumbs">
                                {product.images.map((img, i) => (
                                    <div key={i} className="product-thumb">
                                        <img src={img} alt={`${product.name} view ${i + 1}`} />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Details */}
                    <div className="product-info">
                        {product.tags.length > 0 && (
                            <div className="product-tags">
                                {product.tags.map(tag => (
                                    <span key={tag} className="product-tag">{tag}</span>
                                ))}
                            </div>
                        )}

                        <h1 className="product-title">{product.name}</h1>
                        <p className="product-price">{formatPrice(product.price)}</p>

                        <div className="product-description">
                            <p>{product.description}</p>
                        </div>

                        {/* Color Select */}
                        <div className="product-option">
                            <label>
                                Color: <span>{selectedColor}</span>
                            </label>
                            <div className="color-options">
                                {product.colors.map(color => (
                                    <button
                                        key={color.name}
                                        onClick={() => setSelectedColor(color.name)}
                                        className={`color-btn ${selectedColor === color.name ? 'active' : ''}`}
                                    >
                                        <span style={{ backgroundColor: color.hex }} />
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Size Select */}
                        <div className="product-option">
                            <div className="option-header">
                                <label>Select Size</label>
                                <button className="size-guide-btn">Size Guide</button>
                            </div>
                            <div className="size-options">
                                {product.sizes.map(size => (
                                    <button
                                        key={size}
                                        onClick={() => setSelectedSize(size)}
                                        className={`size-btn ${selectedSize === size ? 'active' : ''}`}
                                    >
                                        {size}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Quantity */}
                        <div className="product-option">
                            <label>Quantity</label>
                            <div className="qty-control">
                                <button onClick={() => setQty(Math.max(1, qty - 1))}>
                                    <Minus size={18} />
                                </button>
                                <span>{qty}</span>
                                <button onClick={() => setQty(qty + 1)}>
                                    <Plus size={18} />
                                </button>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="product-actions">
                            <button onClick={handleAddToCart} className="add-to-cart-btn">
                                <ShoppingBag size={20} /> Add to Inquiry
                            </button>
                            <button onClick={handleDirectChat} className="direct-chat-btn">
                                Direct Chat
                            </button>
                        </div>

                        {/* Trust Badges */}
                        <div className="trust-badges">
                            <div className="trust-badge">
                                <div className="trust-icon green">
                                    <Sparkles size={16} />
                                </div>
                                <span>Hand-crafted by master artisans in Lagos.</span>
                            </div>
                            <div className="trust-badge">
                                <div className="trust-icon blue">
                                    <Truck size={16} />
                                </div>
                                <span>Ships worldwide within 5-7 business days.</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
        .product-detail {
          padding-top: 120px;
          padding-bottom: var(--space-24);
        }

        .product-not-found {
          padding-top: 160px;
          text-align: center;
        }

        .product-not-found p {
          color: var(--color-text-muted);
          margin-bottom: var(--space-4);
        }

        .product-not-found button {
          background: none;
          border: none;
          color: var(--color-coral);
          font-weight: 700;
          cursor: pointer;
          text-decoration: underline;
        }

        .back-btn {
          display: inline-flex;
          align-items: center;
          gap: var(--space-2);
          margin-bottom: var(--space-8);
          background: none;
          border: none;
          font-family: 'Quicksand', sans-serif;
          font-size: 0.75rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.15em;
          color: var(--color-text-muted);
          cursor: pointer;
          transition: color var(--transition-fast);
        }

        .back-btn:hover {
          color: var(--color-coral);
        }

        .product-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: var(--space-12);
        }

        @media (min-width: 1024px) {
          .product-grid {
            grid-template-columns: 1fr 1fr;
            gap: var(--space-16);
            align-items: start;
          }
        }

        .product-gallery {
          display: flex;
          flex-direction: column;
          gap: var(--space-4);
        }

        .product-main-image {
          aspect-ratio: 3 / 4;
          border-radius: var(--radius-xl);
          overflow: hidden;
          background: var(--color-nude-light);
        }

        .product-main-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .product-thumbs {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: var(--space-4);
        }

        .product-thumb {
          aspect-ratio: 1;
          border-radius: var(--radius-md);
          overflow: hidden;
          background: var(--color-nude-light);
          cursor: pointer;
          border: 2px solid transparent;
          transition: border-color var(--transition-fast);
        }

        .product-thumb:hover {
          border-color: var(--color-brown);
        }

        .product-thumb img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .product-info {
          position: sticky;
          top: 120px;
        }

        @media (max-width: 1023px) {
          .product-info {
            position: static;
          }
        }

        .product-tags {
          display: flex;
          gap: var(--space-2);
          margin-bottom: var(--space-4);
        }

        .product-tag {
          font-size: 0.625rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          padding: var(--space-1) var(--space-3);
          border: 1px solid var(--color-nude);
          border-radius: var(--radius-full);
          color: var(--color-brown);
        }

        .product-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(2rem, 4vw, 2.5rem);
          font-weight: 700;
          font-style: italic;
          margin-bottom: var(--space-2);
        }

        .product-price {
          font-family: 'Quicksand', sans-serif;
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--color-coral);
          margin-bottom: var(--space-8);
        }

        .product-description {
          background: var(--color-cream-dark);
          padding: var(--space-6);
          border-radius: var(--radius-lg);
          margin-bottom: var(--space-8);
        }

        .product-description p {
          color: var(--color-text-light);
          line-height: 1.7;
        }

        .product-option {
          margin-bottom: var(--space-6);
        }

        .product-option label {
          display: block;
          font-size: 0.75rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: var(--color-brown-dark);
          margin-bottom: var(--space-3);
        }

        .product-option label span {
          color: var(--color-text-muted);
          font-weight: 500;
        }

        .option-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: var(--space-3);
        }

        .option-header label {
          margin-bottom: 0;
        }

        .size-guide-btn {
          background: none;
          border: none;
          font-size: 0.625rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          text-decoration: underline;
          color: var(--color-text-muted);
          cursor: pointer;
        }

        .color-options {
          display: flex;
          gap: var(--space-3);
        }

        .color-btn {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          border: 2px solid transparent;
          background: none;
          padding: 3px;
          cursor: pointer;
          transition: border-color var(--transition-fast);
        }

        .color-btn.active {
          border-color: var(--color-brown-dark);
        }

        .color-btn span {
          display: block;
          width: 100%;
          height: 100%;
          border-radius: 50%;
          box-shadow: inset 0 2px 4px rgba(0,0,0,0.1);
        }

        .size-options {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: var(--space-3);
        }

        .size-btn {
          padding: var(--space-3);
          background: none;
          border: 2px solid var(--color-nude-light);
          border-radius: var(--radius-md);
          font-family: 'Quicksand', sans-serif;
          font-weight: 700;
          color: var(--color-brown);
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .size-btn:hover {
          border-color: var(--color-nude);
        }

        .size-btn.active {
          background: var(--color-brown-dark);
          border-color: var(--color-brown-dark);
          color: white;
        }

        .qty-control {
          display: inline-flex;
          align-items: center;
          border: 2px solid var(--color-nude-light);
          border-radius: var(--radius-md);
          padding: var(--space-1);
        }

        .qty-control button {
          padding: var(--space-2);
          background: none;
          border: none;
          color: var(--color-brown);
          cursor: pointer;
          transition: color var(--transition-fast);
        }

        .qty-control button:hover {
          color: var(--color-coral);
        }

        .qty-control span {
          width: 48px;
          text-align: center;
          font-weight: 700;
          font-size: 1.125rem;
        }

        .product-actions {
          display: flex;
          flex-direction: column;
          gap: var(--space-3);
          margin-bottom: var(--space-10);
        }

        @media (min-width: 640px) {
          .product-actions {
            flex-direction: row;
          }
        }

        .add-to-cart-btn {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: var(--space-2);
          padding: var(--space-5);
          background: var(--color-coral);
          color: white;
          border: none;
          border-radius: var(--radius-xl);
          font-family: 'Quicksand', sans-serif;
          font-size: 1rem;
          font-weight: 700;
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .add-to-cart-btn:hover {
          background: var(--color-coral-dark);
          transform: translateY(-2px);
        }

        .direct-chat-btn {
          padding: var(--space-5) var(--space-8);
          background: none;
          color: var(--color-brown-dark);
          border: 2px solid var(--color-brown-dark);
          border-radius: var(--radius-xl);
          font-family: 'Quicksand', sans-serif;
          font-size: 1rem;
          font-weight: 700;
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .direct-chat-btn:hover {
          background: var(--color-brown-dark);
          color: white;
        }

        .trust-badges {
          display: flex;
          flex-direction: column;
          gap: var(--space-4);
        }

        .trust-badge {
          display: flex;
          align-items: center;
          gap: var(--space-3);
        }

        .trust-icon {
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: var(--radius-md);
        }

        .trust-icon.green {
          background: #E8F5E9;
          color: #2E7D32;
        }

        .trust-icon.blue {
          background: #E3F2FD;
          color: #1565C0;
        }

        .trust-badge span {
          font-size: 0.875rem;
          color: var(--color-text-muted);
        }
      `}</style>
        </div>
    );
};
