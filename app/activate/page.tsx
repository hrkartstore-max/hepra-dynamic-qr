import Link from "next/link";
import { ArrowLeft, KeyRound } from "lucide-react";

export default function ActivatePage() {
  return (
    <main className="min-h-screen px-5 py-10">
      <div className="mx-auto max-w-xl">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white"><ArrowLeft size={16}/> Back home</Link>
        <div className="mt-10 rounded-3xl border border-white/10 bg-slate-900/80 p-7 shadow-2xl sm:p-9">
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-violet-600/20 text-violet-300"><KeyRound/></div>
          <h1 className="mt-6 text-3xl font-black">Activate your QR card</h1>
          <p className="mt-3 leading-7 text-slate-400">Enter the serial number and activation code supplied with your HEPRA card. Card activation will be enabled after the database is connected.</p>
          <div className="mt-8 space-y-4">
            <label className="block text-sm font-medium text-slate-300">Card serial number<input disabled placeholder="e.g. HEPRA-BATCH-0001" className="mt-2 w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-slate-500 outline-none"/></label>
            <label className="block text-sm font-medium text-slate-300">Activation code<input disabled placeholder="Enter your 10-character code" className="mt-2 w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-slate-500 outline-none"/></label>
            <button disabled className="w-full cursor-not-allowed rounded-xl bg-violet-600/40 px-5 py-4 font-bold text-white/60">Activation coming in the next build</button>
          </div>
          <p className="mt-5 text-xs leading-5 text-slate-500">Never share your activation code publicly. HEPRA support will never ask for your full password.</p>
        </div>
      </div>
    </main>
  );
}