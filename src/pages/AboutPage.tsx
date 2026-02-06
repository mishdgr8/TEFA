import React from 'react';
import { PageName } from '../types';

interface AboutPageProps {
    onNavigate: (page: PageName) => void;
}

export const AboutPage: React.FC<AboutPageProps> = ({ onNavigate }) => {
    return (
        <div className="about-page">
            <div className="about-content">
                <h1>Our Manifesto</h1>
                <div className="about-text">
                    <p>"TÉFA is more than a brand. It is an exploration of the intricate patterns of our identity."</p>
                    <p>We believe that luxury should be meaningful. We believe that heritage is a living thing, meant to be worn, shared, and evolved.</p>
                    <p>By blending ancestral dyeing techniques with contemporary silhouettes, we create a dialogue between the past and the future.</p>
                </div>
                <button onClick={() => onNavigate('shop')}>
                    Explore the Result
                </button>
            </div>

            <style>{`
        .about-page {
          padding-top: 160px;
          padding-bottom: var(--space-24);
        }

        .about-content {
          max-width: 640px;
          margin: 0 auto;
          padding: 0 var(--space-4);
          text-align: center;
        }

        .about-content h1 {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(2.5rem, 5vw, 3.5rem);
          font-weight: 700;
          font-style: italic;
          margin-bottom: var(--space-8);
        }

        .about-text {
          display: flex;
          flex-direction: column;
          gap: var(--space-6);
          margin-bottom: var(--space-10);
        }

        .about-text p {
          font-family: 'Cormorant Garamond', serif;
          font-size: 1.25rem;
          font-style: italic;
          line-height: 1.8;
          color: var(--color-text-light);
        }

        .about-content button {
          padding: var(--space-5) var(--space-10);
          background: var(--color-brown-dark);
          color: white;
          border: none;
          border-radius: var(--radius-full);
          font-family: 'Quicksand', sans-serif;
          font-size: 1rem;
          font-weight: 700;
          cursor: pointer;
          transition: all var(--transition-base);
        }

        .about-content button:hover {
          background: var(--color-coral);
          transform: translateY(-2px);
        }
      `}</style>
        </div>
    );
};
