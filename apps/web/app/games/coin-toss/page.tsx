"use client";

import { useEffect, useRef, useState } from "react";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
type Side = "Heads" | "Tails";

export default function CoinTossPage() {
  const [selected, setSelected] = useState<Side | null>(null);
  const [stake, setStake] = useState("100");
  const [tossing, setTossing] = useState(false);
  const [displaySide, setDisplaySide] = useState<Side>("Heads");
  const [result, setResult] = useState<Side | null>(null);
  const [error, setError] = useState<string | null>(null);
  const tossStartedAt = useRef(0);

  useEffect(() => {
    if (!tossing) return;
    const interval = window.setInterval(() => {
      setDisplaySide((current) => current === "Heads" ? "Tails" : "Heads");
    }, 120);
    return () => window.clearInterval(interval);
  }, [tossing]);

  async function tossCoin() {
    if (!selected || tossing) return;
    const token = localStorage.getItem("accessToken");
    if (!token) {
      setError("Please login before playing.");
      return;
    }

    const amount = Number(stake);
    if (!Number.isFinite(amount) || amount <= 0) {
      setError("Enter a valid stake amount.");
      return;
    }

    setError(null);
    setResult(null);
    setTossing(true);
    tossStartedAt.current = Date.now();

    try {
      const response = await fetch(`${API_BASE_URL}/games/coin-toss/play`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ prediction: selected.toUpperCase(), stakeRupees: amount }),
      });

      const data = await response.json().catch(() => null);
      if (!response.ok) throw new Error(data?.message ?? "Unable to toss the coin");

      const serverResult: Side = data.result === 1 ? "Heads" : "Tails";
      const remaining = Math.max(0, 1800 - (Date.now() - tossStartedAt.current));
      window.setTimeout(() => {
        setDisplaySide(serverResult);
        setResult(serverResult);
        setTossing(false);
      }, remaining);
    } catch (err) {
      setTossing(false);
      setError(err instanceof Error ? err.message : "Unable to toss the coin");
    }
  }

  const won = result !== null && result === selected;

  return (
    <main className="min-h-screen bg-[#07080b] text-white">
      <div className="mx-auto max-w-4xl px-5 pb-12 sm:px-8">
        <header className="flex h-20 items-center justify-between border-b border-white/10">
          <a href="/games" className="text-sm font-semibold text-white/55 hover:text-white">← Game lobby</a>
          <a href="/wallet" className="rounded-xl border border-white/15 px-4 py-2.5 text-sm font-semibold hover:border-white/30">Wallet</a>
        </header>

        <section className="py-8 text-center sm:py-12">
          <div className="relative mx-auto flex h-64 items-center justify-center [perspective:1000px]">
            <div className="absolute h-48 w-48 rounded-full bg-yellow-400/10 blur-3xl" />
            <div className={`coin relative flex h-40 w-40 items-center justify-center rounded-full border-[7px] border-yellow-200/80 bg-gradient-to-br from-yellow-100 via-yellow-400 to-yellow-700 text-black shadow-[0_24px_70px_rgba(234,179,8,0.28),inset_0_0_0_3px_rgba(255,255,255,0.35)] sm:h-44 sm:w-44 ${tossing ? "animate-[coinFlip_0.6s_ease-in-out_infinite]" : ""}`}>
              <div className="absolute inset-3 rounded-full border-2 border-black/15" />
              <div className="relative flex h-24 w-24 items-center justify-center rounded-full border-2 border-black/20 bg-yellow-300/25 px-2 text-center text-sm font-black uppercase tracking-wider">
                {displaySide}
              </div>
            </div>
          </div>
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-white/35">Coin Toss</p>
          <h1 className="mt-2 text-4xl font-black tracking-[-0.03em] sm:text-5xl">Heads or Tails?</h1>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-white/45">Choose your side, place your stake, then watch the coin fly before the server reveals the result.</p>
          {tossing && <p className="mt-4 animate-pulse text-sm font-bold text-yellow-200/80">Flipping in the air…</p>}
        </section>

        <section className="rounded-[28px] border border-white/10 bg-white/[0.035] p-5 shadow-2xl sm:p-8">
          <div className="grid gap-3 sm:grid-cols-2">
            {(["Heads", "Tails"] as const).map((side) => (
              <button key={side} type="button" onClick={() => { setSelected(side); setResult(null); setError(null); }} disabled={tossing} className={`rounded-2xl border px-5 py-6 text-xl font-black transition-all ${selected === side ? "border-yellow-200 bg-yellow-300 text-black shadow-[0_10px_35px_rgba(234,179,8,0.18)]" : "border-white/10 bg-white/[0.04] hover:border-white/25"} disabled:cursor-not-allowed disabled:opacity-60`} aria-pressed={selected === side}>{side}</button>
            ))}
          </div>

          <div className="mt-4 rounded-2xl border border-white/10 bg-black/20 p-4">
            <label htmlFor="coin-stake" className="text-xs font-semibold uppercase tracking-wider text-white/35">Stake amount (₹)</label>
            <input id="coin-stake" type="number" min="10" step="10" inputMode="numeric" value={stake} onChange={(event) => setStake(event.target.value)} disabled={tossing} className="mt-2 w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-lg font-bold outline-none transition focus:border-white/30 disabled:opacity-50" />
            <p className="mt-2 text-xs text-white/30">Amount changes in ₹10 steps · Win payout: 1.9× stake</p>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl bg-black/20 p-4"><p className="text-xs text-white/35">Your prediction</p><p className="mt-1 text-lg font-bold">{selected ?? "Not selected"}</p></div>
            <div className="rounded-2xl bg-black/20 p-4"><p className="text-xs text-white/35">Possible win</p><p className="mt-1 text-lg font-bold">₹{(Number(stake || 0) * 1.9 || 0).toFixed(2)}</p></div>
          </div>

          {error && <div className="mt-4 rounded-2xl border border-red-400/20 bg-red-400/10 p-4 text-sm font-semibold text-red-200">{error}</div>}

          {result && <div className={`mt-5 rounded-2xl border p-5 ${won ? "border-emerald-400/20 bg-emerald-400/10" : "border-white/10 bg-black/20"}`}><p className="text-xs font-bold uppercase tracking-[0.18em] text-white/40">Round result</p><p className="mt-2 text-3xl font-black">{won ? "You won! 🎉" : "Better luck next time"}</p><p className="mt-3 text-sm text-white/55">The coin landed on <span className="font-bold text-white">{result}</span>. {won ? `Your payout is ₹${(Number(stake) * 1.9).toFixed(2)}.` : "Your stake was lost."}</p><button type="button" onClick={() => { setResult(null); setDisplaySide("Heads"); }} className="mt-5 w-full rounded-2xl border border-white/15 px-5 py-3 text-sm font-bold hover:border-white/30">Play another round</button></div>}

          {!result && <button type="button" onClick={tossCoin} disabled={!selected || tossing} className="mt-5 w-full rounded-2xl bg-white px-5 py-4 text-sm font-black text-black transition hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-30">{tossing ? "Tossing..." : selected ? "Toss Coin" : "Select Heads or Tails"}</button>}

          <p className="mt-4 text-center text-xs leading-5 text-white/30">The browser only animates the toss. The actual outcome is generated securely by the server and settled with the wallet.</p>
        </section>
      </div>
      <style jsx global>{`@keyframes coinFlip { 0% { transform: translateY(42px) rotateY(0deg) rotateZ(-5deg) scale(0.9); } 20% { transform: translateY(-42px) rotateY(180deg) rotateZ(5deg) scale(1.02); } 50% { transform: translateY(-88px) rotateY(540deg) rotateZ(-4deg) scale(1.08); } 80% { transform: translateY(-32px) rotateY(900deg) rotateZ(4deg) scale(1.01); } 100% { transform: translateY(42px) rotateY(1080deg) rotateZ(-5deg) scale(0.9); } }`}</style>
    </main>
  );
}
