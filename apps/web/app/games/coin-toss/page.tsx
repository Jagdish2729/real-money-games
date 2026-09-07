"use client";

import { useState } from "react";

export default function CoinTossPage() {
  const [selected, setSelected] = useState<"Heads" | "Tails" | null>(null);

  return (
    <main className="min-h-screen bg-[#07080b] text-white">
      <div className="mx-auto max-w-4xl px-5 pb-12 sm:px-8">
        <header className="flex h-20 items-center justify-between border-b border-white/10">
          <a href="/games" className="text-sm font-semibold text-white/55 hover:text-white">← Game lobby</a>
          <a href="/wallet" className="rounded-xl border border-white/15 px-4 py-2.5 text-sm font-semibold hover:border-white/30">Wallet</a>
        </header>

        <section className="py-10 text-center sm:py-14">
          <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full border-4 border-white bg-white text-3xl font-black text-black shadow-2xl shadow-black/30">RM</div>
          <p className="mt-7 text-xs font-bold uppercase tracking-[0.2em] text-white/35">Coin Toss</p>
          <h1 className="mt-2 text-4xl font-black tracking-[-0.03em] sm:text-5xl">Heads or Tails?</h1>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-white/45">Pick one side of the coin. One server-generated outcome determines the round.</p>
        </section>

        <section className="rounded-3xl border border-white/10 bg-white/[0.035] p-5 sm:p-8">
          <div className="grid gap-3 sm:grid-cols-2">
            {(["Heads", "Tails"] as const).map((side) => (
              <button
                key={side}
                type="button"
                onClick={() => setSelected(side)}
                className={`rounded-2xl border px-5 py-7 text-xl font-black transition ${selected === side ? "border-white bg-white text-black" : "border-white/10 bg-white/[0.04] hover:border-white/25"}`}
                aria-pressed={selected === side}
              >
                {side}
              </button>
            ))}
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl bg-black/20 p-4">
              <p className="text-xs text-white/35">Your prediction</p>
              <p className="mt-1 text-lg font-bold">{selected ?? "Not selected"}</p>
            </div>
            <div className="rounded-2xl bg-black/20 p-4">
              <p className="text-xs text-white/35">Outcome odds</p>
              <p className="mt-1 text-lg font-bold">1 / 2</p>
            </div>
          </div>

          <button type="button" disabled={!selected} className="mt-5 w-full rounded-2xl bg-white px-5 py-4 text-sm font-black text-black disabled:cursor-not-allowed disabled:opacity-30">
            {selected ? "Continue to stake" : "Select Heads or Tails"}
          </button>

          <p className="mt-4 text-center text-xs leading-5 text-white/30">The result is generated server-side after the round is locked. This screen does not generate or control outcomes.</p>
        </section>
      </div>
    </main>
  );
}
