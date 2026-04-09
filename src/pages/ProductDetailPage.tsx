import React, { useState, useMemo } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ChevronLeft, ShoppingBag, Plus, Minus, Sparkles, Truck, Play, X, CheckCircle2 } from 'lucide-react';
import { m, AnimatePresence } from 'framer-motion';
import { ProductCard } from '../components/ProductCard';
import { useStore, formatPrice, getProductPrice } from '../data/store';
import { CartItem } from '../types';
import { SizeGuideModal } from '../components/SizeGuideModal';
import { OptimizedImage } from '../components/OptimizedImage';
import { SEOHead } from '../components/SEOHead';
import { ProductJsonLd } from '../components/ProductJsonLd';
import './ProductDetailPage.css';

export const ProductDetailPage: React.FC = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { products, addToCart, currency } = useStore();
  const product = products.find(p => p.slug === slug);

  // Recommendations: Other products in same category
  const recommendations = useMemo(() => {
    if (!product) return [];
    return products
      .filter(p => p.categoryId === product.categoryId && p.id !== product.id)
      .slice(0, 4);
  }, [products, product]);

  // Combine main images with gallery images
  const allImages = product ? [...product.images, ...(product.galleryImages || [])] : [];

  const [selectedImage, setSelectedImage] = useState(0);
  const [isVideoOpen, setIsVideoOpen] = useState(false);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState(product?.colors[0]?.name || '');
  const [qty, setQty] = useState(1);
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);
  const [isExpress, setIsExpress] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);

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
        <SEOHead title="Product Not Found" noindex={true} path={`/product/${slug}`} />
        <p>Product not found.</p>
        <button onClick={() => navigate('/shop')}>Back to Shop</button>
      </div>
    );
  }

  const productDescription = product.description?.slice(0, 160) || `Shop ${product.name} from TÉFA. Premium handcrafted African fashion from Lagos, Nigeria.`;

  const handleAddToCart = () => {
    if (!selectedSize) {
      alert("Please select a size first.");
      return;
    }

    const { original, sale } = getProductPrice(product, 'NGN');
    const { original: originalUSD, sale: saleUSD } = getProductPrice(product, 'USD');

    const basePrice = sale || original;
    const basePriceUSD = saleUSD || originalUSD;

    const finalPrice = isExpress ? basePrice * 1.2 : basePrice;
    const finalPriceUSD = isExpress ? basePriceUSD * 1.2 : basePriceUSD;

    const item: CartItem = {
      productId: product.id,
      variantId: `${product.id}-${selectedSize}-${selectedColor}${isExpress ? '-express' : ''}`,
      name: product.name,
      price: finalPrice,
      priceUSD: finalPriceUSD,
      qty,
      selectedSize,
      selectedColor,
      image: product.images[0],
      slug: product.slug,
      isExpress,
    };
    addToCart(item);
    setShowSuccessToast(true);
    // Auto hide after 5 seconds
    setTimeout(() => setShowSuccessToast(false), 5000);
  };

  const handleDirectChat = () => {
    if (!selectedSize) {
      alert("Please select a size first.");
      return;
    }
    const msg = encodeURIComponent(
      `Hi TÉFA! I want to order the ${product.name} (Size: ${selectedSize}, Color: ${selectedColor}). Is it available?`
    );
    window.open(`https://wa.me/2348135407871?text=${msg}`, '_blank');
  };

  return (
    <div className="product-detail">
      <SEOHead
        title={product.name}
        description={productDescription}
        path={`/product/${slug}`}
        image={product.images[0]}
        type="product"
      />
      <ProductJsonLd product={product} slug={slug || ''} />
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
                  <OptimizedImage src={img} alt={`${product.name} view ${i + 1}`} sizes="80px" quality={60} />
                </button>
              ))}
              {/* Video Thumbnail */}
              {product.videoUrl && (
                <button
                  className="product-thumb video-thumb"
                  onClick={() => setIsVideoOpen(true)}
                >
                  <OptimizedImage src={allImages[0] || product.images[0]} alt="Video" sizes="80px" quality={60} />
                  <div className="video-play-overlay">
                    <Play size={24} fill="white" />
                  </div>
                </button>
              )}
            </div>

            {/* Main Image */}
            <div className="product-main-image">
              <OptimizedImage
                src={allImages[selectedImage] || product.images[0]}
                alt={product.name}
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
                quality={85}
              />
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
              {(() => {
                const { original, sale } = getProductPrice(product, currency);
                const priceToWeight = sale || original;

                if (isExpress) {
                  return (
                    <>
                      <span className="original-price">{formatPrice({ amount: priceToWeight }, currency)}</span>
                      <span className="express-price">
                        {formatPrice({ amount: priceToWeight * 1.2 }, currency)}
                        <span className="express-tag"> (Express +20%)</span>
                      </span>
                    </>
                  );
                }

                return sale ? (
                  <>
                    <span className="original-price-strike">{formatPrice({ amount: original }, currency)}</span>
                    <span className="sale-price-large">{formatPrice({ amount: sale }, currency)}</span>
                    <span className="sale-badge-large">
                      {Math.round(((original - sale) / original) * 100)}% OFF
                    </span>
                  </>
                ) : (
                  formatPrice({ amount: original }, currency)
                );
              })()}
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
                  {product.soldOut ? (isExpress ? 'Add Express Request' : 'Sold Out') : 'Add to Cart'}
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

      {/* Recommendations Section */}
      {recommendations.length > 0 && (
        <section className="product-recommendations section">
          <div className="container">
            <h2 className="recommendations-title">You May Also Like</h2>
            <div className="recommendations-grid">
              {recommendations.map(rp => (
                <ProductCard key={rp.id} product={rp} />
              ))}
            </div>
          </div>
        </section>
      )}

      <SizeGuideModal
        isOpen={isSizeGuideOpen}
        onClose={() => setIsSizeGuideOpen(false)}
      />

      {/* Success Notification Toast */}
      <AnimatePresence>
        {showSuccessToast && (
          <m.div
            initial={{ opacity: 0, y: 50, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: 20, x: '-50%' }}
            className="add-success-toast"
          >
            <div className="toast-content">
              <CheckCircle2 className="toast-icon" size={20} />
              <div className="toast-text">
                <span className="toast-product-name">{product.name}</span> has been added to your cart
              </div>
              <Link to="/cart" className="toast-view-cart-btn">
                View Cart
              </Link>
              <button
                onClick={() => setShowSuccessToast(false)}
                className="toast-close"
              >
                <X size={16} />
              </button>
            </div>
          </m.div>
        )}
      </AnimatePresence>
    </div>
  );
};
