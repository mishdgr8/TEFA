import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Instagram, MessageCircle, CreditCard, ArrowLeft, ShieldCheck, CheckCircle } from 'lucide-react';
import { useStore, formatPrice } from '../data/store';
import { CustomerInfo, CURRENCIES } from '../types';
import { SEOHead } from '../components/SEOHead';
import { PaymentWrapper } from '../components/PaymentWrapper';
import { SearchableDropdown } from '../components/SearchableDropdown';
import { COUNTRIES } from '../data/countries';

export const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const { cart, currency, clearCart, user } = useStore();

  const [isSuccess, setIsSuccess] = useState(false);

  // Initialize from sessionStorage or defaults
  const [formData, setFormData] = useState<CustomerInfo>(() => {
    try {
      const saved = sessionStorage.getItem('checkout_info');
      if (saved) return JSON.parse(saved);
    } catch (e) { }

    return {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      countryCode: '+234',
      city: '',
      country: '',
      address: '',
      postalCode: '',
      note: ''
    };
  });

  React.useEffect(() => {
    if (user && !formData.email && !formData.firstName) {
      setFormData(prev => ({
        ...prev,
        email: user.email || prev.email,
        firstName: (user.metadata?.first_name) || prev.firstName,
        lastName: (user.metadata?.last_name) || prev.lastName,
        phone: (user.metadata?.phone) || prev.phone,
        country: (user.metadata?.country) || prev.country
      }));
    }
  }, [user]);

  // Save to sessionStorage when it changes so they don't lose progress if they come back
  React.useEffect(() => {
    if (formData.email || formData.firstName) {
      sessionStorage.setItem('checkout_info', JSON.stringify(formData));
    }
  }, [formData]);

  const [showPayment, setShowPayment] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState<{ code: string, amount: number } | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'card'>('card');
  const [cardData, setCardData] = useState({
    number: '',
    expiry: '',
    cvv: '',
    name: '',
    useShippingAsBilling: true,
    saveInfo: false
  });

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
    const text = encodeURIComponent(`New Inquiry from TÉFA Site:\n\nCustomer: ${formData.firstName} ${formData.lastName}\nEmail: ${formData.email}\nPhone: ${formData.countryCode}${formData.phone}\nAddress: ${formData.address}, ${formData.city}, ${formData.country} ${formData.postalCode}\nItems:\n${cart.map(i => `- ${i.name} (x${i.qty})`).join('\n')}\nTotal: ${formatPrice(total)}\nNotes: ${formData.note}`);
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
                    <label>Email Address</label>
                    <input
                      type="email"
                      placeholder="e.g. grace@example.com"
                      value={formData.email}
                      onChange={e => setFormData({ ...formData, email: e.target.value })}
                      required
                    />
                  </div>
                  <div className="input-group">
                    <label>First Name</label>
                    <input
                      type="text"
                      placeholder="First Name"
                      value={formData.firstName}
                      onChange={e => setFormData({ ...formData, firstName: e.target.value })}
                    />
                  </div>
                  <div className="input-group">
                    <label>Last Name</label>
                    <input
                      type="text"
                      placeholder="Last Name"
                      value={formData.lastName}
                      onChange={e => setFormData({ ...formData, lastName: e.target.value })}
                    />
                  </div>
                  <div className="input-group full" style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '8px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <label>Code</label>
                      <SearchableDropdown
                        options={COUNTRIES.map(c => ({
                          label: c.dialCode ? c.dialCode : '',
                          value: c.dialCode,
                          icon: c.flag,
                          searchStr: `${c.name} ${c.dialCode}`
                        })).filter(c => c.value)} // ensure no empty dial code
                        value={formData.countryCode}
                        onChange={(val) => setFormData({ ...formData, countryCode: val })}
                        placeholder="Code"
                        searchPlaceholder="Search..."
                      />
                    </div>
                    <div>
                      <label>Phone Number</label>
                      <input
                        type="text"
                        placeholder="800 000 0000"
                        value={formData.phone}
                        onChange={e => setFormData({ ...formData, phone: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="input-group full">
                    <label>Address</label>
                    <input
                      type="text"
                      placeholder="123 Example Street, Apt 4B"
                      value={formData.address}
                      onChange={e => setFormData({ ...formData, address: e.target.value })}
                    />
                  </div>
                  <div className="input-group">
                    <label>City</label>
                    <input
                      type="text"
                      placeholder="e.g. Lagos"
                      value={formData.city}
                      onChange={e => setFormData({ ...formData, city: e.target.value })}
                    />
                  </div>
                  <div className="input-group">
                    <label>Postal Code / Zip Code</label>
                    <input
                      type="text"
                      placeholder="e.g. 100001"
                      value={formData.postalCode}
                      onChange={e => setFormData({ ...formData, postalCode: e.target.value })}
                    />
                  </div>
                  <div className="input-group full">
                    <label>Country</label>
                    <SearchableDropdown
                      options={COUNTRIES.map(c => ({
                        label: c.name,
                        value: c.name,
                        icon: c.flag,
                        searchStr: c.name
                      }))}
                      value={formData.country}
                      onChange={(val) => setFormData({ ...formData, country: val })}
                      placeholder="Select a country"
                      searchPlaceholder="Search country..."
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

              <section className="checkout-section payment-box" style={{ textAlign: 'left' }}>
                <div className="section-title">
                  <span className="step">2</span>
                  <h2>Payment</h2>
                </div>
                <p className="payment-helper">All transactions are secure and encrypted.</p>

                <div className="payment-methods-container">
                  <div className={`method-choice active`}>
                    <div className="method-header">
                      <div className="radio-group">
                        <div className="radio-outer checked">
                          <div className="radio-inner" />
                        </div>
                        <span className="method-label">Credit card</span>
                      </div>
                      <div className="card-icons">
                        <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" alt="Visa" style={{ height: '12px' }} />
                        <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" alt="Mastercard" style={{ height: '18px' }} />
                        <img src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg" alt="PayPal" style={{ height: '18px', opacity: 0.5, filter: 'grayscale(1)' }} />
                      </div>
                    </div>

                    <div className="card-form-nested">
                      <div className="card-input-wrapper">
                        <input
                          type="text"
                          placeholder="Card number"
                          value={cardData.number}
                          onChange={e => setCardData({ ...cardData, number: e.target.value })}
                        />
                        <ShieldCheck size={18} className="input-icon-right" />
                      </div>
                      <div className="card-row">
                        <input
                          type="text"
                          placeholder="Expiration date (MM / YY)"
                          value={cardData.expiry}
                          onChange={e => setCardData({ ...cardData, expiry: e.target.value })}
                        />
                        <div className="card-input-wrapper">
                          <input
                            type="text"
                            placeholder="Security code"
                            value={cardData.cvv}
                            onChange={e => setCardData({ ...cardData, cvv: e.target.value })}
                          />
                          <span className="info-icon">?</span>
                        </div>
                      </div>
                      <input
                        type="text"
                        placeholder="Name on card"
                        value={cardData.name}
                        onChange={e => setCardData({ ...cardData, name: e.target.value })}
                      />

                      <div className="checkbox-row" onClick={() => setCardData({ ...cardData, useShippingAsBilling: !cardData.useShippingAsBilling })}>
                        <div className={`custom-checkbox ${cardData.useShippingAsBilling ? 'checked' : ''}`}>
                          {cardData.useShippingAsBilling && <CheckCircle size={14} />}
                        </div>
                        <span>Use shipping address as billing address</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="action-row">
                  {!showPayment ? (
                    <button
                      className="review-order-btn"
                      onClick={() => {
                        if (!formData.email) { alert("Please provide an email."); return; }
                        setShowPayment(true);
                      }}
                    >
                      Review order
                    </button>
                  ) : (
                    <div className="paystack-active-container">
                      <div className="interface-header">
                        <button onClick={() => setShowPayment(false)} className="back-sm">
                          <ArrowLeft size={14} /> Back to details
                        </button>
                        <h3>Complete Transaction</h3>
                      </div>
                      <PaymentWrapper
                        email={formData.email}
                        customerName={(`${formData.firstName} ${formData.lastName}`).trim() || 'TÉFA Customer'}
                        total={total}
                        cart={cart}
                        customerInfo={formData}
                        userId={user?.uid}
                        onSuccess={(ref) => {
                          console.log('Payment Successful:', ref);
                          clearCart();
                          setIsSuccess(true);
                        }}
                        onClose={() => setShowPayment(false)}
                      />
                    </div>
                  )}
                </div>

                <div className="policy-footer">
                  <button>Refund policy</button>
                  <button>Shipping policy</button>
                  <button>Privacy policy</button>
                  <button>Terms of service</button>
                </div>
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
                        <div className="item-thumb">
                          <img src={item.image} alt={item.name} />
                          <span className="item-badge">{item.qty}</span>
                        </div>
                        <div className="item-info">
                          <span className="item-name">{item.name}</span>
                          <span className="item-meta">Size: {item.selectedSize} {item.selectedColor ? `| ${item.selectedColor}` : ''}</span>
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
        .input-group textarea,
        .input-group select {
          width: 100%;
          padding: 14px 18px;
          background: #f9f9f9;
          border: 1px solid #eee;
          border-radius: 12px;
          font-family: 'Quicksand', sans-serif;
          font-size: 1rem;
          transition: border-color 0.2s, background 0.2s;
          appearance: none;
        }

        .input-group input:focus, 
        .input-group textarea:focus,
        .input-group select:focus {
          outline: none;
          background: white;
          border-color: #c69b7b;
        }

        .payment-box {
          border-top: 4px solid #c69b7b;
        }

        .payment-helper {
          font-size: 0.85rem;
          color: #888;
          margin-bottom: 24px;
        }

        .payment-methods-container {
          border: 1px solid #ddd;
          border-radius: 12px;
          overflow: hidden;
          background: #f9f9f9;
        }

        .method-choice {
          border-bottom: 1px solid #ddd;
        }

        .method-choice:last-child {
          border-bottom: none;
        }

        .method-choice.active {
          background: #f4faff; /* Light blue tint for active */
          border: 2px solid #005bd3;
          margin: -1px;
          z-index: 1;
        }

        .method-header {
          padding: 18px 20px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          cursor: pointer;
        }

        .radio-group {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .radio-outer {
          width: 18px;
          height: 18px;
          border: 1px solid #ccc;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: white;
        }

        .radio-outer.checked {
          border-color: #005bd3;
          border-width: 5px;
        }

        .radio-inner {
          width: 6px;
          height: 6px;
          background: white;
          border-radius: 50%;
        }

        .method-label {
          font-weight: 600;
          font-size: 0.95rem;
        }

        .card-icons {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .card-form-nested {
          padding: 24px;
          background: #f4f8fb;
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .card-input-wrapper {
          position: relative;
          width: 100%;
        }

        .input-icon-right {
          position: absolute;
          right: 14px;
          top: 50%;
          transform: translateY(-50%);
          color: #aaa;
        }

        .info-icon {
          position: absolute;
          right: 14px;
          top: 50%;
          transform: translateY(-50%);
          color: #aaa;
          font-size: 1.2rem;
          cursor: pointer;
        }

        .card-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 14px;
        }

        .card-form-nested input {
          width: 100% !important;
          box-sizing: border-box !important;
          background: white !important;
          border: 1px solid #ddd !important;
          font-size: 1rem !important;
          padding: 14px 18px !important;
          border-radius: 12px !important;
          font-family: 'Quicksand', sans-serif !important;
          transition: border-color 0.2s !important;
        }

        .card-form-nested input:focus {
          outline: none !important;
          border-color: #c69b7b !important;
        }

        .checkbox-row {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-top: 8px;
          cursor: pointer;
          font-size: 0.9rem;
        }

        .custom-checkbox {
          width: 20px;
          height: 20px;
          border: 1px solid #ddd;
          border-radius: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: white;
          color: #005bd3;
        }

        .custom-checkbox.checked {
          background: #005bd3;
          border-color: #005bd3;
          color: white;
        }

        .save-info-section {
          margin-top: 40px;
        }

        .save-info-section h3 {
          font-size: 1.1rem;
          margin-bottom: 20px;
          font-weight: 600;
        }

        .save-card-box {
          border: 1px solid #ddd;
          border-radius: 12px;
          padding: 20px;
          background: white;
        }

        .phone-input-row {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .icon-box {
          color: #888;
        }

        .phone-col {
          flex: 1;
        }

        .phone-col label {
          font-size: 0.75rem;
          color: #888;
          display: block;
          margin-bottom: 4px;
        }

        .phone-col input {
          border: none;
          padding: 0;
          font-size: 1.1rem;
          font-weight: 600;
          background: transparent;
          width: 100%;
          outline: none;
        }

        .clear-btn {
          color: #005bd3;
          background: none;
          border: none;
          font-weight: 600;
          cursor: pointer;
        }

        .legal-text {
          font-size: 0.8rem;
          color: #888;
          margin-top: 16px;
          line-height: 1.5;
        }

        .review-order-btn {
          width: 100%;
          background: #005bd3;
          color: white;
          padding: 22px;
          border-radius: 12px;
          border: none;
          font-weight: 700;
          font-size: 1.2rem;
          margin-top: 40px;
          cursor: pointer;
          transition: background 0.2s;
        }

        .review-order-btn:hover {
          background: #004fb6;
        }

        .policy-footer {
          margin-top: 48px;
          display: flex;
          flex-wrap: wrap;
          gap: 20px;
          border-top: 1px solid #eee;
          padding-top: 24px;
        }

        .policy-footer button {
          background: none;
          border: none;
          color: #005bd3;
          font-size: 0.85rem;
          text-decoration: underline;
          cursor: pointer;
          padding: 0;
        }

        .paystack-active-container {
            margin-top: 32px;
            padding: 24px;
            background: #fff;
            border: 2px solid #eee;
            border-radius: 20px;
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

        /* ═══════════ ORDER SUMMARY SIDEBAR ═══════════ */
        .checkout-sidebar {
          position: sticky;
          top: 120px;
        }

        .summary-card {
          background: white;
          border: 1px solid #eee;
          border-radius: 24px;
          padding: 32px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.03);
        }

        .summary-card h3 {
          font-family: 'Cormorant Garamond', serif;
          font-size: 1.5rem;
          font-weight: 700;
          font-style: italic;
          margin-bottom: 24px;
          padding-bottom: 16px;
          border-bottom: 1px solid #eee;
        }

        .summary-items {
          display: flex;
          flex-direction: column;
          gap: 0;
        }

        .summary-item {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 12px 0;
          border-bottom: 1px solid #f5f5f5;
        }

        .summary-item:last-child {
          border-bottom: none;
        }

        .item-thumb {
          width: 64px;
          height: 64px;
          background: #f5f5f5;
          border-radius: 12px;
          border: 1px solid #eee;
          position: relative;
          flex-shrink: 0;
        }

        .item-thumb img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          border-radius: 12px;
        }

        .item-badge {
          position: absolute;
          top: -6px;
          right: -6px;
          background: #c69b7b;
          color: white;
          width: 22px;
          height: 22px;
          border-radius: 50%;
          font-size: 0.7rem;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          border: 2px solid white;
          z-index: 2;
        }

        .item-info {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 4px;
          min-width: 0;
        }

        .item-name {
          font-weight: 600;
          font-size: 0.95rem;
          font-family: 'Quicksand', sans-serif;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          color: #1a1a1a;
        }

        .item-meta {
          font-size: 0.78rem;
          color: #999;
          font-family: 'Quicksand', sans-serif;
        }

        .item-price {
          font-weight: 700;
          font-family: 'Quicksand', sans-serif;
          font-size: 0.95rem;
          flex-shrink: 0;
          color: #1a1a1a;
        }

        /* ═══════════ TOTALS ═══════════ */
        .summary-totals {
          margin-top: 20px;
          padding-top: 20px;
          border-top: 1px solid #eee;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .total-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-family: 'Quicksand', sans-serif;
          font-size: 0.95rem;
          color: #555;
        }

        .total-row.discount {
          color: #c69b7b;
        }

        .total-row.grand-total {
          font-size: 1.15rem;
          font-weight: 800;
          color: #1a1a1a;
          padding-top: 12px;
          border-top: 2px solid #1a1a1a;
          margin-top: 4px;
        }

        .delivery-note {
          margin-top: 20px;
          font-size: 0.78rem;
          color: #aaa;
          line-height: 1.5;
          font-style: italic;
        }

      `}</style>
    </div>
  );
};
