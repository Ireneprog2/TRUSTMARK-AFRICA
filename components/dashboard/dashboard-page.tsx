import Link from "next/link";
import { ArrowUpRight, SearchCheck } from "lucide-react";

export function DashboardPage() {
  return (
    <div className="page-content">
      <div className="page-heading">
        <div><div className="eyebrow">TrustMark Africa</div><h1>Workspace overview</h1><p className="heading-copy">Your private activity will appear here when accounts and saved history are enabled.</p></div>
        <Link className="button" href="/analyze"><SearchCheck size={16} /> Check a message</Link>
      </div>
      <div className="overview-grid">
        <section className="panel">
          <div className="panel-heading"><h2 className="panel-title">Recent activity</h2><Link className="panel-link" href="/reports">View reports <ArrowUpRight size={13} /></Link></div>
          <div className="empty-state"><span className="empty-state-icon"><ActivityIcon /></span><h2>No activity yet</h2><p>Messages you check and reports you file will show up here.</p></div>
        </section>
        <section className="panel">
          <div className="panel-heading"><h2 className="panel-title">Start with a check</h2></div>
          <div className="signal-box"><div className="signal-number">01</div><p className="signal-copy">Paste a suspicious message to review common warning signs. The starter analyzer runs locally and is not a definitive fraud detector.</p></div>
          <p style={{ margin: "14px 0 0" }}><Link className="panel-link" href="/analyze">Open message analyzer <ArrowUpRight size={13} /></Link></p>
        </section>
      </div>
    </div>
  );
}

function ActivityIcon() {
  return <ArrowUpRight size={18} />;
}