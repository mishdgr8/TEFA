import { functions } from './firebase';
import { httpsCallable } from 'firebase/functions';

export interface WhatsAppMessage {
    text: string;
    adminText?: string;
    chatId?: string;
}

/**
 * WhatsApp Cloud API Service
 * Now routes through Firebase Functions to avoid CORS issues and keep tokens secure.
 */
export const sendWhatsAppMessage = async (message: WhatsAppMessage) => {
    console.log('Sending WhatsApp Payload:', message);
    try {
        const sendNotification = httpsCallable(functions, 'sendWhatsAppNotification');
        const result = await sendNotification({
            text: message.text,
            adminText: message.adminText,
            chatId: message.chatId
        });
        return result.data;
    } catch (error) {
        console.error('WhatsApp Bridge Error:', error);
        // Fallback to console for debugging if function fails
        console.log('Failing over to manual link flow');
        throw error;
    }
};
