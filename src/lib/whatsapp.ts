import { supabase } from './supabase';

export interface WhatsAppMessage {
    text: string;
    adminText?: string;
    chatId?: string;
}

/**
 * WhatsApp Cloud API Service
 * Routes through Supabase Edge Functions (replaces Firebase callable function).
 */
export const sendWhatsAppMessage = async (message: WhatsAppMessage) => {
    console.log('Sending WhatsApp Payload:', message);
    try {
        const { data, error } = await supabase.functions.invoke('send-whatsapp', {
            body: {
                text: message.text,
                adminText: message.adminText,
                chatId: message.chatId,
            },
        });

        if (error) throw error;
        return data;
    } catch (error) {
        console.error('WhatsApp Bridge Error:', error);
        console.log('Failing over to manual link flow');
        throw error;
    }
};
