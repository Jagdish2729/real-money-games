"use client";

const transactions = [
  {
    type: "Deposit",
    detail: "UPI deposit",
    amount: "+₹0.00",
    status: "Pending",
    date: "—",
  },
  {
    type: "Withdrawal",
    detail: "UPI payout",
    amount: "-₹0.00",
    status: "Pending",
    date: "—",
  },
];

export default function TransactionHistoryPage() {
  return (
    <main className="min-h-screen bg-[#07080b] text-white">
      <div className="mx-auto max-w-4xl px-5 pb-12 sm:px-8">
        <header className="flex h-20 items-center justify-between border-b border-white/10">
          <a href="/" className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-lg font-black text-black">R</span>
            <span className="text-base font-bold tracking-tight">REAL MONEY GAMES</span>
          </a>
          <a href="/wallet" className="text-sm font-semibold text-white/55 hover:text-white">Back to wallet</a>
        </header>

        <section className="py-10 sm:py-14">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/35">Wallet / History</p>
          <h1 className="mt-2 text-4xl font-black tracking-[-0.03em] sm:text-5xl">Transaction history</h1>
          <p className="mt-4 max-w-2xl text-sm leading-6 text-white/45 sm:text-base">
            View deposits, withdrawals and game wallet activity in one place.
          </p>
        </section>

        <section className="rounded-3xl border border-white/10 bg-white/[0.035] p-4 sm:p-6">
          <div className="flex flex-col gap-4 border-b border-white/10 pb-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-white/35">Wallet activity</p>
              <h2 className="mt-1 text-xl font-bold">Recent transactions</h2>
            </div>
            <div className="rounded-xl border border-white/10 px-3 py-2 text-xs text-white/45">All activity</div>
          </div>

          <div className="mt-4 space-y-2">
            {transactions.map((transaction) => (
              <div key={transaction.type} className="rounded-2xl border border-white/8 bg-black/15 p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-sm font-bold">
                      {transaction.type === "Deposit" ? "↓" : "↑"}
                    </div>
                    <div>
                      <p className="text-sm font-bold">{transaction.type}</p>
                      <p className="mt-1 text-xs text-white/35">{transaction.detail}</p>
                    </div>
                  </div>
                  <div className="sm:text-right">
                    <p className="text-sm font-bold">{transaction.amount}</p>
                    <div className="mt-1 flex items-center gap-2 sm:justify-end">
                      <span className="rounded-full border border-white/10 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-white/45">
                        {transaction.status}
                      </span>
                      <span className="text-xs text-white/25">{transaction.date}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-5 rounded-2xl border border-dashed border-white/10 p-6 text-center">
            <p className="text-sm font-semibold text-white/55">No completed transactions yet</p>
            <p className="mt-2 text-xs leading-5 text-white/30">
              Your verified deposits, withdrawals and settled game transactions will appear here.
            </p>
          </div>
        </section>

        <div className="mt-5 flex flex-col gap-3 sm:flex-row">
          <a href="/wallet/deposit" className="rounded-xl bg-white px-4 py-3 text-center text-sm font-bold text-black hover:bg-white/90">
            Deposit funds
          </a>
          <a href="/wallet/withdraw" className="rounded-xl border border-white/15 px-4 py-3 text-center text-sm font-bold hover:border-white/30">
            Withdraw funds
          </a>
        </div>
      </div>
    </main>
  );
}
