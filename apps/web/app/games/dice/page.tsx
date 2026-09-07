"use client";

import { FormEvent, useState } from "react";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
const faces = [1, 2, 3, 4, 5, 6];

type DiceResult = {
  prediction: number;
  result: number;
  stakePaise: string;
  payoutPaise: string;
  won: boolean;
  balancePaise: string;
};

export default function DicePage() {
  const [selected, setSelected] = useState<number | null>(null);
  const [stake, setStake] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<DiceResult | null>(null);

  async function playDice(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setResult(null);

    const token = localStorage.getItem("accessToken");
    if (!token) {
      window.location.href = "/login";
      return;
    }

    const stakeRupees = Number(stake);
    if (!selected || !Number.isFinite(stakeRupees) || stakeRupees <= 0) {
      setError("Select a number and enter a valid stake.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/games/dice/play`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prediction: selected, stakeRupees }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message ?? "Unable to play dice");
      }

      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to play dice");
    } finally {
      setLoading(false);
    }
  }

  function resetRound() {
    setResult(null);
    setError("");
    setStake("");
  }

  return (
    <main className="min-h-screen bg-[#07080b] text-white">
      <div className="mx-auto max-w-4xl px-5 pb-12 sm:px-8">
        <header className="flex h-20 items-center justify-between border-b border-white/10">
          <a href="/games" className="text-sm font-semibold text-white/55 hover:text-white">← Game lobby</a>
          <a href="/wallet" className="rounded-xl border border-white/15 px-4 py-2.5 text-sm font-semibold hover:border-white/30">Wallet</a>
        </header>

        <section className="py-10 text-center sm:py-14">
          <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-3xl bg-white text-6xl text-black shadow-2xl shadow-black/30">⚄</div>
          <p className="mt-7 text-xs font-bold uppercase tracking-[0.2em] text-white/35">Dice Roll</p>
          <h1 className="mt-2 text-4xl font-black tracking-[-0.03em] sm:text-5xl">Pick a number</h1>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-white/45">Choose one face, enter your stake, and let the server generate the result.</p>
        </section>

        <form onSubmit={playDice} className="rounded-3xl border border-white/10 bg-white/[0.035] p-5 sm:p-8">
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
            {faces.map((face) => (
              <button
                key={face}
                type="button"
                onClick={() => { setSelected(face); setResult(null); setError(""); }}
                disabled={loading}
                className={`aspect-square rounded-2xl border text-2xl font-black transition sm:text-3xl ${selected === face ? "border-white bg-white text-black" : "border-white/10 bg-white/[0.04] hover:border-white/25"} disabled:cursor-not-allowed disabled:opacity-60`}
                aria-pressed={selected === face}
              >
                {face}
              </button>
            ))}
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl bg-black/20 p-4">
              <p className="text-xs text-white/35">Your prediction</p>
              <p className="mt-1 text-lg font-bold">{selected ? `Number ${selected}` : "Not selected"}</p>
            </div>
            <div className="rounded-2xl bg-black/20 p-4">
              <p className="text-xs text-white/35">Outcome odds</p>
              <p className="mt-1 text-lg font-bold">1 / 6</p>
            </div>
          </div>

          <label className="mt-6 block">
            <span className="mb-2 block text-sm font-semibold text-white/70">Stake amount</span>
            <div className="flex items-center overflow-hidden rounded-2xl border border-white/10 bg-[#0c0e13] focus-within:border-white/30">
              <span className="border-r border-white/10 px-4 text-sm font-semibold text-white/50">₹</span>
              <input
                required
                type="number"
                min="1"
                step="0.01"
                inputMode="decimal"
                value={stake}
                onChange={(event) => setStake(event.target.value)}
                placeholder="Enter stake"
                disabled={loading}
                className="min-w-0 flex-1 bg-transparent px-4 py-4 text-base outline-none placeholder:text-white/20 disabled:opacity-60"
              />
            </div>
          </label>

          {error && <p className="mt-4 rounded-xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-300">{error}</p>}

          {result && (
            <div className="mt-5 rounded-2xl border border-white/10 bg-black/20 p-5">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/40">Round result</p>
              <p className="mt-2 text-3xl font-black">{result.won ? "You won!" : "Better luck next time"}</p>
              <div className="mt-4 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
                <div><p className="text-white/35">Prediction</p><p className="mt-1 font-bold">{result.prediction}</p></div>
                <div><p className="text-white/35">Result</p><p className="mt-1 font-bold">{result.result}</p></div>
                <div><p className="text-white/35">Payout</p><p className="mt-1 font-bold">₹{(Number(result.payoutPaise) / 100).toFixed(2)}</p></div>
                <div><p className="text-white/35">Balance</p><p className="mt-1 font-bold">₹{(Number(result.balancePaise) / 100).toFixed(2)}</p></div>
              </div>
              <button type="button" onClick={resetRound} className="mt-5 w-full rounded-2xl border border-white/15 px-5 py-3 text-sm font-bold hover:border-white/30">Play another round</button>
            </div>
          )}

          {!result && (
            <button type="submit" disabled={!selected || !stake || loading} className="mt-5 w-full rounded-2xl bg-white px-5 py-4 text-sm font-black text-black transition hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-30">
              {loading ? "Rolling..." : selected ? "Roll Dice" : "Select a number"}
            </button>
          )}

          <p className="mt-4 text-center text-xs leading-5 text-white/30">The result is generated on the server using a secure random number generator. The client does not choose or control the outcome.</p>
        </form>
      </div>
    </main>
  );
}
