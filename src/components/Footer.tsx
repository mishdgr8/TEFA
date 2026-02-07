import React from 'react';
import { Instagram, MessageCircle, ChevronRight } from 'lucide-react';
import { PageName } from '../types';

interface FooterProps {
  onNavigate: (page: PageName) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="footer">
      <div className="footer-pattern" />
      <div className="footer-content">
        <div className="footer-grid">
          {/* Brand Column */}
          <div className="footer-brand">
            <div className="footer-logo-container">
              <span className="footer-logo-top">HOUSE OF</span>
              <span className="footer-logo-main">TÉFA</span>
            </div>
            <p className="footer-tagline">
              Premium Africana fashion for the bold and the beautiful. Rooted in Lagos, inspired by the world.
            </p>
            <div className="footer-social">
              <a href="https://instagram.com/tefa_africana" target="_blank" rel="noopener noreferrer" className="footer-social-link">
                <Instagram size={20} />
              </a>
              <a href="https://wa.me/2340000000000" target="_blank" rel="noopener noreferrer" className="footer-social-link">
                <MessageCircle size={20} />
              </a>
            </div>
          </div>

          {/* Explore Column */}
          <div className="footer-column">
            <h4 className="footer-heading">Explore</h4>
            <div className="footer-links">
              <button onClick={() => onNavigate('shop')}>Shop Collection</button>
              <button onClick={() => onNavigate('home')}>Featured Sets</button>
              <button>Lookbook</button>
              <button>New Arrivals</button>
            </div>
          </div>

          {/* Support Column */}
          <div className="footer-column">
            <h4 className="footer-heading">Support</h4>
            <div className="footer-links">
              <button>Contact Us</button>
              <button>Shipping Info</button>
              <button>Size Guide</button>
              <button>FAQs</button>
            </div>
          </div>

          {/* Newsletter Column */}
          <div className="footer-column">
            <h4 className="footer-heading">Newsletter</h4>
            <p className="footer-newsletter-text">Get early access to drops and stories.</p>
            <div className="footer-newsletter-form">
              <input type="email" placeholder="Your Email" />
              <button type="submit" aria-label="Subscribe">
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="footer-bottom">
          <p>© 2024 TÉFA Africana Studio. All rights reserved.</p>
          <div className="footer-bottom-links">
            <span>Terms</span>
            <span>Privacy</span>
            <span>Heritage</span>
          </div>
        </div>
      </div>

      <style>{`
        .footer {
          background: #111111;
          color: #FFFFFF;
          padding: var(--space-24) var(--space-4);
          position: relative;
          overflow: hidden;
        }

        .footer-pattern {
          position: absolute;
          inset: 0;
          opacity: 0.05;
          background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
        }

        .footer-content {
          max-width: 1280px;
          margin: 0 auto;
          position: relative;
          z-index: 1;
        }

        .footer-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: var(--space-10);
        }

        @media (min-width: 768px) {
          .footer-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (min-width: 1024px) {
          .footer-grid {
            grid-template-columns: 1.5fr repeat(3, 1fr);
          }
        }

        .footer-brand {
          max-width: 280px;
        }

        .footer-logo-container {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          margin-bottom: var(--space-4);
          gap: 2px;
        }

        .footer-logo-top {
          font-family: 'Rethena', serif;
          font-size: 0.75rem;
          text-transform: uppercase;
          letter-spacing: 0.3em;
          color: rgba(255, 255, 255, 0.5);
          line-height: 1;
        }

        .footer-logo-main {
          font-family: 'Cormorant Garamond', serif;
          font-size: 2.25rem;
          font-weight: 700;
          font-style: italic;
          letter-spacing: 0.15em;
          color: #FFFFFF;
          line-height: 1;
        }

        .footer-tagline {
          color: rgba(255, 255, 255, 0.7);
          line-height: 1.7;
          margin-bottom: var(--space-6);
        }

        .footer-social {
          display: flex;
          gap: var(--space-3);
        }

        .footer-social-link {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 44px;
          height: 44px;
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: var(--radius-full);
          color: #FFFFFF;
          transition: all var(--transition-fast);
        }

        .footer-social-link:hover {
          background: #FFFFFF;
          color: #111111;
          transform: translateY(-2px);
        }

        .footer-column {
          display: flex;
          flex-direction: column;
        }

        .footer-heading {
          font-family: 'Rethena', serif;
          font-size: 0.75rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.15em;
          color: #FFFFFF;
          margin-bottom: var(--space-5);
        }

        .footer-links {
          display: flex;
          flex-direction: column;
          gap: var(--space-3);
        }

        .footer-links button {
          background: none;
          border: none;
          color: rgba(255, 255, 255, 0.7);
          font-family: 'Rethena', serif;
          font-size: 0.9375rem;
          cursor: pointer;
          text-align: left;
          transition: all var(--transition-fast);
        }

        .footer-links button:hover {
          color: #FFFFFF;
          padding-left: 4px;
        }

        .footer-newsletter-text {
          color: rgba(255, 255, 255, 0.7);
          font-size: 0.9375rem;
          margin-bottom: var(--space-4);
        }

        .footer-newsletter-form {
          display: flex;
          border-bottom: 1px solid rgba(255, 255, 255, 0.3);
          padding: var(--space-2) 0;
        }

        .footer-newsletter-form input {
          flex: 1;
          background: transparent;
          border: none;
          outline: none;
          color: #FFFFFF;
          font-family: 'Rethena', serif;
          font-size: 0.9375rem;
        }

        .footer-newsletter-form input::placeholder {
          color: rgba(255, 255, 255, 0.4);
        }

        .footer-newsletter-form button {
          background: none;
          border: none;
          color: #FFFFFF;
          cursor: pointer;
          transition: transform var(--transition-fast);
        }

        .footer-newsletter-form button:hover {
          transform: translateX(4px);
        }

        .footer-bottom {
          margin-top: var(--space-16);
          padding-top: var(--space-8);
          border-top: 1px solid rgba(255, 255, 255, 0.1);
          display: flex;
          flex-direction: column;
          gap: var(--space-4);
          align-items: center;
        }

        @media (min-width: 768px) {
          .footer-bottom {
            flex-direction: row;
            justify-content: space-between;
          }
        }

        .footer-bottom p {
          font-size: 0.625rem;
          text-transform: uppercase;
          letter-spacing: 0.15em;
          color: rgba(255, 255, 255, 0.5);
        }

        .footer-bottom-links {
          display: flex;
          gap: var(--space-6);
        }

        .footer-bottom-links span {
          font-size: 0.625rem;
          text-transform: uppercase;
          letter-spacing: 0.15em;
          color: rgba(255, 255, 255, 0.5);
          cursor: pointer;
          transition: color var(--transition-fast);
        }

        .footer-bottom-links span:hover {
          color: #FFFFFF;
        }
      `}</style>
    </footer>
  );
};
