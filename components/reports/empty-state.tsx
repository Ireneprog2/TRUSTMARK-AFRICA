import { Inbox } from "lucide-react";

export function EmptyState({ title, description }: { title: string; description: string }) {
  return <div className="empty-state"><span className="empty-state-icon"><Inbox size={18} /></span><h2>{title}</h2><p>{description}</p></div>;
}