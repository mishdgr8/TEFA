import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.6";
import { createHmac } from "node:crypto";

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
    // Paystack webhooks are POST requests from their servers.
    if (req.method !== 'POST') {
        return new Response('Method not allowed', { status: 405 });
    }

    try {
        const signature = req.headers.get('x-paystack-signature');
        const secret = Deno.env.get('PAYSTACK_SECRET_KEY') || '';

        // We need the raw body to verify the signature
        const bodyText = await req.text();

        // 1. Verify Signature
        const hash = createHmac('sha512', secret)
            .update(bodyText)
            .digest('hex');

        if (hash !== signature) {
            console.error('Invalid Paystack Signature');
            return new Response('Unauthorized', { status: 401 });
        }

        const payload = JSON.parse(bodyText);

        // 2. We only care about successful payments for order creation
        if (payload.event === 'charge.success') {
            const data = payload.data;
            const metadata = data.metadata || {};
            const cartItems = metadata.cart_items || [];

            // Initialize Supabase Client with SERVICE_ROLE to bypass RLS
            // Since this is a webhook, there's no user token.
            const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
            const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
            const supabase = createClient(supabaseUrl, supabaseKey);

            // Extract user_id if attached (if the user was logged in)
            const userId = metadata.user_id || null;

            // Create Order
            const { data: newOrder, error: orderError } = await supabase
                .from('orders')
                .insert({
                    payment_reference: data.reference,
                    user_id: userId,
                    customer_name: metadata.customer_info ? `${metadata.customer_info.firstName} ${metadata.customer_info.lastName}`.trim() : (metadata.customer_name || 'Customer'),
                    customer_email: data.customer.email || metadata.customer_email || '',
                    customer_phone: metadata.customer_info?.phone ? `${metadata.customer_info.countryCode || ''} ${metadata.customer_info.phone}`.trim() : (metadata.customer_phone || data.customer.phone || ''),
                    customer_location: JSON.stringify(metadata.customer_info || {}),
                    customer_note: metadata.customer_note || metadata.customer_info?.note || '',
                    total: data.amount / 100, // Convert subunits back to NGN/USD
                    currency: data.currency || 'NGN',
                    payment_status: 'success',
                    order_status: 'new',
                    payment_method: data.channel || 'paystack'
                })
                .select('id')
                .single();

            if (orderError) {
                throw new Error(`Failed to insert order: ${orderError.message}`);
            }

            // Create Order Items
            if (cartItems.length > 0) {
                const itemsToInsert = cartItems.map((item: any) => ({
                    order_id: newOrder.id,
                    product_id: item.productId,
                    variant_id: item.variantId || `${item.productId}-${item.selectedSize || 'Auto'}`,
                    name: item.name,
                    qty: item.qty || 1,
                    price: item.price || 0,
                    selected_size: item.selectedSize || 'Standard'
                }));

                const { error: itemsError } = await supabase
                    .from('order_items')
                    .insert(itemsToInsert);

                if (itemsError) {
                    throw new Error(`Failed to insert order items: ${itemsError.message}`);
                }
            }

            // 3. Send Confirmation Email
            try {
                await fetch(`${supabaseUrl}/functions/v1/send-order-email`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${supabaseKey}`
                    },
                    body: JSON.stringify({
                        order: {
                            id: newOrder.id,
                            total: data.amount / 100,
                            currency: data.currency || 'NGN',
                            customer_location: metadata.customer_info || {}
                        },
                        items: cartItems,
                        customerEmail: data.customer.email || metadata.customer_email,
                        customerName: metadata.customer_info ? `${metadata.customer_info.firstName} ${metadata.customer_info.lastName}`.trim() : 'Valued Customer'
                    })
                });
                console.log(`📧 Confirmation email triggered for order ${newOrder.id}`);
            } catch (emailErr) {
                console.error('Email sending failed:', emailErr);
                // Don't fail the whole webhook if just email fails
            }

            console.log(`✅ Order ${data.reference} successfully processed by webhook.`);
        }

        return new Response(JSON.stringify({ status: 'ok' }), {
            headers: { 'Content-Type': 'application/json' },
            status: 200,
        });

    } catch (err: any) {
        console.error('Webhook Error:', err);
        return new Response(JSON.stringify({ error: err.message }), {
            headers: { 'Content-Type': 'application/json' },
            status: 500,
        });
    }
});
