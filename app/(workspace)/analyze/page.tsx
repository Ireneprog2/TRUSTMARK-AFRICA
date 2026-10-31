import { AnalyzerForm } from "@/components/analyzer/analyzer-form";

export default function AnalyzePage() {
  return <div className="page-content">
    <div className="page-heading"><div><div className="eyebrow">Message review</div><h1>Analyze a message</h1><p className="heading-copy">Check text for common signs of scams and impersonation.</p></div></div>
    <AnalyzerForm />
    <p className="field-help" style={{ marginTop: 14, lineHeight: 1.6 }}>This starter uses simple keyword rules. A low-risk result does not verify a sender, link, or offer. Confirm claims through official channels.</p>
  </div>;
}