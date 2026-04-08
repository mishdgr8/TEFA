import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import nodemailer from "npm:nodemailer@6.9.13";

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    try {
        const payload = await req.json();
        const { order, items, customerEmail, customerName } = payload;

        if (!customerEmail || !order) {
            throw new Error('Missing required order data for email');
        }

        console.log(`Sending order confirmation for ${order.id} to: ${customerEmail}`);

        const emailUser = Deno.env.get('EMAIL_USER');
        const emailPass = Deno.env.get('EMAIL_PASS');

        if (!emailUser || !emailPass) {
            throw new Error('Email credentials not configured');
        }

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: emailUser,
                pass: emailPass
            }
        });

        const currencySymbol = order.currency === 'USD' ? '$' : '₦';
        const formattedTotal = `${currencySymbol}${order.total.toLocaleString()}`;

        const itemsHtml = items.map((item: any) => {
            // Ensure the image URL is absolute for emails. Fallback to a placeholder if none.
            let imageUrl = item.image || '';
            if (imageUrl.startsWith('/')) {
                // Construct Cloudinary URL similar to OptimizedImage
                const cloudName = Deno.env.get('CLOUDINARY_CLOUD_NAME') || 'dzfrrcacc';
                const publicIdBase = `TEFA/${imageUrl.substring(1).replace(/\//g, '_').replace(/\.[^/.]+$/, "")}`;
                imageUrl = `https://res.cloudinary.com/${cloudName}/image/upload/f_auto,q_80,w_100/${encodeURIComponent(publicIdBase)}`;
            } else if (imageUrl.startsWith('http') && !imageUrl.includes('res.cloudinary.com')) {
                // Use fetch to proxy external images via Cloudinary for optimization
                const cloudName = Deno.env.get('CLOUDINARY_CLOUD_NAME') || 'dzfrrcacc';
                imageUrl = `https://res.cloudinary.com/${cloudName}/image/fetch/f_auto,q_80,w_100/${encodeURIComponent(imageUrl)}`;
            }

            return `
            <tr>
                <td style="padding: 12px 0; border-bottom: 1px solid #eee; width: 60px;">
                    <img src="${imageUrl}" alt="${item.name}" style="width: 50px; height: 65px; object-fit: cover; border-radius: 4px; display: block; background: #eee;" />
                </td>
                <td style="padding: 12px 0; padding-left: 15px; border-bottom: 1px solid #eee;">
                    <div style="font-weight: 600;">${item.name}</div>
                    <div style="font-size: 0.85rem; color: #666;">Size: ${item.selected_size || item.selectedSize || 'N/A'} | Qty: ${item.qty}</div>
                </td>
                <td style="padding: 12px 0; border-bottom: 1px solid #eee; text-align: right; vertical-align: top;">
                    ${currencySymbol}${((item.price || 0) * (item.qty || 1)).toLocaleString()}
                </td>
            </tr>
            `;
        }).join('');

        const mailOptions = {
            from: `"TÉFA Luxury" <${emailUser}>`,
            to: customerEmail,
            subject: `Order Confirmation #${order.id.slice(-6).toUpperCase()} — TÉFA Luxury`,
            html: `
            <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #111; line-height: 1.5;">
                <div style="text-align: center; margin-bottom: 40px;">
                   <h1 style="letter-spacing: 0.3em; text-transform: uppercase; font-weight: 300; border-bottom: 1px solid #eee; padding-bottom: 20px;">TÉFA</h1>
                </div>

                <p style="font-size: 1.1rem; font-weight: 500;">Thank you for your order, ${customerName}.</p>
                <p style="color: #666;">We're getting your order ready to be shipped. We will notify you when it's on its way.</p>
                
                <div style="margin: 40px 0; padding: 20px; background-color: #fafafb; border-radius: 8px;">
                    <h2 style="font-size: 0.9rem; text-transform: uppercase; letter-spacing: 0.1em; color: #888; margin-top: 0;">Order Summary</h2>
                    <table style="width: 100%; border-collapse: collapse;">
                        ${itemsHtml}
                        <tr>
                            <td colspan="2" style="padding: 20px 0 0; font-weight: 700;">Total</td>
                            <td style="padding: 20px 0 0; text-align: right; font-weight: 700; font-size: 1.2rem;">${formattedTotal}</td>
                        </tr>
                    </table>
                </div>

                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 40px;">
                    <div>
                        <h3 style="font-size: 0.8rem; text-transform: uppercase; color: #888;">Shipping Address</h3>
                        <p style="font-size: 0.9rem; margin: 5px 0;">${customerName}<br/>
                        ${order.customer_location?.address || ''}<br/>
                        ${order.customer_location?.city || ''}, ${order.customer_location?.country || ''}</p>
                    </div>
                </div>

                <div style="text-align: center; border-top: 1px solid #eee; padding-top: 30px; margin-top: 40px;">
                    <p style="font-size: 0.85rem; color: #999;">If you have any questions, reply to this email or contact us at <a href="mailto:support@houseoftefa.com" style="color: #111;">support@houseoftefa.com</a></p>
                    <p style="font-size: 0.75rem; color: #bbb; margin-top: 20px;">&copy; 2026 TÉFA Luxury. All rights reserved.</p>
                </div>
            </div>
            `
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Order email sent:', info.messageId);

        return new Response(JSON.stringify({ success: true, messageId: info.messageId }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
        });

    } catch (err: any) {
        console.error('Email Send Error:', err);
        return new Response(JSON.stringify({ error: err.message }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
        });
    }
});
