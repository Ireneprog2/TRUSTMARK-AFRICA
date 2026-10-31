import { AuthForm } from "@/components/auth/auth-form";

export default function LoginPage() {
  return <div className="auth-layout"><section className="auth-card"><div className="eyebrow">TrustMark Africa</div><h1>Welcome back</h1><p className="heading-copy">Sign in to your workspace.</p><AuthForm mode="login" /></section></div>;
}