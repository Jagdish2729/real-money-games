const ledgerPreview = [
  { type: "Wallet created", detail: "Your secure wallet is ready", amount: "—", tone: "muted" },
  { type: "No transactions yet", detail: "Deposits and game activity will appear here", amount: "—", tone: "muted" },
];

export default function WalletPage() {
  return (
    <main className="min-h-screen bg-[#07080b] text-white">
      <div className="mx-auto max-w-5xl px-5 pb-12 sm:px-8">
        <header className="flex h-20 items-center justify-between border-b border-white/10">
          <a href="/" className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-lg font-black text-black">R</span>
            <span className="text-base font-bold tracking-tight">REAL MONEY GAMES</span>
          </a>
          <a href="/games" className="text-sm font-semibold text-white/55 hover:text-white">Games</a>
        </header>

        <section className="py-10 sm:py-14">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/35">Wallet</p>
          <h1 className="mt-2 text-4xl font-black tracking-[-0.03em] sm:text-5xl">Your money, clearly tracked.</h1>
          <p className="mt-4 max-w-2xl text-sm leading-6 text-white/45 sm:text-base">
            Deposits, stakes, payouts and withdrawals are recorded as separate wallet transactions so every balance change has a traceable reference.
          </p>
        </section>

        <section className="grid gap-5 lg:grid-cols-[1.25fr_.75fr]">
          <div className="rounded-3xl border border-white/10 bg-white/[0.035] p-6 sm:p-8">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/35">Available balance</p>
                <p className="mt-2 text-5xl font-black tracking-tight">₹0.00</p>
              </div>
              <div className="flex gap-3">
                <a href="/wallet/deposit" className="rounded-xl bg-white px-4 py-3 text-sm font-bold text-black hover:bg-white/90">Deposit</a>
                <a href="/wallet/withdraw" className="rounded-xl border border-white/15 px-4 py-3 text-sm font-bold hover:border-white/30">Withdraw</a>
              </div>
            </div>

            <div className="mt-8 grid grid-cols-3 gap-3">
              <div className="rounded-2xl bg-black/20 p-4">
                <p className="text-xs text-white/35">Available</p>
                <p className="mt-1 font-bold">₹0.00</p>
              </div>
              <div className="rounded-2xl bg-black/20 p-4">
                <p className="text-xs text-white/35">In play</p>
                <p className="mt-1 font-bold">₹0.00</p>
              </div>
              <div className="rounded-2xl bg-black/20 p-4">
                <p className="text-xs text-white/35">Pending</p>
                <p className="mt-1 font-bold">₹0.00</p>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/[0.035] p-6 sm:p-8">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-white/35">Quick actions</p>
            <div className="mt-5 space-y-3">
              <a href="/wallet/deposit" className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/15 p-4 transition hover:border-white/20 hover:bg-white/[0.04]">
                <div>
                  <p className="font-bold">Add money</p>
                  <p className="mt-1 text-xs text-white/35">Submit a deposit request</p>
                </div>
                <span>→</span>
              </a>
              <a href="/wallet/withdraw" className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/15 p-4 transition hover:border-white/20 hover:bg-white/[0.04]">
                <div>
                  <p className="font-bold">Withdraw</p>
                  <p className="mt-1 text-xs text-white/35">Request a payout</p>
                </div>
                <span>→</span>
              </a>
              <a href="/history" className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/15 p-4 transition hover:border-white/20 hover:bg-white/[0.04]">
                <div>
                  <p className="font-bold">Transaction history</p>
                  <p className="mt-1 text-xs text-white/35">Review every wallet event</p>
                </div>
                <span>→</span>
              </a>
            </div>
          </div>
        </section>

        <section className="mt-6 rounded-3xl border border-white/10 bg-white/[0.035] p-6 sm:p-8">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-white/35">Recent activity</p>
              <h2 className="mt-2 text-xl font-bold">Wallet ledger</h2>
            </div>
            <a href="/history" className="text-sm font-semibold text-white/45 hover:text-white">View all →</a>
          </div>

          <div className="mt-6 divide-y divide-white/10">
            {ledgerPreview.map((item) => (
              <div key={item.type} className="flex items-center justify-between py-4">
                <div>
                  <p className={`text-sm font-semibold ${item.tone === "muted" ? "text-white/65" : ""}`}>{item.type}</p>
                  <p className="mt-1 text-xs text-white/30">{item.detail}</p>
                </div>
                <span className="text-sm font-semibold text-white/35">{item.amount}</span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
