import React, { useState } from 'react';
import { Instagram, MessageCircle } from 'lucide-react';
import { useStore, formatPrice } from '../data/store';
import { PageName, CustomerInfo } from '../types';

interface CheckoutPageProps {
    onNavigate: (page: PageName) => void;
}

export const CheckoutPage: React.FC<CheckoutPageProps> = ({ onNavigate }) => {
    const { cart } = useStore();
    const [formData, setFormData] = useState<CustomerInfo>({
        name: '',
        phone: '',
        location: '',
        note: ''
    });

    const total = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);

    const generateMessage = () => {
        let message = `Hi TÉFA! I'd like to place an order:\n\n`;
        cart.forEach((item, idx) => {
            message += `${idx + 1}) ${item.name}\n   Size: ${item.selectedSize}\n   Color: ${item.selectedColor}\n   Qty: ${item.qty}\n   Price: ${formatPrice(item.price * item.qty)}\n\n`;
        });
        message += `Total Estimate: ${formatPrice(total)}\n\n`;
        message += `Customer Info:\n`;
        message += `- Name: ${formData.name || 'Not provided'}\n`;
        message += `- Location: ${formData.location || 'Not provided'}\n`;
        if (formData.note) message += `- Notes: ${formData.note}\n`;
        message += `\nPlease confirm availability and payment details.`;
        return message;
    };

    const handleSendWhatsApp = () => {
        const encoded = encodeURIComponent(generateMessage());
        window.open(`https://wa.me/2340000000000?text=${encoded}`, '_blank');
    };

    const handleSendInstagram = () => {
        navigator.clipboard.writeText(generateMessage());
        alert("Order summary copied to clipboard! Redirecting to Instagram...");
        window.open(`https://instagram.com/tefa_africana/`, '_blank');
    };

    if (cart.length === 0) {
        return (
            <div className="checkout-empty">
                <p>Your cart is empty.</p>
                <button onClick={() => onNavigate('shop')}>Back to Shop</button>
                <style>{`
          .checkout-empty {
            padding-top: 160px;
            text-align: center;
          }
          .checkout-empty p {
            color: var(--color-text-muted);
            margin-bottom: var(--space-4);
          }
          .checkout-empty button {
            background: none;
            border: none;
            color: var(--color-coral);
            font-weight: 700;
            cursor: pointer;
            text-decoration: underline;
          }
        `}</style>
            </div>
        );
    }

    return (
        <div className="checkout-page">
            <div className="checkout-container">
                <h1>Confirm Your Inquiry</h1>

                {/* Order Summary */}
                <div className="checkout-card">
                    <h3>
                        <span className="step-badge orange">1</span>
                        Order Summary
                    </h3>
                    <div className="order-items">
                        {cart.map(item => (
                            <div key={item.variantId} className="order-item">
                                <span>{item.name} (x{item.qty})</span>
                                <span className="order-item-price">{formatPrice(item.price * item.qty)}</span>
                            </div>
                        ))}
                        <div className="order-total">
                            <span>Estimated Total</span>
                            <span>{formatPrice(total)}</span>
                        </div>
                    </div>
                </div>

                {/* Customer Details */}
                <div className="checkout-card">
                    <h3>
                        <span className="step-badge coral">2</span>
                        Your Details (Optional)
                    </h3>
                    <div className="checkout-form">
                        <div className="form-row">
                            <input
                                type="text"
                                placeholder="Full Name"
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                            />
                            <input
                                type="text"
                                placeholder="Phone Number"
                                value={formData.phone}
                                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                            />
                        </div>
                        <input
                            type="text"
                            placeholder="Delivery City/Country"
                            value={formData.location}
                            onChange={e => setFormData({ ...formData, location: e.target.value })}
                        />
                        <textarea
                            placeholder="Special notes or questions..."
                            rows={3}
                            value={formData.note}
                            onChange={e => setFormData({ ...formData, note: e.target.value })}
                        />
                    </div>
                </div>

                {/* Send Inquiry */}
                <div className="checkout-send">
                    <div className="send-header">
                        <h3>Ready to order?</h3>
                        <p>Choose your preferred channel to send this inquiry.</p>
                    </div>
                    <div className="send-buttons">
                        <button onClick={handleSendWhatsApp} className="whatsapp-btn">
                            <MessageCircle size={20} /> Send on WhatsApp
                        </button>
                        <button onClick={handleSendInstagram} className="instagram-btn">
                            <Instagram size={20} /> Send on Instagram
                        </button>
                    </div>
                    <p className="send-note">Payments are arranged privately after confirmation.</p>
                </div>
            </div>

            <style>{`
        .checkout-page {
          padding-top: 120px;
          padding-bottom: var(--space-24);
        }

        .checkout-container {
          max-width: 680px;
          margin: 0 auto;
          padding: 0 var(--space-4);
        }

        .checkout-container h1 {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(2rem, 4vw, 2.5rem);
          font-weight: 700;
          font-style: italic;
          margin-bottom: var(--space-8);
        }

        .checkout-card {
          background: white;
          padding: var(--space-8);
          border-radius: var(--radius-xl);
          border: 1px solid var(--color-nude-light);
          margin-bottom: var(--space-6);
          box-shadow: var(--shadow-sm);
        }

        .checkout-card h3 {
          font-family: 'Cormorant Garamond', serif;
          font-size: 1.25rem;
          font-weight: 600;
          font-style: italic;
          display: flex;
          align-items: center;
          gap: var(--space-3);
          margin-bottom: var(--space-6);
        }

        .step-badge {
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          color: white;
          font-family: 'Quicksand', sans-serif;
          font-size: 0.75rem;
          font-weight: 700;
          font-style: normal;
        }

        .step-badge.orange {
          background: var(--color-nude);
        }

        .step-badge.coral {
          background: var(--color-coral);
        }

        .order-items {
          display: flex;
          flex-direction: column;
          gap: var(--space-3);
        }

        .order-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 0.9375rem;
        }

        .order-item-price {
          font-weight: 700;
        }

        .order-total {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-top: var(--space-4);
          border-top: 1px solid var(--color-nude-light);
          margin-top: var(--space-3);
          font-family: 'Cormorant Garamond', serif;
          font-size: 1.25rem;
          font-weight: 700;
          font-style: italic;
        }

        .checkout-form {
          display: flex;
          flex-direction: column;
          gap: var(--space-4);
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr;
          gap: var(--space-4);
        }

        @media (min-width: 640px) {
          .form-row {
            grid-template-columns: 1fr 1fr;
          }
        }

        .checkout-form input,
        .checkout-form textarea {
          width: 100%;
          padding: var(--space-4);
          background: var(--color-cream-dark);
          border: 2px solid transparent;
          border-radius: var(--radius-md);
          font-family: 'Quicksand', sans-serif;
          font-size: 1rem;
          color: var(--color-text);
          outline: none;
          transition: all var(--transition-fast);
        }

        .checkout-form input:focus,
        .checkout-form textarea:focus {
          background: white;
          border-color: var(--color-coral);
        }

        .checkout-form input::placeholder,
        .checkout-form textarea::placeholder {
          color: var(--color-text-muted);
        }

        .checkout-form textarea {
          resize: vertical;
        }

        .checkout-send {
          background: var(--color-brown-dark);
          color: white;
          padding: var(--space-8);
          border-radius: var(--radius-xl);
          text-align: center;
        }

        .send-header {
          margin-bottom: var(--space-6);
        }

        .send-header h3 {
          font-family: 'Cormorant Garamond', serif;
          font-size: 1.5rem;
          font-weight: 600;
          font-style: italic;
          color: white;
          margin-bottom: var(--space-2);
        }

        .send-header p {
          color: rgba(255, 255, 255, 0.6);
          font-size: 0.9375rem;
        }

        .send-buttons {
          display: grid;
          grid-template-columns: 1fr;
          gap: var(--space-4);
          margin-bottom: var(--space-4);
        }

        @media (min-width: 640px) {
          .send-buttons {
            grid-template-columns: 1fr 1fr;
          }
        }

        .whatsapp-btn,
        .instagram-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: var(--space-2);
          padding: var(--space-5);
          border: none;
          border-radius: var(--radius-xl);
          font-family: 'Quicksand', sans-serif;
          font-size: 1rem;
          font-weight: 700;
          color: white;
          cursor: pointer;
          transition: opacity var(--transition-fast);
        }

        .whatsapp-btn:hover,
        .instagram-btn:hover {
          opacity: 0.9;
        }

        .whatsapp-btn {
          background: #25D366;
        }

        .instagram-btn {
          background: linear-gradient(135deg, #f9ce34, #ee2a7b, #6228d7);
        }

        .send-note {
          font-size: 0.625rem;
          text-transform: uppercase;
          letter-spacing: 0.2em;
          color: rgba(255, 255, 255, 0.4);
        }
      `}</style>
        </div>
    );
};
