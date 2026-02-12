# TÉFA — Premium African Fashion

Welcome to **TÉFA**, a modern e-commerce platform showcasing premium African fashion. Built with React, TypeScript, and Firebase, deployed on Vercel.

---

## ✨ Features

### 🛍️ Storefront
- Browse curated collections with category filtering and search
- Product detail pages with image galleries, size selection, and color variants
- Express request option for made-to-order items
- Multi-currency support (NGN, USD, GBP, EUR)

### 🛒 Shopping Experience
- Real-time cart with slide-out drawer
- WhatsApp & Instagram checkout — send orders directly via chat
- Size guide modal with UK/US/EU measurements

### 👤 User Accounts
- Google Sign-In authentication
- Role-based access control (admin vs customer)

### 📊 Admin Dashboard
- Manage products, categories, and customer spotlights
- Upload images and videos directly to Firebase Storage
- Real-time inventory updates

### 💬 WhatsApp Integration
- Live chat widget via Firebase Cloud Functions
- WhatsApp Business API webhook for inbound/outbound messaging
- Chat history persisted in Firestore

### 🎥 Customer Spotlight
- Interactive video reviews with auto-play on hover
- Instagram-style customer showcase on the homepage

---

## 🚀 Performance & Optimization

### Image Optimization
- **Vercel Image Optimization** — automatic AVIF/WebP conversion at the edge
- `OptimizedImage` component with responsive `srcset` generation
- Priority loading for above-the-fold hero images, lazy loading elsewhere

### Build Optimization
- Code-splitting with React.lazy for all page routes
- Vendor bundle splitting (React, Firebase, UI libraries)
- CSS extraction per-component
- Font preloading with `font-display: swap`

### Caching
- Vercel edge caching headers for static assets (1 year immutable)
- Optimized cache-control for HTML, images, and API responses

---

## 🔍 SEO

### Crawlability
- `robots.txt` — allows all crawlers, blocks admin/checkout routes
- `sitemap.xml` — all public pages with priority and change frequency

### On-Page SEO
- Dynamic `<title>` and `<meta description>` per page via `react-helmet-async`
- Canonical URLs on every page
- Semantic HTML with proper heading hierarchy
- Visually-hidden `<h1>` on homepage for accessibility

### Structured Data (JSON-LD)
- `Organization` and `WebSite` schemas with sitelinks search box
- `Product` schema on product detail pages for Google rich results

### Social Sharing
- Open Graph tags (title, description, image, URL, locale)
- Twitter Card tags (`summary_large_image`)

### 404 Handling
- Dedicated `NotFoundPage` with `noindex` — no soft-404 penalties

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 19, TypeScript, Vite |
| **Styling** | Scoped CSS, CSS Custom Properties |
| **Animation** | Framer Motion |
| **Icons** | Lucide React |
| **State** | Zustand (custom `useStore` hook) |
| **Backend** | Firebase (Auth, Firestore, Storage, Cloud Functions) |
| **SEO** | react-helmet-async |
| **Deployment** | Vercel (with Image Optimization) |
| **Messaging** | WhatsApp Business API |

---

## 📦 Getting Started

### Prerequisites
- Node.js v18+
- A Firebase project

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/mishdgr8/TEFA.git
   cd TEFA
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Firebase:**
   - Create a project in the [Firebase Console](https://console.firebase.google.com/)
   - Enable **Authentication** (Google & Email/Password)
   - Enable **Cloud Firestore**
   - Enable **Storage**
   - Create a `.env.local` file:

   ```env
   VITE_FIREBASE_API_KEY=your_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   ```

4. **Run the dev server:**
   ```bash
   npm run dev
   ```

5. **Build for production:**
   ```bash
   npm run build
   ```

---

## 📁 Project Structure

```
src/
├── components/       # Reusable UI components (Header, ProductCard, SEOHead, etc.)
├── data/             # Store, products, and Firebase config
├── lib/              # Utilities (seo.ts, firebase.ts)
├── pages/            # Route-level page components
├── types/            # TypeScript interfaces
└── styles.css        # Global design tokens and utilities
public/
├── assets/           # Images, fonts, and media
├── robots.txt        # Search engine crawler rules
└── sitemap.xml       # XML sitemap for search engines
functions/            # Firebase Cloud Functions (WhatsApp webhooks)
```

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.
