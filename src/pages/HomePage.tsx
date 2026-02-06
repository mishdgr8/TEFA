import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { ProductCard } from '../components/ProductCard';
import { useStore } from '../data/store';
import { PageName, PageParams } from '../types';

interface HomePageProps {
    onNavigate: (page: PageName, params?: PageParams) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onNavigate }) => {
    const { products, categories } = useStore();

    return (
        <div className="home-page">
            {/* Hero Section */}
            <section className="hero">
                <div className="hero-bg">
                    <img
                        src="https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?auto=format&fit=crop&q=80&w=1920"
                        alt="Hero Background"
                    />
                    <div className="hero-overlay" />
                </div>

                <div className="hero-content">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <span className="hero-eyebrow">Modern Heritage</span>
                        <h1 className="hero-title">
                            Soul of the <br />
                            <span>Continent.</span>
                        </h1>
                        <button
                            onClick={() => onNavigate('shop')}
                            className="hero-cta"
                        >
                            Shop New Arrivals
                            <ArrowRight size={20} />
                        </button>
                    </motion.div>
                </div>
            </section>

            {/* Brand Story Section */}
            <section className="story section">
                <div className="container">
                    <div className="story-grid">
                        <div className="story-text">
                            <span className="story-eyebrow">The TÉFA Story</span>
                            <h2 className="story-title">
                                Where tradition meets <br />contemporary craft.
                            </h2>
                            <p className="story-description">
                                Founded in Lagos, TÉFA is a celebration of Africana fashion. We source premium fabrics and work with master artisans to create pieces that honor our history while speaking to a modern global audience. Each garment tells a story of identity, resilience, and beauty.
                            </p>
                            <button onClick={() => onNavigate('about')} className="story-link">
                                Read Our Manifesto
                            </button>
                        </div>
                        <div className="story-image">
                            <img src="https://images.unsplash.com/photo-1583394238712-92d354508499?auto=format&fit=crop&q=80&w=800" alt="TÉFA Story" />
                            <div className="story-quote">
                                <p>"Crafting pieces that travel from the heart of Africa to the world."</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Categories Section */}
            <section className="categories section">
                <div className="container">
                    <div className="categories-header">
                        <h2>Browse Collections</h2>
                        <button onClick={() => onNavigate('shop')}>See All Shop</button>
                    </div>
                    <div className="categories-grid">
                        {categories.map((cat, idx) => (
                            <motion.div
                                key={cat.id}
                                initial={{ opacity: 0, scale: 0.9 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: idx * 0.1 }}
                                onClick={() => onNavigate('shop', { categoryId: cat.id })}
                                className="category-card"
                            >
                                <img src={cat.image} alt={cat.name} />
                                <div className="category-overlay" />
                                <div className="category-content">
                                    <h3>{cat.name}</h3>
                                    <div className="category-line" />
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Featured Products Section */}
            <section className="featured section">
                <div className="container">
                    <h2 className="featured-title">Featured Pieces</h2>
                    <div className="featured-grid">
                        {products.slice(0, 3).map(product => (
                            <ProductCard key={product.id} product={product} onNavigate={onNavigate} />
                        ))}
                    </div>
                    <div className="featured-cta">
                        <button onClick={() => onNavigate('shop')}>
                            Explore Full Shop
                        </button>
                    </div>
                </div>
            </section>

            <style>{`
        .home-page {
          padding-top: 80px;
        }

        /* Hero */
        .hero {
          position: relative;
          height: 85vh;
          display: flex;
          align-items: center;
          overflow: hidden;
        }

        .hero-bg {
          position: absolute;
          inset: 0;
        }

        .hero-bg img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .hero-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(139, 111, 92, 0.7), rgba(224, 123, 84, 0.4));
        }

        .hero-content {
          position: relative;
          max-width: 1280px;
          margin: 0 auto;
          padding: 0 var(--space-4);
          width: 100%;
          color: white;
        }

        .hero-eyebrow {
          display: block;
          font-size: 0.75rem;
          text-transform: uppercase;
          letter-spacing: 0.5em;
          font-weight: 600;
          margin-bottom: var(--space-4);
        }

        .hero-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(3rem, 8vw, 6rem);
          font-weight: 700;
          font-style: italic;
          line-height: 1.1;
          margin-bottom: var(--space-8);
          color: white;
        }

        .hero-title span {
          color: var(--color-coral-light);
        }

        .hero-cta {
          display: inline-flex;
          align-items: center;
          gap: var(--space-3);
          padding: var(--space-5) var(--space-10);
          background: white;
          color: var(--color-brown-dark);
          border: none;
          border-radius: var(--radius-full);
          font-family: 'Quicksand', sans-serif;
          font-size: 1rem;
          font-weight: 700;
          cursor: pointer;
          transition: all var(--transition-base);
        }

        .hero-cta:hover {
          background: var(--color-coral);
          color: white;
          transform: translateY(-3px);
          box-shadow: var(--shadow-xl);
        }

        .hero-cta svg {
          transition: transform var(--transition-fast);
        }

        .hero-cta:hover svg {
          transform: translateX(4px);
        }

        /* Story Section */
        .story-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: var(--space-12);
          align-items: center;
        }

        @media (min-width: 768px) {
          .story-grid {
            grid-template-columns: 1fr 1fr;
            gap: var(--space-16);
          }
        }

        .story-eyebrow {
          display: block;
          font-size: 0.75rem;
          text-transform: uppercase;
          letter-spacing: 0.15em;
          font-weight: 700;
          color: var(--color-coral);
          margin-bottom: var(--space-4);
        }

        .story-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(2rem, 4vw, 3rem);
          font-weight: 600;
          font-style: italic;
          line-height: 1.2;
          margin-bottom: var(--space-6);
        }

        .story-description {
          color: var(--color-text-light);
          font-size: 1.0625rem;
          line-height: 1.8;
          margin-bottom: var(--space-8);
        }

        .story-link {
          background: none;
          border: none;
          font-family: 'Quicksand', sans-serif;
          font-size: 1rem;
          font-weight: 700;
          color: var(--color-brown-dark);
          border-bottom: 2px solid var(--color-brown-dark);
          padding-bottom: var(--space-1);
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .story-link:hover {
          color: var(--color-coral);
          border-color: var(--color-coral);
        }

        .story-image {
          position: relative;
        }

        .story-image img {
          width: 100%;
          aspect-ratio: 4 / 5;
          object-fit: cover;
          border-radius: var(--radius-xl);
          box-shadow: var(--shadow-xl);
        }

        .story-quote {
          position: absolute;
          bottom: -32px;
          left: -32px;
          background: white;
          padding: var(--space-8);
          border-radius: var(--radius-lg);
          box-shadow: var(--shadow-lg);
          max-width: 240px;
        }

        @media (max-width: 768px) {
          .story-quote {
            position: relative;
            bottom: auto;
            left: auto;
            margin-top: var(--space-4);
            max-width: 100%;
          }
        }

        .story-quote p {
          font-family: 'Cormorant Garamond', serif;
          font-size: 1.125rem;
          font-style: italic;
          line-height: 1.5;
          color: var(--color-brown-dark);
        }

        /* Categories */
        .categories {
          background: var(--color-cream-dark);
        }

        .categories-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          margin-bottom: var(--space-10);
        }

        .categories-header h2 {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(2rem, 4vw, 2.5rem);
          font-weight: 600;
          font-style: italic;
        }

        .categories-header button {
          background: none;
          border: none;
          font-family: 'Quicksand', sans-serif;
          font-size: 0.75rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.15em;
          color: var(--color-brown);
          cursor: pointer;
        }

        .categories-header button:hover {
          color: var(--color-coral);
        }

        .categories-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: var(--space-4);
        }

        @media (min-width: 768px) {
          .categories-grid {
            grid-template-columns: repeat(4, 1fr);
            gap: var(--space-6);
          }
        }

        .category-card {
          position: relative;
          aspect-ratio: 3 / 4;
          border-radius: var(--radius-xl);
          overflow: hidden;
          cursor: pointer;
        }

        .category-card img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.7s ease;
        }

        .category-card:hover img {
          transform: scale(1.1);
        }

        .category-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(to top, rgba(0, 0, 0, 0.7), transparent 50%);
        }

        .category-content {
          position: absolute;
          bottom: var(--space-6);
          left: var(--space-6);
          color: white;
        }

        .category-content h3 {
          font-size: 1.125rem;
          font-weight: 600;
          color: white;
        }

        .category-line {
          height: 2px;
          width: 0;
          background: var(--color-coral-light);
          transition: width var(--transition-base);
        }

        .category-card:hover .category-line {
          width: 100%;
        }

        /* Featured */
        .featured-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(2rem, 4vw, 2.5rem);
          font-weight: 600;
          font-style: italic;
          text-align: center;
          margin-bottom: var(--space-10);
        }

        .featured-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: var(--space-8);
        }

        @media (min-width: 640px) {
          .featured-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (min-width: 1024px) {
          .featured-grid {
            grid-template-columns: repeat(3, 1fr);
            gap: var(--space-10);
          }
        }

        .featured-cta {
          text-align: center;
          margin-top: var(--space-12);
        }

        .featured-cta button {
          padding: var(--space-4) var(--space-10);
          background: transparent;
          color: var(--color-brown-dark);
          border: 2px solid var(--color-brown-dark);
          border-radius: var(--radius-full);
          font-family: 'Quicksand', sans-serif;
          font-size: 0.9375rem;
          font-weight: 700;
          cursor: pointer;
          transition: all var(--transition-base);
        }

        .featured-cta button:hover {
          background: var(--color-brown-dark);
          color: white;
        }
      `}</style>
        </div>
    );
};
