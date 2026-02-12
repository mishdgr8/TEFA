import React from 'react';
import { Helmet } from 'react-helmet-async';
import { SEO_CONFIG, getCanonicalUrl } from '../lib/seo';
import { Product } from '../types';

interface ProductJsonLdProps {
    product: Product;
    slug: string;
}

/**
 * Renders JSON-LD structured data for a Product.
 * This helps Google show rich results with price, availability, and images.
 */
export const ProductJsonLd: React.FC<ProductJsonLdProps> = ({ product, slug }) => {
    const productUrl = getCanonicalUrl(`/product/${slug}`);

    const availability = product.soldOut
        ? 'https://schema.org/OutOfStock'
        : product.stockStatus === 'out_of_stock'
            ? 'https://schema.org/OutOfStock'
            : product.stockStatus === 'low_stock'
                ? 'https://schema.org/LimitedAvailability'
                : 'https://schema.org/InStock';

    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: product.name,
        description: product.description,
        image: product.images,
        url: productUrl,
        brand: {
            '@type': 'Brand',
            name: SEO_CONFIG.BRAND.name,
        },
        offers: {
            '@type': 'Offer',
            url: productUrl,
            priceCurrency: product.currency || SEO_CONFIG.CURRENCY,
            price: product.price,
            availability,
            seller: {
                '@type': 'Organization',
                name: SEO_CONFIG.BRAND.name,
            },
        },
        ...(product.colors.length > 0 && {
            color: product.colors.map(c => c.name).join(', '),
        }),
        ...(product.sizes.length > 0 && {
            size: product.sizes,
        }),
        category: product.categoryId,
    };

    return (
        <Helmet>
            <script type="application/ld+json">
                {JSON.stringify(jsonLd)}
            </script>
        </Helmet>
    );
};
