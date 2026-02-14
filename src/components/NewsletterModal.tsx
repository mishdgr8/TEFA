import React, { useState } from 'react';
import { X, Mail, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { subscribeToNewsletter } from '../lib/firestore';

interface NewsletterModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NewsletterModal: React.FC<NewsletterModalProps> = ({ isOpen, onClose }) => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    // Simple email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setStatus('error');
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    setStatus('loading');
    try {
      await subscribeToNewsletter(email);
      setStatus('success');
      // Mark as subscribed in localStorage
      localStorage.setItem('tefa_newsletter_subscribed', 'true');
    } catch (error) {
      console.error('Newsletter subscription error:', error);
      setStatus('error');
      setErrorMessage('Something went wrong. Please try again later.');
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="modal-overlay"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 30 }}
            className="modal-content newsletter-modal"
            onClick={e => e.stopPropagation()}
          >
            <button onClick={onClose} className="modal-close newsletter-close">
              <X size={24} />
            </button>

            <div className="newsletter-container">
              {status === 'success' ? (
                <div className="newsletter-success">
                  <motion.div
                    initial={{ scale: 0.5 }}
                    animate={{ scale: 1 }}
                    className="success-icon"
                  >
                    <CheckCircle2 size={64} color="#111111" />
                  </motion.div>
                  <h2 className="font-serif">Welcome to the Family</h2>
                  <p>Thank you for joining the TÉFA circle. You'll be the first to know about new collection drops.</p>

                  <div className="discount-block">
                    <span>YOUR FIRST ORDER DISCOUNT</span>
                    <div className="discount-code">TEFA10</div>
                    <p className="text-small">Use this code at checkout for 10% off</p>
                  </div>

                  <button onClick={onClose} className="btn btn-primary w-full">
                    Start Shopping
                  </button>
                </div>
              ) : (
                <div className="newsletter-form-container">
                  <div className="newsletter-header">
                    <span className="text-caption">The TÉFA Circle</span>
                    <h2 className="font-serif">Be the first to know</h2>
                    <p>Join our newsletter for exclusive access to new collection drops, private events, and 10% off your first order.</p>
                  </div>

                  <form onSubmit={handleSubmit} className="newsletter-form">
                    <div className="input-group">
                      <Mail size={18} className="input-icon" />
                      <input
                        type="email"
                        placeholder="Email Address"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="input"
                        disabled={status === 'loading'}
                        required
                      />
                    </div>

                    {status === 'error' && (
                      <p className="error-message">{errorMessage}</p>
                    )}

                    <button
                      type="submit"
                      className={`btn btn-primary w-full ${status === 'loading' ? 'loading' : ''}`}
                      disabled={status === 'loading'}
                    >
                      {status === 'loading' ? 'Joining...' : 'Get my 10% Discount'}
                    </button>
                  </form>

                  <p className="newsletter-disclaimer">
                    By signing up, you agree to receive marketing emails from TÉFA. You can unsubscribe at any time.
                  </p>
                </div>
              )}
            </div>
          </motion.div>

          <style>{`
            /* Base modal styles */
            .modal-overlay {
              position: fixed;
              inset: 0;
              background: rgba(0, 0, 0, 0.5);
              backdrop-filter: blur(4px);
              z-index: 11000;
              display: flex;
              align-items: center;
              justify-content: center;
              padding: 16px;
            }

            .modal-content {
              position: relative;
              background: white;
              border-radius: var(--radius-xl);
              padding: var(--space-6);
              box-shadow: var(--shadow-xl);
              overflow-y: auto;
            }

            .newsletter-modal {
              max-width: 500px !important;
              width: 95%;
              padding: 0 !important;
              overflow: hidden;
              background: var(--color-white);
              border-radius: var(--radius-xl);
            }


            .newsletter-close {
              position: absolute;
              top: 20px;
              right: 20px;
              z-index: 10;
            }

            .newsletter-container {
              padding: var(--space-8);
            }

            .newsletter-header {
              text-align: center;
              margin-bottom: var(--space-8);
            }

            .newsletter-header h2 {
              font-size: 2rem;
              font-style: italic;
              margin: var(--space-2) 0 var(--space-4);
              color: var(--color-brown-dark);
            }

            .newsletter-header p {
              font-size: 0.9375rem;
              color: var(--color-text-light);
              line-height: 1.6;
            }

            .newsletter-form {
              display: flex;
              flex-direction: column;
              gap: var(--space-4);
            }

            .input-group {
              position: relative;
              display: flex;
              align-items: center;
            }

            .input-icon {
              position: absolute;
              left: 16px;
              color: var(--color-text-muted);
            }

            .newsletter-form .input {
              padding-left: 48px;
              background: var(--color-nude-light);
              border: 1px solid var(--color-nude);
            }

            .newsletter-form .input:focus {
              border-color: var(--color-coral);
              background: var(--color-white);
            }

            .w-full {
              width: 100%;
            }

            .error-message {
              font-size: 0.8125rem;
              color: #dc2626;
              text-align: center;
              margin-bottom: var(--space-2);
            }

            .newsletter-disclaimer {
              font-size: 0.75rem;
              color: var(--color-text-muted);
              text-align: center;
              margin-top: var(--space-6);
              line-height: 1.4;
            }

            .newsletter-success {
              text-align: center;
              padding: var(--space-4) 0;
            }

            .success-icon {
              margin-bottom: var(--space-6);
              display: inline-block;
            }

            .newsletter-success h2 {
              font-size: 2.25rem;
              font-style: italic;
              margin-bottom: var(--space-4);
            }

            .newsletter-success p {
              color: var(--color-text-light);
              margin-bottom: var(--space-8);
            }

            .discount-block {
              background: var(--color-nude-light);
              border: 2px dashed var(--color-blush);
              border-radius: var(--radius-lg);
              padding: var(--space-6);
              margin-bottom: var(--space-8);
            }

            .discount-block span {
              font-size: 0.75rem;
              font-weight: 700;
              letter-spacing: 0.1em;
              color: var(--color-text-muted);
            }

            .discount-code {
              font-size: 3rem;
              font-weight: 700;
              color: var(--color-brown-dark);
              margin: var(--space-2) 0;
              letter-spacing: 0.05em;
            }

            @media (max-width: 480px) {
              .newsletter-container {
                padding: var(--space-6);
              }
              
              .newsletter-header h2 {
                font-size: 1.75rem;
              }

              .discount-code {
                font-size: 2.5rem;
              }
            }
          `}</style>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
