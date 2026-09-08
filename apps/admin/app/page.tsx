"use client";

import { useState } from "react";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

type Deposit = { id: string; amountPaise: string; utr: string; status: string; createdAt: string; };

export default function AdminPage() {
  const [key, setKey] = useState("");
  const [deposit, setDeposit] = useState<Deposit | null>(null);
  const [message, setMessage] = useState("");

  async function loadPending() {
    setMessage("Pending-deposit API is being wired next. Admin authentication is intentionally not exposed in the browser yet.");
  }

  return (
    <main style={{ minHeight: "100vh", padding: "32px 20px" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid rgba(255,255,255,.1)", paddingBottom: 20 }}>
          <div><div style={{ fontSize: 12, letterSpacing: 3, opacity: .45 }}>ROLLRUSH</div><h1 style={{ margin: "6px 0 0", fontSize: 30 }}>Admin Console</h1></div>
          <div style={{ fontSize: 13, opacity: .45 }}>Operations</div>
        </header>

        <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 14, marginTop: 28 }}>
          {["Pending deposits", "Pending withdrawals", "Total users", "Games today"].map((label) => (
            <div key={label} style={{ border: "1px solid rgba(255,255,255,.1)", borderRadius: 20, padding: 20, background: "rgba(255,255,255,.035)" }}>
              <div style={{ fontSize: 12, opacity: .4 }}>{label}</div><div style={{ fontSize: 32, fontWeight: 800, marginTop: 8 }}>—</div>
            </div>
          ))}
        </section>

        <section style={{ marginTop: 18, border: "1px solid rgba(255,255,255,.1)", borderRadius: 24, padding: 24, background: "rgba(255,255,255,.035)" }}>
          <h2 style={{ marginTop: 0 }}>Admin access</h2>
          <p style={{ opacity: .5, lineHeight: 1.6 }}>The API already uses an admin key for deposit approval. We will keep that credential server-side rather than storing it in browser local storage.</p>
          <input value={key} onChange={(e) => setKey(e.target.value)} type="password" placeholder="Admin key (local development)" style={{ width: "100%", maxWidth: 500, padding: 13, borderRadius: 12, border: "1px solid rgba(255,255,255,.12)", background: "rgba(0,0,0,.25)", color: "white" }} />
          <button onClick={loadPending} style={{ display: "block", marginTop: 12, padding: "12px 18px", border: 0, borderRadius: 12, fontWeight: 800, cursor: "pointer" }}>Open operations</button>
          {message && <p style={{ marginTop: 14, color: "#facc15" }}>{message}</p>}
          {deposit && <pre>{JSON.stringify(deposit, null, 2)}</pre>}
        </section>
      </div>
    </main>
  );
}
