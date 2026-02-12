import React from 'react';

/**
 * Vercel Image Optimization wrapper.
 *
 * On Vercel, images are served through `/_vercel/image` which:
 *  - Auto-converts to AVIF/WebP based on the browser's Accept header
 *  - Resizes to the requested width on the edge
 *  - Caches the result at the CDN
 *
 * Locally (dev), it falls back to a plain <img> tag.
 */

const IS_VERCEL = import.meta.env.PROD; // Only use Vercel optimisation in production

// Standard responsive breakpoints
const DEFAULT_WIDTHS = [640, 750, 828, 1080, 1200, 1920, 2048];

function vercelImageUrl(src: string, width: number, quality: number): string {
    return `/_vercel/image?url=${encodeURIComponent(src)}&w=${width}&q=${quality}`;
}

function buildSrcSet(src: string, widths: number[], quality: number): string {
    return widths
        .map((w) => `${vercelImageUrl(src, w, quality)} ${w}w`)
        .join(', ');
}

export interface OptimizedImageProps
    extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, 'srcSet'> {
    /** The source path — either a local `/assets/…` path or a full URL. */
    src: string;
    /** Alt text (required for a11y). */
    alt: string;
    /** 
     * The `sizes` attribute tells the browser how wide the image will be
     * at various viewport widths so it can pick the best srcSet candidate.
     * Example: "(max-width: 768px) 100vw, 50vw"
     * Defaults to "100vw" which works for full-width hero images.
     */
    sizes?: string;
    /** Image quality 1-100. Default: 75 */
    quality?: number;
    /** Explicit widths to generate. Defaults to a standard responsive set. */
    widths?: number[];
    /** If true, set fetchpriority="high" and skip lazy loading (for hero/LCP images). */
    priority?: boolean;
}

export const OptimizedImage: React.FC<OptimizedImageProps> = ({
    src,
    alt,
    sizes = '100vw',
    quality = 75,
    widths = DEFAULT_WIDTHS,
    priority = false,
    loading,
    decoding,
    style,
    ...rest
}) => {
    // In dev mode or if src is missing, fall back to a plain <img>
    if (!IS_VERCEL || !src) {
        return (
            <img
                src={src}
                alt={alt}
                loading={priority ? 'eager' : loading || 'lazy'}
                decoding={priority ? 'sync' : decoding || 'async'}
                style={style}
                {...rest}
            />
        );
    }

    return (
        <img
            src={vercelImageUrl(src, widths[widths.length - 1], quality)}
            srcSet={buildSrcSet(src, widths, quality)}
            sizes={sizes}
            alt={alt}
            loading={priority ? 'eager' : loading || 'lazy'}
            decoding={priority ? 'sync' : decoding || 'async'}
            // @ts-ignore — fetchPriority is valid HTML but not yet in React's TS defs
            fetchPriority={priority ? 'high' : undefined}
            style={style}
            {...rest}
        />
    );
};
