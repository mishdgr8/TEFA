import React from 'react';
import { Truck, Globe, Clock, ShieldCheck } from 'lucide-react';

export const ShippingPage: React.FC = () => {
    return (
        <div className="support-page shipping-page">
            <div className="container">
                <div className="support-header">
                    <h1>Shipping Info</h1>
                    <p>Everything you need to know about our global delivery service.</p>
                </div>

                <div className="shipping-grid">
                    <div className="shipping-card">
                        <Truck className="card-icon" />
                        <h3>Domestic (Nigeria)</h3>
                        <p>Lagos: 1-3 business days</p>
                        <p>Outside Lagos: 3-5 business days</p>
                        <p className="price">Starting from ₦3,500</p>
                    </div>

                    <div className="shipping-card">
                        <Globe className="card-icon" />
                        <h3>International</h3>
                        <p>DHL Express: 5-10 business days</p>
                        <p>Covers USA, UK, Canada, and Europe</p>
                        <p className="price">Calculated at checkout</p>
                    </div>

                    <div className="shipping-card">
                        <Clock className="card-icon" />
                        <h3>Processing Time</h3>
                        <p>Ready-to-wear: 2-3 business days</p>
                        <p>Pre-order: 14-21 business days</p>
                        <p>Express Request: 14 business days</p>
                    </div>

                    <div className="shipping-card">
                        <ShieldCheck className="card-icon" />
                        <h3>Tracking</h3>
                        <p>Real-time updates via email/SMS</p>
                        <p>Signature required upon delivery</p>
                        <p>Fully insured shipments</p>
                    </div>
                </div>

                <div className="shipping-details">
                    <section>
                        <h2>International Customs & Duties</h2>
                        <p>
                            Please note that international shipments may be subject to import duties and taxes, which are levied once a shipment reaches your country.
                            <span className="font-brand"> TÉFA</span> has no control over these charges and cannot predict what they may be.
                        </p>
                    </section>

                    <section>
                        <h2>Returns & Exchanges</h2>
                        <p>
                            We want you to be completely satisfied with your purchase. Items can be returned for store credit or exchange within 7 days of receipt,
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

                .note {
                    margin-top: var(--space-4);
                    font-style: italic;
                    color: var(--color-text-muted);
                }
            `}</style>
        </div>
    );
};
