import React from 'react';
import { Helmet } from 'react-helmet-async';
import { SEO_CONFIG, formatPageTitle, getCanonicalUrl } from '../lib/seo';

interface SEOHeadProps {
    /** Page-specific title (will be appended with "| TÉFA") */
    title?: string;
    /** Page-specific description */
    description?: string;
    /** Canonical URL path (e.g. "/shop" or "/product/the-eve-dress") */
    path?: string;
    /** Open Graph image URL (absolute or relative) */
    image?: string;
    /** Open Graph type (default: "website") */
    type?: 'website' | 'article' | 'product';
    /** Prevent indexing (for checkout, admin, etc.) */
    noindex?: boolean;
    /** Additional JSON-LD structured data */
    jsonLd?: Record<string, unknown> | Record<string, unknown>[];
}

export const SEOHead: React.FC<SEOHeadProps> = ({
    title,
    description,
    path = '/',
    image,
    type = 'website',
    noindex = false,
    jsonLd,
}) => {
    const fullTitle = formatPageTitle(title);
    const fullDescription = description || SEO_CONFIG.DEFAULT_DESCRIPTION;
    const canonicalUrl = getCanonicalUrl(path);
    const ogImage = image?.startsWith('http')
        ? image
        : `${SEO_CONFIG.SITE_URL}${image || SEO_CONFIG.DEFAULT_OG_IMAGE}`;

    return (
        <Helmet>
            {/* Primary */}
            <title>{fullTitle}</title>
            <meta name="description" content={fullDescription} />
            <link rel="canonical" href={canonicalUrl} />

            {/* Robots */}
            {noindex && <meta name="robots" content="noindex, nofollow" />}

            {/* Open Graph */}
            <meta property="og:type" content={type} />
            <meta property="og:title" content={fullTitle} />
            <meta property="og:description" content={fullDescription} />
            <meta property="og:url" content={canonicalUrl} />
            <meta property="og:image" content={ogImage} />
            <meta property="og:site_name" content={SEO_CONFIG.SITE_NAME} />
            <meta property="og:locale" content={SEO_CONFIG.LOCALE} />

            {/* Twitter Card */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content={fullTitle} />
            <meta name="twitter:description" content={fullDescription} />
            <meta name="twitter:image" content={ogImage} />

            {/* JSON-LD Structured Data */}
            {jsonLd && (
                <script type="application/ld+json">
                    {JSON.stringify(Array.isArray(jsonLd) ? jsonLd : jsonLd)}
                </script>
            )}
        </Helmet>
    );
};
