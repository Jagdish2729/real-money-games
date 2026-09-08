"use client";

import { useEffect, useMemo, useState } from "react";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

type Game = {
  id: string;
  type: "DICE" | "COIN_TOSS";
  status: string;
  prediction: number;
  result: number;
  stakePaise: string;
  payoutPaise: string;
  createdAt: string;
};

function rupees(paise: string) {
  return `₹${(Number(paise) / 100).toFixed(2)}`;
}

function predictionLabel(game: Game) {
  if (game.type === "COIN_TOSS") return game.prediction === 1 ? "Heads" : "Tails";
  return `Number ${game.prediction}`;
}

function resultLabel(game: Game) {
  if (game.type === "COIN_TOSS") return game.result === 1 ? "Heads" : "Tails";
  return String(game.result);
}

function netAmount(game: Game) {
  const stake = Number(game.stakePaise);
  const payout = Number(game.payoutPaise);
  return payout > 0 ? payout - stake : -stake;
}

export default function GameHistoryPage() {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadHistory() {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      setError("Please login to view your game history.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");
    try {
      const response = await fetch(`${API_BASE_URL}/games/history?limit=100`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json().catch(() => null);
      if (!response.ok) throw new Error(data?.message ?? "Unable to load game history");
      setGames(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load game history");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadHistory();
  }, []);

  const stats = useMemo(() => {
    const wins = games.filter((game) => Number(game.payoutPaise) > 0).length;
    const losses = games.length - wins;
    const net = games.reduce((sum, game) => sum + netAmount(game), 0);
    return { wins, losses, net };
  }, [games]);

  return (
    <main className="min-h-screen bg-[#07080b] text-white">
      <div className="mx-auto max-w-6xl px-5 pb-12 sm:px-8">
        <header className="flex h-20 items-center justify-between border-b border-white/10">
          <a href="/games" className="text-sm font-semibold text-white/55 hover:text-white">← Game lobby</a>
          <div className="flex items-center gap-3">
            <a href="/wallet" className="rounded-xl border border-white/15 px-4 py-2.5 text-sm font-semibold hover:border-white/30">Wallet</a>
            <a href="/games/history" className="rounded-xl bg-white px-4 py-2.5 text-sm font-bold text-black">History</a>
          </div>
        </header>

        <section className="py-10 sm:py-14">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/35">My games</p>
          <div className="mt-3 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-4xl font-black tracking-[-0.03em] sm:text-5xl">Game history</h1>
              <p className="mt-4 max-w-2xl text-sm leading-6 text-white/45 sm:text-base">Every completed round, stake and payout in one place.</p>
            </div>
            <button type="button" onClick={() => void loadHistory()} disabled={loading} className="rounded-xl border border-white/15 px-4 py-2.5 text-sm font-bold hover:border-white/30 disabled:opacity-50">{loading ? "Refreshing…" : "Refresh"}</button>
          </div>
        </section>

        {error && <div className="mb-5 rounded-2xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm font-semibold text-red-200">{error}</div>}

        <section className="grid grid-cols-3 gap-3 sm:gap-5">
          <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-4 sm:p-5"><p className="text-xs uppercase tracking-wider text-white/35">Rounds</p><p className="mt-2 text-2xl font-black sm:text-3xl">{games.length}</p></div>
          <div className="rounded-2xl border border-emerald-400/10 bg-emerald-400/[0.04] p-4 sm:p-5"><p className="text-xs uppercase tracking-wider text-white/35">Won</p><p className="mt-2 text-2xl font-black text-emerald-200 sm:text-3xl">{stats.wins}</p></div>
          <div className="rounded-2xl border border-red-400/10 bg-red-400/[0.035] p-4 sm:p-5"><p className="text-xs uppercase tracking-wider text-white/35">Lost</p><p className="mt-2 text-2xl font-black text-red-200 sm:text-3xl">{stats.losses}</p></div>
        </section>

        <section className="mt-5 rounded-3xl border border-white/10 bg-white/[0.035] shadow-2xl">
          <div className="flex items-center justify-between border-b border-white/10 px-5 py-5 sm:px-7">
            <div><p className="text-xs font-bold uppercase tracking-[0.16em] text-white/35">Recent rounds</p><h2 className="mt-1 text-xl font-black">Your activity</h2></div>
            <p className={`text-sm font-bold ${stats.net >= 0 ? "text-emerald-200" : "text-red-200"}`}>Net {stats.net >= 0 ? "+" : "-"}{rupees(String(Math.abs(stats.net)))}</p>
          </div>

          {loading ? (
            <div className="px-5 py-16 text-center text-sm text-white/40">Loading your games…</div>
          ) : games.length === 0 ? (
            <div className="px-5 py-16 text-center"><p className="text-lg font-bold">No games yet</p><p className="mt-2 text-sm text-white/40">Play Dice or Coin Toss and your rounds will appear here.</p><a href="/games" className="mt-5 inline-flex rounded-xl bg-white px-4 py-3 text-sm font-bold text-black">Play a game</a></div>
          ) : (
            <>
              <div className="hidden overflow-x-auto md:block">
                <table className="w-full text-left text-sm">
                  <thead className="border-b border-white/10 text-xs uppercase tracking-wider text-white/30"><tr><th className="px-7 py-4">Game</th><th className="px-4 py-4">Prediction</th><th className="px-4 py-4">Result</th><th className="px-4 py-4">Stake</th><th className="px-4 py-4">Payout</th><th className="px-4 py-4">Net</th><th className="px-7 py-4">Date</th></tr></thead>
                  <tbody>{games.map((game) => { const net = netAmount(game); const won = Number(game.payoutPaise) > 0; return <tr key={game.id} className="border-b border-white/[0.06] last:border-0 hover:bg-white/[0.02]"><td className="px-7 py-5"><p className="font-bold">{game.type === "DICE" ? "⚄ Dice Roll" : "◉ Coin Toss"}</p><p className="mt-1 text-xs text-white/30">{game.status}</p></td><td className="px-4 py-5 font-semibold">{predictionLabel(game)}</td><td className="px-4 py-5 font-semibold">{resultLabel(game)}</td><td className="px-4 py-5">{rupees(game.stakePaise)}</td><td className="px-4 py-5">{rupees(game.payoutPaise)}</td><td className={`px-4 py-5 font-black ${won ? "text-emerald-200" : "text-red-200"}`}>{net >= 0 ? "+" : "-"}{rupees(String(Math.abs(net)))}</td><td className="px-7 py-5 text-white/45">{new Date(game.createdAt).toLocaleString()}</td></tr>; })}</tbody>
                </table>
              </div>
              <div className="divide-y divide-white/[0.06] md:hidden">{games.map((game) => { const net = netAmount(game); const won = Number(game.payoutPaise) > 0; return <article key={game.id} className="p-5"><div className="flex items-start justify-between gap-4"><div><p className="font-bold">{game.type === "DICE" ? "⚄ Dice Roll" : "◉ Coin Toss"}</p><p className="mt-1 text-xs text-white/30">{new Date(game.createdAt).toLocaleString()}</p></div><span className={`rounded-full px-3 py-1 text-xs font-bold ${won ? "bg-emerald-400/10 text-emerald-200" : "bg-red-400/10 text-red-200"}`}>{won ? "WON" : "LOST"}</span></div><div className="mt-4 grid grid-cols-2 gap-3 text-sm"><div><p className="text-xs text-white/30">Prediction</p><p className="mt-1 font-bold">{predictionLabel(game)}</p></div><div><p className="text-xs text-white/30">Result</p><p className="mt-1 font-bold">{resultLabel(game)}</p></div><div><p className="text-xs text-white/30">Stake</p><p className="mt-1 font-bold">{rupees(game.stakePaise)}</p></div><div><p className="text-xs text-white/30">Payout</p><p className="mt-1 font-bold">{rupees(game.payoutPaise)}</p></div></div><div className={`mt-4 rounded-xl bg-black/20 p-3 text-sm font-bold ${won ? "text-emerald-200" : "text-red-200"}`}>Net {net >= 0 ? "+" : "-"}{rupees(String(Math.abs(net)))}</div></article>; })}</div>
            </>
          )}
        </section>
      </div>
    </main>
  );
}
