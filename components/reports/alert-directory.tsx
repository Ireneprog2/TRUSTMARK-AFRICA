"use client";

import { useEffect, useState } from "react";
import { Search } from "lucide-react";

type AlertRecord = {
  id: string;
  title: string;
  description: string;
  category: string;
  countryCode: string;
  safetyRecommendation: string;
  reviewedAt: string;
};

const categories = ["SMS", "WHATSAPP", "EMAIL", "PHONE_CALL", "WEBSITE", "SOCIAL_MEDIA", "MOBILE_MONEY", "OTHER"];
const countries = [["RW", "Rwanda"], ["KE", "Kenya"], ["UG", "Uganda"], ["TZ", "Tanzania"], ["BI", "Burundi"], ["CD", "DR Congo"], ["NG", "Nigeria"], ["GH", "Ghana"], ["ZA", "South Africa"], ["ET", "Ethiopia"], ["SN", "Senegal"]];

export function AlertDirectory() {
  const [filters, setFilters] = useState("");
  const [alerts, setAlerts] = useState<AlertRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError("");
    fetch(`/api/alerts${filters ? `?${filters}` : ""}`, { signal: controller.signal })
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.error ?? "Alerts could not be loaded.");
        return data as { alerts: AlertRecord[] };
      })
      .then((data) => setAlerts(data.alerts))
      .catch((caught: unknown) => {
        if (!controller.signal.aborted) setError(caught instanceof Error ? caught.message : "Alerts could not be loaded.");
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [filters]);

  function applyFilters(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const params = new URLSearchParams();
    for (const key of ["query", "countryCode", "category", "from", "to"]) {
      const value = String(form.get(key) ?? "").trim();
      if (value) params.set(key, value);
    }
    setFilters(params.toString());
  }

  return <div className="alert-directory">
    <form className="alert-filters" onSubmit={applyFilters}>
      <label className="filter-search"><span className="sr-only">Search alerts</span><Search size={16} /><input aria-label="Search reviewed alerts" name="query" placeholder="Search reviewed alerts" /></label>
      <label><span className="sr-only">Country</span><select aria-label="Country" className="form-control" defaultValue="" name="countryCode"><option value="">All countries</option>{countries.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
      <label><span className="sr-only">Category</span><select aria-label="Category" className="form-control" defaultValue="" name="category"><option value="">All categories</option>{categories.map((category) => <option key={category} value={category}>{category.replaceAll("_", " ")}</option>)}</select></label>
      <label className="date-filter"><span>From</span><input aria-label="From date" className="form-control" name="from" type="date" /></label>
      <label className="date-filter"><span>To</span><input aria-label="To date" className="form-control" name="to" type="date" /></label>
      <button className="button" type="submit">Apply filters</button>
    </form>
    {error && <p className="form-error" role="alert">{error}</p>}
    {loading ? <p className="directory-state" role="status">Loading reviewed alerts...</p> : alerts.length === 0 && !error ? <div className="directory-state"><strong>No reviewed alerts found</strong><p>Only reviewed and sanitized reports appear here. Try a different filter or check back later.</p></div> : <div className="alert-results">{alerts.map((alert) => <article className="alert-item" key={alert.id}>
      <div className="alert-item-top"><span className="reviewed-badge">Reviewed</span><span>{alert.category.replaceAll("_", " ")} · {alert.countryCode}</span><time dateTime={alert.reviewedAt}>{new Intl.DateTimeFormat("en", { dateStyle: "medium" }).format(new Date(alert.reviewedAt))}</time></div>
      <h2>{alert.title}</h2><p>{alert.description}</p><div className="alert-recommendation"><strong>Safety recommendation</strong><p>{alert.safetyRecommendation}</p></div>
      <p className="alert-caveat">A community report is a signal for awareness, not proof of wrongdoing.</p>
    </article>)}</div>}
  </div>;
}