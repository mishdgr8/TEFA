import { createClient } from '@supabase/supabase-js';

/**
 * TÉFA Social Media Bot SEO Handler
 * This function handles requests from social media bots (WhatsApp, Instagram, etc.)
 * by serving dynamic meta tags for products before the SPA loads.
 */
export default async function (request: any, response: any) {
    const { slug } = request.query;

    if (!slug) {
        return response.status(404).send('Product not found');
    }

    const supabaseUrl = process.env.VITE_SUPABASE_URL;
    const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
        console.error('Supabase credentials missing in Vercel function environment.');
        return response.status(500).send('Internal Server Error: Missing Database Config');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    try {
        // 1. Fetch product from Supabase
        const { data: product, error } = await supabase
            .from('products')
            .select('*')
            .eq('slug', slug)
            .single();

        if (error || !product) {
            console.log(`SEO Bot: Product not found for slug "${slug}"`);
            // Fail gracefully and redirect to home
            return response.status(200).send(`
        <!DOCTYPE html><html><head><meta http-equiv="refresh" content="0; url=/"></head><body>Redirecting...</body></html>
      `);
        }

        // 2. Prepare SEO Content
        const title = `${product.name} | TÉFA — Handcrafted Luxury Africana`;
        const description = (product.description || 'Discover premium African fashion ethically handcrafted in Lagos.').substring(0, 160);
        const rawImage = product.images?.[0] || 'https://shoptefa.com/assets/branding/logo-premium.png';

        // 3. Cloudinary Optimization for Social Media (1200x630)
        let ogImage = rawImage;
        if (rawImage.includes('cloudinary')) {
            ogImage = rawImage.replace(/\/upload\/.*?\/(v\d+\/)?/, `/upload/f_auto,q_auto,w_1200,h_630,c_fill,g_auto/`);
        } else {
            ogImage = `https://res.cloudinary.com/dzfrrcacc/image/upload/f_auto,q_auto,w_1200,h_630,c_fill,g_auto/${encodeURIComponent(rawImage)}`;
        }

        // 4. Return Bot-Friendly HTML
        const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>${title}</title>
    <meta name="description" content="${description}">
    
    <!-- Open Graph / Facebook / WhatsApp -->
    <meta property="og:type" content="product">
    <meta property="og:title" content="${title}">
    <meta property="og:description" content="${description}">
    <meta property="og:image" content="${ogImage}">
    <meta property="og:url" content="https://shoptefa.com/product/${slug}">
    <meta property="og:site_name" content="TÉFA">

    <!-- Twitter -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${title}">
    <meta name="twitter:description" content="${description}">
    <meta name="twitter:image" content="${ogImage}">

    <!-- Instant redirection if a human accidentally hits this URL -->
    <meta http-equiv="refresh" content="0; url=/product/${slug}">
    <script>window.location.href = "/product/${slug}";</script>
</head>
<body style="background: #000; color: #fff; font-family: sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh;">
    <div style="text-align: center;">
        <h1 style="font-weight: 300;">TÉFA</h1>
        <p>Enhancing your luxury experience...</p>
    </div>
</body>
</html>`;

        response.setHeader('Content-Type', 'text/html');
        response.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate'); // Cache for 1 hour
        return response.status(200).send(html);
    } catch (err) {
        console.error('OG API Error:', err);
        return response.status(500).send('Internal Server Error');
    }
}
