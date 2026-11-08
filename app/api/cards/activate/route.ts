import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { hashActivationCode } from "@/lib/security";
import { httpsUrlSchema } from "@/lib/validation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const serial = String(body.serial_number ?? "").trim().toUpperCase();
    const code = String(body.activation_code ?? "").trim();
    const businessName = String(body.business_name ?? "").trim();
    const email = String(body.contact_email ?? "").trim().toLowerCase();
    const reviewUrl = httpsUrlSchema.safeParse(String(body.destination_url ?? "").trim());
    if (!/^HQR-[A-Z0-9]{5}-\d{4}$/.test(serial) || !/^[A-F0-9]{10}$/i.test(code) || businessName.length < 2 || businessName.length > 120 || !reviewUrl.success) {
      return NextResponse.json({ error: "Please check the card details and enter a valid HTTPS review link." }, { status: 400 });
    }
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
    }

    const db = createAdminClient();
    const { data: card, error } = await db.from("review_cards")
      .select("id,activation_code_hash,status")
      .eq("serial_number", serial).maybeSingle();
    if (error || !card || card.status !== "unactivated" || !card.activation_code_hash ||
        hashActivationCode(code) !== card.activation_code_hash) {
      return NextResponse.json({ error: "Card details are invalid or this card has already been activated." }, { status: 400 });
    }

    const { data: business, error: businessError } = await db.from("businesses")
      .insert({ business_name: businessName, contact_email: email || null })
      .select("id").single();
    if (businessError || !business) throw businessError;

    const { data: updated, error: updateError } = await db.from("review_cards")
      .update({ business_id: business.id, destination_url: reviewUrl.data, status: "active", activated_at: new Date().toISOString(), activation_code_hash: null })
      .eq("id", card.id).eq("status", "unactivated").select("slug").maybeSingle();
    if (updateError || !updated) {
      await db.from("businesses").delete().eq("id", business.id);
      return NextResponse.json({ error: "This card was just activated or is no longer available." }, { status: 409 });
    }
    const base = process.env.NEXT_PUBLIC_APP_URL || new URL(request.url).origin;
    return NextResponse.json({ success: true, redirect_url: `${base}/r/${updated.slug}` });
  } catch {
    return NextResponse.json({ error: "Activation could not be completed. Please try again." }, { status: 500 });
  }
}
