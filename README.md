# HEPRA Dynamic QR

Dynamic QR + NFC review-card management platform for local businesses.

## Stack
- Next.js 15 App Router + TypeScript
- Tailwind CSS
- Supabase PostgreSQL
- Vercel
- NTAG213 NFC tags
- QR generated from permanent redirect URLs

## Local development
1. Install Node.js 20.9+.
2. Run `npm install`.
3. Copy `.env.example` to `.env.local`.
4. Fill in Supabase project URL, anon key and server-only service-role key.
5. Run `npm run dev`.

## Environment variables
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (server only; never expose to browser)
- `NEXT_PUBLIC_APP_URL`

## Redirect URL
Printed QR codes and NFC tags should point to:
`https://YOUR-DOMAIN/r/YOUR-CARD-SLUG`

Optional analytics source:
- QR: `?via=qr`
- NFC: `?via=nfc`

## Database
Initial schema: `supabase/migrations/0001_initial_schema.sql`

Apply migrations only after creating the dedicated Supabase project and reviewing the SQL.

## Current release status
Starter UI and secure server-side redirect foundation. Admin provisioning, hashed activation-code verification, customer authentication, QR export, and destination management are next implementation milestones.
