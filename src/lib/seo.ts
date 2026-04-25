// ═══════════════════════════════════════════════════════════════════════════
// TÉFA - SEO Configuration
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Central SEO configuration.
 * Update SITE_URL once the custom domain is live.
 */
export const SEO_CONFIG = {
    SITE_URL: 'https://shoptefa.com',
    SITE_NAME: 'TÉFA',
    DEFAULT_TITLE: 'TÉFA — Premium African Fashion | Handcrafted in Lagos',
    DEFAULT_DESCRIPTION:
        'TÉFA — Ethically handcrafted luxury African fashion. Discover premium kaftans, bold sets, and contemporary gowns from Lagos, Nigeria. Blending rich African heritage with modern, sophisticated aesthetics for the bold and beautiful worldwide.',
    DEFAULT_OG_IMAGE: '/assets/branding/logo-premium.png',
    TWITTER_HANDLE: '@shop.tefa',
    INSTAGRAM_HANDLE: '@shop.tefa',
    LOCALE: 'en_US',
    CURRENCY: 'NGN',
    BRAND: {
        name: 'TÉFA',
        url: 'https://shoptefa.com',
        logo: 'https://shoptefa.com/assets/Hero/Screenshot 2026-02-06 at 13.44.48.webp',
        description: 'Premium African fashion for the bold and beautiful. Handcrafted in Lagos, Nigeria.',
        email: 'hello@shoptefa.com',
        phone: '+2348135407871',
        address: {
            city: 'Lagos',
            country: 'NG',
        },
        sameAs: [
            'https://www.instagram.com/shop.tefa',
        ],
    },
} as const;

/**
 * Generate a page-specific title using the brand template.
 */
export const formatPageTitle = (pageTitle?: string): string => {
    if (!pageTitle) return SEO_CONFIG.DEFAULT_TITLE;
    return `${pageTitle} | ${SEO_CONFIG.SITE_NAME}`;
};

/**
 * Generate a canonical URL from a relative path.
 */
export const getCanonicalUrl = (path: string): string => {
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    return `${SEO_CONFIG.SITE_URL}${cleanPath}`;
};

/**
 * Generate a Cloudinary-optimized Open Graph image URL.
 * Social platforms prefer 1200x630.
 */
export const getCloudinaryOgUrl = (src?: string): string => {
    const CLOUD_NAME = 'dzfrrcacc';
    const defaultImage = `${SEO_CONFIG.SITE_URL}${SEO_CONFIG.DEFAULT_OG_IMAGE}`;
    const imageToProcess = src || defaultImage;

    // Determine transformation based on whether it's a product or a logo
    // Products usually look better with 'c_fill' (cropped to fill)
    // Logos/Branding look better with 'c_pad' (padded with background)
    const isProduct = src && (src.includes('/product/') || src.includes('firebasestorage') || src.includes('products%2F'));
    const transformation = isProduct
        ? 'f_auto,q_auto,w_1200,h_630,c_fill,g_auto'
        : 'f_auto,q_auto,w_1200,h_630,c_pad,b_black'; // Use padding for logos to keep them elegant

    // 1. If it's already a Cloudinary URL
    if (imageToProcess.includes('res.cloudinary.com')) {
        return imageToProcess.replace(/\/upload\/.*?\/(v\d+\/)?/, `/upload/${transformation}/`);
    }

    // 2. If it's an absolute URL
    if (imageToProcess.startsWith('http')) {
        return `https://res.cloudinary.com/${CLOUD_NAME}/image/fetch/${transformation}/${encodeURIComponent(imageToProcess)}`;
    }

    // 3. Local path
    const cleanPath = imageToProcess.startsWith('/') ? imageToProcess.substring(1) : imageToProcess;
    const publicId = `TEFA/${cleanPath.replace(/\//g, '_').replace(/\.[^/.]+$/, "")}`;
    return `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/${transformation}/${encodeURIComponent(publicId)}`;
};
