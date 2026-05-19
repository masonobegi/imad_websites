# Imad's Art Websites

Three separate Next.js storefronts that link to each other. Each is an independent app you deploy as its own Railway service.

```
fine-art/       → Oil & Encaustic paintings (3 sizes each)
photography/    → Fine art photography prints (3 sizes each)
stickers/       → AI-generated sticker packs (quantity only)
```

---

## Quick Start (local dev)

```bash
# Fine art
cd fine-art
npm install
cp .env.example .env.local   # fill in your keys
npm run dev                  # runs on localhost:3000

# Photography (use a different port)
cd photography
npm install
cp .env.example .env.local
npm run dev -- -p 3001

# Stickers
cd stickers
npm install
cp .env.example .env.local
npm run dev -- -p 3002
```

---

## Accounts You Need to Create

### 1. Stripe (payments)
- Sign up at stripe.com
- Get your **Secret key** and **Publishable key** from Developers → API Keys
- Use test keys (`sk_test_...` / `pk_test_...`) while building, switch to live keys when ready
- Each site needs its own Stripe webhook (see below)

### 2. Resend (email confirmations)
- Sign up at resend.com — free tier sends 3,000 emails/month
- Get your **API key**
- For production: verify your domain in Resend so emails come from your own address
- For testing: use `onboarding@resend.dev` as the from address (set `RESEND_FROM_DOMAIN=resend.dev` and emails will come from `orders@resend.dev`)

---

## Deploying to Railway

Each folder is its own Railway service. Do this three times — once per site.

1. Push this whole folder to GitHub as one repo
2. Go to railway.app → New Project → Deploy from GitHub repo
3. For each site, click **Add Service → GitHub Repo**, then set the **Root Directory** to `fine-art`, `photography`, or `stickers`
4. Railway auto-detects Next.js and runs `npm run build && npm start`
5. Set environment variables in Railway's Variables tab (copy from `.env.example`)

### After deploying — set up Stripe webhooks

Once each site has a Railway URL (e.g. `https://fineart-production.up.railway.app`):

1. Go to Stripe Dashboard → Developers → Webhooks → Add endpoint
2. Endpoint URL: `https://your-railway-url.up.railway.app/api/webhook`
3. Select event: `checkout.session.completed`
4. Copy the **Signing secret** — this is your `STRIPE_WEBHOOK_SECRET`
5. Add it to Railway's environment variables for that service
6. Do this for all three sites

---

## Environment Variables Reference

All three `.env.example` files list what's needed. Key ones:

| Variable | What it is |
|---|---|
| `STRIPE_SECRET_KEY` | Your Stripe secret key (sk_test_... or sk_live_...) |
| `STRIPE_WEBHOOK_SECRET` | From Stripe Webhooks dashboard (whsec_...) |
| `RESEND_API_KEY` | From Resend dashboard |
| `RESEND_FROM_DOMAIN` | Your verified email domain (or `resend.dev` for testing) |
| `OWNER_EMAIL` | Where order notification emails go (your uncle's email) |
| `NEXT_PUBLIC_SITE_URL` | This site's public URL — used for Stripe redirect |
| `NEXT_PUBLIC_PHOTOGRAPHY_URL` | URL of the photography site (for footer links) |
| `NEXT_PUBLIC_FINEART_URL` | URL of the fine art site (for footer links) |
| `NEXT_PUBLIC_STICKERS_URL` | URL of the stickers site (for footer links) |

---

## Replacing Placeholder Images

Right now each product shows an emoji on a colored background. When Imad has real photos:

1. Put images in `public/products/` in each site folder
2. In `lib/products.ts`, replace the `emoji` field with an `image` field pointing to `/products/filename.jpg`
3. In `ProductCard.tsx` and `ProductModal.tsx`, swap the emoji div for a `<img>` or Next.js `<Image>` tag

---

## How Payments Work

1. Customer adds items to cart → clicks Checkout
2. Site calls `/api/checkout` → creates a Stripe Checkout Session
3. Customer is redirected to Stripe's hosted payment page (handles card, Apple Pay, etc.)
4. After payment, Stripe redirects to `/success` and fires a webhook to `/api/webhook`
5. The webhook sends two emails via Resend: one to the customer, one to the owner
6. The owner email includes the shipping address so Imad knows where to ship

---

## Adding Products

Edit `lib/products.ts` in each site. Products for fine art and photography need a `sizes` array with label + price. Sticker products just need a single `price`.
