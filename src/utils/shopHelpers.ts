import { CurrencyCode, CURRENCIES, Category, Product } from '../types';
import { CATEGORIES } from '../data/categories';

/**
 * Centrally formats prices based on currency code
 */
export const formatPrice = (
    price: number | { amount: number; isConverted?: boolean },
    currencyCode: CurrencyCode = 'NGN'
): string => {
    const currencyInfo = CURRENCIES.find(c => c.code === currencyCode) || CURRENCIES[0];

    let finalAmount: number;

    if (typeof price === 'object') {
        finalAmount = price.amount;
    } else {
        // Standard path: convert from Naira using the global rate
        finalAmount = price * currencyInfo.rate;
    }

    const fractionDigits = currencyCode === 'NGN' ? 0 : 2;
    return `${currencyInfo.symbol}${finalAmount.toLocaleString(undefined, {
        minimumFractionDigits: fractionDigits,
        maximumFractionDigits: fractionDigits
    })}`;
};

/**
 * Centrally calculates the price for a product based on active currency, 
 * respecting manual USD price overrides if present.
 */
export const getProductPrice = (product: any, currency: CurrencyCode = 'NGN'): { original: number, sale?: number } => {
    if (currency === 'NGN') {
        return {
            original: product.price,
            sale: product.salePrice
        };
    }

    // Handle USD with potential manual price overrides
    const rate = CURRENCIES.find(c => c.code === 'USD')?.rate || 0.00125;

    // Use product.priceUSD if it exists, otherwise fallback to rate conversion
    const originalUSD = product.priceUSD || (product.price * rate);

    // Calculate sale price in USD
    let saleUSD: number | undefined = undefined;
    if (product.salePrice) {
        if (product.priceUSD) {
            // If we have a custom USD price, we scale the sale price proportionally
            const discountRatio = product.salePrice / product.price;
            saleUSD = product.priceUSD * discountRatio;
        } else {
            saleUSD = product.salePrice * rate;
        }
    }

    return { original: originalUSD, sale: saleUSD };
};

/**
 * Helper to get category name by ID
 */
export const getCategoryName = (categoryId: string, categories: Category[] = []): string => {
    // Try finding in the provided live categories first
    const found = categories.find(c => c.id === categoryId);
    if (found) return found.name;

    // Fallback to static CATEGORIES for safety if live list is empty or doesn't match
    return CATEGORIES.find(c => c.id === categoryId)?.name || 'Uncategorized';
};
