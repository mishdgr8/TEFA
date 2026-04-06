import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.6";

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
    // CORS Preflight
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    try {
        const { text, adminText, chatId } = await req.json();

        const accessToken = Deno.env.get('WHATSAPP_TOKEN');
        const phoneNumberId = Deno.env.get('WHATSAPP_PHONE_ID');
        const recipientNumber = Deno.env.get('WHATSAPP_RECIPIENT');

        if (!accessToken || !phoneNumberId || !recipientNumber) {
            console.error('WhatsApp API Config Missing');
            throw new Error('WhatsApp API not configured.');
        }

        // Initialize Supabase Client
        const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
        const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY') ?? '';
        // Use auth token passed from client
        const supabase = createClient(supabaseUrl, supabaseKey, {
            global: { headers: { Authorization: req.headers.get('Authorization')! } }
        });

        // 1. Save user message to Supabase
        if (chatId) {
            const { error: msgError } = await supabase
                .from('chat_messages')
                .insert({
                    chat_id: chatId,
                    text: text,
                    is_user: true
                });

            if (msgError) {
                console.error('Error saving chat message:', msgError);
            }
        }

        const url = `https://graph.facebook.com/v21.0/${phoneNumberId}/messages`;

        // 2. Send to Meta Graph API
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                messaging_product: 'whatsapp',
                recipient_type: 'individual',
                to: recipientNumber,
                type: 'text',
                text: { body: adminText || text },
            }),
        });

        const result = await response.json();

        if (!response.ok) {
            console.error('Meta API Error Response:', JSON.stringify(result));
            const isWindowError = result.error?.code === 131047 || result.error?.message?.includes('24 hours');
            throw new Error(isWindowError
                ? 'WhatsApp 24-hour window is closed. Business must use a template or wait for owner to reply.'
                : (result.error?.message || 'Failed to send WhatsApp message'));
        }

        console.log('Meta Send Success:', JSON.stringify(result));
        const waMessageId = result.messages?.[0]?.id;

        // 3. Save mapping
        if (waMessageId && chatId) {
            // Use service role for mapping table if strict RLS, else use authenticated client
            const serviceClient = createClient(supabaseUrl, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '');
            await serviceClient.from('wa_mappings').insert({
                wa_message_id: waMessageId,
                chat_id: chatId
            });
            console.log('Mapping stored:', waMessageId, '->', chatId);
        }

        return new Response(JSON.stringify({ success: true, messageId: waMessageId }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
        });

    } catch (err: any) {
        console.error('WhatsApp Send Exception:', err);
        return new Response(JSON.stringify({ error: err.message }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
        });
    }
});
