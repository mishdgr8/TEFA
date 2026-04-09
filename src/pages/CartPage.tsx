import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Minus, Plus, Trash2, ArrowLeft, ShoppingBag } from 'lucide-react';
import { useStore, formatPrice } from '../data/store';
import { OptimizedImage } from '../components/OptimizedImage';
import { SEOHead } from '../components/SEOHead';
import './CartPage.css';

export const CartPage: React.FC = () => {
    const navigate = useNavigate();
    const { cart, updateCartQty, removeFromCart, currency } = useStore();

    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);

    if (cart.length === 0) {
        return (
            <div className="cart-page empty">
                <SEOHead title="Your Cart" path="/cart" />
                <div className="container">
                    <div className="empty-cart-content">
                        <div className="empty-icon-circle">
                            <ShoppingBag size={48} />
                        </div>
                        <h1>Your cart is empty</h1>
                        <p>Looks like you haven't added anything to your cart yet.</p>
                        <button onClick={() => navigate('/shop')} className="shop-now-btn">
                            Start Shopping
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="cart-page">
            <SEOHead title="Your Shopping Cart" path="/cart" />
            <div className="container">
                <div className="cart-header">
                    <h1>Your Cart</h1>
                    <button onClick={() => navigate('/shop')} className="continue-shopping">
                        <ArrowLeft size={16} /> Continue Shopping
                    </button>
                </div>

                <div className="cart-layout">
                    <div className="cart-items">
                        <div className="items-header">
                            <span>Product</span>
                            <span>Price</span>
                            <span>Quantity</span>
                            <span>Total</span>
                        </div>

                        {cart.map((item) => (
                            <div key={item.variantId} className="cart-item">
                                <div className="item-info">
                                    <div className="item-image">
                                        <OptimizedImage src={item.image} alt={item.name} sizes="100px" />
                                    </div>
                                    <div className="item-details">
                                        <h3>{item.name}</h3>
                                        <p className="item-variant">
                                            Size: {item.selectedSize} | Color: {item.selectedColor}
                                            {item.isExpress && <span className="express-badge"> ✨ Express</span>}
                                        </p>
                                        <button
                                            onClick={() => removeFromCart(item.variantId)}
                                            className="remove-item-mobile"
                                        >
                                            Remove
                                        </button>
                                    </div>
                                </div>

                                <div className="item-price">
                                    {formatPrice({ amount: item.price }, currency)}
                                </div>

                                <div className="item-qty">
                                    <div className="qty-control">
                                        <button onClick={() => updateCartQty(item.variantId, Math.max(1, item.qty - 1))}>
                                            <Minus size={14} />
                                        </button>
                                        <span>{item.qty}</span>
                                        <button onClick={() => updateCartQty(item.variantId, item.qty + 1)}>
                                            <Plus size={14} />
                                        </button>
                                    </div>
                                </div>

                                <div className="item-total">
                                    {formatPrice({ amount: item.price * item.qty }, currency)}
                                    <button
                                        onClick={() => removeFromCart(item.variantId)}
                                        className="remove-item-desktop"
                                        title="Remove item"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="cart-summary-card">
                        <h2>Order Summary</h2>
                        <div className="summary-row">
                            <span>Subtotal</span>
                            <span>{formatPrice({ amount: subtotal }, currency)}</span>
                        </div>
                        <div className="summary-row">
                            <span>Shipping</span>
                            <span className="free">Calculated at checkout</span>
                        </div>
                        <div className="summary-total">
                            <span>Total</span>
                            <span>{formatPrice({ amount: subtotal }, currency)}</span>
                        </div>

                        <p className="exclusive-note">
                            Inclusive of all taxes and handcrafted with care in Lagos.
                        </p>

                        <button
                            onClick={() => navigate('/checkout')}
                            className="checkout-btn"
                        >
                            Proceed to Checkout
                        </button>

                        <div className="secure-checkout">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                                <path d="M7 11V7a5 5 0 0110 0v4" />
                            </svg>
                            Secure Checkout via Paystack
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
