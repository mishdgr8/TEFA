import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Instagram, MessageCircle, CreditCard, ArrowLeft, ShieldCheck, CheckCircle, Smartphone } from 'lucide-react';
import { useStore, formatPrice } from '../data/store';
import { CustomerInfo, CURRENCIES } from '../types';
import { SEOHead } from '../components/SEOHead';
import { PaymentWrapper } from '../components/PaymentWrapper';

export const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const { cart, currency, clearCart } = useStore();
  const [formData, setFormData] = useState<CustomerInfo>({
    name: '',
    email: '',
    phone: '',
    location: '',
    note: ''
  });

  const [showPayment, setShowPayment] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState<{ code: string, amount: number } | null>(null);

  const currentCurrency = CURRENCIES.find(c => c.code === currency);
  const rate = currentCurrency?.rate || 1;

  const subtotal = cart.reduce((acc, item) => {
    // If USD, use priceUSD or fall back to converted price
    const itemPrice = currency === 'USD' ? (item.priceUSD || (item.price * rate)) : item.price;
    return acc + (itemPrice * (item.qty || 1));
  }, 0);

  // Convert discount amount if needed
  const discountAmount = appliedDiscount ? (currency === 'USD' ? (appliedDiscount.amount * rate) : appliedDiscount.amount) : 0;
  const total = subtotal - discountAmount;

  if (cart.length === 0 && !isSuccess) {
    return (
      <div className="empty-checkout">
        <SEOHead title="Checkout | TÉFA" description="Complete your order." />
        <h1>Your bag is empty</h1>
        <button onClick={() => navigate('/shop')}>Return to Shop</button>
        <style>{`
          .empty-checkout {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            min-height: 60vh;
            padding-top: 100px;
          }
          .empty-checkout h1 {
            font-family: 'Cormorant Garamond', serif;
            font-size: 2.5rem;
            margin-bottom: 2rem;
            font-style: italic;
          }
          .empty-checkout button {
            background: #1a1a1a;
            color: white;
            padding: 1rem 2rem;
            border-radius: 40px;
            border: none;
            cursor: pointer;
            font-weight: 600;
          }
        `}</style>
      </div>
    );
  }

  const handleSendWhatsApp = () => {
    const text = encodeURIComponent(`New Inquiry from TÉFA Site:\n\nCustomer: ${formData.name}\nEmail: ${formData.email}\nItems:\n${cart.map(i => `- ${i.name} (x${i.qty})`).join('\n')}\nTotal: ${formatPrice(total)}\nNotes: ${formData.note}`);
    window.open(`https://wa.me/2349000000000?text=${text}`, '_blank');
  };

  const handleSendInstagram = () => {
    window.open('https://instagram.com/tefaofficial', '_blank');
  };

  return (
    <div className="checkout-page">
      <SEOHead title="Checkout | TÉFA" description="Secure your pieces from the latest collection." />

      <div className="checkout-container">
        <header className="checkout-header">
          <button onClick={() => navigate(-1)} className="back-link">
            <ArrowLeft size={16} /> Back to Shop
          </button>
          <h1>Secure Your Pieces</h1>
          <p className="subtitle">Finalize your selection and secure your order.</p>
        </header>

        {!isSuccess ? (
          <div className="checkout-layout">
            {/* Left Column: Form & Payment */}
            <div className="checkout-main">
              <section className="checkout-section">
                <div className="section-title">
                  <span className="step">1</span>
                  <h2>Delivery Details</h2>
                </div>
                <div className="form-grid">
                  <div className="input-group full">
                    <label>Email Address (Required for receipt)</label>
                    <input
                      type="email"
                      placeholder="e.g. grace@example.com"
                      value={formData.email}
                      onChange={e => setFormData({ ...formData, email: e.target.value })}
                      required
                    />
                  </div>
                  <div className="input-group">
                    <label>Full Name</label>
                    <input
                      type="text"
                      placeholder="Enter your name"
                      value={formData.name}
                      onChange={e => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>
                  <div className="input-group">
                    <label>Phone Number</label>
                    <input
                      type="text"
                      placeholder="+234..."
                      value={formData.phone}
                      onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </div>
                  <div className="input-group full">
                    <label>Delivery City & Country</label>
                    <input
                      type="text"
                      placeholder="e.g. Lagos, Nigeria"
                      value={formData.location}
                      onChange={e => setFormData({ ...formData, location: e.target.value })}
                    />
                  </div>
                  <div className="input-group full">
                    <label>Special Notes (Optional)</label>
                    <textarea
                      placeholder="Size adjustments, delivery instructions, etc."
                      rows={3}
                      value={formData.note}
                      onChange={e => setFormData({ ...formData, note: e.target.value })}
                    />
                  </div>
                </div>
              </section>

              <section className="checkout-section payment-box">
                {!showPayment ? (
                  <div className="payment-options">
                    <button
                      className="primary-pay-btn"
                      onClick={() => {
                        if (!formData.email) {
                          alert("Please provide an email address for payment.");
                          return;
                        }
                        setShowPayment(true);
                      }}
                    >
                      <CreditCard size={20} />
                      Pay Instantly via Card
                    </button>

                    <div className="separator">
                      <span>OR CHOOSE AN INQUIRY CHANNEL</span>
                    </div>

                    <div className="inquiry-grid">
                      <button onClick={handleSendWhatsApp} className="inquiry-btn wa">
                        <MessageCircle size={18} /> WhatsApp
                      </button>
                      <button onClick={handleSendInstagram} className="inquiry-btn ig">
                        <Instagram size={18} /> Instagram
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="paystack-interface">
                    <div className="interface-header">
                      <button onClick={() => setShowPayment(false)} className="back-sm">
                        <ArrowLeft size={14} /> Change Method
                      </button>
                      <h3>Secure Checkout</h3>
                    </div>
                    <PaymentWrapper
                      email={formData.email}
                      customerName={formData.name || 'TÉFA Customer'}
                      total={total}
                      cart={cart}
                      customerInfo={formData}
                      onSuccess={(ref) => {
                        console.log('Payment Successful:', ref);
                        clearCart();
                        setIsSuccess(true);
                      }}
                      onClose={() => setShowPayment(false)}
                    />
                    <div className="security-footer">
                      <ShieldCheck size={12} />
                      PCI-DSS Compliant Encryption
                    </div>
                  </div>
                )}
              </section>
            </div>

            {/* Right Column: Order Summary */}
            <aside className="checkout-sidebar">
              <div className="summary-card">
                <h3>Order Summary</h3>
                <div className="summary-items">
                  {cart.map(item => {
                    const itemPrice = currency === 'USD' ? (item.priceUSD || (item.price * rate)) : item.price;
                    return (
                      <div key={item.variantId} className="summary-item">
                        <div className="item-info">
                          <span className="item-name">{item.name}</span>
                          <span className="item-qty">Qty: {item.qty}</span>
                        </div>
                        <span className="item-price">{formatPrice({ amount: itemPrice * (item.qty || 1) }, currency)}</span>
                      </div>
                    );
                  })}
                </div>

                <div className="summary-totals">
                  <div className="total-row">
                    <span>Subtotal</span>
                    <span>{formatPrice({ amount: subtotal }, currency)}</span>
                  </div>
                  {appliedDiscount && (
                    <div className="total-row discount">
                      <span>Discount ({appliedDiscount.code})</span>
                      <span>-{formatPrice({ amount: discountAmount }, currency)}</span>
                    </div>
                  )}
                  <div className="total-row grand-total">
                    <span>Grand Total</span>
                    <span>{formatPrice({ amount: total }, currency)}</span>
                  </div>
                </div>

                <p className="delivery-note">
                  * Shipping rates will be updated via email/WhatsApp based on your location.
                </p>
              </div>
            </aside>
          </div>
        ) : (
          <div className="success-screen">
            <CheckCircle size={64} className="success-icon" />
            <h2>Order Secured Successfully!</h2>
            <p>Thank you for choosing TÉFA. We've sent a detailed receipt to <strong>{formData.email}</strong>. Our team will contact you shortly regarding delivery.</p>
            <button onClick={() => navigate('/shop')} className="return-btn">Return to Collections</button>
          </div>
        )}
      </div>

      <style>{`
        .checkout-page {
          background-color: #fdfaf7;
          min-height: 100vh;
          padding: 100px 24px 80px;
          color: #1a1a1a;
        }

        .checkout-container {
          max-width: 1100px;
          margin: 0 auto;
        }

        .checkout-header {
          margin-bottom: 48px;
        }

        .back-link {
          background: none;
          border: none;
          color: #666;
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          margin-bottom: 24px;
          font-family: 'Quicksand', sans-serif;
          font-weight: 600;
          font-size: 0.9rem;
        }

        .checkout-header h1 {
          font-family: 'Cormorant Garamond', serif;
          font-size: 3rem;
          font-weight: 700;
          font-style: italic;
          margin-bottom: 8px;
          line-height: 1.1;
        }

        .subtitle {
          color: #888;
          font-size: 1.1rem;
        }

        .checkout-layout {
          display: grid;
          grid-template-columns: 1fr 380px;
          gap: 48px;
          align-items: start;
        }

        @media (max-width: 900px) {
          .checkout-layout {
            grid-template-columns: 1fr;
          }
          .checkout-sidebar {
            order: -1;
          }
        }

        .checkout-section {
          background: white;
          border-radius: 24px;
          padding: 32px;
          margin-bottom: 24px;
          border: 1px solid #eee;
          box-shadow: 0 4px 20px rgba(0,0,0,0.02);
        }

        .section-title {
          display: flex;
          align-items: center;
          gap: 16px;
          margin-bottom: 32px;
        }

        .step {
          width: 32px;
          height: 32px;
          background: #c69b7b;
          color: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 0.8rem;
        }

        .section-title h2 {
          font-family: 'Cormorant Garamond', serif;
          font-size: 1.6rem;
          font-weight: 600;
          font-style: italic;
        }

        .form-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }

        .input-group.full {
          grid-column: span 2;
        }

        @media (max-width: 600px) {
          .input-group { grid-column: span 2; }
          .form-grid { grid-template-columns: 1fr; }
        }

        .input-group label {
          display: block;
          font-size: 0.8rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: 8px;
          color: #999;
        }

        .input-group input, 
        .input-group textarea {
          width: 100%;
          padding: 14px 18px;
          background: #f9f9f9;
          border: 1px solid #eee;
          border-radius: 12px;
          font-family: 'Quicksand', sans-serif;
          font-size: 1rem;
          transition: border-color 0.2s, background 0.2s;
        }

        .input-group input:focus, 
        .input-group textarea:focus {
          outline: none;
          background: white;
          border-color: #c69b7b;
        }

        .payment-box {
          border-top: 4px solid #c69b7b;
          text-align: center;
        }

        .primary-pay-btn {
          width: 100%;
          background: #1a1a1a;
          color: white;
          padding: 20px;
          border-radius: 16px;
          border: none;
          font-weight: 700;
          font-size: 1.1rem;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          cursor: pointer;
          transition: transform 0.2s;
        }

        .primary-pay-btn:hover {
          transform: translateY(-2px);
          background: #000;
        }

        .separator {
          display: flex;
          align-items: center;
          gap: 16px;
          margin: 32px 0;
        }

        .separator::before, 
        .separator::after {
          content: "";
          flex: 1;
          height: 1px;
          background: #eee;
        }

        .separator span {
          font-size: 0.7rem;
          font-weight: 800;
          color: #bbb;
          letter-spacing: 0.1em;
        }

        .inquiry-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }

        .inquiry-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 16px;
          border-radius: 12px;
          border: 1px solid #eee;
          font-weight: 700;
          cursor: pointer;
          background: white;
          transition: all 0.2s;
        }

        .inquiry-btn.wa { color: #25D366; }
        .inquiry-btn.ig { color: #E4405F; }
        .inquiry-btn:hover { background: #fdfdfd; border-color: #ddd; }

        .summary-card {
          background: white;
          border-radius: 24px;
          padding: 32px;
          border: 1px solid #eee;
          position: sticky;
          top: 100px;
        }

        .summary-card h3 {
          font-family: 'Cormorant Garamond', serif;
          font-size: 1.6rem;
          font-style: italic;
          margin-bottom: 24px;
          border-bottom: 1px solid #eee;
          padding-bottom: 16px;
        }

        .summary-item {
          display: flex;
          justify-content: space-between;
          margin-bottom: 16px;
        }

        .item-info {
          display: flex;
          flex-direction: column;
        }

        .item-name { font-weight: 600; font-size: 0.95rem; }
        .item-qty { font-size: 0.8rem; color: #888; }
        .item-price { font-weight: 700; font-family: 'Quicksand', sans-serif; }

        .summary-totals {
          margin-top: 32px;
          padding-top: 24px;
          border-top: 2px dashed #eee;
        }

        .total-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 12px;
          font-size: 0.9rem;
        }

        .grand-total {
          font-size: 1.4rem;
          font-weight: 800;
          color: #c69b7b;
          margin-top: 12px;
        }

        .delivery-note {
          font-size: 0.75rem;
          color: #999;
          margin-top: 24px;
          line-height: 1.5;
        }

        .success-screen {
          background: white;
          padding: 80px 40px;
          border-radius: 32px;
          text-align: center;
          box-shadow: 0 10px 40px rgba(0,0,0,0.05);
        }

        .success-icon {
          color: #22c55e;
          margin-bottom: 24px;
        }

        .success-screen h2 {
          font-family: 'Cormorant Garamond', serif;
          font-size: 2.5rem;
          margin-bottom: 16px;
        }

        .success-screen p { color: #666; max-width: 500px; margin: 0 auto 40px; }

        .return-btn {
          background: #c69b7b;
          color: white;
          padding: 18px 36px;
          border-radius: 40px;
          border: none;
          font-weight: 700;
          cursor: pointer;
        }

        .interface-header {
          display: flex;
          align-items: center;
          gap: 16px;
          margin-bottom: 24px;
        }

        .interface-header h3 { font-family: 'Cormorant Garamond', serif; font-size: 1.4rem; }

        .back-sm {
          background: none;
          border: none;
          color: #999;
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 0.8rem;
          cursor: pointer;
        }

        .security-footer {
          margin-top: 24px;
          font-size: 0.7rem;
          color: #bbb;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
        }
      `}</style>
    </div>
  );
};
