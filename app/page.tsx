import Link from "next/link";
import { ArrowRight, QrCode, SmartphoneNfc, SlidersHorizontal, ShieldCheck, BarChart3 } from "lucide-react";

const features = [
  { icon: QrCode, title: "Dynamic QR codes", text: "Print once. Change the destination later without replacing the QR artwork." },
  { icon: SmartphoneNfc, title: "NFC-ready cards", text: "Program an NTAG213 tag with the same permanent redirect URL." },
  { icon: SlidersHorizontal, title: "Self-service activation", text: "Give each card a unique serial and one-time activation code." },
  { icon: BarChart3, title: "Scan analytics", text: "Build visibility into QR visits and NFC taps without exposing customer data." },
];

export default function Home() {
  return (
    <main className="min-h-screen overflow-hidden">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6">
        <Link href="/" className="flex items-center gap-3 font-bold tracking-tight"><span className="grid h-10 w-10 place-items-center rounded-xl bg-violet-600"><QrCode size={22}/></span> HEPRA <span className="text-violet-400">DYNAMIC QR</span></Link>
        <Link href="/activate" className="rounded-full border border-white/15 px-5 py-2.5 text-sm text-slate-200 hover:bg-white/5">Activate a card</Link>
      </nav>
      <section className="mx-auto grid max-w-7xl items-center gap-14 px-6 pb-24 pt-16 md:grid-cols-2 md:pt-24">
        <div>
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-violet-400/25 bg-violet-400/10 px-4 py-2 text-sm text-violet-200"><span className="h-2 w-2 rounded-full bg-violet-400"/> Dynamic QR + NFC platform</div>
          <h1 className="max-w-2xl text-5xl font-black leading-[1.05] tracking-tight md:text-7xl">One card.<br/><span className="bg-gradient-to-r from-violet-400 to-fuchsia-300 bg-clip-text text-transparent">Many destinations.</span></h1>
          <p className="mt-7 max-w-xl text-lg leading-8 text-slate-400">Create smart review cards for restaurants, salons, clinics and local businesses. Update destinations from your dashboard without reprinting the QR code.</p>
          <div className="mt-9 flex flex-wrap gap-3"><Link href="/activate" className="inline-flex items-center gap-2 rounded-full bg-violet-600 px-6 py-3.5 font-semibold shadow-lg shadow-violet-950/50 hover:bg-violet-500">Activate your card <ArrowRight size={18}/></Link><a href="#features" className="rounded-full border border-white/15 px-6 py-3.5 font-semibold text-slate-200 hover:bg-white/5">Explore features</a></div>
          <p className="mt-5 text-xs text-slate-500">Prototype release · Admin tools and card provisioning are being built.</p>
        </div>
        <div className="relative mx-auto w-full max-w-md">
          <div className="absolute -inset-8 rounded-full bg-violet-600/20 blur-3xl"/>
          <div className="relative rotate-2 rounded-[2rem] border border-white/15 bg-gradient-to-br from-blue-700 via-blue-800 to-indigo-950 p-7 shadow-2xl">
            <div className="rounded-[1.5rem] bg-white p-6 text-slate-950">
              <div className="rounded-xl bg-blue-700 px-4 py-6 text-center text-white"><div className="text-3xl font-black">G</div><div className="mt-2 text-sm font-bold tracking-wide">WE APPRECIATE YOUR REVIEW</div></div>
              <div className="py-6 text-center text-lg font-bold">Share your experience</div>
              <div className="flex items-center justify-between gap-4"><div className="text-center"><SmartphoneNfc className="mx-auto h-14 w-14"/><p className="mt-2 text-xs font-bold">TAP PHONE</p></div><div className="grid h-28 w-28 place-items-center border-4 border-slate-900 p-2"><QrCode className="h-full w-full"/></div></div>
              <p className="mt-5 text-center text-xs text-slate-500">SCAN QR OR TAP YOUR PHONE</p>
            </div>
            <div className="mt-5 flex items-center justify-center gap-2 text-sm text-blue-100"><ShieldCheck size={16}/> Reusable dynamic destination</div>
          </div>
        </div>
      </section>
      <section id="features" className="border-t border-white/10 bg-white/[0.02] px-6 py-20"><div className="mx-auto max-w-7xl"><p className="text-sm font-semibold uppercase tracking-[.2em] text-violet-300">Built for local businesses</p><h2 className="mt-3 text-3xl font-bold md:text-4xl">Everything your smart card needs</h2><div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">{features.map(({icon:Icon,title,text})=><article key={title} className="rounded-2xl border border-white/10 bg-slate-900/70 p-6"><Icon className="h-7 w-7 text-violet-400"/><h3 className="mt-5 font-bold">{title}</h3><p className="mt-2 text-sm leading-6 text-slate-400">{text}</p></article>)}</div></div></section>
      <footer className="mx-auto flex max-w-7xl flex-col gap-2 px-6 py-8 text-sm text-slate-500 sm:flex-row sm:justify-between"><span>© {new Date().getFullYear()} HEPRA Dynamic QR</span><span>Smart cards for real-world businesses.</span></footer>
    </main>
  );
}