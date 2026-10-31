import { AlertDirectory } from "@/components/reports/alert-directory";

export default function AlertsPage() {
  return <div className="page-content">
    <div className="page-heading"><div><div className="eyebrow">Community safety</div><h1>Reviewed alerts</h1><p className="heading-copy">Community reports are signals for review, not proof of wrongdoing.</p></div></div>
    <AlertDirectory />
    <p className="field-help" style={{ marginTop: 14, lineHeight: 1.6 }}>Community reports are not proof of wrongdoing. Public alerts are limited to reviewed, sanitized information.</p>
  </div>;
}