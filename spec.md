# Africana Clothing Store — spec.md

## 0) Objective
Build a **multi-page Africana-style clothing store website** with a premium, vibrant African feel: bold but tasteful color accents, clean layout, fast browsing, and a frictionless “buy” flow that **does not require sign-in**.

Instead of full e-commerce checkout, customers will:
- **Start a chat on-site** (WhatsApp-style widget or embedded chat) OR
- Be routed to **Instagram DM** to place orders.

## 1) Product Principles
- **Africana aesthetic, minimalist structure**: strong patterns + warm color pops, but not cluttered.
- **Browse-first UX**: categories + grid + quick product details.
- **Fast + responsive**: mobile-first, optimized images, snappy transitions.
- **Conversion via chat**: every product has a strong “Order via Chat” CTA.

## 2) Scope (MVP)
### Must-have
- Home page with hero + brand story + categories + featured products
- Shop page with grid, filters, category browsing
- Product detail page (sizes/colors/gallery) + “Order via Chat”
- Cart-lite (“inquiry cart”) that holds selected items locally (no auth)
- Checkout-like “Inquiry Form” that composes a message and routes to:
  - Instagram DM (primary) and/or WhatsApp click-to-chat (optional)
- CMS-like admin experience (simple): easy add/edit/remove products (Phase 1: local JSON; Phase 2: Firebase/Firestore)

### Nice-to-have
- Subtle animations (page fades, hover lift, image zoom, drawer cart)
- Size guide modal
- “New arrivals” and “Best sellers”
- Lookbook page
- Newsletter capture

## 3) Information Architecture
### Pages
- `/` Home
- `/shop` Products grid + filters
- `/c/[categorySlug]` Category-specific grid
- `/p/[productSlug]` Product detail
- `/cart` Inquiry cart (local only)
- `/checkout` Inquiry form (routes to chat)
- `/about` Brand story
- `/lookbook` Editorial / outfits
- `/contact` Social links + store info

Navigation
- Top nav: Shop, Categories dropdown, Lookbook, About, Contact
- Sticky “Chat to Order” button on mobile

## 4) Core User Flows
### 4.1 Browse → Product → Order via Chat
1. User browses shop grid
2. Opens product detail
3. Selects size/color + quantity
4. Clicks “Add to Cart” (optional) or “Order via Chat” (direct)
5. User is taken to `/checkout` inquiry form
6. Submit composes a structured message and opens:
   - Instagram DM link OR
   - WhatsApp click-to-chat link
7. Store owner confirms price, delivery, payment details manually

### 4.2 Add multiple items (Inquiry Cart)
- Cart is stored in `localStorage`
- User can adjust qty, size, color
- Checkout generates one combined message

## 5) Visual Design System (Africana)
### 5.1 Brand Palette (guideline)
- Background: warm neutrals (sand, cream, charcoal)
- Accents: 3–5 rotating “African pop” colors (e.g., saffron, teal, coral, indigo, jungle green)
- Patterns: subtle geometric motifs used sparingly (section dividers, borders, badges)

Rules:
- Use **one primary accent per page section**; avoid rainbow UI.
- Allow product photos to dominate. Use color as framing, not noise.

### 5.2 Typography
- Display font: bold serif or geometric sans for headlines
- Body font: clean sans for readability
- Large headlines + generous whitespace

### 5.3 Components
- Hero section with big image + short brand statement + CTA
- Category cards (with pattern overlay + hover)
- Product cards (image, name, price, quick add)
- Filter chips (categories, sizes, colors)
- Drawer cart (slide-in)
- “Order via Chat” CTA (sticky on mobile)

## 6) Motion & Animation Guidelines
- Page enter: fade/slide (150–250ms)
- Product cards: hover lift + slight shadow + image zoom 1.02
- Drawer cart: spring slide
- Add-to-cart: micro “pop” + toast
- Section reveals: staggered on scroll (subtle)

No autoplay carousels by default.

## 7) Data Model (Phase 1: local JSON; Phase 2: Firestore)
### 7.1 Product Fields
Each product:
- `id: string`
- `slug: string` (unique)
- `name: string`
- `description: string`
- `price: number` (in cents)
- `currency: 'USD' | 'NGN' | ...`
- `images: string[]`
- `categoryId: string`
- `tags: string[]`
- `sizes: string[]` (e.g., S, M, L, XL, XXL)
- `colors: Array<{ name: string, hex: string }>`
- `materials?: string`
- `care?: string`
- `fitNote?: string`
- `inventory?: { inStock: boolean }` (MVP only)
- `isActive: boolean`
- `createdAt: timestamp`
- `updatedAt: timestamp`

### 7.2 Categories
- `id: string`
- `name: string` (e.g., Ankara Sets, Kaftans, Dresses, Tops, Accessories)
- `slug: string`
- `order: number`
- `isActive: boolean`

### 7.3 Inquiry Cart Item (Local)
- `productId`
- `name`
- `unitPrice`
- `qty`
- `selectedSize`
- `selectedColor`
- `image`
- `slug`

## 8) Inquiry Checkout (Chat Routing)
### 8.1 Inquiry Form Fields
- Name (optional)
- Phone or email (optional)
- Delivery city/country (optional)
- Notes (optional)

### 8.2 Message Template
Generated message (example):
"Hi! I want to order:
1) Kaftan — Size L — Color Indigo — Qty 1 — ₦45,000
2) Ankara Set — Size M — Color Coral — Qty 2 — ₦70,000
Delivery: Lagos
Notes: Please confirm availability and total incl. delivery."

### 8.3 Chat Targets
- Instagram DM deep link (primary)
- Optional WhatsApp click-to-chat

Instagram linking approach:
- Provide a visible button: “Message us on Instagram”
- Use `https://instagram.com/<handle>/` as the reliable fallback
- If deep-linking fails on desktop, show modal instructions (“opens best on mobile”)

WhatsApp approach (optional):
- `https://wa.me/<number>?text=<encoded message>`

## 9) Tech Stack Recommendation
- Frontend: Next.js (App Router) + TypeScript
- Styling: Tailwind CSS
- UI components: shadcn/ui (minimal base)
- Animation: Framer Motion
- State: Zustand or React context for cart (localStorage persistence)
- Image optimization: Next Image

Backend:
- MVP: no backend required (static product data in JSON)
- Phase 2: Firebase (Firestore + Storage) to manage products

Deployment:
- Vercel (recommended) or Firebase Hosting

## 10) SEO & Analytics (MVP)
- Metadata per page (title/description)
- OpenGraph images for products
- Sitemap generation (optional)
- Basic analytics (Plausible/GA) (optional)

## 11) MVP Acceptance Criteria
- Home page loads with hero + categories + featured grid
- Shop grid page supports:
  - Category filter
  - Price display
  - Responsive layout
- Product detail supports:
  - Image gallery
  - Size + color selection required before adding
  - Add to cart
  - Order via chat
- Cart supports:
  - Adjust quantity
  - Remove items
  - Persist across refresh
- Checkout inquiry:
  - Collects optional user details
  - Generates message
  - Routes to Instagram/WhatsApp with prefilled text (where supported)

## 12) Build Plan (Milestones)
1) Design system + layout + routing
2) Home page sections + category cards
3) Product grid + filter UI + local JSON data
4) Product detail page + variants (sizes/colors)
5) Cart drawer + cart page + persistence
6) Inquiry checkout + message generation + Instagram routing
7) Motion polish + performance + deploy

## 13) Prompts (Start → Finish)
### Prompt A — Bootstrap
"Create a Next.js + TS project with Tailwind, shadcn/ui, Framer Motion. Implement multi-page layout with Africana design direction: warm neutrals + bold accent palette + subtle geometric pattern accents."

### Prompt B — Home page
"Build the home page: hero (large image, headline, CTA), brand description, category section, featured products section. Add subtle scroll reveal animations."

### Prompt C — Data + shop grid
"Create a local products dataset (JSON/TS) with categories, sizes, colors, prices, images. Implement /shop grid with filters and category navigation."

### Prompt D — Product detail
"Implement /p/[slug] product detail with image gallery, size/color pickers, add-to-cart, and Order via Chat CTA. Enforce variant selection."

### Prompt E — Cart + persistence
"Implement cart drawer + /cart page with localStorage persistence. Support qty changes, remove, subtotal."

### Prompt F — Inquiry checkout
"Implement /checkout inquiry form that generates a structured order message. Add buttons to route to Instagram (and optionally WhatsApp) with encoded message. Provide fallback instructions for desktop."

### Prompt G — Styling pass
"Polish Africana UI: patterns used sparingly, consistent spacing, tasteful accent usage, improved typography hierarchy, responsive details, performance optimizations."

### Prompt H — Deploy
"Provide a deployment checklist for Vercel, including environment config and image optimization."

FONT: https://www.figma.com/resource-library/professional-fonts/ 

COLORS: https://www.figma.com/resource-library/professional-colors/ 

