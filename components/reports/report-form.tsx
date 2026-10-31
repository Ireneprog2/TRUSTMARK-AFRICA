"use client";

import { useState } from "react";
import { LoaderCircle, Send } from "lucide-react";

const categories = [
  ["SMS", "SMS"],
  ["WHATSAPP", "WhatsApp"],
  ["EMAIL", "Email"],
  ["PHONE_CALL", "Phone call"],
  ["WEBSITE", "Website"],
  ["SOCIAL_MEDIA", "Social media"],
  ["MOBILE_MONEY", "Mobile money"],
  ["OTHER", "Other"],
];

const countries = [
  ["RW", "Rwanda"], ["KE", "Kenya"], ["UG", "Uganda"], ["TZ", "Tanzania"],
  ["BI", "Burundi"], ["CD", "DR Congo"], ["NG", "Nigeria"], ["GH", "Ghana"],
  ["ZA", "South Africa"], ["ET", "Ethiopia"], ["SN", "Senegal"], ["OTHER", "Other"],
];

export function ReportForm() {
  const [category, setCategory] = useState("SMS");
  const [countryCode, setCountryCode] = useState("RW");
  const [description, setDescription] = useState("");
  const [messageExcerpt, setMessageExcerpt] = useState("");
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setSubmitted(false);
    try {
      const response = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category, countryCode: countryCode === "OTHER" ? "XX" : countryCode, description, messageExcerpt }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Report submission failed.");
      setSubmitted(true);
      setDescription("");
      setMessageExcerpt("");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Report submission failed.");
    } finally {
      setLoading(false);
    }
  }

  return <section className="content-panel">
    <form className="report-form" onSubmit={submit}>
      <div className="report-fields">
        <div className="form-field"><label className="field-label" htmlFor="report-category">Channel</label><select className="form-control" id="report-category" onChange={(event) => setCategory(event.target.value)} value={category}>{categories.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></div>
        <div className="form-field"><label className="field-label" htmlFor="report-country">Country</label><select className="form-control" id="report-country" onChange={(event) => setCountryCode(event.target.value)} value={countryCode}>{countries.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></div>
      </div>
      <div className="form-field"><label className="field-label" htmlFor="report-description">What happened?</label><textarea className="message-input report-description" id="report-description" maxLength={2000} minLength={20} onChange={(event) => setDescription(event.target.value)} placeholder="Describe the request or behavior without naming or accusing a person." required value={description} /><span className="char-count">{description.length}/2,000 characters. Do not include names, account numbers, or contact details.</span></div>
      <div className="form-field"><label className="field-label" htmlFor="report-excerpt">Message excerpt <span className="optional-label">Optional</span></label><textarea className="message-input report-excerpt" id="report-excerpt" maxLength={500} onChange={(event) => setMessageExcerpt(event.target.value)} placeholder="A short excerpt only; email addresses, links, and phone-like numbers are removed before storage." value={messageExcerpt} /></div>
      {error && <p className="form-error" role="alert">{error}</p>}
      {submitted && <p className="form-success" role="status">Your report was received for private review. It will not appear publicly unless it is reviewed and sanitized.</p>}
      <div className="form-actions"><span className="field-help report-disclaimer">Reports are community signals, not proof of wrongdoing.</span><button className="button" disabled={loading || description.trim().length < 20} type="submit">{loading ? <LoaderCircle className="spin" size={16} /> : <Send size={15} />}{loading ? "Submitting" : "Submit report"}</button></div>
    </form>
  </section>;
}