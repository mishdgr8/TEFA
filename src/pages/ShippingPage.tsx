import React from 'react';
import { Truck, Globe, Clock, ShieldCheck } from 'lucide-react';
import { SEOHead } from '../components/SEOHead';

export const ShippingPage: React.FC = () => {
    return (
        <div className="support-page shipping-page">
            <SEOHead
                title="Shipping & Delivery"
                description="TÉFA shipping information — domestic delivery across Nigeria, international shipping via DHL Express to USA, UK, Canada, and Europe. Processing times and returns policy."
                path="/shipping"
            />
            <div className="container">
                <div className="support-header">
                    <h1>Shipping Info</h1>
                    <p>Everything you need to know about our global delivery service.</p>
                </div>

                <div className="shipping-grid">
                    <div className="shipping-card">
                        <Truck className="card-icon" />
                        <h3>Domestic (Nigeria)</h3>
                        <p>Lagos: 1-2 business days</p>
                        <p>Outside Lagos: 2-3 business days</p>
                        <p className="price">Starting from ₦3,500</p>
                    </div>

                    <div className="shipping-card">
                        <Globe className="card-icon" />
                        <h3>International</h3>
                        <p>DHL Express: 3-5 business days</p>
                        <p>Global logistics partners</p>
                        <p className="price">Calculated at checkout</p>
                    </div>

                    <div className="shipping-card">
                        <Clock className="card-icon" />
                        <h3>Pre-Order Timeline</h3>
                        <p>Strictly PREORDER ONLY</p>
                        <p>Handcrafted to order: 14-21 days</p>
                        <p>Subject to dispatch date</p>
                    </div>

                    <div className="shipping-card">
                        <ShieldCheck className="card-icon" />
                        <h3>Tracking</h3>
                        <p>Tracking number via email</p>
                        <p>Dispatched via trusted partners</p>
                        <p>Insurance included</p>
                    </div>
                </div>

                <div className="shipping-details">
                    <section>
                        <h2>General Shipping Policy</h2>
                        <p>
                            <span className="font-brand">TÉFA</span> partners with trusted third-party logistics providers for local and international deliveries.
                            When placing your order, please ensure billing and shipping address details are accurate, as we cannot modify them once the item has been ordered or dispatched.
                        </p>
                    </section>

                    <section>
                        <h2>Timelines</h2>
                        <p>
                            Shipping and delivery timelines start from the date of dispatch and are subject to the operations of our logistics partners.
                        </p>
                        <ul className="timeline-list">
                            <li>Deliveries within Lagos: 1–2 business days</li>
                            <li>Deliveries within Nigeria (outside Lagos): 2–3 business days</li>
                            <li>International deliveries: 3–5 business days</li>
                        </ul>
                    </section>

                    <section>
                        <h2>Shipment Tracking</h2>
                        <p>
                            For shipments outside Lagos, a Shipment Tracking Number will be emailed to you once your order is dispatched.
                            If you do not receive your order within 10 working days of dispatch, notify us promptly.
                            If we do not hear from you within 14 working days of dispatch, we will assume the parcel was received in perfect condition.
                        </p>
                    </section>

                    <section>
                        <h2>Shipping Fees & Custom Duties</h2>
                        <p>
                            Shipping fees vary by destination and are shown at checkout. Product prices exclude shipping fees and taxes.
                            Customs & Import taxes are your responsibility and vary by country.
                            <span className="font-brand">TÉFA</span> is not liable for delays or additional fees imposed by customs or logistics providers.
                        </p>
                    </section>

                    <section>
                        <h2>Returns & Exchanges</h2>
                        <p>
                            We want you to be completely satisfied with your purchase. Every piece is handcrafted to order. Items can be returned for store credit or exchange within 7 days of receipt,
                            provided they are unworn, unwashed, and in their original packaging with tags attached.
                        </p>
                        <p className="note">Note: Custom orders and sale items are final sale.</p>
                    </section>
                </div>
            </div>

            <style>{`
                .support-page {
                    padding-top: 160px;
                    padding-bottom: var(--space-24);
                    background-color: var(--color-cream);
                }

                .support-header {
                    text-align: center;
                    margin-bottom: var(--space-16);
                }

                .support-header h1 {
                    font-size: clamp(2.5rem, 5vw, 4rem);
                    margin-bottom: var(--space-4);
                }

                .shipping-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
                    gap: var(--space-6);
                    margin-bottom: var(--space-16);
                }

                .shipping-card {
                    background: white;
                    padding: var(--space-8);
                    border-radius: var(--radius-xl);
                    box-shadow: var(--shadow-md);
                    text-align: center;
                    transition: transform var(--transition-base);
                }

                .shipping-card:hover {
                    transform: translateY(-5px);
                    box-shadow: var(--shadow-lg);
                }

                .card-icon {
                    width: 40px;
                    height: 40px;
                    color: var(--color-coral);
                    margin-bottom: var(--space-6);
                }

                .shipping-card h3 {
                    margin-bottom: var(--space-4);
                }

                .shipping-card p {
                    color: var(--color-text-muted);
                    font-size: 0.9375rem;
                    margin-bottom: var(--space-1);
                }

                .price {
                    margin-top: var(--space-4);
                    font-weight: 700;
                    color: var(--color-brown);
                }

                .shipping-details {
                    max-width: 800px;
                    margin: 0 auto;
                    display: flex;
                    flex-direction: column;
                    gap: var(--space-12);
                }

                .shipping-details h2 {
                    margin-bottom: var(--space-4);
                    font-size: 1.5rem;
                }

                .shipping-details p {
                    line-height: 1.8;
                    color: var(--color-text-light);
                }

                .timeline-list {
                    list-style: disc;
                    padding-left: var(--space-6);
                    color: var(--color-text-light);
                    display: flex;
                    flex-direction: column;
                    gap: var(--space-2);
                }

                .note {
                    margin-top: var(--space-4);
                    font-style: italic;
                    color: var(--color-text-muted);
                }
            `}</style>
        </div>
    );
};
