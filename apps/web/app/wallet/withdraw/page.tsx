"use client";

import { FormEvent, useState } from "react";

export default function WithdrawPage() {
  const [amount, setAmount] = useState("");
  const [upiId, setUpiId] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!amount || !upiId.trim()) return;
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
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/35">Wallet / Withdraw</p>
          <h1 className="mt-2 text-4xl font-black tracking-[-0.03em] sm:text-5xl">Withdraw funds</h1>
          <p className="mt-4 max-w-2xl text-sm leading-6 text-white/45 sm:text-base">
            Request a withdrawal to your verified UPI ID. Your request will be reviewed and processed separately from your wallet balance.
          </p>
        </section>

        {submitted ? (
          <section className="rounded-3xl border border-white/10 bg-white/[0.035] p-6 sm:p-8">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-xl font-black text-black">✓</div>
            <h2 className="mt-6 text-2xl font-bold">Withdrawal request submitted</h2>
            <p className="mt-3 text-sm leading-6 text-white/45">
              Your request is now pending review. Funds are reserved by the server when the withdrawal is accepted.
            </p>
            <div className="mt-6 flex gap-3">
              <a href="/wallet" className="rounded-xl bg-white px-4 py-3 text-sm font-bold text-black">View wallet</a>
              <button onClick={() => setSubmitted(false)} className="rounded-xl border border-white/15 px-4 py-3 text-sm font-bold hover:border-white/30">
                New request
              </button>
            </div>
          </section>
        ) : (
          <div className="grid gap-5 lg:grid-cols-[1.1fr_.9fr]">
            <section className="rounded-3xl border border-white/10 bg-white/[0.035] p-6 sm:p-8">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-white/35">Withdrawal details</p>
              <h2 className="mt-2 text-xl font-bold">Request payout</h2>

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
                  <span className="text-sm font-semibold">Verified UPI ID</span>
                  <input
                    type="text"
                    value={upiId}
                    onChange={(event) => setUpiId(event.target.value)}
                    placeholder="example@upi"
                    className="mt-2 w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm outline-none placeholder:text-white/25 focus:border-white/30"
                    required
                  />
                  <span className="mt-2 block text-xs text-white/30">Use the UPI ID associated with your verified account.</span>
                </label>

                <div className="rounded-2xl border border-white/10 bg-black/15 p-4 text-xs leading-5 text-white/40">
                  Only your available balance can be requested. A pending withdrawal will not be available for another withdrawal request.
                </div>

                <button type="submit" className="w-full rounded-xl bg-white px-4 py-3.5 text-sm font-bold text-black hover:bg-white/90">
                  Submit withdrawal request
                </button>
              </form>
            </section>

            <aside className="rounded-3xl border border-white/10 bg-white/[0.035] p-6 sm:p-8">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-white/35">Current wallet</p>
              <p className="mt-2 text-4xl font-black">₹0.00</p>
              <p className="mt-2 text-sm text-white/40">Available to withdraw</p>
              <div className="mt-7 space-y-3 border-t border-white/10 pt-5 text-sm">
                <div className="flex justify-between"><span className="text-white/40">In play</span><span>₹0.00</span></div>
                <div className="flex justify-between"><span className="text-white/40">Pending</span><span>₹0.00</span></div>
              </div>
              <div className="mt-6 rounded-2xl border border-white/10 bg-black/15 p-4 text-xs leading-5 text-white/35">
                Withdrawal status will be visible in transaction history once the backend is connected.
              </div>
            </aside>
          </div>
        )}
      </div>
    </main>
  );
}
