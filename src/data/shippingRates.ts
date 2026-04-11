export interface InternationalShippingRate {
    country: string;
    rateNGN: number;
}

export const INTERNATIONAL_SHIPPING_RATES: InternationalShippingRate[] = [
    { country: 'United Kingdom', rateNGN: 58800 },
    { country: 'United States', rateNGN: 75800 },
    { country: 'Ghana', rateNGN: 45000 },
    { country: 'South Africa', rateNGN: 70000 },
    { country: 'Senegal', rateNGN: 64800 },
    { country: 'France', rateNGN: 78800 },
    { country: 'Italy', rateNGN: 82800 },
    { country: 'United Arab Emirates', rateNGN: 90000 },
    { country: 'Ireland', rateNGN: 58800 },
    { country: 'Switzerland', rateNGN: 78500 },
    { country: 'Barbados', rateNGN: 98800 },
    { country: 'Belgium', rateNGN: 78800 },
    { country: 'Canada', rateNGN: 75800 },
];

export const WORLDWIDE_FLAT_RATE = 80000;

// Helper to get rate by country name
export const getInternationalRate = (countryName: string): number => {
    if (!countryName || countryName === 'Nigeria') return 0;

    // Try exact match or common aliases
    const matched = INTERNATIONAL_SHIPPING_RATES.find(r =>
        r.country.toLowerCase() === countryName.toLowerCase() ||
        (r.country === 'United States' && (countryName === 'USA' || countryName === 'United States of America')) ||
        (r.country === 'United Kingdom' && (countryName === 'UK' || countryName === 'Britain')) ||
        (r.country === 'United Arab Emirates' && (countryName === 'Dubai' || countryName === 'UAE'))
    );

    return matched ? matched.rateNGN : WORLDWIDE_FLAT_RATE;
};
