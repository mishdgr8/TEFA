// ═══════════════════════════════════════════════════════════════════════════
// TÉFA - SEO Configuration
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Central SEO configuration.
 * Update SITE_URL once the custom domain is live.
 */
export const SEO_CONFIG = {
    SITE_URL: 'https://houseoftefa.com',
    SITE_NAME: 'TÉFA',
    DEFAULT_TITLE: 'TÉFA — Premium African Fashion | Handcrafted in Lagos',
    DEFAULT_DESCRIPTION:
        'Discover TÉFA — premium African fashion for the bold and beautiful. Handcrafted kaftans, ankara sets, gowns, and accessories from Lagos, Nigeria. Free worldwide shipping.',
    DEFAULT_OG_IMAGE: '/assets/Hero/Screenshot 2026-02-06 at 13.44.48.jpg',
    TWITTER_HANDLE: '@shop.tefa',
    INSTAGRAM_HANDLE: '@shop.tefa',
    LOCALE: 'en_US',
    CURRENCY: 'NGN',
    BRAND: {
        name: 'TÉFA',
        url: 'https://houseoftefa.com',
        logo: 'https://houseoftefa.com/assets/Hero/Screenshot 2026-02-06 at 13.44.48.jpg',
        description: 'Premium African fashion for the bold and beautiful. Handcrafted in Lagos, Nigeria.',
        email: 'hello@houseoftefa.com',
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
