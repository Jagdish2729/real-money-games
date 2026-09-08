"use client";

import { useEffect, useState } from "react";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
type Deposit = { id: string; amountPaise: string; utr: string; proofUrl: string | null; status: string; rejectionReason: string | null; createdAt: string; phoneNumber: string };
type Dashboard = { pendingDeposits: number; pendingWithdrawals: number; totalUsers: number; gamesToday: number };
const money = (paise: string) => `₹${(Number(paise) / 100).toFixed(2)}`;

export default function AdminPage() {
  const [key, setKey] = useState("");
  const [authenticated, setAuthenticated] = useState(false);
  const [dashboard, setDashboard] = useState<Dashboard | null>(null);
  const [deposits, setDeposits] = useState<Deposit[]>([]);
  const [status, setStatus] = useState("PENDING");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function api(path: string, options: RequestInit = {}) {
    const response = await fetch(`${API_BASE_URL}${path}`, { ...options, headers: { "Content-Type": "application/json", "x-admin-key": key, ...(options.headers || {}) } });
    const data = await response.json().catch(() => null);
    if (!response.ok) throw new Error(data?.message ?? "Admin request failed");
    return data;
  }

  async function loadData(nextStatus = status) {
    if (!key.trim()) { setMessage("Enter the admin API key first."); return; }
    setLoading(true); setMessage("");
    try { const [dash, list] = await Promise.all([api("/admin/dashboard"), api(`/admin/deposits?status=${nextStatus}`)]); setDashboard(dash); setDeposits(list); setAuthenticated(true); }
    catch (error) { setAuthenticated(false); setMessage(error instanceof Error ? error.message : "Unable to connect to admin API"); }
    finally { setLoading(false); }
  }

  useEffect(() => { if (authenticated) void loadData(status); }, [status]);

  async function approve(id: string) {
    if (!confirm("Approve this deposit and credit the user's wallet?")) return;
    setLoading(true); setMessage("");
    try { await api(`/admin/deposits/${id}/approve`, { method: "POST" }); setMessage("Deposit approved and wallet credited."); await loadData(status); }
    catch (error) { setMessage(error instanceof Error ? error.message : "Approval failed"); setLoading(false); }
  }

  async function reject(id: string) {
    const reason = prompt("Reason for rejection:");
    if (!reason?.trim()) return;
    setLoading(true); setMessage("");
    try { await api(`/admin/deposits/${id}/reject`, { method: "POST", body: JSON.stringify({ reason }) }); setMessage("Deposit rejected."); await loadData(status); }
    catch (error) { setMessage(error instanceof Error ? error.message : "Rejection failed"); setLoading(false); }
  }

  const cardStyle: React.CSSProperties = { border: "1px solid rgba(255,255,255,.1)", borderRadius: 20, padding: 20, background: "rgba(255,255,255,.035)" };
  const buttonStyle: React.CSSProperties = { padding: "10px 14px", borderRadius: 10, border: "1px solid rgba(255,255,255,.12)", background: "transparent", color: "white", cursor: "pointer", fontWeight: 700 };

  return <main style={{ minHeight: "100vh", padding: "28px 18px" }}><div style={{ maxWidth: 1180, margin: "0 auto" }}>
    <header style={{ display: "flex", flexWrap: "wrap", gap: 20, justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid rgba(255,255,255,.1)", paddingBottom: 20 }}>
      <div><div style={{ fontSize: 12, letterSpacing: 3, opacity: .45 }}>ROLLRUSH</div><h1 style={{ margin: "6px 0 0", fontSize: 30 }}>Admin Dashboard</h1></div>
      {authenticated && <button onClick={() => { setAuthenticated(false); setDashboard(null); setDeposits([]); setKey(""); }} style={buttonStyle}>Sign out</button>}
    </header>

    {!authenticated ? <section style={{ maxWidth: 560, margin: "70px auto", ...cardStyle }}>
      <p style={{ fontSize: 12, letterSpacing: 2, opacity: .4 }}>SECURE OPERATIONS</p><h2 style={{ margin: "8px 0" }}>Admin access</h2>
      <p style={{ opacity: .5, lineHeight: 1.6 }}>Enter the API key configured in your API environment. It stays only in this page's memory.</p>
      <input value={key} onChange={e => setKey(e.target.value)} type="password" autoComplete="off" placeholder="Admin API key" onKeyDown={e => { if (e.key === "Enter") void loadData(); }} style={{ width: "100%", padding: 14, borderRadius: 12, border: "1px solid rgba(255,255,255,.12)", background: "rgba(0,0,0,.25)", color: "white" }} />
      <button disabled={loading} onClick={() => void loadData()} style={{ width: "100%", marginTop: 12, padding: 14, border: 0, borderRadius: 12, fontWeight: 800, cursor: "pointer", opacity: loading ? .6 : 1 }}>{loading ? "Connecting..." : "Open dashboard"}</button>
      {message && <p style={{ color: "#f87171", marginTop: 14 }}>{message}</p>}
    </section> : <>
      <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(210px,1fr))", gap: 14, marginTop: 26 }}>
        {[['Pending deposits', dashboard?.pendingDeposits], ['Pending withdrawals', dashboard?.pendingWithdrawals], ['Total users', dashboard?.totalUsers], ['Games today', dashboard?.gamesToday]].map(([label, value]) => <div key={String(label)} style={cardStyle}><div style={{ fontSize: 12, opacity: .4 }}>{label}</div><div style={{ fontSize: 32, fontWeight: 800, marginTop: 8 }}>{value ?? "—"}</div></div>)}
      </section>
      <section style={{ marginTop: 18, ...cardStyle }}><div style={{ display: "flex", flexWrap: "wrap", gap: 12, justifyContent: "space-between", alignItems: "center" }}><div><h2 style={{ margin: 0 }}>Deposit requests</h2><p style={{ margin: "6px 0 0", opacity: .4, fontSize: 13 }}>Verify payment details before crediting the wallet.</p></div><div style={{ display: "flex", gap: 8 }}>{['PENDING','APPROVED','REJECTED'].map(item => <button key={item} onClick={() => setStatus(item)} style={{ ...buttonStyle, background: status === item ? "white" : "transparent", color: status === item ? "black" : "white" }}>{item}</button>)}</div></div>
      {message && <div style={{ marginTop: 16, padding: 12, borderRadius: 12, background: "rgba(250,204,21,.08)", color: "#fde68a" }}>{message}</div>}
      <div style={{ marginTop: 18, display: "grid", gap: 10 }}>{deposits.length === 0 ? <div style={{ padding: 35, textAlign: "center", opacity: .4, border: "1px dashed rgba(255,255,255,.1)", borderRadius: 16 }}>No {status.toLowerCase()} deposits.</div> : deposits.map(d => <div key={d.id} style={{ border: "1px solid rgba(255,255,255,.08)", borderRadius: 18, padding: 16, background: "rgba(0,0,0,.16)" }}><div style={{ display: "flex", justifyContent: "space-between", gap: 14 }}><div><div style={{ fontSize: 18, fontWeight: 800 }}>{money(d.amountPaise)}</div><div style={{ marginTop: 5, fontSize: 13, opacity: .55 }}>{d.phoneNumber} · UTR <b style={{ color: "white" }}>{d.utr}</b></div><div style={{ marginTop: 5, fontSize: 12, opacity: .35 }}>{new Date(d.createdAt).toLocaleString()}</div></div><span style={{ borderRadius: 999, padding: "6px 10px", fontSize: 11, fontWeight: 800, background: "rgba(255,255,255,.08)", height: "fit-content" }}>{d.status}</span></div>{d.proofUrl && <a href={d.proofUrl} target="_blank" rel="noreferrer" style={{ display: "inline-block", marginTop: 12, fontSize: 13, textDecoration: "underline", opacity: .7 }}>View payment proof →</a>}{d.status === 'PENDING' && <div style={{ display: "flex", gap: 9, marginTop: 14 }}><button disabled={loading} onClick={() => void approve(d.id)} style={{ ...buttonStyle, background: "white", color: "black" }}>Approve & credit</button><button disabled={loading} onClick={() => void reject(d.id)} style={{ ...buttonStyle, color: "#fca5a5", borderColor: "rgba(248,113,113,.3)" }}>Reject</button></div>}{d.rejectionReason && <div style={{ marginTop: 12, fontSize: 13, color: "#fca5a5" }}>Reason: {d.rejectionReason}</div>}</div>)}</div></section>
    </>}
  </div></main>;
}
