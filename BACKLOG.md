# TÉFA — Future Features Backlog

## 📧 Newsletter Signup Modal
- **Status:** Shelved (2026-02-12)
- **Idea:** Show modal after ~5 seconds on first visit to collect emails
- **Trigger:** Delayed (5-8s), first visit only (localStorage flag)
- **Storage:** Firestore `subscribers` collection
- **Email service:** Mailchimp, Brevo, or Firebase SendGrid extension
- **Design:** Premium, minimal — "Be the first to know when new pieces drop"
- **Note:** Avoid immediate popup — Google penalizes intrusive mobile interstitials

## 🌐 Domain & Post-Launch
- Update `SITE_URL` in `src/lib/seo.ts` once custom domain is live
- Submit sitemap to Google Search Console
- Set up 301 redirect from Vercel subdomain → custom domain
- Generate dynamic sitemap with product URLs at build time
