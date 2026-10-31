import { AuthForm } from "@/components/auth/auth-form";

export default function RegisterPage() {
  return <div className="auth-layout"><section className="auth-card"><div className="eyebrow">TrustMark Africa</div><h1>Create your account</h1><p className="heading-copy">Verify your email to set up a workspace.</p><AuthForm mode="register" /></section></div>;
}