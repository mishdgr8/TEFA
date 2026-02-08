import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Truck, Tag, Globe, Play, Instagram, X, ExternalLink } from 'lucide-react';
import { ProductCard } from '../components/ProductCard';
import { useStore } from '../data/store';
import { DEFAULT_PRODUCTS } from '../data/products';
import { CustomerReview } from '../types';

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

// Instagram review videos (placeholders - replace with real embed URLs)
const instagramReviews: CustomerReview[] = [
  { id: '1', thumbnail: '/assets/images/Screenshot 2026-02-07 at 11.32.55.jpg', username: '@tefa_customer1', platform: 'instagram', videoUrl: '' },
  { id: '2', thumbnail: '/assets/images/Screenshot 2026-02-07 at 11.33.18.jpg', username: '@tefa_lover', platform: 'instagram', videoUrl: '' },
  { id: '3', thumbnail: '/assets/images/Screenshot 2026-02-07 at 11.51.16.png', username: '@adire_queen', platform: 'instagram', videoUrl: '' },
  { id: '4', thumbnail: '/assets/Hero/Screenshot 2026-02-06 at 13.44.48.png', username: '@fashion_ng', platform: 'instagram', videoUrl: '' },
];

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { products, categories, reviews, loading, currency } = useStore();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [storyStack, setStoryStack] = useState(storyImages);
  const [hoveredCategoryId, setHoveredCategoryId] = useState<string | null>(null);
  const [showScrollHint, setShowScrollHint] = useState(true);

  const categoriesRef = React.useRef<HTMLDivElement>(null);

  // Use default products while loading to ensure featured section always shows
  const displayProducts = products.length > 0 ? products : DEFAULT_PRODUCTS;

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

      {/* Categories Section */}
      <section className="categories section">
        <div className="container">
          <div className="categories-header">
            <h2>Browse Collections</h2>
            <button onClick={() => navigate('/shop')}>See All Shop</button>
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
                  onClick={() => navigate(`/shop/${cat.id}`)}
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
              <button onClick={() => navigate('/about')} className="story-link-btn">
                Discover what's new
                <div className="wheat-icon-1">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 26.3 65.33" style={{ shapeRendering: 'geometricPrecision', fillRule: 'evenodd', clipRule: 'evenodd' }}>
                    <path d="M13.98 52.87c0.37,-0.8 0.6,-1.74 0.67,-2.74 1.01,1.1 2.23,2.68 1.24,3.87 -0.22,0.26 -0.41,0.61 -0.59,0.97 -2.95,5.89 3.44,10.87 2.98,0.78 0.29,0.23 0.73,0.82 1.03,1.18 0.33,0.4 0.7,0.77 1,1.15 0.29,0.64 -0.09,2.68 1.77,4.91 5.42,6.5 5.67,-2.38 0.47,-4.62 -0.41,-0.18 -0.95,-0.26 -1.28,-0.54 -0.5,-0.41 -1.23,-1.37 -1.66,-1.9 0.03,-0.43 -0.17,-0.13 0.11,-0.33 4.98,1.72 8.4,-1.04 2.38,-3.16 -1.98,-0.7 -2.9,-0.36 -4.72,0.16 -0.63,-0.58 -2.38,-3.82 -2.82,-4.76 1.21,0.56 1.72,1.17 3.47,1.3 6.5,0.5 2.31,-4.21 -2.07,-4.04 -1.12,0.04 -1.62,0.37 -2.49,0.62l-1.25 -3.11c0.03,-0.26 0.01,-0.18 0.1,-0.28 1.35,0.86 1.43,1 3.25,1.45 2.35,0.15 3.91,-0.15 1.75,-2.4 -1.22,-1.27 -2.43,-2.04 -4.22,-2.23l-2.08 0.13c-0.35,-0.58 -0.99,-2.59 -1.12,-3.3l-0.01 -0.01c-0.24,-0.36 1.88,1.31 2.58,1.57 1.32,0.49 2.6,0.33 3.82,0 -0.37,-1.08 -1.17,-2.31 -2.13,-3.11 -1.79,-1.51 -3.07,-1.41 -5.22,-1.38l-0.93 -4.07c0.41,-0.57 1.41,0.9 2.82,1.36 0.96,0.31 1.94,0.41 3,0.14 2,-0.52 -2.25,-4.4 -4.53,-4.71 -0.7,-0.1 -1.23,-0.04 -1.92,-0.03 -0.46,-0.82 -0.68,-3.61 -0.92,-4.74 0.8,0.88 1.15,1.54 2.25,2.23 0.8,0.5 1.58,0.78 2.57,0.85 2.54,0.18 -0.1,-3.47 -0.87,-4.24 -1.05,-1.05 -2.34,-1.59 -4.32,-1.78l-0.33 -3.49c0.83,0.67 1.15,1.48 2.3,2.16 1.07,0.63 2.02,0.89 3.58,0.79 0.15,-1.34 -1.07,-3.39 -2.03,-4.3 -1.05,-0.99 -2.08,-1.47 -3.91,-1.68l-0.07 -3.27 0.32 -0.65c0.44,0.88 1.4,1.74 2.24,2.22 0.69,0.39 2.4,1.1 3.44,0.67 0.31,-1.92 -1.84,-4.49 -3.5,-5.29 -0.81,-0.39 -1.61,-0.41 -2.18,-0.68 -0.12,-1.28 0.27,-3.23 0.37,-4.55l-0.89 0c-0.06,1.28 -0.35,3.12 -0.34,4.31 -0.44,0.45 -0.37,0.42 -0.96,0.64 -3.88,1.49 -4.86,6.38 -3.65,7.34 1.42,-0.31 3.69,-2.14 4.16,-3.66 0.23,0.5 0.1,2.36 0.05,3.05 -1.23,0.4 -2.19,1.05 -2.92,1.82 -1.17,1.24 -2.36,4.04 -1.42,5.69 1.52,0.09 4.07,-2.49 4.49,-4.07l0.29 3.18c-2.81,0.96 -5.01,3.68 -4.18,7.43 2.06,-0.09 3.78,-2.56 4.66,-4.15 0.23,1.45 0.67,3.06 0.74,4.52 -1.26,0.93 -2.37,1.8 -2.97,3.55 -0.48,1.4 -0.49,3.72 0.19,4.55 0.59,0.71 2.06,-1.17 2.42,-1.67 1,-1.35 0.81,-1.92 1.29,-2.46l0.7 3.44c-0.49,0.45 -0.94,0.55 -1.5,1.19 -1.93,2.23 -2.14,4.33 -1.01,6.92 0.72,0.09 2.04,-1.4 2.49,-2.06 0.65,-0.95 0.79,-1.68 1.14,-2.88l0.97 2.92c-0.2,0.55 -1.84,1.32 -2.6,3.62 -0.54,1.62 -0.37,3.86 0.67,4.93 0.58,-0.09 1.85,-1.61 2.2,-2.19 0.66,-1.09 0.66,-1.64 1,-2.93l1.32 3.18c-0.23,0.72 -1.63,1.72 -1.82,4.18 -0.17,2.16 1.11,6.88 3.13,2.46zm-4.09 -16.89l0.01 0.01z" fill="currentColor" />
                  </svg>
                </div>
                <div className="wheat-icon-2">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 11.67 37.63" style={{ shapeRendering: 'geometricPrecision', fillRule: 'evenodd', clipRule: 'evenodd' }}>
                    <path d="M7.63 35.26c-0.02,0.13 0.01,0.05 -0.06,0.14l-0.11,0.1c-0.42,0.25 -0.55,0.94 -0.23,1.4 0.68,0.95 2.66,0.91 3.75,0.21 0.2,-0.13 0.47,-0.3 0.57,-0.49 0.09,-0.02 0.04,0.03 0.11,-0.07l-1.35 -1.24c-0.78,-0.78 -1.25,-1.9 -2.07,-0.62 -0.11,0.18 -0.06,0.16 -0.22,0.26 -0.4,-0.72 -0.95,-1.79 -1.26,-2.59 0.82,0.02 1.57,-0.12 2.16,-0.45 0.49,-0.27 1.15,-0.89 1.33,-1.4l0.06,-0.1c-0.24,-0.16 -0.87,-0.37 -1.19,-0.52 -0.4,-0.19 -0.73,-0.39 -1.09,-0.62 -0.25,-0.16 -0.85,-0.6 -1.18,-0.3 -0.35,0.32 -0.32,0.83 -0.53,1.17 -0.71,-0.3 -0.55,-0.26 -0.84,-1.22 -0.15,-0.5 -0.31,-1.12 -0.41,-1.66l0.03 -0.13c0.56,0.23 1.28,0.37 1.99,0.28 0.56,-0.07 1.33,-0.42 1.62,-0.71l0.1 -0.1c-0.74,-0.68 -1.09,-1.2 -1.65,-1.99 -1.09,-1.52 -1.2,-0.28 -1.92,0.17 -0.26,-0.79 -0.73,0.2 -0.12,-2.76 0.06,-0.3 0.19,-0.7 0.2,-0.98l0.11,0.08c0.05,0.05 0.07,0.07 0.1,0.12 0.94,1.17 3.63,0.82 4.21,0.01l0.1,-0.1c-1.14,-0.81 -1.91,-2.89 -2.58,-2.67 -0.29,0.09 -0.78,0.63 -0.93,0.87 -0.54,-0.48 -0.36,-0.63 -0.38,-0.81l0.03,-0.03c0.36,-0.35 0.45,-0.6 0.45,-0.6 0.13,-0.35 0.04,-0.65 -0.05,-0.95 0.06,-0.41 0.33,-1.33 0.28,-1.71l0.45,0.17c0.47,0.23 1.17,0.33 1.7,0.32 0.62,0 1.74,-0.39 1.94,-0.75l0.13,-0.09c-1.05,-1.1 -0.7,-0.64 -1.62,-1.92 -0.58,-0.81 -0.9,-1.27 -1.9,0.12 -0.44,-0.5 -0.64,-0.69 -0.66,-1.24 0.02,-0.31 0.15,-0.36 0.08,-0.73 -0.04,-0.24 -0.14,-0.41 -0.29,-0.59l-0.47 -2.54c0.09,-0.14 -0.09,-0.1 0.2,-0.05l0.3,0.07c0.54,0.09 1.47,0.01 1.95,-0.15 0.57,-0.19 1.53,-0.8 1.68,-1.18l0.15,-0.13c-0.12,-0.15 -0.95,-0.65 -1.15,-0.8 -1.43,-1.08 -2.21,-2.77 -3.16,-0.38 -0.2,-0.1 -0.75,-0.55 -0.83,-0.74 -0.15,-0.35 -0.21,-0.81 -0.37,-1.15l-0.1 -0.25c-0.03,-0.3 -0.44,-1.33 -0.57,-1.64 -0.2,-0.51 -0.47,-1.09 -0.64,-1.6l-0.55 0c0.14,0.42 0.36,0.84 0.53,1.28 0.12,0.3 0.19,0.35 0.06,0.66l-0.21 0.52c-0.06,0.1 -0.03,0.05 -0.06,0.09 -1.44,-1.03 -1.66,-0.73 -2.07,0.46 -0.16,0.46 -0.3,0.93 -0.5,1.36l-0.64 1.28c0.06,0.07 0,0.03 0.1,0.03l0.1,0.08 0.49,0.14c0.23,0.05 0.44,0.09 0.66,0.1 0.55,0.04 0.94,-0.06 1.35,-0.19 0.54,-0.18 1.09,-0.44 1.5,-0.82 0.15,-0.14 0.24,-0.3 0.4,-0.41l0.46 1.66c0.03,0.74 -0.09,0.6 0.27,1.21l0.02,0.03 0.02,0.04 0.07,0.11c-0.02,0.22 0.19,1.01 0.24,1.29 0.09,0.46 -0.21,0.79 -0.3,1.2 -0.55,-0.23 -1.25,-1.06 -1.66,-0.23 -0.12,0.25 -0.17,0.36 -0.26,0.62 -0.33,1.01 -0.63,1.61 -1.06,2.43l0.12,0.04 0.23,0.11c0.06,0.02 0.17,0.04 0.25,0.06 0.17,0.04 0.34,0.08 0.52,0.09 0.29,0.02 0.93,0.07 1.12,-0.13 0.42,0.01 1.24,-0.49 1.51,-0.71l0.04,0.02 0.09,0.06c-0.04,0.29 0.02,0.41 0.03,0.7l-0.05 1.41c-0.06,1.12 -0.29,1.06 -0.76,1.69l-0.11,-0.11c-0.03,-0.03 -0.06,-0.08 -0.09,-0.11 -0.2,-0.25 -0.38,-0.54 -0.7,-0.69 -0.7,-0.32 -1.52,1.73 -2.82,2.61l0.1,0.11c0.25,0.3 1,0.67 1.5,0.78 0.35,0.08 0.71,0.08 1.09,0.05 0.25,-0.02 0.82,-0.16 0.92,-0.13 -0.16,0.69 -0.35,1.35 -0.52,2.03 -0.25,1 -0.03,0.77 -0.98,1.53 -0.3,-0.31 -0.33,-0.77 -0.77,-1.02 -0.42,-0.25 -0.91,0.35 -1.12,0.55 -0.33,0.32 -0.58,0.6 -0.97,0.89 -0.19,0.14 -0.34,0.26 -0.53,0.4 -0.14,0.11 -0.43,0.29 -0.53,0.4l0.15,0.13c0.09,0.22 0.35,0.38 0.54,0.52 0.22,0.16 0.43,0.29 0.69,0.39 0.43,0.17 1.32,0.31 1.87,0.23l0.23,-0.05c0.32,0.05 0.52,-0.18 0.79,-0.24l-0.02 0.66c0,0.77 -0.24,0.75 0.16,1.51l0.04,0.07 0.02,0.04c-0.05,0.35 0.18,1.03 0.24,1.4 -0.23,0.18 -0.34,0.33 -0.51,0.41 -0.75,-1.17 -0.82,-1.52 -1.92,-0.43 -0.32,0.31 -0.59,0.57 -0.95,0.86 -0.23,0.19 -0.95,0.65 -1.05,0.81l0.13,0.1c0.88,1.15 3.14,1.5 4.1,0.82 0.47,-0.34 0.54,-0.56 0.52,-1.34l0.67 1.84c0.03,0.16 0.06,0.28 0.12,0.42l0.09,0.17c0.1,0.15 0.03,0.06 0.13,0.14 0,0.29 0.14,0.22 0.06,0.56 -0.03,0.13 -0.14,0.43 -0.19,0.53 -1.94,-1.27 -1.57,-0.02 -2.28,1.76 -0.16,0.41 -0.37,0.77 -0.53,1.2l0.15,0.03c0.29,0.33 1.66,0.28 2.36,-0.01 0.48,-0.2 0.96,-0.46 1.3,-0.82 0.15,-0.16 0.16,-0.3 0.38,-0.33 0.14,0.08 0.17,0.19 0.27,0.36z" fill="currentColor" />
                  </svg>
                </div>
                <div className="wheat-icon-3">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 25.29 76.92" style={{ shapeRendering: 'geometricPrecision', fillRule: 'evenodd', clipRule: 'evenodd' }}>
                    <path d="M19.14 6.58l0.17,0.15 0.27,0.13 0.16,0.02 0.22,0.18c0.63,0.37 1.81,0.52 2.51,0.53 0.42,-0.26 0.61,-1.58 0.55,-2.27 -0.11,-1.17 -1.02,-3.42 -2.17,-3.76 -0.84,-0.25 -1.19,0.02 -1.4,0.7l-0.09,0.28 -0.18,0.25c-0.18,-0.36 -0.77,-0.97 -1.2,-1.18 -0.64,-0.31 -0.36,-0.26 -0.84,-1.59l-0.75 0c0.2,0.63 0.44,1.27 0.61,1.92 0.17,0.64 0.47,1.46 0.58,2.05 -0.21,0.36 -0.43,0.5 -0.31,1.1 0.11,0.51 0.35,0.71 0.76,0.9 0.13,0.31 0.36,1.33 0.39,1.78 -0.68,0.24 -1.38,0.85 -1.62,1.43 -0.45,-0.47 -0.29,-1.59 -1.59,-1.22 -0.8,0.22 -1.09,0.8 -1.45,1.52 -0.58,1.18 -0.96,2.15 -0.6,3.58l0.19,0.55c0.11,0.29 0.09,0.34 0.35,0.44 1.74,-0.01 2.96,-0.82 4.13,-1.55 0.22,-0.13 0.65,-0.39 0.79,-0.62 0.74,-1.2 -0.74,-2.14 -1.7,-2.43 -0.01,-0.51 1.07,-0.87 1.7,-0.82 0.21,1.74 0.56,3.5 0.61,5.33 0.05,2.05 0.01,3.68 -0.08,5.71 -1.2,0.52 -0.99,0.65 -1.77,1.46 -0.39,-0.45 -0.22,-1.6 -1.59,-1.18 -0.79,0.24 -0.91,0.63 -1.42,1.55 -0.78,1.41 -0.95,2.66 -0.36,4.15 0.14,0.35 0.06,0.36 0.36,0.37 0.78,0 1.47,-0.18 2.09,-0.43 0.51,-0.2 1.26,-0.76 1.69,-0.86 -0.18,0.3 -0.34,0.91 -0.48,1.25l-1.54 3.5c-1.75,0.08 -1.26,0.29 -2.27,0.59 0.1,-1.15 0.1,-1.69 -1.1,-1.78 -0.7,-0.05 -1.5,0.65 -1.91,0.96 -1.04,0.82 -1.93,1.81 -1.94,3.77l0.18,0.11c0.24,0.36 1.4,0.49 1.94,0.58l0.19,-0.01 0.71,-0.01 0.08,-0.02 1.74,-0.17c0.25,0.04 0.03,-0.07 0.19,0.09l-2.62 4.74c-0.28,0.51 -0.56,1.2 -0.86,1.61 -0.44,-0.02 -0.69,-0.14 -1.18,-0.08 -0.38,0.04 -0.72,0.17 -1.08,0.22 0.1,-0.53 0.78,-1.5 -0.62,-1.96 -0.79,-0.26 -1.74,0.32 -2.33,0.6 -2.12,1.02 -2.81,3.28 -2.36,3.38l0.03,0.04 0.11,0.1c0.42,0.34 1.16,0.64 1.66,0.79 0.65,0.19 1.73,0.31 2.43,0.38 3,0.28 1.16,-2.8 1.09,-3.14 0.86,0.12 1.3,-0.05 1.81,0.56 -0.08,0.35 -0.53,1.2 -0.71,1.6 -0.74,1.61 -1.24,3.24 -1.73,4.96 -0.92,0.11 -1.11,0.44 -1.77,0.69 0.01,-1.08 0.1,-1.68 -1.14,-1.71 -0.55,-0.01 -0.8,0.17 -1.11,0.41 -1.43,1.08 -2.52,2.24 -2.53,4.15 0,0.62 0.11,0.48 0.22,0.54 0.63,0.38 1.79,0.44 2.67,0.35 0.47,-0.05 0.97,-0.11 1.43,-0.2l0.98,-0.22c0.38,-0.08 0.14,-0.15 0.26,0.06 -0.08,0.78 -0.66,2.6 -0.56,3.29l-0.17,0.29 -0.12,0.33c-0.07,0.3 -0.02,0.6 -0.03,0.92 -0.09,0.94 -0.17,0.52 -0.78,0.94 -0.32,0.22 -0.57,0.55 -0.86,0.82 -0.29,-0.69 -0.22,-1.44 -1.39,-1.13 -0.93,0.25 -1.93,2.19 -2.03,3.16 -0.06,0.56 0.02,1.84 0.39,2.08 2,0.02 2.64,-0.6 4.08,-1.25l-0.01,0.28c-0.06,0.58 -0.22,2.09 -0.14,2.62 -0.44,0.37 -0.46,1.03 -0.12,1.49 -0.08,3.97 0.16,2.73 -0.77,3.57 -0.24,0.21 -0.37,0.4 -0.62,0.62 -0.36,-0.53 -0.09,-1.43 -1.37,-1.13 -0.98,0.23 -1.92,2.22 -2.06,3.14 -0.07,0.47 -0.07,1.79 0.41,2.09 0.86,0.04 1.94,-0.12 2.51,-0.52l0.16,-0.08c0.6,-0.17 1.39,-0.67 1.84,-0.94l0.14,0.1c-0.18,0.38 -0.31,0.07 -0.71,0.58 -0.67,0.86 0.33,1.72 0.89,2.31 0.6,0.64 1.71,1.63 2.94,1.88 0.38,-0.11 0.92,-1.2 1.04,-1.69 0.21,-0.86 0.15,-1.53 -0.05,-2.41 -0.22,-0.94 -0.24,-1.38 -1.01,-1.81 -0.93,-0.52 -1.19,0.28 -1.59,0.76 -0.21,-0.33 -0.33,-0.79 -0.58,-1.12 -0.48,-0.62 -0.48,-0.13 -0.5,-1.22 -0.02,-1.09 0.05,-2.25 0.01,-3.32 0.37,0.22 0.89,0.86 1.37,1.21 0.51,0.37 1.05,0.65 1.76,0.82 0.32,-0.02 0.92,-1.21 1.04,-1.68 0.22,-0.87 0.15,-1.53 -0.04,-2.41 -0.19,-0.86 -0.3,-1.41 -0.96,-1.79 -1.06,-0.6 -1.26,0.38 -1.71,0.74 -0.22,-0.8 -0.65,-1.34 -1.19,-1.71l0.5 -4.35 0.38,0.28c0.23,0.25 0.6,0.67 0.87,0.82l0.19,0.21c0.18,0.23 0.66,0.57 0.92,0.6l0.16,0.16 0.18,0.11c0.14,0.07 0.26,0.1 0.44,0.15l0.45,0.17c0.35,0.08 0.75,-0.74 0.91,-1.05 0.21,-0.4 0.41,-1.07 0.43,-1.57 0,-0.28 0.04,-0.67 -0.1,-0.85l0.03,-0.17c0,-0.04 -0.01,-0.13 -0.01,-0.15l-0.09,-0.17c0.06,-0.51 -0.25,-1.75 -0.94,-2.22 -1.11,-0.74 -1.37,0.09 -1.86,0.69l-0.12,-0.2c-0.28,-0.56 -0.41,-1.06 -1,-1.45 0.04,-1.21 1.29,-5.03 1.31,-5.65l0.12,0.13c0.63,0.83 0.41,0.6 1.22,1.38 0.76,0.74 1.67,1.73 2.95,1.92 0.28,0.13 0.55,-0.41 0.69,-0.64 0.21,-0.34 0.36,-0.64 0.47,-1.02 0.36,-1.24 0.14,-3.92 -1.03,-4.6 -1.23,-0.72 -1.67,0.89 -1.75,0.72l-0.04,0.03c-0.19,-0.33 -0.3,-0.68 -0.49,-1 -0.22,-0.38 -0.47,-0.51 -0.68,-0.79 0.39,-1.04 1.05,-2.29 1.59,-3.3 0.57,-1.06 1.2,-2.15 1.7,-3.17 1.43,-0.02 1.51,0.55 1.8,0.6l-0.16,0.2c-0.8,0.47 -1.8,0.96 -1.37,2.09 0.14,0.37 0.42,0.53 0.75,0.73 1.23,0.73 2.46,1.53 4.32,1.53 0.28,-0.08 0.25,-0.15 0.35,-0.44 0.22,-0.63 0.33,-1.22 0.26,-1.93 -0.11,-1.05 -1.06,-3.33 -2.21,-3.65 -1.31,-0.37 -1.17,0.6 -1.56,1.21l-0.2,-0.19c-0.84,-0.96 -0.61,-0.56 -1.27,-1.09 0.16,-0.47 0.7,-1.32 0.98,-1.82 1.05,-1.91 1.94,-3.59 2.84,-5.61 0.73,0.01 1.23,0.31 1.57,0.68 -0.26,0.25 -1.37,0.7 -1.67,1.19 -0.51,0.8 -0.07,1.45 0.63,1.87 1.15,0.7 2.56,1.58 4.34,1.55 0.33,-0.09 0.46,-0.67 0.52,-0.98 0.28,-1.4 -0.01,-2.34 -0.66,-3.5 -0.49,-0.87 -0.67,-1.3 -1.44,-1.54 -1.15,-0.36 -1.27,0.44 -1.56,1.23 -0.65,-0.55 0.03,-0.23 -1.38,-1.25 0.22,-0.6 1.08,-2.59 1.06,-3.14 0.38,-0.35 0.52,-0.78 0.43,-1.4 0.22,-0.75 0.67,-4.16 0.53,-5 0.32,0.09 0.75,0.4 1.06,0.57 0.35,0.2 0.71,0.39 1.06,0.57 0.73,0.38 1.61,0.62 2.65,0.61 0.58,-0.21 0.64,-1.82 0.61,-2.32 -0.04,-0.79 -0.45,-1.64 -0.77,-2.19 -0.39,-0.68 -0.64,-1.3 -1.45,-1.52 -1.33,-0.36 -1.16,0.63 -1.55,1.24 -0.67,-0.66 -0.61,-0.87 -1.64,-1.37 -0.06,-2.55 -0.87,-5.97 -0.9,-6.74l0.15,-0.03 0.01,-0.03z" fill="currentColor" />
                  </svg>
                </div>
              </button>
            </div>
            <div className="story-image-container">
              <div className="image-stack">
                <AnimatePresence mode="popLayout">
                  {storyStack.map((src, index) => {
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
            {displayProducts.slice(0, 3).map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
          <div className="featured-cta">
            <button onClick={() => navigate('/shop')}>
              Explore Full Shop
            </button>
          </div>
        </div>
      </section>

      {/* Instagram Customer Reviews Section */}
      <section className="instagram-reviews section">
        <div className="container">
          <div className="reviews-header">
            <h2>Customer Spotlight</h2>
            <a href="https://instagram.com/houseoftefa" target="_blank" rel="noopener noreferrer" className="instagram-link">
              <Instagram size={20} />
              @houseoftefa
            </a>
          </div>
          <p className="reviews-subtitle">See us on our customers and friends of the brand.</p>
          <div className="reviews-grid">
            {(reviews.length > 0 ? reviews : instagramReviews).map((review, idx) => (
              <motion.div
                key={review.id}
                className="review-card"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                onClick={() => {
                  if (review.externalLink) {
                    window.open(review.externalLink, '_blank');
                  } else if (review.username.startsWith('@')) {
                    const handle = review.username.substring(1);
                    window.open(`https://instagram.com/${handle}`, '_blank');
                  }
                }}
              >
                <div className="review-thumbnail">
                  {review.videoUrl ? (
                    <video
                      src={review.videoUrl}
                      muted
                      loop
                      playsInline
                      className="review-video"
                      onMouseEnter={(e) => e.currentTarget.play()}
                      onMouseLeave={(e) => {
                        e.currentTarget.pause();
                        e.currentTarget.currentTime = 0;
                      }}
                    />
                  ) : (
                    <img src={review.thumbnail} alt={`Customer review from ${review.username}`} />
                  )}
                </div>
                <span className="review-username">{review.username}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Promo Icons Section */}
      <section className="promo-icons section">
        <div className="container">
          <div className="promo-grid">
            <motion.div
              className="promo-item"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0 }}
            >
              <div className="promo-icon">
                <Truck size={48} strokeWidth={1.5} />
              </div>
              <h3>FREE NIGERIA SHIPPING</h3>
              <p>On orders above ₦50,000</p>
            </motion.div>

            <motion.div
              className="promo-item"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
            >
              <div className="promo-icon">
                <Tag size={48} strokeWidth={1.5} />
              </div>
              <h3>WANT 10% OFF?</h3>
              <p>Sign up to our newsletter</p>
            </motion.div>

            <motion.div
              className="promo-item"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              <div className="promo-icon">
                <Globe size={48} strokeWidth={1.5} />
              </div>
              <h3>WORLD WIDE SHIPPING</h3>
              <p>We deliver globally</p>
            </motion.div>
          </div>
        </div>
      </section>



      <style>{`
        .home-page {
          padding-top: 80px;
          min-height: 100vh;
          background-color: var(--color-background);
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
        position: relative;
        background: #2C1810;
        color: #F5E6D3;
        border: 1px solid #2C1810;
        padding: 15px 45px;
        font-family: 'Rethena', serif;
        font-size: 1rem;
        font-weight: 600;
        width: fit-content;
        cursor: pointer;
        border-radius: 8px;
        filter: drop-shadow(2px 2px 3px rgba(0, 0, 0, 0.2));
        transition: all var(--transition-fast);
        }

        .story-link-btn:hover {
        border: 1px solid #1A0F0A;
        background: linear-gradient(85deg, #2C1810, #3D2317, #2C1810, #3D2317, #2C1810);
        animation: wind 2s ease-in-out infinite;
        }

        @keyframes wind {
        0%, 100% { background-position: 0% 50%; }
        50% {background-position: 100% 50%; }
        }

        .wheat-icon-1 {
        position: absolute;
        top: 0;
        right: 0;
        width: 25px;
        transform-origin: 0 0;
        transform: rotate(10deg);
        transition: all 0.5s ease-in-out;
        filter: drop-shadow(2px 2px 3px rgba(0, 0, 0, 0.3));
        }

        .story-link-btn:hover .wheat-icon-1 {
        animation: slay-1 3s cubic-bezier(0.52, 0, 0.58, 1) infinite;
        }

        @keyframes slay-1 {
        0%, 100% { transform: rotate(10deg); }
        50% {transform: rotate(-5deg); }
        }

        .wheat-icon-2 {
        position: absolute;
        top: 0;
        left: 25px;
        width: 12px;
        transform-origin: 50% 0;
        transform: rotate(10deg);
        transition: all 1s ease-in-out;
        filter: drop-shadow(2px 2px 3px rgba(0, 0, 0, 0.5));
        }

        .story-link-btn:hover .wheat-icon-2 {
        animation: slay-2 3s cubic-bezier(0.52, 0, 0.58, 1) 1s infinite;
        }

        @keyframes slay-2 {
        0%, 100% { transform: rotate(0deg); }
        50% {transform: rotate(15deg); }
        }

        .wheat-icon-3 {
        position: absolute;
        top: 0;
        left: 0;
        width: 18px;
        transform-origin: 50% 0;
        transform: rotate(-5deg);
        transition: all 1s ease-in-out;
        filter: drop-shadow(2px 2px 3px rgba(0, 0, 0, 0.5));
        }

        .story-link-btn:hover .wheat-icon-3 {
        animation: slay-3 2s cubic-bezier(0.52, 0, 0.58, 1) 1s infinite;
        }

        @keyframes slay-3 {
        0%, 100% { transform: rotate(0deg); }
        50% {transform: rotate(-5deg); }
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

        /* Instagram Reviews Section */
        .instagram-reviews {
        background: var(--color-cream-dark);
        }

        .reviews-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: var(--space-2);
        }

        .reviews-header h2 {
        font-family: 'Cormorant Garamond', serif;
        font-size: clamp(2rem, 4vw, 2.5rem);
        font-weight: 600;
        font-style: italic;
        }

        .instagram-link {
        display: flex;
        align-items: center;
        gap: 8px;
        font-family: 'Inter', sans-serif;
        font-size: 0.875rem;
        font-weight: 600;
        color: #E1306C;
        text-decoration: none;
        transition: opacity var(--transition-fast);
        }

        .instagram-link:hover {
        opacity: 0.8;
        }

        .reviews-subtitle {
        color: var(--color-text-muted);
        margin-bottom: var(--space-10);
        font-size: 1rem;
        }

        .reviews-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: var(--space-4);
        }

        @media (min-width: 768px) {
        .reviews-grid {
        grid-template-columns: repeat(4, 1fr);
        }
        }

        .review-card {
        cursor: pointer;
        }

        .review-thumbnail {
        position: relative;
        aspect-ratio: 9 / 16;
        border-radius: var(--radius-md);
        overflow: hidden;
        margin-bottom: var(--space-2);
        }

        .review-thumbnail img,
        .review-video {
        width: 100%;
        height: 100%;
        object-fit: cover;
        transition: transform var(--transition-slow);
        }

        .review-card:hover .review-thumbnail img,
        .review-card:hover .review-video {
        transform: scale(1.05);
        }

        .review-username {
        font-family: 'Inter', sans-serif;
        font-size: 0.75rem;
        font-weight: 600;
        color: var(--color-text-muted);
        }

        /* Promo Icons Section */
        .promo-icons {
        background: #F7F3ED;
        padding: var(--space-16) 0;
        }

        .promo-grid {
        display: grid;
        grid-template-columns: 1fr;
        gap: var(--space-10);
        text-align: center;
        }

        @media (min-width: 768px) {
        .promo-grid {
        grid-template-columns: repeat(3, 1fr);
        gap: var(--space-8);
        }
        }

        .promo-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        }

        .promo-icon {
        width: 80px;
        height: 80px;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-bottom: var(--space-4);
        color: #666666;
        }

        .promo-item h3 {
        font-family: 'Inter', sans-serif;
        font-size: 0.9375rem;
        font-weight: 700;
        letter-spacing: 0.05em;
        margin-bottom: var(--space-1);
        color: #333333;
        }

        .promo-item p {
        font-family: 'Inter', sans-serif;
        font-size: 0.8125rem;
        color: #666666;
        }


      `}</style>
    </div>
  );
};
