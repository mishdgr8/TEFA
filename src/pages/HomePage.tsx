import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { m, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { ArrowRight, Truck, Tag, Globe, Play, Instagram, X, ExternalLink } from 'lucide-react';
import { ProductCard } from '../components/ProductCard';
import { OptimizedImage } from '../components/OptimizedImage';
import { SEOHead } from '../components/SEOHead';
import { NewsletterModal } from '../components/NewsletterModal';
import { useStore } from '../data/store';
import { WheatIcon1, WheatIcon2, WheatIcon3 } from '../components/ReviewPlatformIcons';

import { DEFAULT_PRODUCTS } from '../data/products';
import { CustomerReview } from '../types';
import './HomePage.css';

// Hero images (using JPG for smaller file sizes)
const heroImages = [
  '/assets/Hero/Screenshot 2026-02-06 at 13.44.48.webp',
  '/assets/Hero/Screenshot 2026-02-07 at 09.26.26.webp',
  '/assets/Hero/Screenshot 2026-02-07 at 09.31.22.webp',
];




export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { products, categories, reviews, loading, currency, isSearchOpen } = useStore();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isNewsletterOpen, setIsNewsletterOpen] = useState(false);




  const { scrollY } = useScroll();
  const [rects, setRects] = useState<{ hero: DOMRect | null; nav: DOMRect | null }>({ hero: null, nav: null });

  // Recalculate rects for FLIP morph
  const updateRects = () => {
    const heroTarget = document.getElementById('hero-logo-target');
    const navTarget = document.getElementById('nav-logo-target');
    if (heroTarget && navTarget) {
      setRects({
        hero: heroTarget.getBoundingClientRect(),
        nav: navTarget.getBoundingClientRect()
      });
      return true;
    }
    return false;
  };

  useEffect(() => {
    let retries = 0;
    const measure = () => {
      if (!updateRects() && retries < 10) {
        retries++;
        requestAnimationFrame(measure);
      }
    };
    measure();

    let resizeTimer: NodeJS.Timeout;
    const handleResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(updateRects, 150); // Throttle resize
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(resizeTimer);
    };
  }, []);

  // Gucci-style threshold
  const threshold = 200;

  // Eased progress (easeInOutCubic)
  const rawProgress = useTransform(scrollY, [0, threshold], [0, 1]);
  const scrollProgress = useTransform(rawProgress, (p) => {
    // easeInOutCubic implementation
    return p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2;
  });

  // Interpolate position and scale
  const logoX = useTransform(scrollProgress, [0, 1], [
    rects.hero ? rects.hero.left + rects.hero.width / 2 : 0,
    rects.nav ? rects.nav.left + rects.nav.width / 2 : 0
  ]);

  const logoY = useTransform(scrollProgress, [0, 1], [
    rects.hero ? rects.hero.top + rects.hero.height / 2 : 0,
    rects.nav ? rects.nav.top + rects.nav.height / 2 : 0
  ]);

  const logoScale = useTransform(scrollProgress, [0, 1], [
    1,
    rects.hero && rects.nav ? rects.nav.width / rects.hero.width : 0.18
  ]);

  const logoColor = useTransform(scrollProgress, [0, 0.8, 1], ['#FFFFFF', '#FFFFFF', '#111111']);

  // Auto-slide hero every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Preload next hero slide for seamless transitions
  useEffect(() => {
    const nextIndex = (currentSlide + 1) % heroImages.length;
    const img = new Image();
    img.src = heroImages[nextIndex];
  }, [currentSlide]);



  // Newsletter Trigger
  useEffect(() => {
    // Wait 6 seconds before showing newsletter modal
    const timer = setTimeout(() => {
      const hasSubscribed = localStorage.getItem('tefa_newsletter_subscribed');
      const hasSeenModal = sessionStorage.getItem('tefa_newsletter_seen');

      if (!hasSubscribed && !hasSeenModal) {
        setIsNewsletterOpen(true);
        sessionStorage.setItem('tefa_newsletter_seen', 'true');
      }
    }, 6000);

    return () => clearTimeout(timer);
  }, []);


  return (
    <div className="home-page">
      <SEOHead
        title="Premium African Fashion | Handcrafted in Lagos"
        description="Discover TÉFA — premium African fashion for the bold and beautiful. Handcrafted kaftans, ankara sets, gowns, and accessories from Lagos, Nigeria. Free worldwide shipping."
        path="/"
      />
      <h1 className="visually-hidden">TÉFA — Premium African Fashion Boutique</h1>
      {/* Hero Section with Sliding Images */}
      <section className="hero">
        <div className="hero-bg">
          <AnimatePresence>
            <m.div
              key={currentSlide}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1, ease: 'easeInOut' }}
              style={{ position: 'absolute', inset: 0 }}
            >
              <OptimizedImage
                src={heroImages[currentSlide]}
                alt={`Hero Slide ${currentSlide + 1}`}
                priority={currentSlide === 0}
                sizes="100vw"
                quality="auto"
                widths={[640, 828, 1080, 1200, 1920]}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </m.div>
          </AnimatePresence>
          <div className="hero-overlay" />
        </div>

        {/* Hero Logo Target (Measurement Only) */}
        <div
          id="hero-logo-target"
          className="hero-logo-target"
          style={{
            position: 'absolute',
            top: '40%', // Exact Gucci placement
            left: '50%',
            transform: 'translate(-50%, -50%)',
            visibility: 'hidden',
            pointerEvents: 'none',
            fontFamily: "'Montserrat', sans-serif",
            fontSize: 'clamp(4rem, 15vw, 12rem)',
            fontWeight: 500,
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            whiteSpace: 'nowrap',
          }}
        >
          TÉFA
        </div>

        {/* Moving Wordmark (The actual animated element) */}
        {rects.hero && !isSearchOpen && (
          <m.div
            style={{
              position: 'fixed',
              left: 0,
              top: 0,
              x: logoX,
              y: logoY,
              translateX: '-50%',
              translateY: '-50%',
              scale: logoScale,
              color: logoColor,
              zIndex: 100, // Very high z-index
              pointerEvents: 'none',
              fontFamily: "'Montserrat', sans-serif",
              fontSize: 'clamp(4rem, 15vw, 12rem)',
              fontWeight: 500,
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              lineHeight: 0.9,
              whiteSpace: 'nowrap',
              willChange: 'transform',
            }}
          >
            TÉFA
          </m.div>
        )}

        <div className="hero-content">
          {/* Spacer to push content below the logo */}
          <div style={{ height: 'clamp(6rem, 20vw, 16rem)', marginBottom: 'var(--space-4)' }} />

          <m.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="hero-tagline font-brand"
            style={{
              letterSpacing: '0.05em',
              fontSize: 'clamp(1.5rem, 4vw, 2.5rem)',
              fontWeight: 600,
              display: 'inline-block',
              transform: 'scaleY(1.4)',
              transformOrigin: 'center',
              textTransform: 'uppercase'
            }}
          >
            PROUDLY NIGERIAN
          </m.p>
          <div
            className="new-arrival-button"
            role="button"
            tabIndex={0}
            aria-label="Shop New Arrivals"
            onKeyDown={(e) => e.key === 'Enter' && navigate('/shop')}
            onClick={() => navigate('/shop')}
          >
            <div className="box">S</div>
            <div className="box">H</div>
            <div className="box">O</div>
            <div className="box">P</div>
            <div className="box"></div>
            <div className="box">N</div>
            <div className="box">E</div>
            <div className="box">W</div>
          </div>
        </div>
      </section>

      {/* Categories Header Section */}
      <section className="categories section">
        <div className="categories-header">
          <h2>Browse Collections</h2>
        </div>
      </section>

      {/* New 3-Category Layout */}
      <section className="collection-grid">
        <div className="collection-row">
          {['Dresses', 'Pants'].map((name) => {
            const cat = categories.find(c => c.name.toLowerCase() === name.toLowerCase());
            if (!cat) return null;
            return (
              <m.div
                key={cat.id}
                className="collection-item half"
                onClick={() => navigate(`/shop/${cat.id}`)}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
              >
                <OptimizedImage
                  src={cat.image}
                  alt={cat.name}
                  sizes="50vw"
                  quality={80}
                  className="collection-image"
                />
                <div className="collection-label">
                  <span className="label-text">{cat.name}</span>
                </div>
              </m.div>
            );
          })}
        </div>
        <div className="collection-row">
          {['Sets'].map((name) => {
            const cat = categories.find(c => c.name.toLowerCase() === name.toLowerCase());
            if (!cat) return null;
            return (
              <m.div
                key={cat.id}
                className="collection-item full"
                onClick={() => navigate(`/shop/${cat.id}`)}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
              >
                <OptimizedImage
                  src={cat.image}
                  alt={cat.name}
                  sizes="100vw"
                  quality={80}
                  className="collection-image"
                />
                <div className="collection-label">
                  <span className="label-text">{cat.name}</span>
                </div>
              </m.div>
            );
          })}
        </div>
      </section>

      {/* Pattern Stack Section */}
      <section className="cta-pattern-top" />

      <section className="shop-all-cta">
        <m.button
          onClick={() => navigate('/shop')}
          className="shop-all-btn"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          Explore All Shop
        </m.button>
      </section>

      <section className="cta-pattern-bottom" />

      <NewsletterModal
        isOpen={isNewsletterOpen}
        onClose={() => setIsNewsletterOpen(false)}
      />
    </div>
  );
};

