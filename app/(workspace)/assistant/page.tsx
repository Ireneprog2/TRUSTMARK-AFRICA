import { AssistantPanel } from "@/components/assistant/assistant-panel";

export default function AssistantPage() {
  return <div className="page-content">
    <div className="page-heading"><div><div className="eyebrow">Support in three languages</div><h1>Help &amp; translation</h1><p className="heading-copy">Get help using TrustMark Africa or translate between Kinyarwanda, English, and French.</p></div></div>
    <AssistantPanel />
  </div>;
}