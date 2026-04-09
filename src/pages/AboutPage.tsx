import React from 'react';
import { useNavigate } from 'react-router-dom';
import { m } from 'framer-motion';
import { SEOHead } from '../components/SEOHead';
import { OptimizedImage } from '../components/OptimizedImage';

export const AboutPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="about-page">
      <SEOHead
        title="Our Story & Manifesto | TÉFA"
        description="Discover the soul of TÉFA. We create clothes with a story, blending ancestral Nigerian dyeing techniques with contemporary global silhouettes."
        path="/about"
      />

      {/* Hero Section */}
      <section className="about-hero">
        <m.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="about-hero-content"
        >
          <span className="eyebrow">THE TÉFA MANIFESTO</span>
          <h1>Clothes With A Story</h1>
        </m.div>
      </section>

      {/* Story Section - Split Layout */}
      <section className="story-split section">
        <div className="container">
          <div className="story-grid">
            <m.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1 }}
              className="story-image-container"
            >
              <OptimizedImage
                src="/assets/Hero/Screenshot 2026-02-07 at 09.31.22.webp"
                alt="TÉFA Craftsmanship"
                className="story-image"
              />
              <div className="image-overlay-text">SINCE 2024</div>
            </m.div>

            <m.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1, delay: 0.2 }}
              className="story-text-container"
            >
              <h2 className="section-title">Rooted in Heritage</h2>
              <p className="lead-text">
                "TÉFA is more than a brand. It is an exploration of the intricate patterns of our identity."
              </p>
              <div className="story-body">
                <p>
                  Born in the heart of Lagos, TÉFA was founded on a simple yet profound belief: that luxury should be meaningful. That the clothes we wear should carry the weight of our history and the lightness of our future.
                </p>
                <p>
                  Every piece we create is a dialogue. We take ancestral Nigerian dyeing techniques—patterns passed down through generations—and translate them into contemporary, architectural silhouettes that speak to the modern global citizen.
                </p>
                <p>
                  When you wear TÉFA, you aren't just wearing a garment; you are wearing a story. A story of craftsmanship, of identity, and of the enduring beauty of handcrafted art.
                </p>
              </div>
              <m.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/shop')}
                className="shop-story-btn"
              >
                Explore the Collection
              </m.button>
            </m.div>
          </div>
        </div>
      </section>

      {/* Philosophy Section */}
      <section className="philosophy-section">
        <div className="container">
          <div className="phi-grid">
            <div className="phi-card">
              <h3>Ancestral Craft</h3>
              <p>We work with master artisans in Nigeria to preserve and evolve traditional textile arts like Adire and hand-dyeing.</p>
            </div>
            <div className="phi-card">
              <h3>Modern Soul</h3>
              <p>Our designs are built for the world stage—minimalist, bold, and unapologetically contemporary.</p>
            </div>
            <div className="phi-card">
              <h3>Slow Luxury</h3>
              <p>We reject the pace of fast fashion. Each piece is made with intention, care, and the time it deserves.</p>
            </div>
          </div>
        </div>
      </section>

      <style>{`
        .about-page {
          background-color: var(--color-cream);
          color: var(--color-text);
        }

        .about-hero {
          height: 60vh;
          display: flex;
          align-items: center;
          justify-content: center;
          text-align: center;
          background: var(--color-cream-dark);
          padding-top: 100px;
        }

        .about-hero-content .eyebrow {
          font-family: 'Montserrat', sans-serif;
          font-size: 0.75rem;
          font-weight: 700;
          letter-spacing: 0.3em;
          text-transform: uppercase;
          color: var(--color-text-muted);
          display: block;
          margin-bottom: var(--space-4);
        }

        .about-hero-content h1 {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(3rem, 8vw, 6rem);
          font-weight: 500;
          font-style: italic;
          line-height: 1;
          color: var(--color-text);
        }

        .story-split {
          padding: 120px 0;
        }

        .story-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 60px;
          align-items: center;
        }

        @media (min-width: 1024px) {
          .story-grid {
            grid-template-columns: 1fr 1fr;
            gap: 100px;
          }
        }

        .story-image-container {
          position: relative;
          aspect-ratio: 4/5;
        }

        .story-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          border-radius: var(--radius-sm);
        }

        .image-overlay-text {
          position: absolute;
          bottom: -20px;
          left: -20px;
          padding: 20px 30px;
          background: var(--color-text);
          color: white;
          font-family: 'Montserrat', sans-serif;
          font-size: 0.75rem;
          font-weight: 700;
          letter-spacing: 0.2em;
          z-index: 2;
        }

        .section-title {
          font-family: 'Montserrat', sans-serif;
          font-size: 0.75rem;
          font-weight: 700;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          margin-bottom: var(--space-8);
          color: var(--color-text-muted);
        }

        .lead-text {
          font-family: 'Cormorant Garamond', serif;
          font-size: 2.25rem;
          font-style: italic;
          line-height: 1.2;
          margin-bottom: var(--space-10);
          color: var(--color-text);
        }

        .story-body {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
          margin-bottom: var(--space-12);
        }

        .story-body p {
          font-family: 'Inter', sans-serif;
          font-size: 1.05rem;
          line-height: 1.8;
          color: var(--color-text-light);
        }

        .shop-story-btn {
          padding: 20px 40px;
          background: var(--color-text);
          color: white;
          border: none;
          font-family: 'Quicksand', sans-serif;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .philosophy-section {
          padding: 100px 0;
          background: var(--color-nude-light);
        }

        .phi-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 40px;
        }

        .phi-card h3 {
          font-family: 'Montserrat', sans-serif;
          font-size: 1.25rem;
          font-weight: 700;
          margin-bottom: var(--space-4);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .phi-card p {
          font-family: 'Inter', sans-serif;
          line-height: 1.7;
          color: var(--color-text-muted);
        }

        @media (max-width: 768px) {
          .about-hero {
            height: 40vh;
          }
          .lead-text {
            font-size: 1.75rem;
          }
          .image-overlay-text {
            left: 20px;
            bottom: 20px;
          }
        }
      `}</style>
    </div>
  );
};
