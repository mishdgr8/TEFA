import React from 'react';
import { useNavigate } from 'react-router-dom';
import { SEOHead } from '../components/SEOHead';

export const NotFoundPage: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="not-found-page">
            <SEOHead
                title="Page Not Found"
                description="The page you're looking for doesn't exist. Browse the TÉFA collection for premium African fashion."
                noindex={true}
            />
            <div className="not-found-content">
                <h1>404</h1>
                <p className="not-found-subtitle">Page not found</p>
                <p className="not-found-text">
                    The page you're looking for doesn't exist or has been moved.
                </p>
                <div className="not-found-actions">
                    <button onClick={() => navigate('/')} className="not-found-btn primary">
                        Go Home
                    </button>
                    <button onClick={() => navigate('/shop')} className="not-found-btn secondary">
                        Browse Collection
                    </button>
                </div>
            </div>

            <style>{`
        .not-found-page {
          padding-top: 160px;
          padding-bottom: var(--space-24);
          min-height: 60vh;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .not-found-content {
          text-align: center;
          max-width: 480px;
          padding: 0 var(--space-4);
        }

        .not-found-content h1 {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(5rem, 12vw, 8rem);
          font-weight: 700;
          font-style: italic;
          color: var(--color-coral);
          line-height: 1;
          margin-bottom: var(--space-4);
        }

        .not-found-subtitle {
          font-family: 'Cormorant Garamond', serif;
          font-size: 1.5rem;
          font-weight: 600;
          font-style: italic;
          margin-bottom: var(--space-4);
        }

        .not-found-text {
          color: var(--color-text-muted);
          margin-bottom: var(--space-8);
          line-height: 1.6;
        }

        .not-found-actions {
          display: flex;
          gap: var(--space-4);
          justify-content: center;
        }

        .not-found-btn {
          padding: var(--space-4) var(--space-8);
          border-radius: var(--radius-full);
          font-family: 'Quicksand', sans-serif;
          font-size: 0.9375rem;
          font-weight: 700;
          cursor: pointer;
          transition: all var(--transition-base);
          border: none;
        }

        .not-found-btn.primary {
          background: var(--color-brown-dark);
          color: white;
        }

        .not-found-btn.primary:hover {
          background: var(--color-coral);
          transform: translateY(-2px);
        }

        .not-found-btn.secondary {
          background: transparent;
          border: 2px solid var(--color-brown-dark);
          color: var(--color-brown-dark);
        }

        .not-found-btn.secondary:hover {
          background: var(--color-brown-dark);
          color: white;
          transform: translateY(-2px);
        }
      `}</style>
        </div>
    );
};
