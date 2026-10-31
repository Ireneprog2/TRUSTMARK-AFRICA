import { ReportForm } from "@/components/reports/report-form";

export default function ReportsPage() {
  return <div className="page-content">
    <div className="page-heading"><div><div className="eyebrow">Community safety</div><h1>Submit a report</h1><p className="heading-copy">Share a suspicious activity for private review. Reports are not proof of wrongdoing.</p></div></div>
    <ReportForm />
    <p className="field-help" style={{ marginTop: 14, lineHeight: 1.6 }}>Submissions are stored privately for review. Do not include passwords, PINs, OTPs, full account numbers, or identifying details.</p>
  </div>;
}