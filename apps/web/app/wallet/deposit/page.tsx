"use client";

import { FormEvent, useState } from "react";

export default function DepositPage() {
  const [amount, setAmount] = useState("");
  const [utr, setUtr] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!amount || !utr.trim()) return;
    setSubmitted(true);
  }

  return (
    <main className="min-h-screen bg-[#07080b] text-white">
      <div className="mx-auto max-w-3xl px-5 pb-12 sm:px-8">
        <header className="flex h-20 items-center justify-between border-b border-white/10">
          <a href="/" className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-lg font-black text-black">R</span>
            <span className="text-base font-bold tracking-tight">REAL MONEY GAMES</span>
          </a>
          <a href="/wallet" className="text-sm font-semibold text-white/55 hover:text-white">Back to wallet</a>
        </header>

        <section className="py-10 sm:py-14">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/35">Wallet / Deposit</p>
          <h1 className="mt-2 text-4xl font-black tracking-[-0.03em] sm:text-5xl">Add money</h1>
          <p className="mt-4 max-w-2xl text-sm leading-6 text-white/45 sm:text-base">
            Send your payment using the displayed payment method, then submit the transaction reference for manual verification.
          </p>
        </section>

        {submitted ? (
          <section className="rounded-3xl border border-white/10 bg-white/[0.035] p-6 sm:p-8">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-xl font-black text-black">✓</div>
            <h2 className="mt-6 text-2xl font-bold">Deposit request submitted</h2>
            <p className="mt-3 text-sm leading-6 text-white/45">
              Your request is pending manual verification. The wallet balance will be updated only after the payment is approved.
            </p>
            <div className="mt-6 flex gap-3">
              <a href="/wallet" className="rounded-xl bg-white px-4 py-3 text-sm font-bold text-black">View wallet</a>
              <button onClick={() => setSubmitted(false)} className="rounded-xl border border-white/15 px-4 py-3 text-sm font-bold hover:border-white/30">
                Submit another request
              </button>
            </div>
          </section>
        ) : (
          <div className="grid gap-5 lg:grid-cols-[.9fr_1.1fr]">
            <section className="rounded-3xl border border-white/10 bg-white/[0.035] p-6 sm:p-8">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-white/35">Step 1</p>
              <h2 className="mt-2 text-xl font-bold">Make your payment</h2>
              <div className="mt-6 rounded-2xl border border-dashed border-white/15 bg-black/20 p-6 text-center">
                <div className="mx-auto flex h-36 w-36 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-xs text-white/35">
                  PAYMENT QR
                </div>
                <p className="mt-4 text-sm font-semibold">UPI payment</p>
                <p className="mt-1 text-xs text-white/35">Payment details will be configured by the operator.</p>
              </div>
              <div className="mt-5 rounded-2xl border border-white/10 bg-black/15 p-4 text-xs leading-5 text-white/45">
                Do not submit a request until your payment has been completed. Keep the transaction reference available.
              </div>
            </section>

            <section className="rounded-3xl border border-white/10 bg-white/[0.035] p-6 sm:p-8">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-white/35">Step 2</p>
              <h2 className="mt-2 text-xl font-bold">Submit payment details</h2>

              <form onSubmit={handleSubmit} className="mt-6 space-y-5">
                <label className="block">
                  <span className="text-sm font-semibold">Amount</span>
                  <div className="mt-2 flex items-center rounded-xl border border-white/10 bg-black/20 px-4 focus-within:border-white/30">
                    <span className="text-white/45">₹</span>
                    <input
                      type="number"
                      min="1"
                      step="1"
                      value={amount}
                      onChange={(event) => setAmount(event.target.value)}
                      placeholder="Enter amount"
                      className="w-full bg-transparent px-3 py-3 text-sm outline-none placeholder:text-white/25"
                      required
                    />
                  </div>
                </label>

                <label className="block">
                  <span className="text-sm font-semibold">UTR / transaction reference</span>
                  <input
                    value={utr}
                    onChange={(event) => setUtr(event.target.value)}
                    placeholder="Enter payment reference"
                    className="mt-2 w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm outline-none placeholder:text-white/25 focus:border-white/30"
                    required
                  />
                </label>

                <label className="block">
                  <span className="text-sm font-semibold">Payment proof</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="mt-2 block w-full rounded-xl border border-white/10 bg-black/20 p-3 text-sm text-white/55 file:mr-3 file:rounded-lg file:border-0 file:bg-white file:px-3 file:py-2 file:text-xs file:font-bold file:text-black"
                  />
                  <span className="mt-2 block text-xs text-white/30">Screenshot upload will be connected to secure storage in the backend.</span>
                </label>

                <div className="rounded-2xl border border-white/10 bg-black/15 p-4 text-xs leading-5 text-white/40">
                  Deposits are credited only after admin verification. This screen does not change your wallet balance directly.
                </div>

                <button type="submit" className="w-full rounded-xl bg-white px-4 py-3.5 text-sm font-bold text-black hover:bg-white/90">
                  Submit deposit request
                </button>
              </form>
            </section>
          </div>
        )}
      </div>
    </main>
  );
}
