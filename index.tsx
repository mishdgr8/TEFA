import React, { useState, useEffect, useMemo } from 'react';
import { createRoot } from 'react-dom/client';
import {
  ShoppingBag,
  Menu,
  X,
  ChevronRight,
  ArrowRight,
  Instagram,
  MessageCircle,
  Trash2,
  Plus,
  Minus,
  Search,
  ChevronLeft,
  Sparkles,
  Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

/** 
 * --- DATA MODELS & MOCK DATA ---
 */

interface Product {
  id: string;
  slug: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  images: string[];
  categoryId: string;
  tags: string[];
  sizes: string[];
  colors: { name: string; hex: string }[];
}

interface Category {
  id: string;
  name: string;
  slug: string;
  image: string;
}

interface CartItem {
  productId: string;
  variantId: string; // combination of productId+size+color
  name: string;
  price: number;
  qty: number;
  selectedSize: string;
  selectedColor: string;
  image: string;
  slug: string;
}

const CATEGORIES: Category[] = [
  { id: '1', name: 'Ankara Sets', slug: 'ankara-sets', image: 'https://images.unsplash.com/photo-1590736704728-f4730bb30770?auto=format&fit=crop&q=80&w=800' },
  { id: '2', name: 'Kaftans', slug: 'kaftans', image: 'https://images.unsplash.com/photo-1597505666710-85f096738943?auto=format&fit=crop&q=80&w=800' },
  { id: '3', name: 'Dresses', slug: 'dresses', image: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?auto=format&fit=crop&q=80&w=800' },
  { id: '4', name: 'Accessories', slug: 'accessories', image: 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&q=80&w=800' },
];

const PRODUCTS: Product[] = [
  {
    id: 'p1',
    slug: 'indigo-flow-kaftan',
    name: 'Indigo Flow Kaftan',
    description: 'A luxurious, hand-dyed indigo kaftan with geometric embroidery on the collar. Made from premium breathable linen blend.',
    price: 45000,
    currency: '₦',
    images: ['https://images.unsplash.com/photo-1583394238712-92d354508499?auto=format&fit=crop&q=80&w=800'],
    categoryId: '2',
    tags: ['Best Seller', 'New Arrival'],
    sizes: ['M', 'L', 'XL'],
    colors: [{ name: 'Indigo', hex: '#3F51B5' }, { name: 'Deep Sea', hex: '#1A237E' }],
  },
  {
    id: 'p2',
    slug: 'saffron-sun-ankara',
    name: 'Saffron Sun Ankara Set',
    description: 'Vibrant two-piece set featuring traditional sun motifs in warm saffron and burnt orange tones.',
    price: 32000,
    currency: '₦',
    images: ['https://images.unsplash.com/photo-1597505666710-85f096738943?auto=format&fit=crop&q=80&w=800'],
    categoryId: '1',
    tags: ['Traditional', 'Bright'],
    sizes: ['S', 'M', 'L'],
    colors: [{ name: 'Saffron', hex: '#F4A261' }, { name: 'Clay', hex: '#BC6C25' }],
  },
  {
    id: 'p3',
    slug: 'emerald-queen-dress',
    name: 'Emerald Queen Dress',
    description: 'Stunning floor-length dress with architectural sleeves and gold thread detailing.',
    price: 58000,
    currency: '₦',
    images: ['https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?auto=format&fit=crop&q=80&w=800'],
    categoryId: '3',
    tags: ['Evening', 'Luxury'],
    sizes: ['XS', 'S', 'M', 'L'],
    colors: [{ name: 'Jungle Green', hex: '#2D6A4F' }, { name: 'Gold', hex: '#D4AF37' }],
  },
  {
    id: 'p4',
    slug: 'zulu-bead-necklace',
    name: 'Zulu Heritage Beads',
    description: 'Handcrafted multi-strand beaded necklace representing modern South African elegance.',
    price: 15000,
    currency: '₦',
    images: ['https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&q=80&w=800'],
    categoryId: '4',
    tags: ['Handmade', 'Accessory'],
    sizes: ['OS'],
    colors: [{ name: 'Multi', hex: '#000000' }],
  },
  {
    id: 'p5',
    slug: 'coral-bloom-wrap',
    name: 'Coral Bloom Wrap Dress',
    description: 'Elegant wrap dress in a soft coral tone with delicate floral patterns.',
    price: 28000,
    currency: '₦',
    images: ['https://images.unsplash.com/photo-1590736704728-f4730bb30770?auto=format&fit=crop&q=80&w=800'],
    categoryId: '3',
    tags: ['Casual', 'Summer'],
    sizes: ['S', 'M', 'L', 'XL'],
    colors: [{ name: 'Coral', hex: '#E76F51' }],
  },
  {
    id: 'p6',
    slug: 'charcoal-linen-tunic',
    name: 'Charcoal Linen Tunic',
    description: 'Minimalist charcoal tunic with subtle geometric patterned trim.',
    price: 22000,
    currency: '₦',
    images: ['https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&q=80&w=800'],
    categoryId: '2',
    tags: ['Minimalist'],
    sizes: ['M', 'L', 'XL', 'XXL'],
    colors: [{ name: 'Charcoal', hex: '#333333' }],
  },
];

/**
 * --- UTILS ---
 */

const formatPrice = (price: number, currency: string = '₦') => {
  return `${currency}${price.toLocaleString()}`;
};

/**
 * --- STYLES & THEME ---
 */

const THEME = {
  bg: 'bg-[#FDFBF7]',
  text: 'text-[#1A1A1A]',
  accent: 'text-[#E76F51]', // Coral
  accentBg: 'bg-[#E76F51]',
  accentLight: 'bg-[#F4A261]', // Saffron
  secondary: 'text-[#2A9D8F]', // Teal
  secondaryBg: 'bg-[#2A9D8F]',
  muted: 'text-gray-500',
  border: 'border-[#EAE2D6]',
  card: 'bg-white',
};

// Subtle geometric pattern for backgrounds/dividers
const GeometricPattern = ({ className = "" }: { className?: string }) => (
  <div className={`opacity-5 pointer-events-none select-none ${className}`} style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")` }} />
);

/**
 * --- COMPONENTS ---
 */

const Header = ({
  onNavigate,
  cartCount,
  onOpenCart
}: {
  onNavigate: (page: string, params?: any) => void;
  cartCount: number;
  onOpenCart: () => void;
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 ${THEME.bg} border-b ${THEME.border}`}>
      <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <button onClick={() => setIsMenuOpen(true)} className="lg:hidden p-2">
            <Menu size={24} />
          </button>
          <div className="hidden lg:flex items-center gap-8 font-medium tracking-tight">
            <button onClick={() => onNavigate('shop')} className="hover:text-[#E76F51] transition-colors">Shop</button>
            <button onClick={() => onNavigate('about')} className="hover:text-[#E76F51] transition-colors">About</button>
          </div>
        </div>

        <button onClick={() => onNavigate('home')} className="absolute left-1/2 -translate-x-1/2 flex flex-col items-center">
          <span className="text-3xl font-serif font-black tracking-[0.2em] italic">TÉFA</span>
          <span className="text-[10px] uppercase tracking-[0.4em] font-light mt-[-4px]">Africana</span>
        </button>

        <div className="flex items-center gap-4">
          <button className="p-2 hidden sm:block">
            <Search size={22} />
          </button>
          <button onClick={onOpenCart} className="relative p-2 flex items-center gap-2 bg-black text-white rounded-full px-4 hover:opacity-90 transition-opacity">
            <ShoppingBag size={18} />
            <span className="text-sm font-semibold">{cartCount}</span>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsMenuOpen(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60]"
            />
            <motion.div
              initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className={`fixed top-0 left-0 bottom-0 w-[80%] max-w-sm ${THEME.bg} z-[70] p-8 flex flex-col`}
            >
              <div className="flex justify-between items-center mb-12">
                <span className="text-2xl font-serif font-bold italic">TÉFA</span>
                <button onClick={() => setIsMenuOpen(false)}><X size={24} /></button>
              </div>
              <div className="flex flex-col gap-6 text-xl font-medium">
                <button onClick={() => { onNavigate('home'); setIsMenuOpen(false); }} className="flex items-center justify-between group">
                  Home <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </button>
                <button onClick={() => { onNavigate('shop'); setIsMenuOpen(false); }} className="flex items-center justify-between group">
                  Shop All <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </button>
                <div className="pt-4 mt-4 border-t border-gray-100 flex flex-col gap-4">
                  {CATEGORIES.map(cat => (
                    <button
                      key={cat.id}
                      onClick={() => { onNavigate('shop', { categoryId: cat.id }); setIsMenuOpen(false); }}
                      className="text-gray-500 hover:text-black transition-colors"
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </nav>
  );
};

/* Fix: Explicitly typing ProductCard as React.FC ensures that React intrinsic attributes like 'key' are allowed in JSX. */
const ProductCard: React.FC<{ product: Product; onNavigate: (page: string, params?: any) => void }> = ({ product, onNavigate }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="group cursor-pointer"
      onClick={() => onNavigate('product', { slug: product.slug })}
    >
      <div className="relative aspect-[3/4] overflow-hidden rounded-2xl bg-gray-100">
        <img
          src={product.images[0]}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute top-4 left-4 flex gap-2">
          {product.tags.map(tag => (
            <span key={tag} className="text-[10px] uppercase tracking-widest bg-white/90 backdrop-blur-md px-2 py-1 rounded-full font-bold">
              {tag}
            </span>
          ))}
        </div>
      </div>
      <div className="mt-4 flex justify-between items-start">
        <div>
          <h3 className="font-medium text-lg group-hover:text-[#E76F51] transition-colors">{product.name}</h3>
          <p className="text-sm text-gray-500">{CATEGORIES.find(c => c.id === product.categoryId)?.name}</p>
        </div>
        <p className="font-bold">{formatPrice(product.price)}</p>
      </div>
    </motion.div>
  );
};

const CartDrawer = ({
  isOpen,
  onClose,
  items,
  onUpdateQty,
  onRemove,
  onCheckout
}: {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQty: (variantId: string, delta: number) => void;
  onRemove: (variantId: string) => void;
  onCheckout: () => void;
}) => {
  const total = items.reduce((sum, item) => sum + (item.price * item.qty), 0);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/30 backdrop-blur-[2px] z-[100]"
          />
          <motion.div
            initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className={`fixed top-0 right-0 bottom-0 w-full max-w-md ${THEME.bg} z-[110] flex flex-col shadow-2xl`}
          >
            <div className="p-6 border-b flex items-center justify-between">
              <h2 className="text-xl font-bold flex items-center gap-2 italic">
                <ShoppingBag size={20} /> Inquiry Cart
              </h2>
              <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><X size={24} /></button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {items.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center py-12">
                  <ShoppingBag size={48} className="text-gray-200 mb-4" />
                  <p className="text-gray-500">Your inquiry cart is empty.</p>
                  <button
                    onClick={onClose}
                    className="mt-4 text-[#E76F51] font-bold hover:underline"
                  >
                    Start Browsing
                  </button>
                </div>
              ) : (
                items.map(item => (
                  <div key={item.variantId} className="flex gap-4">
                    <div className="w-24 h-32 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start">
                          <h4 className="font-bold">{item.name}</h4>
                          <button onClick={() => onRemove(item.variantId)} className="text-gray-400 hover:text-red-500 transition-colors">
                            <Trash2 size={16} />
                          </button>
                        </div>
                        <p className="text-xs text-gray-500 mt-1 uppercase tracking-wider">
                          Size: {item.selectedSize} | Color: {item.selectedColor}
                        </p>
                        <p className="font-semibold text-sm mt-1">{formatPrice(item.price)}</p>
                      </div>
                      <div className="flex items-center gap-4 mt-2">
                        <div className="flex items-center border rounded-full px-2">
                          <button onClick={() => onUpdateQty(item.variantId, -1)} className="p-1"><Minus size={14} /></button>
                          <span className="w-8 text-center text-sm font-medium">{item.qty}</span>
                          <button onClick={() => onUpdateQty(item.variantId, 1)} className="p-1"><Plus size={14} /></button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {items.length > 0 && (
              <div className="p-6 border-t bg-white space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Subtotal</span>
                  <span className="text-xl font-bold">{formatPrice(total)}</span>
                </div>
                <button
                  onClick={onCheckout}
                  className="w-full bg-black text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
                >
                  Confirm Inquiry <ArrowRight size={18} />
                </button>
                <p className="text-[10px] text-center text-gray-400 uppercase tracking-widest">
                  Orders are finalized via Instagram or WhatsApp
                </p>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

/**
 * --- PAGES ---
 */

const HomePage = ({ onNavigate }: { onNavigate: (page: string, params?: any) => void }) => {
  return (
    <div className="pt-20">
      {/* Hero */}
      <section className="relative h-[85vh] flex items-center overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?auto=format&fit=crop&q=80&w=1920"
            alt="Hero Background"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/40" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 w-full text-white">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="max-w-2xl"
          >
            <button
              onClick={() => onNavigate('shop')}
              className="group bg-white text-black px-10 py-5 rounded-full font-bold text-lg flex items-center gap-3 hover:bg-[#E76F51] hover:text-white transition-all duration-300"
            >
              Shop New Arrivals
              <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform" />
            </button>
          </motion.div>
        </div>
        <GeometricPattern className="absolute bottom-0 right-0 w-1/2 h-full" />
      </section>

      {/* Brand Story */}
      <section className="py-24 max-w-7xl mx-auto px-4 grid md:grid-cols-2 gap-16 items-center">
        <div>
          <span className="text-[#E76F51] font-bold uppercase tracking-widest text-xs mb-4 block">The TÉFA Story</span>
          <h2 className="text-4xl md:text-5xl font-serif font-bold italic leading-tight mb-6">
            Where tradition meets <br /> contemporary craft.
          </h2>
          <p className="text-gray-600 text-lg leading-relaxed mb-8">
            Founded in Lagos, TÉFA is a celebration of Africana fashion. We source premium fabrics and work with master artisans to create pieces that honor our history while speaking to a modern global audience. Each garment tells a story of identity, resilience, and beauty.
          </p>
          <button onClick={() => onNavigate('about')} className="font-bold border-b-2 border-black pb-1 hover:text-[#E76F51] hover:border-[#E76F51] transition-all">
            Read Our Manifesto
          </button>
        </div>
        <div className="relative">
          <div className="aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl">
            <img src="https://images.unsplash.com/photo-1583394238712-92d354508499?auto=format&fit=crop&q=80&w=800" className="w-full h-full object-cover" />
          </div>
          <div className="absolute -bottom-8 -left-8 bg-white p-8 rounded-2xl shadow-xl max-w-[240px]">
            <p className="font-serif italic text-lg leading-tight">"Crafting pieces that travel from the heart of Africa to the world."</p>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-24 bg-[#EAE2D6]/20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-end mb-12">
            <h2 className="text-4xl font-serif font-bold italic">Browse Collections</h2>
            <button onClick={() => onNavigate('shop')} className="text-sm font-bold uppercase tracking-widest hover:text-[#E76F51] transition-colors">See All Shop</button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {CATEGORIES.map((cat, idx) => (
              <motion.div
                key={cat.id}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                onClick={() => onNavigate('shop', { categoryId: cat.id })}
                className="group relative aspect-[3/4] rounded-3xl overflow-hidden cursor-pointer"
              >
                <img src={cat.image} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                <div className="absolute bottom-6 left-6 text-white">
                  <h3 className="text-xl font-bold">{cat.name}</h3>
                  <div className="h-1 w-0 group-hover:w-full bg-[#F4A261] transition-all duration-300" />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-24 max-w-7xl mx-auto px-4">
        <h2 className="text-4xl font-serif font-bold italic mb-12 text-center">Featured Pieces</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-12">
          {PRODUCTS.slice(0, 3).map(product => (
            <ProductCard key={product.id} product={product} onNavigate={onNavigate} />
          ))}
        </div>
        <div className="mt-16 text-center">
          <button
            onClick={() => onNavigate('shop')}
            className="px-12 py-4 border-2 border-black rounded-full font-bold hover:bg-black hover:text-white transition-all"
          >
            Explore Full Shop
          </button>
        </div>
      </section>
    </div>
  );
};

const ShopPage = ({
  onNavigate,
  categoryIdFilter
}: {
  onNavigate: (page: string, params?: any) => void;
  categoryIdFilter?: string;
}) => {
  const [activeCategory, setActiveCategory] = useState(categoryIdFilter || 'all');

  const filteredProducts = useMemo(() => {
    if (activeCategory === 'all') return PRODUCTS;
    return PRODUCTS.filter(p => p.categoryId === activeCategory);
  }, [activeCategory]);

  return (
    <div className="pt-32 pb-24 max-w-7xl mx-auto px-4">
      <div className="mb-12">
        <h1 className="text-5xl font-serif font-black italic mb-8">The Collection</h1>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => setActiveCategory('all')}
            className={`px-6 py-2 rounded-full font-medium transition-all ${activeCategory === 'all' ? 'bg-black text-white' : 'bg-gray-100 hover:bg-gray-200'}`}
          >
            All Pieces
          </button>
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-6 py-2 rounded-full font-medium transition-all ${activeCategory === cat.id ? 'bg-[#E76F51] text-white' : 'bg-gray-100 hover:bg-gray-200'}`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-12">
          {filteredProducts.map(product => (
            <ProductCard key={product.id} product={product} onNavigate={onNavigate} />
          ))}
        </div>
      ) : (
        <div className="py-24 text-center">
          <p className="text-gray-500 text-lg">No products found in this category.</p>
        </div>
      )}
    </div>
  );
};

const ProductDetailPage = ({
  slug,
  onNavigate,
  onAddToCart
}: {
  slug: string;
  onNavigate: (page: string, params?: any) => void;
  onAddToCart: (item: CartItem) => void;
}) => {
  const product = PRODUCTS.find(p => p.slug === slug);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState(product?.colors[0].name || '');
  const [qty, setQty] = useState(1);

  if (!product) return <div className="pt-32 text-center">Product not found.</div>;

  const handleAddToCart = () => {
    if (!selectedSize) {
      alert("Please select a size first.");
      return;
    }
    const item: CartItem = {
      productId: product.id,
      variantId: `${product.id}-${selectedSize}-${selectedColor}`,
      name: product.name,
      price: product.price,
      qty,
      selectedSize,
      selectedColor,
      image: product.images[0],
      slug: product.slug,
    };
    onAddToCart(item);
  };

  return (
    <div className="pt-32 pb-24 max-w-7xl mx-auto px-4">
      <button onClick={() => onNavigate('shop')} className="flex items-center gap-2 text-gray-500 hover:text-black mb-8 font-bold text-sm uppercase tracking-widest">
        <ChevronLeft size={16} /> Back to Collection
      </button>

      <div className="grid lg:grid-cols-2 gap-16 items-start">
        {/* Gallery */}
        <div className="space-y-4">
          <div className="aspect-[3/4] rounded-3xl overflow-hidden bg-gray-100">
            <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
          </div>
          <div className="grid grid-cols-4 gap-4">
            {product.images.map((img, i) => (
              <div key={i} className="aspect-square rounded-xl overflow-hidden bg-gray-100 cursor-pointer border-2 border-transparent hover:border-black">
                <img src={img} className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        </div>

        {/* Details */}
        <div className="sticky top-32">
          <div className="flex gap-2 mb-4">
            {product.tags.map(tag => (
              <span key={tag} className="text-[10px] uppercase tracking-widest border px-2 py-1 rounded-full font-bold">
                {tag}
              </span>
            ))}
          </div>
          <h1 className="text-4xl font-serif font-black italic mb-2">{product.name}</h1>
          <p className="text-2xl font-bold mb-8">{formatPrice(product.price)}</p>

          <div className="bg-[#EAE2D6]/30 p-6 rounded-2xl mb-10 leading-relaxed text-gray-700">
            {product.description}
          </div>

          <div className="space-y-8 mb-10">
            {/* Color Select */}
            <div>
              <label className="text-xs uppercase tracking-widest font-black block mb-4">Color: <span className="text-gray-500 font-normal">{selectedColor}</span></label>
              <div className="flex gap-3">
                {product.colors.map(color => (
                  <button
                    key={color.name}
                    onClick={() => setSelectedColor(color.name)}
                    className={`w-10 h-10 rounded-full border-2 transition-all flex items-center justify-center ${selectedColor === color.name ? 'border-black' : 'border-transparent'}`}
                  >
                    <div className="w-7 h-7 rounded-full shadow-inner" style={{ backgroundColor: color.hex }} />
                  </button>
                ))}
              </div>
            </div>

            {/* Size Select */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <label className="text-xs uppercase tracking-widest font-black">Select Size</label>
                <button className="text-[10px] uppercase tracking-wider underline font-bold">Size Guide</button>
              </div>
              <div className="grid grid-cols-4 gap-3">
                {product.sizes.map(size => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`py-3 rounded-xl border-2 font-bold transition-all ${selectedSize === size ? 'border-black bg-black text-white' : 'border-gray-100 hover:border-gray-300'}`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity */}
            <div>
              <label className="text-xs uppercase tracking-widest font-black block mb-4">Quantity</label>
              <div className="flex items-center border-2 border-gray-100 w-max rounded-xl px-2">
                <button onClick={() => setQty(Math.max(1, qty - 1))} className="p-3 hover:text-[#E76F51]"><Minus size={18} /></button>
                <span className="w-12 text-center font-bold text-lg">{qty}</span>
                <button onClick={() => setQty(qty + 1)} className="p-3 hover:text-[#E76F51]"><Plus size={18} /></button>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={handleAddToCart}
              className="flex-1 bg-black text-white py-5 rounded-2xl font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
            >
              <ShoppingBag size={20} /> Add to Inquiry
            </button>
            <button
              onClick={() => {
                if (!selectedSize) return alert("Select size first");
                const msg = encodeURIComponent(`Hi TÉFA! I want to order the ${product.name} (Size: ${selectedSize}, Color: ${selectedColor}). Is it available?`);
                window.open(`https://wa.me/2340000000000?text=${msg}`, '_blank');
              }}
              className="px-8 py-5 border-2 border-black rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-black hover:text-white transition-all"
            >
              Direct Chat
            </button>
          </div>

          <div className="mt-12 space-y-4">
            <div className="flex items-center gap-3 text-sm text-gray-500">
              <div className="p-2 bg-green-50 text-green-600 rounded-lg"><Sparkles size={16} /></div>
              <span>Hand-crafted by master artisans in Lagos.</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-500">
              <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><Info size={16} /></div>
              <span>Ships worldwide within 5-7 business days.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const CheckoutPage = ({ items, onNavigate }: { items: CartItem[]; onNavigate: (page: string) => void }) => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    location: '',
    note: ''
  });

  const total = items.reduce((sum, item) => sum + (item.price * item.qty), 0);

  const generateMessage = () => {
    let message = `Hi TÉFA! I'd like to place an order:\n\n`;
    items.forEach((item, idx) => {
      message += `${idx + 1}) ${item.name}\n   Size: ${item.selectedSize}\n   Color: ${item.selectedColor}\n   Qty: ${item.qty}\n   Price: ${formatPrice(item.price * item.qty)}\n\n`;
    });
    message += `Total Estimate: ${formatPrice(total)}\n\n`;
    message += `Customer Info:\n`;
    message += `- Name: ${formData.name || 'Not provided'}\n`;
    message += `- Location: ${formData.location || 'Not provided'}\n`;
    if (formData.note) message += `- Notes: ${formData.note}\n`;
    message += `\nPlease confirm availability and payment details.`;
    return message;
  };

  const handleSendWhatsApp = () => {
    const encoded = encodeURIComponent(generateMessage());
    window.open(`https://wa.me/2340000000000?text=${encoded}`, '_blank');
  };

  const handleSendInstagram = () => {
    alert("Copying your order summary to clipboard. Redirecting to Instagram DMs...");
    navigator.clipboard.writeText(generateMessage());
    window.open(`https://instagram.com/tefa_africana/`, '_blank');
  };

  if (items.length === 0) return <div className="pt-40 text-center"><button onClick={() => onNavigate('shop')} className="font-bold underline">Cart is empty. Back to Shop.</button></div>;

  return (
    <div className="pt-32 pb-24 max-w-3xl mx-auto px-4">
      <h1 className="text-4xl font-serif font-black italic mb-8">Confirm Your Inquiry</h1>

      <div className="space-y-8">
        <div className="bg-white p-8 rounded-3xl border shadow-sm">
          <h3 className="font-bold text-xl mb-6 flex items-center gap-2 italic">
            <span className="bg-[#F4A261] text-white w-8 h-8 rounded-full flex items-center justify-center text-xs not-italic">1</span>
            Order Summary
          </h3>
          <div className="space-y-4 mb-6">
            {items.map(item => (
              <div key={item.variantId} className="flex justify-between items-center text-sm">
                <span>{item.name} (x{item.qty})</span>
                <span className="font-bold">{formatPrice(item.price * item.qty)}</span>
              </div>
            ))}
            <div className="pt-4 border-t flex justify-between items-center text-lg font-black italic">
              <span>Estimated Total</span>
              <span>{formatPrice(total)}</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-8 rounded-3xl border shadow-sm">
          <h3 className="font-bold text-xl mb-6 flex items-center gap-2 italic">
            <span className="bg-[#E76F51] text-white w-8 h-8 rounded-full flex items-center justify-center text-xs not-italic">2</span>
            Your Details (Optional)
          </h3>
          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <input
              type="text" placeholder="Full Name"
              className="w-full p-4 rounded-xl bg-gray-50 border-transparent focus:bg-white focus:border-black transition-all outline-none"
              value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })}
            />
            <input
              type="text" placeholder="Phone Number"
              className="w-full p-4 rounded-xl bg-gray-50 border-transparent focus:bg-white focus:border-black transition-all outline-none"
              value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })}
            />
          </div>
          <input
            type="text" placeholder="Delivery City/Country"
            className="w-full p-4 rounded-xl bg-gray-50 border-transparent focus:bg-white focus:border-black transition-all outline-none mb-4"
            value={formData.location} onChange={e => setFormData({ ...formData, location: e.target.value })}
          />
          <textarea
            placeholder="Special notes or questions..." rows={3}
            className="w-full p-4 rounded-xl bg-gray-50 border-transparent focus:bg-white focus:border-black transition-all outline-none"
            value={formData.note} onChange={e => setFormData({ ...formData, note: e.target.value })}
          />
        </div>

        <div className="bg-black text-white p-8 rounded-3xl space-y-6">
          <div className="text-center mb-4">
            <h3 className="text-xl font-bold italic mb-2">Ready to order?</h3>
            <p className="text-gray-400 text-sm">Choose your preferred channel to send this inquiry.</p>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <button
              onClick={handleSendWhatsApp}
              className="bg-[#25D366] text-white py-5 rounded-2xl font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
            >
              <MessageCircle size={20} /> Send on WhatsApp
            </button>
            <button
              onClick={handleSendInstagram}
              className="bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] text-white py-5 rounded-2xl font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
            >
              <Instagram size={20} /> Send on Instagram
            </button>
          </div>
          <p className="text-[10px] text-center text-gray-500 uppercase tracking-[0.2em]">
            Payments are arranged privately after confirmation.
          </p>
        </div>
      </div>
    </div>
  );
};

const Footer = ({ onNavigate }: { onNavigate: (page: string) => void }) => (
  <footer className="bg-black text-white py-24 px-4 overflow-hidden relative">
    <GeometricPattern className="absolute inset-0 opacity-10" />
    <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 relative z-10">
      <div className="col-span-1 md:col-span-1">
        <span className="text-4xl font-serif font-black italic tracking-widest mb-4 block">TÉFA</span>
        <p className="text-gray-400 leading-relaxed mb-6">
          Premium Africana fashion for the bold and the beautiful. Rooted in Lagos, inspired by the world.
        </p>
        <div className="flex gap-4">
          <button className="p-3 bg-white/10 rounded-full hover:bg-white/20 transition-colors"><Instagram size={20} /></button>
          <button className="p-3 bg-white/10 rounded-full hover:bg-white/20 transition-colors"><MessageCircle size={20} /></button>
        </div>
      </div>

      <div>
        <h4 className="font-bold uppercase tracking-widest text-sm mb-6">Explore</h4>
        <div className="flex flex-col gap-4 text-gray-400">
          <button onClick={() => onNavigate('shop')} className="hover:text-white transition-colors text-left">Shop Collection</button>
          <button onClick={() => onNavigate('home')} className="hover:text-white transition-colors text-left">Featured Sets</button>
          <button className="hover:text-white transition-colors text-left">Lookbook</button>
          <button className="hover:text-white transition-colors text-left">New Arrivals</button>
        </div>
      </div>

      <div>
        <h4 className="font-bold uppercase tracking-widest text-sm mb-6">Support</h4>
        <div className="flex flex-col gap-4 text-gray-400">
          <button className="hover:text-white transition-colors text-left">Contact Us</button>
          <button className="hover:text-white transition-colors text-left">Shipping Info</button>
          <button className="hover:text-white transition-colors text-left">Size Guide</button>
          <button className="hover:text-white transition-colors text-left">FAQs</button>
        </div>
      </div>

      <div>
        <h4 className="font-bold uppercase tracking-widest text-sm mb-6">Newsletter</h4>
        <p className="text-gray-400 text-sm mb-4">Get early access to drops and stories.</p>
        <div className="flex border-b border-gray-700 py-2">
          <input
            type="email"
            placeholder="Your Email"
            className="bg-transparent border-none outline-none flex-1 text-sm"
          />
          <button className="text-[#F4A261] font-bold"><ChevronRight size={20} /></button>
        </div>
      </div>
    </div>
    <div className="max-w-7xl mx-auto mt-24 pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] uppercase tracking-widest text-gray-600 font-bold">
      <p>&copy; 2024 TÉFA Africana Studio. All rights reserved.</p>
      <div className="flex gap-6">
        <span>Terms</span>
        <span>Privacy</span>
        <span>Heritage</span>
      </div>
    </div>
  </footer>
);

/**
 * --- MAIN APP ---
 */

const App = () => {
  const [currentPage, setCurrentPage] = useState('home');
  const [pageParams, setPageParams] = useState<any>({});
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Persistence
  useEffect(() => {
    const saved = localStorage.getItem('tefa_cart');
    if (saved) setCart(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem('tefa_cart', JSON.stringify(cart));
  }, [cart]);

  const navigate = (page: string, params: any = {}) => {
    setCurrentPage(page);
    setPageParams(params);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const addToCart = (item: CartItem) => {
    setCart(prev => {
      const existing = prev.find(i => i.variantId === item.variantId);
      if (existing) {
        return prev.map(i => i.variantId === item.variantId ? { ...i, qty: i.qty + item.qty } : i);
      }
      return [...prev, item];
    });
    setIsCartOpen(true);
  };

  const updateCartQty = (variantId: string, delta: number) => {
    setCart(prev => prev.map(i => {
      if (i.variantId === variantId) {
        return { ...i, qty: Math.max(1, i.qty + delta) };
      }
      return i;
    }));
  };

  const removeFromCart = (variantId: string) => {
    setCart(prev => prev.filter(i => i.variantId !== variantId));
  };

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage onNavigate={navigate} />;
      case 'shop':
        return <ShopPage onNavigate={navigate} categoryIdFilter={pageParams.categoryId} />;
      case 'product':
        return <ProductDetailPage slug={pageParams.slug} onNavigate={navigate} onAddToCart={addToCart} />;
      case 'checkout':
        return <CheckoutPage items={cart} onNavigate={navigate} />;
      case 'about':
        return (
          <div className="pt-40 pb-40 max-w-2xl mx-auto px-4 text-center">
            <h1 className="text-5xl font-serif font-black italic mb-8">Our Manifesto</h1>
            <div className="space-y-6 text-lg text-gray-600 leading-relaxed italic">
              <p>"TÉFA is more than a brand. It is an exploration of the intricate patterns of our identity."</p>
              <p>We believe that luxury should be meaningful. We believe that heritage is a living thing, meant to be worn, shared, and evolved.</p>
              <p>By blending ancestral dyeing techniques with contemporary silhouettes, we create a dialogue between the past and the future.</p>
            </div>
            <button onClick={() => navigate('shop')} className="mt-12 bg-black text-white px-10 py-5 rounded-full font-bold">Explore the Result</button>
          </div>
        );
      default:
        return <HomePage onNavigate={navigate} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#1A1A1A] selection:bg-[#E76F51] selection:text-white overflow-x-hidden">
      <Header
        onNavigate={navigate}
        cartCount={cart.reduce((sum, i) => sum + i.qty, 0)}
        onOpenCart={() => setIsCartOpen(true)}
      />

      <AnimatePresence mode="wait">
        <motion.main
          key={currentPage + JSON.stringify(pageParams)}
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -10 }}
          transition={{ duration: 0.3 }}
        >
          {renderCurrentPage()}
        </motion.main>
      </AnimatePresence>

      <Footer onNavigate={navigate} />

      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cart}
        onUpdateQty={updateCartQty}
        onRemove={removeFromCart}
        onCheckout={() => {
          setIsCartOpen(false);
          navigate('checkout');
        }}
      />

      {/* Floating Inquiry Button (Sticky on Mobile) */}
      <button
        onClick={() => setIsCartOpen(true)}
        className="fixed bottom-6 right-6 z-40 bg-[#E76F51] text-white p-4 rounded-full shadow-2xl lg:hidden flex items-center gap-2 font-bold"
      >
        <ShoppingBag size={24} />
        {cart.length > 0 && <span className="bg-white text-[#E76F51] w-6 h-6 rounded-full flex items-center justify-center text-xs">{cart.reduce((a, b) => a + b.qty, 0)}</span>}
      </button>
    </div>
  );
};

const rootElement = document.getElementById('root');
if (rootElement) {
  const root = createRoot(rootElement);
  root.render(<App />);
}
