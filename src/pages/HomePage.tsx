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

// Story Stack Images
const storyImages = [
  '/assets/images/Screenshot 2026-02-07 at 11.32.55.webp',
  '/assets/images/Screenshot 2026-02-07 at 11.33.18.webp',
  '/assets/images/Screenshot 2026-02-07 at 11.51.16.webp',
];

// Instagram review videos (placeholders - replace with real embed URLs)
const instagramReviews: CustomerReview[] = [
  { id: '1', thumbnail: '/assets/images/Screenshot 2026-02-07 at 11.32.55.webp', username: '@tefa_customer1', platform: 'instagram', videoUrl: '' },
  { id: '2', thumbnail: '/assets/images/Screenshot 2026-02-07 at 11.33.18.webp', username: '@mish_mordi', platform: 'instagram', videoUrl: '' },
  { id: '3', thumbnail: '/assets/images/Screenshot 2026-02-07 at 11.51.16.webp', username: '@fashion_ng', platform: 'instagram', videoUrl: '' },
  { id: '4', thumbnail: '/assets/Hero/Screenshot 2026-02-06 at 13.44.48.webp', username: '@fashion_ng', platform: 'instagram', videoUrl: '' },
];

const ReviewCard = React.memo(({ review, idx }: { review: CustomerReview; idx: number }) => {
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const [isInView, setIsInView] = useState(false);
  const cardRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry.isIntersecting);
      },
      { threshold: 0.6 } // Play when 60% of the card is visible
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (videoRef.current) {
      if (isInView) {
        videoRef.current.play().catch(() => {
          // Autoplay might be blocked if not muted/interacted with
        });
      } else {
        videoRef.current.pause();
      }
    }
  }, [isInView]);

  return (
    <m.div
      ref={cardRef}
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
            ref={videoRef}
            src={review.videoUrl}
            poster={review.thumbnail}
            muted
            loop
            playsInline
            className="review-video"
            onMouseEnter={(e) => e.currentTarget.play()}
            onMouseLeave={(e) => {
              if (!isInView) {
                e.currentTarget.pause();
              }
            }}
          />
        ) : (
          <OptimizedImage src={review.thumbnail} alt={`Customer review from ${review.username}`} sizes="(max-width: 768px) 50vw, 25vw" quality={70} />
        )}
      </div>
      <span className="review-username">{review.username}</span>
    </m.div>
  );
});

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { products, categories, reviews, loading, currency, isSearchOpen } = useStore();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [storyStack, setStoryStack] = useState(storyImages);
  const [hoveredCategoryId, setHoveredCategoryId] = useState<string | null>(null);
  const [showScrollHint, setShowScrollHint] = useState(true);
  const [isNewsletterOpen, setIsNewsletterOpen] = useState(false);


  const categoriesRef = React.useRef<HTMLDivElement>(null);

  // Use default products while loading to ensure featured section always shows
  const displayProducts = products.length > 0 ? products : DEFAULT_PRODUCTS;

  // Intersection Observer for Category Scroll Hint (Better than scroll listener)
  useEffect(() => {
    const categoriesElement = categoriesRef.current;
    if (!categoriesElement) return;

    // Use a small spacer at the start to detect if we've scrolled
    const observer = new IntersectionObserver(
      ([entry]) => {
        setShowScrollHint(entry.isIntersecting);
      },
      { root: categoriesElement, threshold: 0.1 }
    );

    // Create a sentinel element if it doesn't exist
    let sentinel = categoriesElement.querySelector('.scroll-sentinel');
    if (!sentinel) {
      sentinel = document.createElement('div');
      sentinel.className = 'scroll-sentinel';
      sentinel.style.width = '1px';
      sentinel.style.height = '1px';
      sentinel.style.position = 'absolute';
      sentinel.style.left = '0';
      categoriesElement.prepend(sentinel);
    }

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [categories]);

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

  // Auto-scroll categories every 5 seconds
  useEffect(() => {
    const section = document.querySelector('.categories');
    if (!section) return;

    let intervalId: NodeJS.Timeout;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          intervalId = setInterval(() => {
            if (categoriesRef.current) {
              const { scrollLeft, scrollWidth, clientWidth } = categoriesRef.current;
              const maxScroll = scrollWidth - clientWidth;
              const nextScroll = scrollLeft + 300;

              if (nextScroll >= maxScroll) {
                categoriesRef.current.scrollTo({ left: 0, behavior: 'smooth' });
              } else {
                categoriesRef.current.scrollTo({ left: nextScroll, behavior: 'smooth' });
              }
            }
          }, 5000);
        } else {
          clearInterval(intervalId);
        }
      },
      { threshold: 0.5 }
    );

    observer.observe(section);

    return () => {
      observer.disconnect();
      clearInterval(intervalId);
    };
  }, []);

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
            className="hero-tagline font-decorative"
          >
            PROUDLY NIGERIAN
          </m.p>
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
            >
              {categories.map((cat, idx) => (
                <m.div
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
                  <OptimizedImage
                    src={hoveredCategoryId === cat.id && cat.hoverImage ? cat.hoverImage : cat.image}
                    alt={cat.name}
                    sizes="(max-width: 768px) 75vw, 25vw"
                    quality={75}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      transition: 'transform 0.7s ease',
                      transform: hoveredCategoryId === cat.id ? 'scale(1.05)' : 'scale(1)',
                    }}
                  />
                  <div className="category-overlay" />
                  <div className="category-content">
                    <h3>{cat.name}</h3>
                    <div className="category-line" />
                  </div>
                </m.div>
              ))}
            </div>

            <AnimatePresence>
              {showScrollHint && (
                <m.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{
                    opacity: 1,
                    x: [0, -10, 0],
                  }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{
                    x: {
                      repeat: Infinity,
                      duration: 1.5,
                      ease: "easeInOut"
                    },
                    opacity: { duration: 0.3 }
                  }}
                  className="scroll-hint"
                >
                  <span>Scroll to explore</span>
                  <ArrowRight size={16} />
                </m.div>
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
                <WheatIcon1 className="wheat-icon-1" />
                <WheatIcon2 className="wheat-icon-2" />
                <WheatIcon3 className="wheat-icon-3" />
              </button>
            </div>
            <div className="story-image-container">
              <div className="image-stack">
                <AnimatePresence mode="popLayout">
                  {storyStack.map((src, index) => {
                    const isCenter = index === storyStack.length - 1;
                    const isLeft = index === storyStack.length - 2;
                    const isRight = index === storyStack.length - 3;

                    if (index < storyStack.length - 3) return null;

                    return (
                      <m.div
                        key={src}
                        className={`stack-card ${isCenter ? 'center' : isLeft ? 'left' : 'right'}`}
                        initial={{ opacity: 0, scale: 0.5, y: 50 }}
                        animate={{
                          x: isCenter ? 0 : isLeft ? -120 : 120,
                          y: isCenter ? 0 : 30,
                          rotate: isCenter ? 0 : isLeft ? -15 : 15,
                          scale: isCenter ? 1 : 0.85,
                          zIndex: isCenter ? 10 : 5,
                          opacity: 1
                        }}
                        exit={{
                          opacity: 0,
                          scale: 0.5,
                          x: isCenter ? 200 : isLeft ? -200 : 0,
                          y: 100
                        }}
                        transition={{
                          type: "spring",
                          stiffness: 260,
                          damping: 20
                        }}
                      >
                        <OptimizedImage src={src} alt="Brand Story" sizes="(max-width: 768px) 80vw, 40vw" quality={75} />
                      </m.div>
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
            <a href="https://www.instagram.com/shop.tefa" target="_blank" rel="noopener noreferrer" className="instagram-link">
              <Instagram size={20} />
              @shop.tefa
            </a>
          </div>
          <p className="reviews-subtitle">See us on our customers and friends of the brand.</p>
          <div className="reviews-grid">
            {(reviews.length > 0 ? reviews : instagramReviews).map((review, idx) => (
              <ReviewCard key={review.id} review={review} idx={idx} />
            ))}
          </div>
        </div>
      </section>

      {/* Promo Icons Section */}
      <section className="promo-icons section">
        <div className="container">
          <div className="promo-grid">
            <m.div
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
            </m.div>

            <m.div
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
            </m.div>

            <m.div
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
            </m.div>
          </div>
        </div>
      </section>
      <NewsletterModal
        isOpen={isNewsletterOpen}
        onClose={() => setIsNewsletterOpen(false)}
      />
    </div>
  );
};

