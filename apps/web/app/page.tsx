const games = [
  {
    title: "Dice Roll",
    description: "Predict the exact number from 1 to 6.",
    icon: "⚄",
    href: "/games/dice",
    tag: "1 / 6 odds",
  },
  {
    title: "Coin Toss",
    description: "Pick Heads or Tails and test your luck.",
    icon: "◉",
    href: "/games/coin-toss",
    tag: "1 / 2 odds",
  },
];

const transactions = [
  { label: "Welcome to Real Money Games", meta: "Wallet activity will appear here", amount: "—" },
  { label: "Secure wallet", meta: "Server-authoritative balance", amount: "—" },
  { label: "Fair game engine", meta: "Cryptographically secure outcomes", amount: "—" },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-[#07080b] text-white">
      <div className="mx-auto min-h-screen max-w-7xl px-5 pb-10 sm:px-8">
        <header className="flex h-20 items-center justify-between border-b border-white/10">
          <a href="/" className="flex items-center gap-3" aria-label="Real Money Games home">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-lg font-black text-black">
              R
            </span>
            <span className="text-base font-bold tracking-tight">REAL MONEY GAMES</span>
          </a>

          <div className="flex items-center gap-3">
            <a
              href="/login"
              className="rounded-xl border border-white/15 px-4 py-2.5 text-sm font-semibold text-white/80 transition hover:border-white/30 hover:text-white"
            >
              Log in
            </a>
            <a
              href="/login"
              className="rounded-xl bg-white px-4 py-2.5 text-sm font-bold text-black transition hover:bg-white/90"
            >
              Get started
            </a>
          </div>
        </header>

        <section className="grid gap-10 py-12 lg:grid-cols-[1.25fr_.75fr] lg:items-center lg:py-20">
          <div>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-semibold text-white/60">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              Secure • Transparent • Server-authoritative
            </div>

            <h1 className="max-w-3xl text-5xl font-black leading-[0.98] tracking-[-0.04em] sm:text-6xl lg:text-7xl">
              Predict. Play.
              <br />
              <span className="text-white/45">Win fairly.</span>
            </h1>

            <p className="mt-6 max-w-2xl text-base leading-7 text-white/55 sm:text-lg">
              A clean prediction-game experience built around a secure wallet, auditable
              game rounds and transparent payout rules.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href="/games"
                className="rounded-2xl bg-white px-6 py-3.5 text-sm font-bold text-black transition hover:bg-white/90"
              >
                Explore games →
              </a>
              <a
                href="/wallet"
                className="rounded-2xl border border-white/15 px-6 py-3.5 text-sm font-bold text-white transition hover:border-white/30 hover:bg-white/[0.04]"
              >
                View wallet
              </a>
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 shadow-2xl shadow-black/30">
            <div className="rounded-2xl border border-white/10 bg-[#0c0e13] p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-white/40">AVAILABLE BALANCE</p>
                  <p className="mt-2 text-4xl font-black tracking-tight">₹0.00</p>
                </div>
                <a href="/wallet/deposit" className="rounded-xl bg-white px-4 py-2.5 text-xs font-bold text-black">
                  + Deposit
                </a>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-3">
                <div className="rounded-2xl bg-white/[0.04] p-4">
                  <p className="text-xs text-white/40">Games</p>
                  <p className="mt-1 text-xl font-bold">2</p>
                </div>
                <div className="rounded-2xl bg-white/[0.04] p-4">
                  <p className="text-xs text-white/40">Wallet status</p>
                  <p className="mt-1 text-xl font-bold text-emerald-400">Ready</p>
                </div>
              </div>

              <div className="mt-4 space-y-2">
                {transactions.map((item) => (
                  <div key={item.label} className="flex items-center justify-between rounded-xl px-1 py-3">
                    <div>
                      <p className="text-sm font-semibold">{item.label}</p>
                      <p className="mt-0.5 text-xs text-white/35">{item.meta}</p>
                    </div>
                    <span className="text-sm font-semibold text-white/45">{item.amount}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="pb-12">
          <div className="mb-5 flex items-end justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/35">Games</p>
              <h2 className="mt-2 text-2xl font-bold tracking-tight">Choose your prediction</h2>
            </div>
            <a href="/games" className="text-sm font-semibold text-white/50 hover:text-white">
              View all →
            </a>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {games.map((game) => (
              <a
                key={game.title}
                href={game.href}
                className="group rounded-3xl border border-white/10 bg-white/[0.035] p-6 transition hover:-translate-y-0.5 hover:border-white/20 hover:bg-white/[0.06]"
              >
                <div className="flex items-start justify-between">
                  <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-3xl text-black">
                    {game.icon}
                  </span>
                  <span className="rounded-full border border-white/10 px-3 py-1 text-[11px] font-bold text-white/45">
                    {game.tag}
                  </span>
                </div>
                <h3 className="mt-7 text-xl font-bold">{game.title}</h3>
                <p className="mt-2 max-w-md text-sm leading-6 text-white/45">{game.description}</p>
                <div className="mt-6 text-sm font-bold text-white/70 group-hover:text-white">Play game →</div>
              </a>
            ))}
          </div>
        </section>

        <footer className="border-t border-white/10 py-7 text-xs text-white/30">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <span>Real Money Games</span>
            <span>Transparent rules • Secure wallet • Auditable settlements</span>
          </div>
        </footer>
      </div>
    </main>
  );
}
