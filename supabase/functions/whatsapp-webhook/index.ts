import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.6";

serve(async (req) => {
    // Verification Handle (GET)
    if (req.method === 'GET') {
        const url = new URL(req.url);
        const mode = url.searchParams.get('hub.mode');
        const token = url.searchParams.get('hub.verify_token');
        const challenge = url.searchParams.get('hub.challenge');

        const verifyToken = Deno.env.get('WHATSAPP_VERIFY_TOKEN');

        if (mode === 'subscribe' && token === verifyToken) {
            console.log('Webhook Verified!');
            return new Response(challenge, { status: 200 });
        }
        return new Response('Forbidden', { status: 403 });
    }

    // Event Handle (POST)
    if (req.method === 'POST') {
        try {
            const body = await req.json();

            if (body.object === 'whatsapp_business_account') {
                const entry = body.entry?.[0];
                const change = entry?.changes?.[0];
                const value = change?.value;
                const message = value?.messages?.[0];

                if (message && message.type === 'text') {
                    const text = message.text.body;
                    const contextId = message.context?.id;
                    const from = message.from;

                    console.log(`Msg from ${from}: ${text} (Context: ${contextId})`);

                    // Initialize service-role Supabase client
                    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
                    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
                    const supabase = createClient(supabaseUrl, supabaseKey);

                    let targetChatId = null;

                    if (contextId) {
                        const { data: mapping } = await supabase
                            .from('wa_mappings')
                            .select('chat_id')
                            .eq('wa_message_id', contextId)
                            .single();

                        if (mapping) {
                            targetChatId = mapping.chat_id;
                        }
                    }

                    // Fallback: If no contextId, try to find a recent mapping
                    if (!targetChatId) {
                        const recipientNumber = Deno.env.get('WHATSAPP_RECIPIENT');
                        if (from === recipientNumber) {
                            const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();
                            const { data: recent } = await supabase
                                .from('wa_mappings')
                                .select('chat_id')
                                .gte('created_at', twoHoursAgo)
                                .order('created_at', { ascending: false })
                                .limit(1);

                            if (recent && recent.length > 0) {
                                targetChatId = recent[0].chat_id;
                            }
                        }
                    }

                    if (targetChatId) {
                        const { error: insertError } = await supabase
                            .from('chat_messages')
                            .insert({
                                chat_id: targetChatId,
                                text: text,
                                is_user: false
                            });

                        if (insertError) {
                            console.error('ERROR SAVING TO SUPABASE:', insertError);
                        } else {
                            console.log('SAVED TO SUPABASE:', targetChatId);
                        }
                    } else {
                        console.warn('COULD NOT ROUTE MESSAGE - NO RECENT CHAT ID FOUND FOR:', from);
                    }
                }
            }
        } catch (err: any) {
            console.error('WEBHOOK ERROR:', err.message || err);
        }

        // Always return 200 to Meta
        return new Response('EVENT_RECEIVED', { status: 200 });
    }

    return new Response('Method Not Allowed', { status: 405 });
});
