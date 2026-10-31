"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type AuthFormProps = { mode: "login" | "register" };

export function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const isRegistration = mode === "register";
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [verificationStep, setVerificationStep] = useState(false);
  const [secondsRemaining, setSecondsRemaining] = useState(0);
  const [resendSecondsRemaining, setResendSecondsRemaining] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!verificationStep || (secondsRemaining <= 0 && resendSecondsRemaining <= 0)) return;
    const timer = window.setTimeout(() => {
      setSecondsRemaining((remaining) => Math.max(0, remaining - 1));
      setResendSecondsRemaining((remaining) => Math.max(0, remaining - 1));
    }, 1000);
    return () => window.clearTimeout(timer);
  }, [resendSecondsRemaining, secondsRemaining, verificationStep]);

  async function submitRegistration() {
    setError("");
    setMessage("");
    setBusy(true);
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await response.json() as { error?: string; message?: string; expiresAt?: string; retryAfterSeconds?: number };
      if (!response.ok) {
        if (data.retryAfterSeconds) setResendSecondsRemaining(data.retryAfterSeconds);
        throw new Error(data.error ?? "Could not start registration.");
      }
      const expiresAt = data.expiresAt ? new Date(data.expiresAt).getTime() : Number.NaN;
      if (!Number.isFinite(expiresAt)) throw new Error("The verification response was invalid. Please try again.");
      setVerificationStep(true);
      setSecondsRemaining(Math.max(0, Math.ceil((expiresAt - Date.now()) / 1000)));
      setResendSecondsRemaining(60);
      setMessage(data.message ?? `A verification code was sent to ${email}.`);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not start registration.");
    } finally {
      setBusy(false);
    }
  }

  async function submitVerification(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");
    setBusy(true);
    try {
      const response = await fetch("/api/auth/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code }),
      });
      const data = await response.json() as { error?: string };
      if (!response.ok) throw new Error(data.error ?? "Could not verify the code.");
      router.replace("/dashboard");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not verify the code.");
    } finally {
      setBusy(false);
    }
  }

  async function submitLogin(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setBusy(true);
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json() as { error?: string };
      if (!response.ok) throw new Error(data.error ?? "Could not sign in.");
      router.replace("/dashboard");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not sign in.");
    } finally {
      setBusy(false);
    }
  }

  if (isRegistration && verificationStep) {
    return <form className="auth-fields" onSubmit={submitVerification}>
      <p className="auth-note">Enter the six-digit code sent to <strong>{email}</strong>. The code expires in five minutes.</p>
      <label className="field-label" htmlFor="verification-code">Email verification code</label>
      <input autoComplete="one-time-code" autoFocus className="verification-code-input" id="verification-code" inputMode="numeric" maxLength={6} onChange={(event) => setCode(event.target.value.replace(/\D/g, "").slice(0, 6))} pattern="[0-9]{6}" required value={code} />
      {secondsRemaining > 0
        ? <p className="auth-note" role="timer">Code expires in {Math.floor(secondsRemaining / 60)}:{String(secondsRemaining % 60).padStart(2, "0")}.</p>
        : <p className="form-error" role="alert">This code has expired. Request a new one to continue.</p>}
      {error && <p className="form-error" role="alert">{error}</p>}
      {message && <p className="form-success" role="status">{message}</p>}
      <button className="button" disabled={busy || code.length !== 6 || secondsRemaining <= 0} type="submit">{busy ? "Verifying..." : "Verify email and create account"}</button>
      <button className="auth-secondary-button" disabled={busy || resendSecondsRemaining > 0} onClick={submitRegistration} type="button">{busy ? "Sending..." : resendSecondsRemaining > 0 ? `Send a new code in ${Math.floor(resendSecondsRemaining / 60)}:${String(resendSecondsRemaining % 60).padStart(2, "0")}` : "Send a new code"}</button>
      <button className="auth-secondary-button" disabled={busy} onClick={() => { setVerificationStep(false); setCode(""); setError(""); setMessage(""); }} type="button">Change registration details</button>
    </form>;
  }

  return <form className="auth-fields" onSubmit={isRegistration ? (event) => { event.preventDefault(); void submitRegistration(); } : submitLogin}>
    {isRegistration && <>
      <label className="field-label" htmlFor="name">Full name</label>
      <input autoComplete="name" id="name" maxLength={80} onChange={(event) => setName(event.target.value)} required value={name} />
    </>}
    <label className="field-label" htmlFor="email">Email</label>
    <input autoComplete="email" id="email" maxLength={254} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" required type="email" value={email} />
    <label className="field-label" htmlFor="password">Password</label>
    <input autoComplete={isRegistration ? "new-password" : "current-password"} id="password" maxLength={128} minLength={isRegistration ? 10 : undefined} onChange={(event) => setPassword(event.target.value)} required suppressHydrationWarning type="password" value={password} />
    {isRegistration && <p className="auth-note">Use at least 10 characters. We&apos;ll email you a code that expires in five minutes.</p>}
    {error && <p className="form-error" role="alert">{error}</p>}
    <button className="button" disabled={busy || (isRegistration && name.trim().length < 2)} type="submit">{busy ? (isRegistration ? "Sending code..." : "Signing in...") : (isRegistration ? "Continue with email verification" : "Sign in")}</button>
    <p className="auth-note">{isRegistration ? "Already have an account? " : "Need an account? "}<Link className="panel-link" href={isRegistration ? "/login" : "/register"}>{isRegistration ? "Sign in" : "Create account"}</Link></p>
  </form>;
}
