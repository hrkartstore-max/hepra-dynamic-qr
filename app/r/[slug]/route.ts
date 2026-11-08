import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: Request, context: { params: Promise<{ slug: string }> }) {
  const { slug } = await context.params;
  if (!/^[a-z0-9-]{4,48}$/.test(slug)) {
    return new NextResponse("Invalid card link", { status: 400 });
  }

  try {
    const supabase = createAdminClient();
    const { data: card, error } = await supabase
      .from("review_cards")
      .select("id, destination_url, status")
      .eq("slug", slug)
      .maybeSingle();

    if (error || !card || card.status !== "active") {
      return new NextResponse("This card link is not active.", {
        status: 404,
        headers: { "Cache-Control": "no-store" }
      });
    }

    const destination = new URL(card.destination_url);
    if (destination.protocol !== "https:") {
      return new NextResponse("Invalid destination.", { status: 400 });
    }

    // Record a minimal scan event. Do not store IP addresses or device fingerprints.
    await supabase.from("scan_events").insert({
      card_id: card.id,
      source: new URL(request.url).searchParams.get("via") === "nfc" ? "nfc" : "qr"
    });

    return NextResponse.redirect(destination.toString(), {
      status: 302,
      headers: { "Cache-Control": "no-store, max-age=0" }
    });
  } catch {
    return new NextResponse("Service temporarily unavailable.", { status: 503 });
  }
}