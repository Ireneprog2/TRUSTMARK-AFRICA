import Link from "next/link";
import { Activity, Bell, BookOpenText, FileText, Languages, LayoutDashboard, ShieldCheck } from "lucide-react";

const links = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/analyze", label: "Analyze", icon: Activity },
  { href: "/reports", label: "Reports", icon: FileText },
  { href: "/alerts", label: "Alerts", icon: Bell },
  { href: "/education", label: "Guides", icon: BookOpenText },
  { href: "/assistant", label: "Help", icon: Languages },
];

export function AppShell({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="app-layout">
      <aside className="sidebar">
        <Link className="brand" href="/">
          <span className="brand-mark"><ShieldCheck size={19} /></span>
          <span className="brand-name">trustmark<span> africa</span></span>
        </Link>
        <div>
          <p className="nav-label">Workspace</p>
          <nav aria-label="Main navigation" className="nav-list">
            {links.map(({ href, label, icon: Icon }) => (
              <Link className="nav-link" href={href} key={href}>
                <Icon size={17} strokeWidth={1.8} />{label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="sidebar-bottom">
          <Link className="nav-link" href="/login">Sign in</Link>
          <div className="profile">
            <span className="avatar">TA</span>
            <div><div className="profile-name">Trust analyst</div><div className="profile-role">Local workspace</div></div>
          </div>
        </div>
      </aside>
      <div className="main-area">
        <header className="topbar">
          <span className="topbar-context">Trust &amp; safety workspace</span>
          <span className="topbar-date">Africa region</span>
        </header>
        <main>{children}</main>
      </div>
    </div>
  );
}