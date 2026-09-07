"use client";

import { useState } from "react";

export default function CoinTossPage() {
  const [selected, setSelected] = useState<"Heads" | "Tails" | null>(null);
  const [tossing, setTossing] = useState(false);
  const [displaySide, setDisplaySide] = useState<"Heads" | "Tails">("Heads");
  const [result, setResult] = useState<"Heads" | "Tails" | null>(null);

  function tossCoin() {
    if (!selected || tossing) return;
    setResult(null);
    setTossing(true);

    const finalSide = Math.random() < 0.5 ? "Heads" : "Tails";
    let count = 0;
    const interval = window.setInterval(() => {
      setDisplaySide((current) => current === "Heads" ? "Tails" : "Heads");
      count += 1;
      if (count >= 12) {
        window.clearInterval(interval);
        setDisplaySide(finalSide);
        setResult(finalSide);
        setTossing(false);
      }
    }, 110);
  }

  return (
    <main className="min-h-screen bg-[#07080b] text-white">
      <div className="mx-auto max-w-4xl px-5 pb-12 sm:px-8">
        <header className="flex h-20 items-center justify-between border-b border-white/10">
          <a href="/games" className="text-sm font-semibold text-white/55 hover:text-white">← Game lobby</a>
          <a href="/wallet" className="rounded-xl border border-white/15 px-4 py-2.5 text-sm font-semibold hover:border-white/30">Wallet</a>
        </header>

        <section className="py-10 text-center sm:py-14">
          <div className="relative mx-auto flex h-52 items-center justify-center [perspective:800px]">
            <div className={`flex h-36 w-36 items-center justify-center rounded-full border-8 border-yellow-300/80 bg-gradient-to-br from-yellow-200 via-yellow-400 to-yellow-600 text-xl font-black text-black shadow-[0_20px_60px_rgba(234,179,8,0.25)] sm:h-40 sm:w-40 ${tossing ? "animate-[coinToss_0.55s_ease-in-out_infinite]" : ""}`}>
              <span className="rounded-full border-2 border-black/20 px-4 py-2">{displaySide}</span>
            </div>
          </div>
          <p className="mt-2 text-xs font-bold uppercase tracking-[0.2em] text-white/35">Coin Toss</p>
          <h1 className="mt-2 text-4xl font-black tracking-[-0.03em] sm:text-5xl">Heads or Tails?</h1>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-white/45">Pick a side, place your stake, and watch the coin toss before the result is revealed.</p>
          {tossing && <p className="mt-4 text-sm font-bold text-white/70">Tossing the coin…</p>}
        </section>

        <section className="rounded-3xl border border-white/10 bg-white/[0.035] p-5 sm:p-8">
          <div className="grid gap-3 sm:grid-cols-2">
            {(["Heads", "Tails"] as const).map((side) => (
              <button key={side} type="button" onClick={() => { setSelected(side); setResult(null); }} disabled={tossing} className={`rounded-2xl border px-5 py-7 text-xl font-black transition ${selected === side ? "border-white bg-white text-black" : "border-white/10 bg-white/[0.04] hover:border-white/25"} disabled:cursor-not-allowed disabled:opacity-60`} aria-pressed={selected === side}>{side}</button>
            ))}
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl bg-black/20 p-4"><p className="text-xs text-white/35">Your prediction</p><p className="mt-1 text-lg font-bold">{selected ?? "Not selected"}</p></div>
            <div className="rounded-2xl bg-black/20 p-4"><p className="text-xs text-white/35">Win payout</p><p className="mt-1 text-lg font-bold">1.9× stake</p></div>
          </div>

          {result && <div className="mt-5 rounded-2xl border border-white/10 bg-black/20 p-5"><p className="text-xs font-bold uppercase tracking-[0.18em] text-white/40">Round result</p><p className="mt-2 text-3xl font-black">{result === selected ? "You won!" : "Better luck next time"}</p><p className="mt-3 text-sm text-white/55">The coin landed on <span className="font-bold text-white">{result}</span>.</p><button type="button" onClick={() => setResult(null)} className="mt-5 w-full rounded-2xl border border-white/15 px-5 py-3 text-sm font-bold hover:border-white/30">Play another round</button></div>}

          {!result && <button type="button" onClick={tossCoin} disabled={!selected || tossing} className="mt-5 w-full rounded-2xl bg-white px-5 py-4 text-sm font-black text-black transition hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-30">{tossing ? "Tossing..." : selected ? "Toss Coin" : "Select Heads or Tails"}</button>}

          <p className="mt-4 text-center text-xs leading-5 text-white/30">The visual toss is only an animation. The production outcome should be generated and settled by the server, never by the browser.</p>
        </section>
      </div>
      <style jsx global>{`@keyframes coinToss { 0% { transform: rotateY(0deg) translateY(0); } 25% { transform: rotateY(180deg) translateY(-22px); } 50% { transform: rotateY(360deg) translateY(0); } 75% { transform: rotateY(540deg) translateY(-22px); } 100% { transform: rotateY(720deg) translateY(0); } }`}</style>
    </main>
  );
}
