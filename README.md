# HEPRA Dynamic QR

Dynamic QR + NFC smart-card platform for local businesses.

## Features in this starter
- Premium responsive landing page
- Customer card activation using serial number + one-time activation code
- Admin-only card inventory dashboard at `/admin`
- Bulk generation of 1–100 cards with unique serials, random activation codes and permanent redirect slugs
- Activation codes are hashed with a server-side pepper and returned only once at generation
- QR previews and CSV inventory export
- Permanent QR/NFC redirect route at `/r/[slug]`
- Admin destination editor: change the destination without reprinting QR codes or reprogramming NFC tags
- Basic scan-event counts for QR and NFC visits
- RLS enabled on all application tables; direct anon/authenticated table access revoked

## Stack
- Next.js 15 App Router + TypeScript
- Tailwind CSS
- Supabase PostgreSQL
- Vercel
- QR code generation via `qrcode`
- NFC tags should store the permanent redirect URL

## Required environment variables
Configure these in local `.env.local` and your hosting provider's project settings. Never commit real secrets.

- `NEXT_PUBLIC_SUPABASE_URL`: `https://syqrcbofqfrzomlbqfpu.supabase.co`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`: Supabase publishable key (not a secret)
- `SUPABASE_SERVICE_ROLE_KEY`: server-only service role key; never prefix with `NEXT_PUBLIC_`
- `ACTIVATION_CODE_PEPPER`: long random server-only secret used to hash activation codes
- `ADMIN_BOOTSTRAP_SECRET`: long random server-only secret required for admin API access
- `NEXT_PUBLIC_APP_URL`: canonical production URL, e.g. `https://your-domain.com`

## Admin setup
1. Set all required environment variables.
2. Set a strong unique `ADMIN_BOOTSTRAP_SECRET` and `ACTIVATION_CODE_PEPPER` (do not reuse passwords).
3. Deploy the application.
4. Open `/admin` and enter the admin bootstrap secret.
5. Generate a card batch. Download and securely store the one-time activation code CSV immediately; codes cannot be retrieved later.
6. Print the generated QR artwork or write each card's `/r/<slug>` URL to its NFC tag.

## Customer activation
Customers open `/activate` and enter their serial, one-time activation code, business name and Google review URL. The app binds the card to that destination and activates its permanent redirect.

## Destination updates
From the admin dashboard, edit the HTTPS destination URL for an active card and save. Existing printed QR codes and NFC tags continue pointing to the same redirect slug.

## Local development
1. Install Node.js 20.9+.
2. Run `npm install`.
3. Copy `.env.example` to `.env.local` and fill in all secrets.
4. Run `npm run dev`.

## Important production hardening before public launch
- Add Supabase Auth-based administrator accounts and replace the shared bootstrap secret.
- Add request rate limiting / abuse protection to activation and redirect endpoints.
- Add atomic database RPC for card activation to avoid orphan business records under concurrent activation attempts.
- Add destination allowlist and Google review URL validation rules appropriate to your product.
- Configure Vercel environment variables and custom domain.
- Add automated tests and error monitoring.
- Keep the repository private if it contains proprietary application logic.
