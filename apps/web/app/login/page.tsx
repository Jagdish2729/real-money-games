"use client";

import { FormEvent, useState } from "react";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export default function LoginPage() {
  const [phone, setPhone] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [developmentOtp, setDevelopmentOtp] = useState("");

  async function handleSendOtp(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setDevelopmentOtp("");
    if (!/^[6-9]\d{9}$/.test(phone)) { setError("Please enter a valid 10-digit mobile number."); return; }
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/auth/request-otp`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ phoneNumber: `+91${phone}` }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message ?? "Unable to send OTP");
      setOtpSent(true);
      if (data.developmentOtp) setDevelopmentOtp(data.developmentOtp);
    } catch (err) { setError(err instanceof Error ? err.message : "Unable to send OTP"); } finally { setLoading(false); }
  }

  async function handleVerify(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    if (otp.length !== 6) return;
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/auth/verify-otp`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ phoneNumber: `+91${phone}`, code: otp }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message ?? "OTP verification failed");
      localStorage.setItem("accessToken", data.accessToken);
      localStorage.setItem("user", JSON.stringify(data.user));
      window.location.href = "/games";
    } catch (err) { setError(err instanceof Error ? err.message : "OTP verification failed"); } finally { setLoading(false); }
  }

  return (
    <main className="min-h-screen bg-[#07080b] px-5 text-white">
      <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center py-10">
        <a href="/" className="mb-10 flex items-center gap-3 self-center">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-lg font-black text-black">R</span>
          <span className="font-bold tracking-tight">ROLLRUSH</span>
        </a>
        <section className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 shadow-2xl shadow-black/30 sm:p-8">
          <div className="mb-8"><p className="text-xs font-bold uppercase tracking-[0.18em] text-white/35">Account</p><h1 className="mt-2 text-3xl font-black tracking-tight">{otpSent ? "Enter your OTP" : "Welcome to RollRush"}</h1><p className="mt-3 text-sm leading-6 text-white/45">{otpSent ? `We sent a one-time password to +91 ${phone}.` : "Log in securely using your mobile number."}</p></div>
          {!otpSent ? (
            <form onSubmit={handleSendOtp} className="space-y-5">
              <label className="block"><span className="mb-2 block text-sm font-semibold text-white/70">Mobile number</span><div className="flex overflow-hidden rounded-2xl border border-white/10 bg-[#0c0e13] focus-within:border-white/30"><span className="flex items-center border-r border-white/10 px-4 text-sm font-semibold text-white/50">+91</span><input required inputMode="numeric" maxLength={10} value={phone} onChange={(event) => setPhone(event.target.value.replace(/\D/g, ""))} placeholder="Enter 10-digit number" className="min-w-0 flex-1 bg-transparent px-4 py-4 text-base outline-none placeholder:text-white/20" /></div></label>
              {error && <p className="rounded-xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-300">{error}</p>}
              <button type="submit" disabled={phone.length !== 10 || loading} className="w-full rounded-2xl bg-white py-4 text-sm font-bold text-black transition hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-40">{loading ? "Sending OTP..." : "Send OTP"}</button>
            </form>
          ) : (
            <form onSubmit={handleVerify} className="space-y-5">
              <label className="block"><span className="mb-2 block text-sm font-semibold text-white/70">6-digit OTP</span><input required autoFocus inputMode="numeric" maxLength={6} value={otp} onChange={(event) => setOtp(event.target.value.replace(/\D/g, ""))} placeholder="••••••" className="w-full rounded-2xl border border-white/10 bg-[#0c0e13] px-4 py-4 text-center text-2xl tracking-[0.45em] outline-none placeholder:text-white/20 focus:border-white/30" /></label>
              {developmentOtp && <div className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white/60">Development OTP: <span className="font-bold text-white">{developmentOtp}</span></div>}
              {error && <p className="rounded-xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-300">{error}</p>}
              <button type="submit" disabled={otp.length !== 6 || loading} className="w-full rounded-2xl bg-white py-4 text-sm font-bold text-black transition hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-40">{loading ? "Verifying..." : "Verify & Continue"}</button>
              <button type="button" onClick={() => { setOtpSent(false); setOtp(""); setError(""); setDevelopmentOtp(""); }} className="w-full py-2 text-sm font-semibold text-white/45 hover:text-white">Change mobile number</button>
            </form>
          )}
          <p className="mt-7 border-t border-white/10 pt-5 text-center text-xs leading-5 text-white/30">By continuing, you agree to the platform terms and acknowledge the applicable game rules.</p>
        </section>
        <a href="/" className="mt-6 text-center text-sm font-semibold text-white/35 hover:text-white">← Back to RollRush</a>
      </div>
    </main>
  );
}
