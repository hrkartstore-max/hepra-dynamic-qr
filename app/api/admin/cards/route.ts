import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { generateActivationCode, generateSlug, hashActivationCode } from "@/lib/security";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function authorized(request: Request) {
  const secret = process.env.ADMIN_BOOTSTRAP_SECRET;
  return !!secret && request.headers.get("x-admin-secret") === secret;
}

export async function GET(request: Request) {
  if (!authorized(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const db = createAdminClient();
    const [{ data: cards, error }, { count: active }, { count: total }, { count: scans }] = await Promise.all([
      db.from("review_cards").select("id,serial_number,slug,status,destination_url,created_at,activated_at").order("created_at", { ascending: false }).limit(100),
      db.from("review_cards").select("*", { count: "exact", head: true }).eq("status", "active"),
      db.from("review_cards").select("*", { count: "exact", head: true }),
      db.from("scan_events").select("*", { count: "exact", head: true })
    ]);
    if (error) throw error;
    return NextResponse.json({ cards: cards ?? [], stats: { total: total ?? 0, active: active ?? 0, scans: scans ?? 0 } });
  } catch {
    return NextResponse.json({ error: "Could not load card inventory." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  if (!authorized(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const body = await request.json();
    const quantity = Number(body.quantity);
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > 100) {
      return NextResponse.json({ error: "Quantity must be between 1 and 100." }, { status: 400 });
    }
    const db = createAdminClient();
    const batch = randomBatch();
    const codes = Array.from({ length: quantity }, () => generateActivationCode());
    const rows = codes.map((code, i) => ({
      serial_number: `HQR-${batch}-${String(i + 1).padStart(4, "0")}`,
      activation_code_hash: hashActivationCode(code),
      slug: generateSlug(),
      destination_url: "https://www.google.com",
      status: "unactivated"
    }));
    const { data, error } = await db.from("review_cards").insert(rows).select("id,serial_number,slug,status");
    if (error || !data) throw error;
    return NextResponse.json({
      cards: data.map((card, i) => ({ ...card, activation_code: codes[i] })),
      warning: "Save this response securely now. Activation codes are shown only once."
    }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Card generation failed. Check database settings." }, { status: 500 });
  }
}

function randomBatch() { return Math.random().toString(36).slice(2, 7).toUpperCase(); }
