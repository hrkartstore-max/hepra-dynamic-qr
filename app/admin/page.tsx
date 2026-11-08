"use client";

import { useCallback, useEffect, useState } from "react";
import QRCode from "qrcode";
import { KeyRound, RefreshCw, QrCode, Copy, Download, PackagePlus, BarChart3, ShieldCheck } from "lucide-react";

type Card = { id: string; serial_number: string; slug: string; status: string; destination_url: string; created_at: string };
type Stats = { total: number; active: number; scans: number };
type ActivationCode = { serial_number: string; activation_code: string };

export default function AdminPage() {
  const [secret, setSecret] = useState("");
  const [saved, setSaved] = useState(false);
  const [quantity, setQuantity] = useState("10");
  const [cards, setCards] = useState<Card[]>([]);
  const [activationCodes, setActivationCodes] = useState<ActivationCode[]>([]);
  const [destinations, setDestinations] = useState<Record<string, string>>({});
  const [stats, setStats] = useState<Stats>({ total: 0, active: 0, scans: 0 });
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [qr, setQr] = useState<Record<string, string>>({});
  const base = typeof window === "undefined" ? "" : window.location.origin;

  const load = useCallback(async (key: string) => {
    setBusy(true);
    setMessage("");
    try {
      const response = await fetch("/api/admin/cards", { headers: { "x-admin-secret": key }, cache: "no-store" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Unable to authenticate");
      setCards(data.cards ?? []);
      setStats(data.stats ?? { total: 0, active: 0, scans: 0 });
      setDestinations(Object.fromEntries((data.cards ?? []).map((card: Card) => [card.serial_number, card.destination_url])));
      setSaved(true);
      const images: Record<string, string> = {};
      await Promise.all((data.cards ?? []).map(async (card: Card) => {
        images[card.id] = await QRCode.toDataURL(`${base}/r/${card.slug}`, { width: 220, margin: 2 });
      }));
      setQr(images);
    } catch (error) {
      setSaved(false);
      setMessage(error instanceof Error ? error.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  }, [base]);

  useEffect(() => {
    const key = sessionStorage.getItem("hepra_admin_secret");
    if (key) {
      setSecret(key);
      void load(key);
    }
  }, [load]);

  async function generate() {
    setBusy(true);
    setMessage("");
    setActivationCodes([]);
    try {
      const response = await fetch("/api/admin/cards", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-admin-secret": secret },
        body: JSON.stringify({ quantity: Number(quantity) })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Generation failed");
      setActivationCodes(data.cards as ActivationCode[]);
      setMessage("Cards created. Save the one-time activation codes below now.");
      await load(secret);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Generation failed");
    } finally {
      setBusy(false);
    }
  }

  async function updateDestination(serial: string) {
    setBusy(true);
    setMessage("");
    try {
      const response = await fetch("/api/admin/cards", {
        method: "PATCH",
        headers: { "Content-Type": "application/json", "x-admin-secret": secret },
        body: JSON.stringify({ serial_number: serial, destination_url: destinations[serial] })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Update failed");
      setMessage(`Updated destination for ${serial}. Existing QR/NFC tags remain unchanged.`);
      await load(secret);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Update failed");
    } finally {
      setBusy(false);
    }
  }

  function downloadCsv(rows: string[][], filename: string) {
    const csv = rows.map(row => row.map(value => `"${String(value).replaceAll('"', '""')}"`).join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = filename;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  function exportInventory() {
    const codeMap = new Map(activationCodes.map(card => [card.serial_number, card.activation_code]));
    downloadCsv(
      [["Serial", "Status", "QR URL", "One-time activation code"],
       ...cards.map(card => [card.serial_number, card.status, `${base}/r/${card.slug}`, codeMap.get(card.serial_number) || "Already issued / not retrievable"])],
      "hepra-card-inventory.csv"
    );
  }

  if (!saved) {
    return (
      <main className="min-h-screen px-5 py-16">
        <section className="mx-auto max-w-md rounded-3xl border border-white/10 bg-slate-900 p-8">
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-violet-600/20 text-violet-300"><KeyRound /></div>
          <h1 className="mt-6 text-3xl font-black">HEPRA Admin</h1>
          <p className="mt-2 text-sm text-slate-400">Enter the server-side admin key to manage card inventory.</p>
          <input type="password" value={secret} onChange={event => setSecret(event.target.value)} placeholder="Admin access key" className="mt-6 w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 outline-none focus:border-violet-500" />
          <button onClick={() => { sessionStorage.setItem("hepra_admin_secret", secret); void load(secret); }} disabled={!secret || busy} className="mt-4 w-full rounded-xl bg-violet-600 px-4 py-3 font-bold disabled:opacity-50">{busy ? "Checking…" : "Open dashboard"}</button>
          {message && <p className="mt-4 text-sm text-rose-300">{message}</p>}
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen px-5 py-8 md:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div><p className="text-sm font-semibold uppercase tracking-widest text-violet-300">HEPRA / Control centre</p><h1 className="mt-2 text-3xl font-black">Card dashboard</h1><p className="mt-1 text-sm text-slate-400">Provision inventory and monitor activated cards.</p></div>
          <div className="flex gap-2"><button onClick={() => void load(secret)} className="rounded-xl border border-white/15 px-4 py-2.5 text-sm"><RefreshCw size={16} className="mr-2 inline" />Refresh</button><button onClick={() => { sessionStorage.removeItem("hepra_admin_secret"); setSaved(false); setSecret(""); }} className="rounded-xl border border-white/15 px-4 py-2.5 text-sm">Sign out</button></div>
        </header>

        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {[{ label: "Total cards", value: stats.total, icon: QrCode }, { label: "Activated", value: stats.active, icon: ShieldCheck }, { label: "Recorded scans", value: stats.scans, icon: BarChart3 }].map(item => <div key={item.label} className="rounded-2xl border border-white/10 bg-slate-900 p-5"><item.icon className="text-violet-400" /><p className="mt-4 text-sm text-slate-400">{item.label}</p><p className="mt-1 text-3xl font-black">{item.value}</p></div>)}
        </div>

        <section className="mt-8 rounded-2xl border border-white/10 bg-slate-900 p-6">
          <div className="flex items-center gap-3"><PackagePlus className="text-violet-400" /><h2 className="text-xl font-bold">Generate card batch</h2></div>
          <p className="mt-2 text-sm text-slate-400">Create up to 100 unique cards per batch. Activation codes are hashed before storage.</p>
          <div className="mt-5 flex flex-wrap gap-3"><input type="number" min="1" max="100" value={quantity} onChange={event => setQuantity(event.target.value)} className="w-32 rounded-xl border border-white/10 bg-black/30 px-4 py-3" /><button onClick={() => void generate()} disabled={busy} className="rounded-xl bg-violet-600 px-5 py-3 font-bold disabled:opacity-50">{busy ? "Working…" : "Generate cards"}</button><button onClick={exportInventory} className="rounded-xl border border-white/15 px-5 py-3 font-semibold"><Download size={16} className="mr-2 inline" />Export inventory</button></div>
          {message && <p className="mt-4 text-sm text-emerald-300">{message}</p>}
        </section>

        {activationCodes.length > 0 && <section className="mt-8 rounded-2xl border border-amber-400/30 bg-amber-400/5 p-6"><h2 className="text-lg font-bold text-amber-200">New activation codes — save now</h2><p className="mt-2 text-sm text-slate-400">These codes are shown only once. Download and store them securely with the physical cards.</p><div className="mt-4 space-y-2">{activationCodes.map(card => <div key={card.serial_number} className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-black/30 px-4 py-3 text-sm"><span className="font-semibold">{card.serial_number}</span><code className="text-amber-200">{card.activation_code}</code></div>)}</div><button onClick={() => downloadCsv([["Serial", "Activation Code"], ...activationCodes.map(card => [card.serial_number, card.activation_code])], "hepra-one-time-activation-codes.csv")} className="mt-4 rounded-xl bg-amber-300 px-4 py-2.5 font-bold text-slate-950">Download activation codes CSV</button></section>}

        <section className="mt-8">
          <div className="mb-4 flex items-center justify-between"><h2 className="text-xl font-bold">Latest card inventory</h2><span className="text-sm text-slate-500">{cards.length} shown</span></div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {cards.map(card => <article key={card.id} className="flex gap-4 rounded-2xl border border-white/10 bg-slate-900 p-4">
              <div className="shrink-0 rounded-lg bg-white p-2">{qr[card.id] ? <img src={qr[card.id]} alt={`QR for ${card.serial_number}`} className="h-24 w-24" /> : <QrCode className="h-24 w-24 text-black" />}</div>
              <div className="min-w-0"><p className="break-all font-bold">{card.serial_number}</p><span className={`mt-2 inline-block rounded-full px-2 py-1 text-xs ${card.status === "active" ? "bg-emerald-500/15 text-emerald-300" : "bg-amber-500/15 text-amber-300"}`}>{card.status}</span><p className="mt-2 break-all text-xs text-slate-500">/r/{card.slug}</p>
                {card.status === "active" && <><input value={destinations[card.serial_number] || ""} onChange={event => setDestinations({ ...destinations, [card.serial_number]: event.target.value })} className="mt-2 w-full rounded-lg border border-white/10 bg-black/30 px-2 py-2 text-xs" aria-label="New destination URL" /><button onClick={() => void updateDestination(card.serial_number)} disabled={busy} className="mt-2 block text-xs font-semibold text-emerald-300">Save destination</button></>}
                <button onClick={() => navigator.clipboard.writeText(`${base}/r/${card.slug}`)} className="mt-3 text-xs text-violet-300"><Copy size={13} className="mr-1 inline" />Copy redirect URL</button>
              </div>
            </article>)}
          </div>
        </section>
      </div>
    </main>
  );
}
