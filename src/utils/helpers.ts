// Utility helpers for TÉFA

/**
 * Generates a URL-friendly slug from a string
 */
export const slugify = (text: string): string => {
    return text
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
};

/**
 * Generates a unique ID
 */
export const generateId = (): string => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
};

/**
 * Formats a price with currency symbol
 */
export const formatPrice = (price: number, currency: string = '₦'): string => {
    return `${currency}${price.toLocaleString()}`;
};

/**
 * Truncates text to a maximum length with ellipsis
 */
export const truncate = (text: string, maxLength: number): string => {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength).trim() + '...';
};

/**
 * Validates an image URL (basic check)
 */
export const isValidImageUrl = (url: string): boolean => {
    try {
        new URL(url);
        return /\.(jpg|jpeg|png|gif|webp|svg)(\?.*)?$/i.test(url) ||
            url.includes('unsplash.com') ||
            url.includes('images.');
    } catch {
        return false;
    }
};

/**
 * Debounce function
 */
export const debounce = <T extends (...args: unknown[]) => unknown>(
    fn: T,
    delay: number
): ((...args: Parameters<T>) => void) => {
    let timeoutId: ReturnType<typeof setTimeout>;
    return (...args: Parameters<T>) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => fn(...args), delay);
    };
};

/**
 * Generates WhatsApp link with message
 */
export const generateWhatsAppLink = (phone: string, message: string): string => {
    const encoded = encodeURIComponent(message);
    return `https://wa.me/${phone}?text=${encoded}`;
};

/**
 * Copy text to clipboard
 */
export const copyToClipboard = async (text: string): Promise<boolean> => {
    try {
        await navigator.clipboard.writeText(text);
        return true;
    } catch {
        return false;
    }
};
