"use client";

import { useState } from "react";

const faces = [1, 2, 3, 4, 5, 6];

export default function DicePage() {
  const [selected, setSelected] = useState<number | null>(null);

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
          <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-white/45">Choose exactly one face from 1 to 6. Your selection is locked when the round closes.</p>
        </section>

        <section className="rounded-3xl border border-white/10 bg-white/[0.035] p-5 sm:p-8">
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
            {faces.map((face) => (
              <button
                key={face}
                type="button"
                onClick={() => setSelected(face)}
                className={`aspect-square rounded-2xl border text-2xl font-black transition sm:text-3xl ${selected === face ? "border-white bg-white text-black" : "border-white/10 bg-white/[0.04] hover:border-white/25"}`}
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

          <button type="button" disabled={!selected} className="mt-5 w-full rounded-2xl bg-white px-5 py-4 text-sm font-black text-black disabled:cursor-not-allowed disabled:opacity-30">
            {selected ? "Continue to stake" : "Select a number"}
          </button>

          <p className="mt-4 text-center text-xs leading-5 text-white/30">The result is generated server-side after the round is locked. This screen does not generate or control outcomes.</p>
        </section>
      </div>
    </main>
  );
}
