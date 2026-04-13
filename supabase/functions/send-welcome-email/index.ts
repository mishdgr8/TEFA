import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import nodemailer from "npm:nodemailer@6.9.13";

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
    // We expect this to be triggered by a Supabase Database Webhook (e.g. INSERT on auth.users or public.profiles)
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    try {
        const payload = await req.json();

        // Support either direct webhook format or explicit { email, name }
        let email = '';
        let displayName = 'Member';

        if (payload.type === 'INSERT' && payload.table === 'users' && payload.schema === 'auth') {
            email = payload.record.email;
            displayName = email?.split('@')[0] || 'Member';
        } else if (payload.type === 'INSERT' && payload.table === 'subscribers') {
            email = payload.record.email;
            displayName = 'Member';
        } else if (payload.email) {
            email = payload.email;
            displayName = payload.name || email?.split('@')[0] || 'Member';
        }

        if (!email) {
            throw new Error('No email found in request payload');
        }

        console.log(`Sending welcome email to: ${email}`);

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

        const isSubscriber = payload.table === 'subscribers';
        const subject = isSubscriber ? 'Welcome to the TÉFA Circle 🥂' : 'Welcome to TÉFA Luxury 🥂';
        const welcomeMessage = isSubscriber
            ? "Thank you for joining our newsletter. You're now part of the TÉFA circle, where we share stories of African luxury and craftsmanship."
            : "We are delighted to have you join our exclusive community. At TÉFA, we believe in the art of storytelling through fashion.";

        const mailOptions = {
            from: '"TÉFA Luxury" <no-reply@houseoftefa.com>',
            to: email,
            subject: subject,
            html: `
            <div style="font-family: 'Georgia', serif; max-width: 600px; margin: 0 auto; padding: 40px; color: #111; background-color: #fdfaf7;">
                <div style="text-align: center; margin-bottom: 40px;">
                    <h1 style="letter-spacing: 0.3em; text-transform: uppercase; font-weight: 300; border-bottom: 1px solid #eee; display: inline-block; padding-bottom: 10px;">TÉFA</h1>
                </div>
                
                <p style="font-size: 1.1rem; line-height: 1.6;">
                    Dear ${displayName},
                </p>
                <p style="font-size: 1.1rem; line-height: 1.6;">
                    ${welcomeMessage}
                </p>
                
                <div style="background: #fff; border: 1px dashed #111; padding: 30px; margin: 40px 0; text-align: center;">
                    <p style="text-transform: uppercase; font-size: 0.8rem; letter-spacing: 0.2em; margin-bottom: 10px; color: #666;">Your First Order Gift</p>
                    <h2 style="font-size: 2.5rem; margin: 0; letter-spacing: 0.1em;">TEFA10</h2>
                    <p style="font-size: 0.9rem; margin-top: 10px; color: #666;">Apply this code at checkout for 10% off your first purchase.</p>
                </div>

                <div style="text-align: center; margin-top: 40px;">
                    <a href="https://houseoftefa.com/shop" style="background: #111; color: #fff; padding: 18px 45px; text-decoration: none; text-transform: uppercase; letter-spacing: 0.2em; font-size: 0.85rem; font-weight: 600;">Explore the Collection</a>
                </div>

                <p style="font-size: 0.95rem; line-height: 1.6; margin-top: 50px;">
                    You can expect early access to new collection drops, private event invitations, and curated content from the heart of Lagos.
                </p>
                
                <p style="font-size: 0.9rem; color: #666; margin-top: 60px; text-align: center;">
                    If you have any questions, simply reply to this email or reach us via Live Chat on our website.
                </p>
                <hr style="border: none; border-top: 1px solid #eee; margin: 40px 0;" />
                <p style="text-align: center; font-size: 0.8rem; letter-spacing: 0.1em; color: #999; text-transform: uppercase;">House of African Luxury</p>
            </div>
        `
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent:', info.messageId);

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
