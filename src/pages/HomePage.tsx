import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, easeIn } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { ProductCard } from '../components/ProductCard';
import { useStore } from '../data/store';
import { PageName, PageParams } from '../types';

// Hero images
const heroImages = [
  '/assets/Hero/Screenshot 2026-02-06 at 13.44.48.png',
  '/assets/Hero/Screenshot 2026-02-07 at 09.26.26.png',
  '/assets/Hero/Screenshot 2026-02-07 at 09.31.22.png',
];

// Story Stack Images
const storyImages = [
  '/assets/images/Screenshot 2026-02-07 at 11.32.55.jpg',
  '/assets/images/Screenshot 2026-02-07 at 11.33.18.jpg',
  '/assets/images/Screenshot 2026-02-07 at 11.51.16.png',
];

interface HomePageProps {
  onNavigate: (page: PageName, params?: PageParams) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onNavigate }) => {
  const { products, categories } = useStore();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [storyStack, setStoryStack] = useState(storyImages);
  const [hoveredCategoryId, setHoveredCategoryId] = useState<string | null>(null);
  const [showScrollHint, setShowScrollHint] = useState(true);
  const categoriesRef = React.useRef<HTMLDivElement>(null);

  // Handle categories scroll to hide hint
  const handleCategoriesScroll = () => {
    if (categoriesRef.current) {
      if (categoriesRef.current.scrollLeft > 20) {
        setShowScrollHint(false);
      } else {
        setShowScrollHint(true);
      }
    }
  };

  // Auto-slide hero every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Shuffle story stack every 4 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setStoryStack((prev) => {
        const next = [...prev];
        const first = next.shift();
        if (first) next.push(first);
        return next;
      });
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="home-page">
      {/* Hero Section with Sliding Images */}
      <section className="hero">
        <div className="hero-bg">
          <AnimatePresence>
            <motion.img
              key={currentSlide}
              src={heroImages[currentSlide]}
              alt={`Hero Slide ${currentSlide + 1}`}
              initial={{ opacity: 0, scale: 1 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1 }}
              transition={{ duration: 1, ease: 'easeInOut' }}
            />
          </AnimatePresence>
          <div className="hero-overlay" />
        </div>

        <div className="hero-content">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="hero-eyebrow"
          >
            HOUSE OF TEFA
          </motion.span>
          <div className="hero-title-container">
            <h1 className="hero-title">
              Confidence in <br></br> Every Stitch
            </h1>
          </div>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="hero-tagline"
          >
            PROUDLY NIGERIAN
          </motion.p>
          <div
            className="new-arrival-button"
            onClick={() => onNavigate('shop')}
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

      {/* Categories Section */}
      <section className="categories section">
        <div className="container">
          <div className="categories-header">
            <h2>Browse Collections</h2>
            <button onClick={() => onNavigate('shop')}>See All Shop</button>
          </div>
          <div className="categories-wrapper">
            <div
              className="categories-grid"
              ref={categoriesRef}
              onScroll={handleCategoriesScroll}
            >
              {categories.map((cat, idx) => (
                <motion.div
                  key={cat.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  onClick={() => onNavigate('shop', { categoryId: cat.id })}
                  onMouseEnter={() => setHoveredCategoryId(cat.id)}
                  onMouseLeave={() => setHoveredCategoryId(null)}
                  className="category-card"
                >
                  <motion.img
                    animate={{
                      scale: hoveredCategoryId === cat.id ? 1.05 : 1,
                    }}
                    src={hoveredCategoryId === cat.id && cat.hoverImage ? cat.hoverImage : cat.image}
                    alt={cat.name}
                  />
                  <div className="category-overlay" />
                  <div className="category-content">
                    <h3>{cat.name}</h3>
                    <div className="category-line" />
                  </div>
                </motion.div>
              ))}
            </div>

            <AnimatePresence>
              {showScrollHint && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="scroll-hint"
                >
                  <span>Scroll to explore</span>
                  <ArrowRight size={16} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </section>

      {/* Brand Story Section */}
      <section className="story section">
        <div className="container-full">
          <div className="story-grid">
            <div className="story-text">
              <h2 className="story-title">
                CLOTHES WITH A STORY
              </h2>
              <p className="story-description">
                Every TEFA piece has its own unique story. <br /><br />
                Adire is a traditional textile art from Nigeria, particularly the Yoruba people, known for its distinctive indigo-dyed patterns and complex designs. It involves various re-sist-dyeing
                techniques, including "tie and dye" where fabric is tied and then dyed to create patterns.
                The name "Adire" itself translates to "tie and dye" in Yoruba. <br /><br />
                Adire is "handmade"
                , it goes
                through a series of processes for the designs to be created and for that reason mistakes would be made which are those small stains you see which is almost inevitable, we hope everyone understands this
              </p>
              <button onClick={() => onNavigate('about')} className="story-link-btn">
                Discover what's new
              </button>
            </div>
            <div className="story-image-container">
              <div className="image-stack">
                <AnimatePresence mode="popLayout">
                  {storyStack.map((src, index) => {
                    // Logic: index 0 is at the bottom, last index is at the top
                    // We want to show 3 images.
                    // The one at the end of the array is the "front" one.
                    const isFront = index === storyStack.length - 1;
                    const isMiddle = index === storyStack.length - 2;
                    const isBack = index === storyStack.length - 3;

                    if (index < storyStack.length - 3) return null;

                    return (
                      <motion.div
                        key={src}
                        className={`stack-card ${isFront ? 'front' : isMiddle ? 'middle' : 'back'}`}
                        initial={{ x: 300, opacity: 0, scale: 0.8 }}
                        animate={{
                          x: isFront ? 0 : isMiddle ? -40 : -80,
                          y: isFront ? 0 : isMiddle ? 10 : 20,
                          rotate: isFront ? 0 : isMiddle ? -5 : -10,
                          scale: isFront ? 1 : isMiddle ? 0.9 : 0.8,
                          zIndex: index,
                          opacity: 1
                        }}
                        exit={{ x: -300, opacity: 0, scale: 0.8 }}
                        transition={{
                          type: 'spring',
                          stiffness: 260,
                          damping: 20,
                          opacity: { duration: 0.2 }
                        }}
                      >
                        <img src={src} alt="Story Stack" />
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            </div>
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
          height: 60vh;
          display: flex;
          align-items: center;
          overflow: hidden;
        }

        .hero-bg {
          position: absolute;
          inset: 0;
        }

        .hero-bg img {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .hero-overlay {
          display: none;
        }

        .hero-content {
          position: relative;
          max-width: 1280px;
          margin: 0 auto;
          padding: 0 var(--space-4);
          width: 100%;
          color: #111111;
        }

        .hero-eyebrow {
          display: block;
          font-family: 'Inter', sans-serif;
          font-size: 1.25rem;
          text-transform: uppercase;
          letter-spacing: 0.4em;
          font-weight: 800;
          margin-bottom: var(--space-4);
          color: #FFFFFF;
          text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
          opacity: 1;
        }

        .hero-title {
          font-family: 'LC SAC', 'Inter', sans-serif;
          font-size: clamp(3rem, 8vw, 5.5rem);
          font-weight: 700;
          font-style: normal;
          line-height: 1.1;
          margin-bottom: var(--space-6);
          color: #111111;
          text-shadow: 
            -2px -2px 0 rgba(255,255,255,0.9),
            2px -2px 0 rgba(255,255,255,0.9),
            -2px 2px 0 rgba(255,255,255,0.9),
            2px 2px 0 rgba(255,255,255,0.9),
            0 0 30px rgba(255,255,255,1);
        }

        .hero-title-container {
          color: #111111;
        }

        .hero-tagline {
          font-size: 1.5rem;
          font-weight: 700;
          margin-bottom: var(--space-10);
          color: #FFFFFF;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
          opacity: 1;
        }

        .hero-indicators {
          display: flex;
          gap: var(--space-3);
          margin-top: var(--space-10);
        }

        .indicator {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          border: 2px solid white;
          background: transparent;
          cursor: pointer;
          transition: all var(--transition-fast);
          padding: 0;
        }

        .indicator:hover {
          background: rgba(255, 255, 255, 0.5);
        }

        .indicator.active {
          background: white;
          transform: scale(1.2);
        }

        .new-arrival-button {
          display: flex;
          cursor: pointer;
          margin-top: var(--space-4);
          box-shadow: 0 4px 15px rgba(0,0,0,0.1);
          border: 1px solid #111111;
          width: fit-content;
        }

        .new-arrival-button .box {
          width: 40px;
          height: 50px;
          display: flex;
          justify-content: center;
          align-items: center;
          font-size: 14px;
          font-weight: 700;
          color: #111111;
          transition: all .6s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          background: rgba(206, 135, 13, 1);
          overflow: hidden;
          font-family: 'Inter', sans-serif;
        }

        .new-arrival-button .box:before {
          content: "A";
          position: absolute;
          top: 0;
          background: #FFFFFF;
          color: #111111;
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          transform: translateY(100%);
          transition: transform .4s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .new-arrival-button .box:nth-child(2)::before {
          transform: translateY(-100%);
          content: 'R';
        }

        .new-arrival-button .box:nth-child(3)::before {
          content: 'R';
        }

        .new-arrival-button .box:nth-child(4)::before {
          transform: translateY(-100%);
          content: 'I';
        }

        .new-arrival-button .box:nth-child(5)::before {
          content: 'V';
        }
        .new-arrival-button .box:nth-child(6)::before {
          transform: translateY(-100%);
          content: 'A';
        }

        .new-arrival-button .box:nth-child(7)::before {
          content: 'L';
        }
        .new-arrival-button .box:nth-child(8)::before {
          transform: translateY(-100%);
          content: 'S';
        }

        .new-arrival-button:hover .box:before {
          transform: translateY(0);
        }

        /* Story Section */
        .story {
          background: #D2A55D;
          padding: 0;
          overflow: hidden;
        }

        .container-full {
          width: 100%;
          max-width: 100%;
        }

        .story-grid {
          display: grid;
          grid-template-columns: 1fr;
          align-items: stretch;
        }

        @media (min-width: 768px) {
          .story-grid {
            grid-template-columns: 1fr 1fr;
          }
        }

        .story-text {
          padding: var(--space-16) var(--space-8);
          display: flex;
          flex-direction: column;
          justify-content: center;
          color: #111111;
        }

        @media (min-width: 1024px) {
          .story-text {
            padding: var(--space-20) var(--space-16);
            max-width: 600px;
            margin-left: auto;
          }
        }

        .story-title {
          font-family: 'Rethena', serif;
          font-size: clamp(2rem, 4vw, 2.5rem);
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          line-height: 1.1;
          margin-bottom: var(--space-8);
          color: #111111;
        }

        .story-description {
          color: rgba(0, 0, 0, 0.8);
          font-size: 1rem;
          line-height: 1.6;
          margin-bottom: var(--space-10);
          max-width: 500px;
        }

        .story-link-btn {
          background: #BDC6A1;
          color: #111111;
          border: none;
          padding: var(--space-4) var(--space-8);
          font-family: 'Rethena', serif;
          font-size: 0.875rem;
          font-weight: 600;
          width: fit-content;
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .story-link-btn:hover {
          opacity: 0.9;
          transform: translateY(-2px);
        }

        .story-image-container {
          position: relative;
          height: 100%;
          min-height: 500px;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: var(--space-8);
          overflow: visible;
        }

        @media (min-width: 768px) {
          .story-image-container {
            min-height: 600px;
          }
        }

        .image-stack {
          position: relative;
          width: 80%;
          height: 80%;
          max-width: 400px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .stack-card {
          position: absolute;
          width: 100%;
          aspect-ratio: 4 / 5;
          background: white;
          padding: 8px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.15);
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .stack-card img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        /* Categories */
        .categories {
          background: var(--color-cream-dark);
          padding-bottom: 20px !important;
        }

        .categories .container {
          max-width: 100%;
          padding: 0 4px;
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
          display: flex;
          gap: 2px;
          overflow-x: auto;
          scroll-snap-type: x mandatory;
          -webkit-overflow-scrolling: touch;
          padding-bottom: var(--space-4);
          scrollbar-width: none; /* Firefox */
          -ms-overflow-style: none; /* IE 10+ */
        }

        .categories-grid::-webkit-scrollbar {
          display: none; /* Chrome/Safari/Webkit */
        }

        .categories-wrapper {
          position: relative;
        }

        .scroll-hint {
          position: absolute;
          right: 20px;
          bottom: 20px;
          display: flex;
          align-items: center;
          gap: 8px;
          background: rgba(255, 255, 255, 0.9);
          padding: 8px 16px;
          border-radius: 20px;
          font-family: 'Inter', sans-serif;
          font-size: 0.75rem;
          font-weight: 600;
          color: #111111;
          box-shadow: 0 4px 15px rgba(0,0,0,0.1);
          pointer-events: none;
          z-index: 10;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .category-card {
          position: relative;
          flex: 0 0 calc(25% - 2px); /* 4 visible on desktop, slightly more/less depending on container */
          min-width: 250px;
          aspect-ratio: 3 / 4;
          border-radius: 0;
          overflow: hidden;
          cursor: pointer;
          scroll-snap-align: start;
        }

        @media (max-width: 768px) {
          .category-card {
            flex: 0 0 75%; /* Show part of the next one on mobile */
            min-width: 200px;
          }
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

        /* Brand Story Section overrides */
        .story.section {
          padding-top: 20px !important;
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
