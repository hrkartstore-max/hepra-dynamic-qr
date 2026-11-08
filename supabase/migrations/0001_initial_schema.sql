-- HEPRA Dynamic QR: initial schema
create extension if not exists pgcrypto;

create table if not exists public.businesses (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references auth.users(id) on delete set null,
  business_name text not null,
  contact_email text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.review_cards (
  id uuid primary key default gen_random_uuid(),
  business_id uuid references public.businesses(id) on delete set null,
  serial_number text not null unique,
  activation_code_hash text,
  slug text not null unique,
  destination_type text not null default 'google_review'
    check (destination_type in ('google_review','instagram','website','whatsapp','custom')),
  destination_url text not null,
  status text not null default 'unactivated'
    check (status in ('unactivated','active','disabled')),
  activated_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.scan_events (
  id bigint generated always as identity primary key,
  card_id uuid not null references public.review_cards(id) on delete cascade,
  source text not null default 'qr' check (source in ('qr','nfc')),
  scanned_at timestamptz not null default now()
);

create index if not exists businesses_owner_id_idx on public.businesses(owner_id);
create index if not exists review_cards_business_id_idx on public.review_cards(business_id);
create index if not exists review_cards_slug_idx on public.review_cards(slug);
create index if not exists scan_events_card_id_scanned_at_idx on public.scan_events(card_id, scanned_at desc);

alter table public.businesses enable row level security;
alter table public.review_cards enable row level security;
alter table public.scan_events enable row level security;

-- No public table access. All provisioning and redirects go through trusted server routes.
-- Add authenticated owner policies when customer account management is implemented.
revoke all on public.businesses from anon, authenticated;
revoke all on public.review_cards from anon, authenticated;
revoke all on public.scan_events from anon, authenticated;

grant select, insert, update, delete on public.businesses to service_role;
grant select, insert, update, delete on public.review_cards to service_role;
grant select, insert, update, delete on public.scan_events to service_role;
