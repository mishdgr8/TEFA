import React from 'react';
import { Mail, Instagram, Facebook, Music, Send } from 'lucide-react';
import { SEOHead } from '../components/SEOHead';

export const ContactPage: React.FC = () => {
    return (
        <div className="support-page contact-page">
            <SEOHead
                title="Contact Us"
                description="Get in touch with TÉFA — premium African fashion from Lagos. Email hello@houseoftefa.com or visit our studio in Victoria Island, Lagos."
                path="/contact"
            />
            <div className="container">
                <div className="support-header">
                    <h1>Contact Us</h1>
                    <p>We'd love to hear from you. Reach out with any inquiries or feedback.</p>
                </div>

                <div className="contact-grid">
                    <div className="contact-info">
                        <div className="info-item">
                            <div className="info-icon">
                                <Mail size={24} />
                            </div>
                            <div className="info-text">
                                <h3>Email</h3>
                                <p>hello@houseoftefa.com</p>
                                <p>orders@houseoftefa.com</p>
                            </div>
                        </div>

                        <div className="info-item">
                            <div className="info-icon">
                                <Instagram size={24} />
                            </div>
                            <div className="info-text">
                                <h3>Instagram</h3>
                                <p>@houseoftefa</p>
                                <a href="https://instagram.com/houseoftefa" target="_blank" rel="noopener noreferrer" className="contact-link">Follow us</a>
                            </div>
                        </div>

                        <div className="info-item">
                            <div className="info-icon">
                                <Music size={24} />
                            </div>
                            <div className="info-text">
                                <h3>TikTok</h3>
                                <p>@houseoftefa</p>
                                <a href="https://tiktok.com/@houseoftefa" target="_blank" rel="noopener noreferrer" className="contact-link">Watch our story</a>
                            </div>
                        </div>

                        <div className="info-item">
                            <div className="info-icon">
                                <Facebook size={24} />
                            </div>
                            <div className="info-text">
                                <h3>Facebook</h3>
                                <p>House of TÉFA</p>
                                <a href="https://facebook.com/houseoftefa" target="_blank" rel="noopener noreferrer" className="contact-link">Connect with us</a>
                            </div>
                        </div>
                    </div>

                    <div className="contact-form-container">
                        <form className="contact-form" onSubmit={(e) => e.preventDefault()}>
                            <div className="form-group">
                                <label>Name</label>
                                <input type="text" placeholder="Your Name" required />
                            </div>
                            <div className="form-group">
                                <label>Email</label>
                                <input type="email" placeholder="your@email.com" required />
                            </div>
                            <div className="form-group">
                                <label>Subject</label>
                                <select required>
                                    <option value="">Select a subject</option>
                                    <option value="order">Order Inquiry</option>
                                    <option value="custom">Custom Sizing</option>
                                    <option value="wholesale">Wholesale</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Message</label>
                                <textarea rows={5} placeholder="How can we help?" required></textarea>
                            </div>
                            <button type="submit" className="submit-btn" disabled>
                                <Send size={18} /> Send Message
                            </button>
                            <p className="form-note">Note: This form is currently under maintenance. Please contact us via email.</p>
                        </form>
                    </div>
                </div>
            </div>

            <style>{`
                .support-page {
                    padding-top: 160px;
                    padding-bottom: var(--space-24);
                    background-color: var(--color-cream);
                    min-height: 80vh;
                }

                .support-header {
                    text-align: center;
                    margin-bottom: var(--space-16);
                }

                .support-header h1 {
                    font-size: clamp(2.5rem, 5vw, 4rem);
                    margin-bottom: var(--space-4);
                }

                .support-header p {
                    color: var(--color-text-muted);
                    font-size: 1.125rem;
                }

                .contact-grid {
                    display: grid;
                    grid-template-columns: 1fr;
                    gap: var(--space-12);
                    max-width: 1000px;
                    margin: 0 auto;
                }

                @media (min-width: 768px) {
                    .contact-grid {
                        grid-template-columns: 1fr 1.5fr;
                    }
                }

                .contact-info {
                    display: flex;
                    flex-direction: column;
                    gap: var(--space-8);
                }

                .info-item {
                    display: flex;
                    gap: var(--space-4);
                }

                .info-icon {
                    width: 50px;
                    height: 50px;
                    background: var(--color-nude-light);
                    border-radius: var(--radius-md);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: var(--color-coral);
                    flex-shrink: 0;
                }

                .info-text h3 {
                    font-size: 1.125rem;
                    margin-bottom: var(--space-1);
                }

                .info-text p {
                    color: var(--color-text-muted);
                    font-size: 0.9375rem;
                }

                .contact-form-container {
                    background: white;
                    padding: var(--space-8);
                    border-radius: var(--radius-xl);
                    box-shadow: var(--shadow-lg);
                }

                .contact-form {
                    display: flex;
                    flex-direction: column;
                    gap: var(--space-4);
                }

                .form-group label {
                    display: block;
                    font-size: 0.8125rem;
                    font-weight: 700;
                    text-transform: uppercase;
                    margin-bottom: var(--space-2);
                    color: var(--color-brown);
                }

                .form-group input,
                .form-group select,
                .form-group textarea {
                    width: 100%;
                    padding: var(--space-3);
                    border: 1px solid var(--color-nude);
                    border-radius: var(--radius-md);
                    font-family: 'Quicksand', sans-serif;
                }

                .submit-btn {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: var(--space-2);
                    padding: var(--space-4);
                    background: var(--color-coral);
                    color: white;
                    border: none;
                    border-radius: var(--radius-md);
                    font-weight: 700;
                    cursor: not-allowed;
                    opacity: 0.7;
                    margin-top: var(--space-4);
                }

                .form-note {
                    font-size: 0.75rem;
                    color: var(--color-text-muted);
                    text-align: center;
                    margin-top: var(--space-2);
                    font-style: italic;
                }
                .contact-link {
                    display: inline-block;
                    margin-top: var(--space-1);
                    color: var(--color-coral);
                    font-size: 0.8125rem;
                    font-weight: 700;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                    text-decoration: none;
                }

                .contact-link:hover {
                    text-decoration: underline;
                }
            `}</style>
        </div>
    );
};
