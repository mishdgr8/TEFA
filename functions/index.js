const { onCall, HttpsError, onRequest } = require('firebase-functions/v2/https');
const admin = require('firebase-admin');

admin.initializeApp();
const db = admin.firestore();

/**
 * Cloud Function to send WhatsApp notifications.
 */
exports.sendWhatsAppNotification = onCall({ cors: true }, async (request) => {
    console.log('--- sendWhatsAppNotification Started ---');
    const { text, adminText, chatId } = request.data;

    const accessToken = process.env.WHATSAPP_TOKEN;
    const phoneNumberId = process.env.WHATSAPP_PHONE_ID;
    const recipientNumber = process.env.WHATSAPP_RECIPIENT;

    if (!accessToken || !phoneNumberId || !recipientNumber) {
        throw new HttpsError('failed-precondition', 'WhatsApp API not configured.');
    }

    // 1. Save user message to Firestore
    if (chatId) {
        await db.collection('chats').doc(chatId).collection('messages').add({
            text,
            isUser: true,
            timestamp: admin.firestore.FieldValue.serverTimestamp()
        });
    }

    const url = `https://graph.facebook.com/v21.0/${phoneNumberId}/messages`;

    try {
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
        console.log('Meta Send Result:', JSON.stringify(result));

        const waMessageId = result.messages?.[0]?.id;

        if (waMessageId && chatId) {
            await db.collection('wa_mappings').doc(waMessageId).set({
                chatId,
                timestamp: admin.firestore.FieldValue.serverTimestamp()
            });
            console.log('Mapping stored:', waMessageId, '->', chatId);
        }

        return { success: true, messageId: waMessageId };
    } catch (error) {
        console.error('WhatsApp Send Error:', error);
        throw new HttpsError('internal', error.message);
    }
});

/**
 * Webhook for Meta to send messages back to us.
 */
exports.whatsappWebhook = onRequest({ cors: true }, async (req, res) => {
    console.log('--- Webhook Hit ---', req.method);

    // Verification Handle
    if (req.method === 'GET') {
        const mode = req.query['hub.mode'];
        const token = req.query['hub.verify_token'];
        const challenge = req.query['hub.challenge'];

        if (mode === 'subscribe' && token === process.env.WHATSAPP_VERIFY_TOKEN) {
            console.log('Webhook Verified!');
            return res.status(200).send(challenge);
        }
        return res.status(403).send('Forbidden');
    }

    // Event Handle
    if (req.method === 'POST') {
        console.log('Webhook Body:', JSON.stringify(req.body));
        const body = req.body;

        if (body.object === 'whatsapp_business_account') {
            try {
                const entry = body.entry?.[0];
                const change = entry?.changes?.[0];
                const value = change?.value;
                const message = value?.messages?.[0];

                if (message && message.type === 'text') {
                    const text = message.text.body;
                    const contextId = message.context?.id;
                    const from = message.from;

                    console.log(`Msg from ${from}: ${text} (Context: ${contextId})`);

                    let targetChatId = null;

                    if (contextId) {
                        const mapping = await db.collection('wa_mappings').doc(contextId).get();
                        if (mapping.exists) {
                            targetChatId = mapping.data().chatId;
                        }
                    }

                    // Fallback: If it's your number and there's a recent mapping, use it
                    if (!targetChatId && from === process.env.WHATSAPP_RECIPIENT) {
                        const recent = await db.collection('wa_mappings')
                            .orderBy('timestamp', 'desc')
                            .limit(1)
                            .get();

                        if (!recent.empty) {
                            targetChatId = recent.docs[0].data().chatId;
                        }
                    }

                    if (targetChatId) {
                        await db.collection('chats').doc(targetChatId).collection('messages').add({
                            text,
                            isUser: false,
                            timestamp: admin.firestore.FieldValue.serverTimestamp()
                        });
                        console.log('SAVED TO FIRESTORE:', targetChatId);
                    } else {
                        console.warn('COULD NOT ROUTE MESSAGE - NO CHAT ID FOUND');
                    }
                }
            } catch (err) {
                console.error('WEBHOOK ERROR:', err);
            }
            return res.status(200).send('EVENT_RECEIVED');
        }
        return res.status(200).send('OK'); // Always return 200 to Meta
    }
});
