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

        const mailOptions = {
            from: '"TÉFA Luxury" <no-reply@houseoftefa.com>',
            to: email,
            subject: 'Welcome to TÉFA Luxury 🥂',
            html: `
            <div style="font-family: 'Georgia', serif; max-width: 600px; margin: 0 auto; padding: 40px; color: #111;">
                <h1 style="text-align: center; letter-spacing: 0.2em; text-transform: uppercase; font-weight: 300;">Welcome to TÉFA</h1>
                <p style="font-size: 1.1rem; line-height: 1.6; margin-top: 40px;">
                    Dear ${displayName},
                </p>
                <p style="font-size: 1.1rem; line-height: 1.6;">
                    We are delighted to have you join our exclusive community. At TÉFA, we believe in the art of storytelling through fashion.
                </p>
                <p style="font-size: 1.1rem; line-height: 1.6;">
                    Your account has been successfully created. You can now save your favorite pieces, track your inquiries, and experience personalized concierge service.
                </p>
                <div style="text-align: center; margin-top: 60px;">
                    <a href="https://tefa.com" style="background: #111; color: #fff; padding: 15px 40px; text-decoration: none; text-transform: uppercase; letter-spacing: 0.1em; font-size: 0.9rem;">Visit the Shop</a>
                </div>
                <p style="font-size: 0.9rem; color: #666; margin-top: 60px; text-align: center;">
                    If you have any questions, simply reply to this email or reach us via Live Chat on our website.
                </p>
                <hr style="border: none; border-top: 1px solid #eee; margin: 40px 0;" />
                <p style="text-align: center; font-style: italic; color: #999;">TÉFA — House of African Luxury</p>
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
