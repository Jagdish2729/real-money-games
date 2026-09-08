"use client";

import { FormEvent, useEffect, useState } from "react";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
type Prediction = "MORE" | "LESS" | "EQUALS";
type DiceResult = { prediction: number; result: number; stakePaise: string; payoutPaise: string; won: boolean; balancePaise: string; };

function DieFace({ value }: { value: number }) {
  const pips: Record<number, string> = { 1: "•", 2: "••", 3: "•••", 4: "••••", 5: "•••••", 6: "••••••" };
  return <div className="relative flex h-28 w-28 rotate-[-6deg] items-center justify-center rounded-[1.6rem] border border-white/30 bg-white text-6xl font-black text-black shadow-[0_25px_60px_rgba(0,0,0,0.45)] sm:h-36 sm:w-36 sm:text-7xl"><span className="tracking-[0.04em]">{pips[value]}</span></div>;
}

function decodeDice(result: number) {
  const dieOne = Math.floor(result / 100);
  const dieTwo = result % 100;
  return { dieOne, dieTwo, sum: dieOne + dieTwo };
}

export default function DicePage() {
  const [selected, setSelected] = useState<Prediction | null>(null);
  const [stake, setStake] = useState("");
  const [loading, setLoading] = useState(false);
  const [rollingOne, setRollingOne] = useState(1);
  const [rollingTwo, setRollingTwo] = useState(6);
  const [error, setError] = useState("");
  const [result, setResult] = useState<DiceResult | null>(null);

  useEffect(() => {
    if (!loading) return;
    const interval = window.setInterval(() => {
      setRollingOne((current) => (current % 6) + 1);
      setRollingTwo((current) => current === 1 ? 6 : current - 1);
    }, 110);
    return () => window.clearInterval(interval);
  }, [loading]);

  async function playDice(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setResult(null);
    const token = localStorage.getItem("accessToken");
    if (!token) { window.location.href = "/login"; return; }
    const stakeRupees = Number(stake);
    if (!selected || !Number.isFinite(stakeRupees) || stakeRupees < 10 || stakeRupees % 10 !== 0) {
      setError("Select a prediction and enter a valid stake in ₹10 steps.");
      return;
    }
    setLoading(true);
    const startedAt = Date.now();
    try {
      const response = await fetch(`${API_BASE_URL}/games/dice/play`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ prediction: selected, stakeRupees }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message ?? "Unable to roll dice");
      const { dieOne, dieTwo } = decodeDice(data.result);
      const remaining = Math.max(0, 1500 - (Date.now() - startedAt));
      window.setTimeout(() => {
        setRollingOne(dieOne);
        setRollingTwo(dieTwo);
        setResult(data);
        setLoading(false);
      }, remaining);
    } catch (err) {
      setLoading(false);
      setError(err instanceof Error ? err.message : "Unable to roll dice");
    }
  }

  function resetRound() {
    setResult(null);
    setError("");
    setStake("");
    setSelected(null);
    setRollingOne(1);
    setRollingTwo(6);
  }

  const labels: { value: Prediction; title: string; payout: string; sub: string }[] = [
    { value: "MORE", title: "More than 7", payout: "2.25×", sub: "Sum 8–12" },
    { value: "LESS", title: "Less than 7", payout: "2.25×", sub: "Sum 2–6" },
    { value: "EQUALS", title: "Equals 7", payout: "5.5×", sub: "Exact sum 7" },
  ];

  return (
    <main className="min-h-screen bg-[#07080b] text-white">
      <div className="mx-auto max-w-4xl px-5 pb-12 sm:px-8">
        <header className="flex h-20 items-center justify-between border-b border-white/10"><a href="/games" className="text-sm font-semibold text-white/55 hover:text-white">← RollRush lobby</a><a href="/wallet" className="rounded-xl border border-white/15 px-4 py-2.5 text-sm font-semibold hover:border-white/30">Wallet</a></header>

        <section className="py-10 text-center sm:py-14">
          <div className={`mx-auto flex h-40 items-center justify-center gap-4 sm:h-48 sm:gap-6 ${loading ? "animate-[diceRoll_0.55s_linear_infinite]" : ""}`}><DieFace value={rollingOne} /><DieFace value={rollingTwo} /></div>
          <p className="mt-7 text-xs font-bold uppercase tracking-[0.2em] text-white/35">RollRush • Dice Roll</p>
          <h1 className="mt-2 text-4xl font-black tracking-[-0.03em] sm:text-5xl">Roll two dice</h1>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-white/45">Pick whether the total is more than 7, less than 7, or exactly 7. One roll decides the round.</p>
          {loading && <p className="mt-4 text-sm font-bold text-white/70">Rolling two dice…</p>}
        </section>

        <form onSubmit={playDice} className="rounded-3xl border border-white/10 bg-white/[0.035] p-5 sm:p-8">
          <div className="grid gap-3 sm:grid-cols-3">
            {labels.map((option) => <button key={option.value} type="button" onClick={() => { setSelected(option.value); setResult(null); setError(""); }} disabled={loading} className={`rounded-2xl border p-4 text-left transition ${selected === option.value ? "border-white bg-white text-black" : "border-white/10 bg-white/[0.04] hover:border-white/25"} disabled:cursor-not-allowed disabled:opacity-60`} aria-pressed={selected === option.value}><div className="flex items-center justify-between gap-3"><span className="text-base font-black sm:text-lg">{option.title}</span><span className="text-sm font-black">{option.payout}</span></div><p className={`mt-1 text-xs ${selected === option.value ? "text-black/55" : "text-white/35"}`}>{option.sub}</p></button>)}
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2"><div className="rounded-2xl bg-black/20 p-4"><p className="text-xs text-white/35">Your prediction</p><p className="mt-1 text-lg font-bold">{selected ? labels.find((option) => option.value === selected)?.title : "Not selected"}</p></div><div className="rounded-2xl bg-black/20 p-4"><p className="text-xs text-white/35">Payout</p><p className="mt-1 text-lg font-bold">{selected ? labels.find((option) => option.value === selected)?.payout : "—"} of stake</p></div></div>

          <label className="mt-6 block"><span className="mb-2 block text-sm font-semibold text-white/70">Stake amount</span><div className="flex items-center overflow-hidden rounded-2xl border border-white/10 bg-[#0c0e13] focus-within:border-white/30"><span className="border-r border-white/10 px-4 text-sm font-semibold text-white/50">₹</span><input required type="number" min="10" step="10" inputMode="numeric" value={stake} onChange={(event) => setStake(event.target.value)} placeholder="Enter stake" disabled={loading} className="min-w-0 flex-1 bg-transparent px-4 py-4 text-base outline-none placeholder:text-white/20 disabled:opacity-60" /></div><span className="mt-2 block text-xs text-white/30">Amount changes in ₹10 steps</span></label>

          {error && <p className="mt-4 rounded-xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-300">{error}</p>}
          {result && (() => { const dice = decodeDice(result.result); return <div className="mt-5 rounded-2xl border border-white/10 bg-black/20 p-5"><p className="text-xs font-bold uppercase tracking-[0.18em] text-white/40">Round result</p><p className="mt-2 text-3xl font-black">{result.won ? "You won!" : "Better luck next time"}</p><p className="mt-2 text-base font-bold">{dice.dieOne} + {dice.dieTwo} = {dice.sum}</p><div className="mt-4 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4"><div><p className="text-white/35">Prediction</p><p className="mt-1 font-bold">{labels.find((option) => option.value === (result.prediction === 1 ? "MORE" : result.prediction === 2 ? "LESS" : "EQUALS"))?.title}</p></div><div><p className="text-white/35">Total</p><p className="mt-1 font-bold">{dice.sum}</p></div><div><p className="text-white/35">Payout</p><p className="mt-1 font-bold">₹{(Number(result.payoutPaise) / 100).toFixed(2)}</p></div><div><p className="text-white/35">Balance</p><p className="mt-1 font-bold">₹{(Number(result.balancePaise) / 100).toFixed(2)}</p></div></div><button type="button" onClick={resetRound} className="mt-5 w-full rounded-2xl border border-white/15 px-5 py-3 text-sm font-bold hover:border-white/30">Play another round</button></div>; })()}
          {!result && <button type="submit" disabled={!selected || !stake || loading} className="mt-5 w-full rounded-2xl bg-white px-5 py-4 text-sm font-black text-black transition hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-30">{loading ? "Rolling..." : selected ? "Roll Two Dice" : "Choose a prediction"}</button>}
          <p className="mt-4 text-center text-xs leading-5 text-white/30">Each die is generated independently on the server using a secure random number generator. The animation only reveals the server result; it does not control it.</p>
        </form>
      </div>
      <style jsx global>{`@keyframes diceRoll { 0% { transform: rotate(0deg) translateY(0); } 25% { transform: rotate(90deg) translateY(-10px); } 50% { transform: rotate(180deg) translateY(0); } 75% { transform: rotate(270deg) translateY(-10px); } 100% { transform: rotate(360deg) translateY(0); } }`}</style>
    </main>
  );
}
