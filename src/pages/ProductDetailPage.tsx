import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ChevronLeft, ShoppingBag, Plus, Minus, Sparkles, Truck, Play, X } from 'lucide-react';
import { useStore, formatPrice } from '../data/store';
import { CartItem } from '../types';
import { SizeGuideModal } from '../components/SizeGuideModal';

export const ProductDetailPage: React.FC = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { products, addToCart, currency } = useStore();
  const product = products.find(p => p.slug === slug);

  // Combine main images with gallery images
  const allImages = product ? [...product.images, ...(product.galleryImages || [])] : [];

  const [selectedImage, setSelectedImage] = useState(0);
  const [isVideoOpen, setIsVideoOpen] = useState(false);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState(product?.colors[0]?.name || '');
  const [qty, setQty] = useState(1);
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);
  const [isExpress, setIsExpress] = useState(false);

  const sizeRanges: Record<string, string> = {
    'XS': '24-25.5"',
    'S': '26-27.6"',
    'M': '27.6-29.2"',
    'L': '29.2-31.9"',
    'XL': '31.9-34.3"',
    'XXL': '34.3-36.7"',
    'OS': 'One Size'
  };

  if (!product) {
    return (
      <div className="product-not-found">
        <p>Product not found.</p>
        <button onClick={() => navigate('/shop')}>Back to Shop</button>
      </div>
    );
  }

  const handleAddToCart = () => {
    if (!selectedSize) {
      alert("Please select a size first.");
      return;
    }

    const price = isExpress ? product.price * 1.2 : product.price;

    const item: CartItem = {
      productId: product.id,
      variantId: `${product.id}-${selectedSize}-${selectedColor}${isExpress ? '-express' : ''}`,
      name: product.name,
      price,
      qty,
      selectedSize,
      selectedColor,
      image: product.images[0],
      slug: product.slug,
      isExpress,
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
        <button onClick={() => navigate('/shop')} className="back-btn">
          <ChevronLeft size={16} /> Back to Collection
        </button>

        <div className="product-grid">
          {/* Gallery - Thumbnails on left, main image on right */}
          <div className="product-gallery">
            {/* Vertical Thumbnails */}
            <div className="product-thumbs-vertical">
              {allImages.map((img, i) => (
                <button
                  key={i}
                  className={`product-thumb ${selectedImage === i ? 'active' : ''}`}
                  onClick={() => setSelectedImage(i)}
                >
                  <img src={img} alt={`${product.name} view ${i + 1}`} />
                </button>
              ))}
              {/* Video Thumbnail */}
              {product.videoUrl && (
                <button
                  className="product-thumb video-thumb"
                  onClick={() => setIsVideoOpen(true)}
                >
                  <img src={allImages[0] || product.images[0]} alt="Video" />
                  <div className="video-play-overlay">
                    <Play size={24} fill="white" />
                  </div>
                </button>
              )}
            </div>

            {/* Main Image */}
            <div className="product-main-image">
              <img src={allImages[selectedImage] || product.images[0]} alt={product.name} />
            </div>
          </div>

          {/* Video Modal */}
          {isVideoOpen && product.videoUrl && (
            <div className="video-modal-overlay" onClick={() => setIsVideoOpen(false)}>
              <div className="video-modal" onClick={e => e.stopPropagation()}>
                <button className="video-close-btn" onClick={() => setIsVideoOpen(false)}>
                  <X size={24} />
                </button>
                <video
                  src={product.videoUrl}
                  controls
                  autoPlay
                  className="video-player"
                >
                  Your browser does not support video playback.
                </video>
              </div>
            </div>
          )}

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
            <p className="product-price">
              {isExpress ? (
                <>
                  <span className="original-price">{formatPrice(product.price, currency)}</span>
                  <span className="express-price">{formatPrice(product.price * 1.2, currency)}</span>
                </>
              ) : (
                formatPrice(product.price, currency)
              )}
            </p>

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
                <button
                  className="size-guide-btn"
                  onClick={() => setIsSizeGuideOpen(true)}
                >
                  Size Guide
                </button>
              </div>
              <div className="size-options">
                {product.sizes.map(size => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`size-btn ${selectedSize === size ? 'active' : ''}`}
                  >
                    <span className="size-label">{size}</span>
                    <span className="size-range">{sizeRanges[size] || ''}</span>
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
            <div className="product-actions-container">
              {product.soldOut && (
                <div className="express-request-toggle">
                  <label className="express-toggle-label">
                    <input
                      type="checkbox"
                      checked={isExpress}
                      onChange={(e) => setIsExpress(e.target.checked)}
                    />
                    <div className="express-toggle-content">
                      <div className="express-toggle-title">
                        ✨ Request Express Production
                      </div>
                      <div className="express-toggle-desc">
                        Sold Out. We can make this for you in 14 days for a 20% priority surcharge.
                      </div>
                    </div>
                  </label>
                </div>
              )}

              <div className="product-actions">
                <button
                  onClick={handleAddToCart}
                  className={`add-to-cart-btn ${product.soldOut && !isExpress ? 'disabled' : ''}`}
                  disabled={product.soldOut && !isExpress}
                >
                  <ShoppingBag size={20} />
                  {product.soldOut ? (isExpress ? 'Add Express Request' : 'Sold Out') : 'Add to Inquiry'}
                </button>
                <button onClick={handleDirectChat} className="direct-chat-btn">
                  Direct Chat
                </button>
              </div>
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

      <SizeGuideModal
        isOpen={isSizeGuideOpen}
        onClose={() => setIsSizeGuideOpen(false)}
      />

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
          flex-direction: column-reverse;
          gap: var(--space-4);
        }

        @media (min-width: 768px) {
          .product-gallery {
            flex-direction: row;
          }
        }

        .product-thumbs-vertical {
          display: flex;
          flex-direction: row;
          gap: var(--space-2);
          overflow-x: auto;
          padding-bottom: var(--space-2);
        }

        @media (min-width: 768px) {
          .product-thumbs-vertical {
            flex-direction: column;
            overflow-x: visible;
            overflow-y: auto;
            max-height: 500px;
            width: 80px;
            flex-shrink: 0;
          }
        }

        .product-thumb {
          width: 70px;
          height: 80px;
          flex-shrink: 0;
          border-radius: var(--radius-md);
          overflow: hidden;
          background: var(--color-nude-light);
          cursor: pointer;
          border: 2px solid transparent;
          transition: all var(--transition-fast);
          padding: 0;
          position: relative;
        }

        .product-thumb:hover {
          border-color: var(--color-brown);
        }

        .product-thumb.active {
          border-color: var(--color-coral);
        }

        .product-thumb img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .video-thumb {
          position: relative;
        }

        .video-play-overlay {
          position: absolute;
          inset: 0;
          background: rgba(0, 0, 0, 0.4);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
        }

        .product-main-image {
          flex: 1;
          aspect-ratio: 3 / 4;
          border-radius: var(--radius-xl);
          overflow: hidden;
          background: var(--color-nude-light);
          border: 2px solid var(--color-coral);
        }

        .product-main-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        /* Video Modal */
        .video-modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.85);
          z-index: 200;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: var(--space-4);
        }

        .video-modal {
          position: relative;
          width: 100%;
          max-width: 900px;
          background: black;
          border-radius: var(--radius-xl);
          overflow: hidden;
        }

        .video-close-btn {
          position: absolute;
          top: var(--space-4);
          right: var(--space-4);
          z-index: 10;
          background: rgba(255, 255, 255, 0.2);
          border: none;
          color: white;
          padding: var(--space-2);
          border-radius: var(--radius-full);
          cursor: pointer;
          transition: background var(--transition-fast);
        }

        .video-close-btn:hover {
          background: rgba(255, 255, 255, 0.3);
        }

        .video-player {
          width: 100%;
          display: block;
        }

        .product-thumbs {
          display: none;
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
          color: var(--color-brown-dark);
          margin-bottom: var(--space-6);
          display: flex;
          align-items: center;
          gap: var(--space-3);
        }

        .original-price {
          text-decoration: line-through;
          color: var(--color-text-muted);
          font-size: 1.125rem;
        }

        .express-price {
          color: var(--color-coral);
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
          padding: var(--space-2) var(--space-3);
          background: none;
          border: 2px solid var(--color-nude-light);
          border-radius: var(--radius-md);
          font-family: 'Quicksand', sans-serif;
          color: var(--color-brown);
          cursor: pointer;
          transition: all var(--transition-fast);
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 2px;
        }

        .size-label {
          font-weight: 700;
          font-size: 1rem;
        }

        .size-range {
          font-size: 0.625rem;
          font-weight: 500;
          opacity: 0.8;
          white-space: nowrap;
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

        .add-to-cart-btn.disabled {
          background: var(--color-nude);
          cursor: not-allowed;
          transform: none;
        }

        .product-actions-container {
          display: flex;
          flex-direction: column;
          gap: var(--space-6);
          margin-bottom: var(--space-10);
        }

        .express-request-toggle {
          padding: var(--space-4);
          background: #FFF5F5;
          border: 1px dashed #FEB2B2;
          border-radius: var(--radius-lg);
        }

        .express-toggle-label {
          display: flex;
          gap: var(--space-3);
          cursor: pointer;
        }

        .express-toggle-label input {
          width: 20px;
          height: 20px;
          margin-top: 4px;
        }

        .express-toggle-title {
          font-weight: 700;
          color: #C53030;
          margin-bottom: 4px;
        }

        .express-toggle-desc {
          font-size: 0.875rem;
          color: #742A2A;
          line-height: 1.4;
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
    </div >
  );
};
