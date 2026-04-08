import React from 'react';

/**
 * Cloudinary Image Optimization wrapper.
 *
 * This component automatically generates optimized Cloudinary URLs
 * and a srcSet for responsive breakpoints.
 */

// Standard responsive breakpoints (Added 320, 480 for mobile)
const DEFAULT_WIDTHS = [320, 480, 640, 750, 828, 1080, 1200, 1920, 2048];
const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'dzfrrcacc';

function cloudinaryImageUrl(src: string, width: number, quality: number | string): string {
    // 1. If it's already a Cloudinary URL from our own cloud, we can just transform it.
    // We look for res.cloudinary.com/<our-cloud>/
    const cloudinaryBase = `res.cloudinary.com/${CLOUD_NAME}/`;
    if (src.includes(cloudinaryBase)) {
        // Find the index after the cloud name and handle potential version/upload segments
        const parts = src.split(cloudinaryBase);
        const resourcePath = parts[1];

        // Remove existing transformations if any (e.g. image/upload/v1234/...)
        // Simple heuristic: find 'image/upload/' and keep what's after the version (v[0-9]+)
        const uploadMarker = 'image/upload/';
        if (resourcePath.includes(uploadMarker)) {
            const afterUpload = resourcePath.split(uploadMarker)[1];
            // Remove the version segment if it's there (v123456789/)
            const cleanPath = afterUpload.replace(/^v\d+\//, '');
            return `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/f_auto,q_${quality},w_${width}/${cleanPath}`;
        }
    }

    // 2. For external URLs (like Firebase Storage), use the Cloudinary 'fetch' API
    if (src.startsWith('http')) {
        return `https://res.cloudinary.com/${CLOUD_NAME}/image/fetch/f_auto,q_${quality},w_${width}/${encodeURIComponent(src)}`;
    }

    // 3. For local assets (like /assets/Hero/image.webp), use the uploaded assets from Cloudinary
    if (src.startsWith('/')) {
        const publicIdBase = `TEFA/${src.substring(1).replace(/\//g, '_').replace(/\.[^/.]+$/, "")}`;
        return `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/f_auto,q_${quality},w_${width}/${encodeURIComponent(publicIdBase)}`;
    }

    return src;
}

function buildSrcSet(src: string, widths: number[], quality: number | string): string {
    return widths
        .map((w) => `${cloudinaryImageUrl(src, w, quality)} ${w}w`)
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
     */
    sizes?: string;
    /** Image quality 1-100. Default: auto */
    quality?: number | 'auto';
    /** Explicit widths to generate. Defaults to a standard responsive set. */
    widths?: number[];
    /** If true, set fetchpriority="high" and skip lazy loading (for hero/LCP images). */
    priority?: boolean;
}

export const OptimizedImage: React.FC<OptimizedImageProps> = ({
    src,
    alt,
    sizes = '100vw',
    quality = 'auto',
    widths = DEFAULT_WIDTHS,
    priority = false,
    loading,
    decoding,
    style,
    ...rest
}) => {
    const [failed, setFailed] = React.useState(false);

    // If src is missing or Cloudinary failed, fall back to a plain <img>
    if (!src || failed) {
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
            src={cloudinaryImageUrl(src, widths[widths.length - 1], quality)}
            srcSet={buildSrcSet(src, widths, quality)}
            sizes={sizes}
            alt={alt}
            loading={priority ? 'eager' : loading || 'lazy'}
            decoding={priority ? 'sync' : decoding || 'async'}
            crossOrigin="anonymous"
            onError={() => setFailed(true)}
            // @ts-ignore — fetchPriority is valid HTML but not yet in React's TS defs
            fetchPriority={priority ? 'high' : undefined}
            style={style}
            {...rest}
        />
    );
};
