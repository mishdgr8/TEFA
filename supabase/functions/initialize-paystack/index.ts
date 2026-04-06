import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.6";

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

async function calculateOrderTotal(supabase: any, cart: any[], currency = 'NGN') {
    let total = 0;

    for (const item of cart) {
        // Note: product_id was text in Firebase, but Postgres uses UUID.
        // If the cart relies on the slug or the new UUID, we must verify what `item.id` is.
        // Assuming `item.id` is the new UUID of the product.
        const { data: product, error } = await supabase
            .from('products')
            .select('price, price_usd')
            .eq('id', item.id)
            .single();

        if (error || !product) {
            throw new Error(`Product ${item.id} no longer exists or could not be verified.`);
        }

        let price = (currency.toUpperCase() === 'USD')
            ? (product.price_usd || product.price / 1500)
            : (product.price || 0);

        total += price * (item.qty || 1);
    }

    return total;
}

serve(async (req) => {
    // CORS Preflight
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    try {
        const { cart, email, currency = 'NGN', metadata = {} } = await req.json();

        if (!cart || !email) {
            throw new Error('Missing cart or email.');
        }

        // Initialize Supabase Client
        const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
        const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY') ?? '';
        const supabase = createClient(supabaseUrl, supabaseKey, {
            global: { headers: { Authorization: req.headers.get('Authorization')! } },
        });

        // 1. Double-check total against database
        const total = await calculateOrderTotal(supabase, cart, currency);
        const amountInSubunits = Math.round(total * 100);

        // 2. Initialize Paystack
        const paystackKey = Deno.env.get('PAYSTACK_SECRET_KEY');
        if (!paystackKey) {
            throw new Error('Missing Paystack configuration');
        }

        const payload = {
            email: email,
            amount: amountInSubunits,
            currency: currency.toUpperCase(),
            callback_url: 'https://houseoftefa.com/checkout/success', // Adjust as needed
            metadata: {
                ...metadata,
                cart_items: cart.map((i: any) => ({ name: i.name, qty: i.qty, id: i.id })),
                platform: 'web_v1'
            }
        };

        const response = await fetch('https://api.paystack.co/transaction/initialize', {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${paystackKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        const result = await response.json();

        if (!result.status) {
            console.error('Paystack API Error:', result.message);
            throw new Error(result.message || 'Paystack initialization failed.');
        }

        return new Response(JSON.stringify(result.data), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
        });

    } catch (err: any) {
        console.error('Initialization Error:', err);
        return new Response(JSON.stringify({ error: err.message }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
        });
    }
});
