import React from 'react';
import { ShoppingBag, X, Trash2, Plus, Minus, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { CartItem, CurrencyCode } from '../types';
import { formatPrice } from '../data/store';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  currency: CurrencyCode;
  onUpdateQty: (variantId: string, delta: number) => void;
  onRemove: (variantId: string) => void;
  onCheckout: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  items,
  currency,
  onUpdateQty,
  onRemove,
  onCheckout
}) => {
  const total = items.reduce((sum, item) => sum + (item.price * item.qty), 0);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="cart-overlay"
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="cart-drawer"
          >
            {/* Header */}
            <div className="cart-header">
              <h2 className="cart-title">
                <ShoppingBag size={20} /> Inquiry Cart
              </h2>
              <button onClick={onClose} className="cart-close">
                <X size={24} />
              </button>
            </div>

            {/* Items */}
            <div className="cart-items">
              {items.length === 0 ? (
                <div className="cart-empty">
                  <ShoppingBag size={48} />
                  <p>Your inquiry cart is empty.</p>
                  <button onClick={onClose} className="cart-empty-btn">
                    Start Browsing
                  </button>
                </div>
              ) : (
                items.map(item => (
                  <div key={item.variantId} className="cart-item">
                    <div className="cart-item-image">
                      <img src={item.image} alt={item.name} />
                    </div>
                    <div className="cart-item-content">
                      <div className="cart-item-header">
                        <h4 className="cart-item-name">{item.name}</h4>
                        <button
                          onClick={() => onRemove(item.variantId)}
                          className="cart-item-remove"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                      <p className="cart-item-variant">
                        Size: {item.selectedSize} | Color: {item.selectedColor}
                      </p>
                      {item.isExpress && (
                        <div className="cart-item-express">
                          ✨ Express Production (14 days)
                        </div>
                      )}
                      <p className="cart-item-price">{formatPrice(item.price, currency)}</p>
                      <div className="cart-item-qty">
                        <button onClick={() => onUpdateQty(item.variantId, -1)}>
                          <Minus size={14} />
                        </button>
                        <span>{item.qty}</span>
                        <button onClick={() => onUpdateQty(item.variantId, 1)}>
                          <Plus size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="cart-footer">
                <div className="cart-total">
                  <span>Subtotal</span>
                  <span className="cart-total-amount">{formatPrice(total, currency)}</span>
                </div>
                <button onClick={onCheckout} className="cart-checkout-btn">
                  Confirm Inquiry <ArrowRight size={18} />
                </button>
                <p className="cart-footer-note">
                  Orders are finalized via Instagram or WhatsApp
                </p>
              </div>
            )}
          </motion.div>

          <style>{`
            .cart-overlay {
              position: fixed;
              inset: 0;
              background: rgba(0, 0, 0, 0.3);
              backdrop-filter: blur(2px);
              z-index: 100;
            }

            .cart-drawer {
              position: fixed;
              top: 0;
              right: 0;
              bottom: 0;
              width: 100%;
              max-width: 420px;
              background: var(--color-cream);
              z-index: 110;
              display: flex;
              flex-direction: column;
              box-shadow: -10px 0 40px rgba(0, 0, 0, 0.1);
            }

            .cart-header {
              padding: var(--space-6);
              border-bottom: 1px solid var(--color-nude-light);
              display: flex;
              justify-content: space-between;
              align-items: center;
            }

            .cart-title {
              font-family: 'Cormorant Garamond', serif;
              font-size: 1.25rem;
              font-weight: 600;
              font-style: italic;
              color: var(--color-brown-dark);
              display: flex;
              align-items: center;
              gap: var(--space-2);
            }

            .cart-close {
              padding: var(--space-2);
              background: none;
              border: none;
              color: var(--color-brown);
              cursor: pointer;
              border-radius: var(--radius-full);
              transition: background var(--transition-fast);
            }

            .cart-close:hover {
              background: var(--color-nude-light);
            }

            .cart-items {
              flex: 1;
              overflow-y: auto;
              padding: var(--space-6);
            }

            .cart-empty {
              height: 100%;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              text-align: center;
              color: var(--color-text-muted);
            }

            .cart-empty svg {
              color: var(--color-nude);
              margin-bottom: var(--space-4);
            }

            .cart-empty p {
              margin-bottom: var(--space-4);
            }

            .cart-empty-btn {
              background: none;
              border: none;
              color: var(--color-coral);
              font-family: 'Quicksand', sans-serif;
              font-weight: 700;
              cursor: pointer;
            }

            .cart-empty-btn:hover {
              text-decoration: underline;
            }

            .cart-item {
              display: flex;
              gap: var(--space-4);
              margin-bottom: var(--space-6);
            }

            .cart-item-image {
              width: 96px;
              height: 128px;
              flex-shrink: 0;
              border-radius: var(--radius-md);
              overflow: hidden;
              background: var(--color-nude-light);
            }

            .cart-item-image img {
              width: 100%;
              height: 100%;
              object-fit: cover;
            }

            .cart-item-content {
              flex: 1;
              display: flex;
              flex-direction: column;
              justify-content: space-between;
            }

            .cart-item-header {
              display: flex;
              justify-content: space-between;
              align-items: flex-start;
            }

            .cart-item-name {
              font-family: 'Quicksand', sans-serif;
              font-size: 0.9375rem;
              font-weight: 700;
              color: var(--color-brown-dark);
            }

            .cart-item-remove {
              background: none;
              border: none;
              color: var(--color-text-muted);
              cursor: pointer;
              transition: color var(--transition-fast);
            }

            .cart-item-remove:hover {
              color: var(--color-coral);
            }

            .cart-item-variant {
              font-size: 0.8125rem;
              color: var(--color-text-muted);
              margin-bottom: var(--space-2);
            }

            .cart-item-express {
              display: inline-block;
              font-size: 0.75rem;
              font-weight: 700;
              color: #C53030;
              background: #FFF5F5;
              padding: 2px 8px;
              border-radius: var(--radius-sm);
              margin-bottom: var(--space-2);
            }

            .cart-item-price {
              font-weight: 700;
              color: var(--color-brown-dark);
              margin-bottom: var(--space-2);
            }

            .cart-item-qty {
              display: inline-flex;
              align-items: center;
              border: 1px solid var(--color-nude);
              border-radius: var(--radius-full);
              padding: var(--space-1);
              margin-top: var(--space-2);
            }

            .cart-item-qty button {
              padding: var(--space-1);
              background: none;
              border: none;
              color: var(--color-brown);
              cursor: pointer;
            }

            .cart-item-qty span {
              width: 32px;
              text-align: center;
              font-size: 0.875rem;
              font-weight: 600;
            }

            .cart-footer {
              padding: var(--space-6);
              border-top: 1px solid var(--color-nude-light);
              background: white;
            }

            .cart-total {
              display: flex;
              justify-content: space-between;
              align-items: center;
              margin-bottom: var(--space-4);
            }

            .cart-total span:first-child {
              color: var(--color-text-muted);
            }

            .cart-total-amount {
              font-size: 1.25rem;
              font-weight: 700;
              color: var(--color-brown-dark);
            }

            .cart-checkout-btn {
              width: 100%;
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

            .cart-checkout-btn:hover {
              background: var(--color-coral-dark);
              transform: translateY(-2px);
            }

            .cart-footer-note {
              margin-top: var(--space-4);
              font-size: 0.625rem;
              text-transform: uppercase;
              letter-spacing: 0.15em;
              text-align: center;
              color: var(--color-text-muted);
            }
          `}</style>
        </>
      )}
    </AnimatePresence>
  );
};
