const games = [
  {
    title: "Dice Roll",
    subtitle: "Pick one exact number",
    description: "Choose a number from 1 to 6. The server generates the round outcome after entries close.",
    icon: "⚄",
    odds: "1 in 6",
    href: "/games/dice",
  },
  {
    title: "Coin Toss",
    subtitle: "Heads or Tails",
    description: "Choose Heads or Tails. The server securely generates one outcome for the round.",
    icon: "◉",
    odds: "1 in 2",
    href: "/games/coin-toss",
  },
];

export default function GamesPage() {
  return (
    <main className="min-h-screen bg-[#07080b] text-white">
      <div className="mx-auto max-w-6xl px-5 pb-12 sm:px-8">
        <header className="flex h-20 items-center justify-between border-b border-white/10">
          <a href="/" className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-lg font-black text-black">R</span>
            <span className="text-base font-bold tracking-tight">REAL MONEY GAMES</span>
          </a>
          <div className="flex items-center gap-3">
            <a href="/games/history" className="rounded-xl border border-white/15 px-4 py-2.5 text-sm font-semibold hover:border-white/30">History</a>
            <a href="/wallet" className="rounded-xl border border-white/15 px-4 py-2.5 text-sm font-semibold hover:border-white/30">Wallet</a>
          </div>
        </header>

        <section className="py-12 sm:py-16">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/35">Game lobby</p>
          <h1 className="mt-3 text-4xl font-black tracking-[-0.03em] sm:text-5xl">Choose your game</h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-white/50">
            Every round is settled by the server. Payout rules are shown before you play and wallet changes are recorded in the transaction ledger.
          </p>
        </section>

        <section className="grid gap-5 md:grid-cols-2">
          {games.map((game) => (
            <a key={game.title} href={game.href} className="group rounded-3xl border border-white/10 bg-white/[0.035] p-6 transition hover:-translate-y-1 hover:border-white/20 hover:bg-white/[0.055] sm:p-8">
              <div className="flex items-start justify-between">
                <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-4xl text-black shadow-lg shadow-black/20">{game.icon}</span>
                <span className="rounded-full border border-white/10 px-3 py-1.5 text-xs font-bold text-white/50">{game.odds}</span>
              </div>
              <p className="mt-8 text-xs font-bold uppercase tracking-[0.16em] text-white/35">{game.subtitle}</p>
              <h2 className="mt-2 text-2xl font-black">{game.title}</h2>
              <p className="mt-3 max-w-lg text-sm leading-6 text-white/45">{game.description}</p>
              <div className="mt-8 flex items-center justify-between border-t border-white/10 pt-5">
                <span className="text-sm font-bold text-white/70 group-hover:text-white">Open game</span>
                <span className="text-lg transition-transform group-hover:translate-x-1">→</span>
              </div>
            </a>
          ))}
        </section>

        <a href="/games/history" className="group mt-8 flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.025] p-5 transition hover:border-white/20 hover:bg-white/[0.04]">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-white/35">My activity</p>
            <p className="mt-1 font-bold">View your game history</p>
            <p className="mt-1 text-sm text-white/40">See predictions, results, stakes, payouts and net win/loss.</p>
          </div>
          <span className="text-lg transition-transform group-hover:translate-x-1">→</span>
        </a>

        <section className="mt-5 rounded-2xl border border-white/10 bg-white/[0.025] p-5 text-sm text-white/40">
          <strong className="text-white/70">Fair-play note:</strong> game outcomes are generated server-side using a secure random source. The client cannot choose or change a resolved outcome.
        </section>
      </div>
    </main>
  );
}
