"use client";

import { useState } from "react";
import { LoaderCircle, SearchCheck } from "lucide-react";

type Analysis = {
  riskLevel: "LOW" | "MEDIUM" | "HIGH";
  score: number;
  signals: Array<{ label: string; explanation: string; weight: number }>;
  summary: string;
  recommendedActions: string[];
  confidenceNote: string;
};

export function AnalyzerForm() {
  const [message, setMessage] = useState("");
  const [result, setResult] = useState<Analysis | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Analysis could not be completed.");
      setResult(data);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Analysis could not be completed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="content-panel">
      <form className="analyzer-form" onSubmit={submit}>
        <label className="field-label" htmlFor="message">Message to review</label>
        <p className="field-help">Paste message text only. Avoid including passwords, account numbers, or other sensitive information.</p>
        <textarea className="message-input" id="message" maxLength={5000} onChange={(event) => setMessage(event.target.value)} placeholder="Paste a message, email, or offer here..." required value={message} />
        <div className="form-actions"><span className="char-count">{message.length}/5,000 characters</span><button className="button" disabled={loading || !message.trim()} type="submit">{loading ? <LoaderCircle className="spin" size={16} /> : <SearchCheck size={16} />}{loading ? "Checking" : "Check message"}</button></div>
      </form>
      {error && <p role="alert" style={{ color: "#a13e25", margin: "16px 0 0", fontSize: 12 }}>{error}</p>}
      {result && <section aria-live="polite" className={`result ${result.riskLevel === "LOW" ? "low" : ""} ${result.riskLevel === "HIGH" ? "high" : ""}`}>
        <div className="result-topline"><span className={`risk-label ${result.riskLevel === "LOW" ? "safe" : ""}`}>{result.riskLevel} risk</span><strong>Risk score {result.score}/100</strong></div>
        <h2>{result.riskLevel === "LOW" ? "No common warning signs found" : "Review this message carefully"}</h2>
        <p>{result.summary}</p>
        {result.signals.length > 0 && <div className="result-signals"><h3>Indicators found</h3>{result.signals.map((signal) => <article key={signal.label}><strong>{signal.label}</strong><p>{signal.explanation}</p></article>)}</div>}
        <div className="result-actions"><h3>What to do next</h3><ul>{result.recommendedActions.map((action) => <li key={action}>{action}</li>)}</ul></div>
        <p className="result-limit">{result.confidenceNote}</p>
      </section>}
    </div>
  );
}