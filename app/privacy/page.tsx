export default function PrivacyPage() {
  return <main className="page-content">
    <div className="page-heading"><div><div className="eyebrow">TrustMark Africa · Phase 1</div><h1>Privacy overview</h1><p className="heading-copy">What this starter currently processes, and what it does not.</p></div></div>
    <section className="content-panel policy-copy">
      <h2>Message analysis</h2><p>Message text sent to Analyze is checked by deterministic rules on this application&apos;s server. The analyzer does not send it to an external AI provider or store it in the database. Avoid entering passwords, PINs, OTPs, payment-card details, or other sensitive information.</p>
      <h2>Assistant and translation</h2><p>Common support answers work locally. When an operator configures an AI provider, assistant questions and translation text are sent to that provider only after you check the consent box. Text is not saved by this feature. Provider retention is governed by that provider&apos;s terms; do not include sensitive information.</p>
      <h2>Account verification</h2><p>Registration stores your email, display name, and a password hash. A six-digit verification code is sent through the configured email provider; only a keyed hash of the code is stored, and the code expires after five minutes. Verification email delivery is handled by that provider.</p>
      <h2>Community reports</h2><p>Report descriptions and optional excerpts are stored for review. Reports are private by default. Optional excerpts are redacted for common contact details, links, numbers, and credential values, but automatic redaction can miss sensitive information; do not include it.</p>
      <h2>Technical data</h2><p>Report submissions use a keyed hash of the network address supplied by the hosting proxy for rate limiting. The original address is not stored by the rate-limit table. Configure the trusted proxy to set this header safely.</p>
      <h2>Retention and deletion</h2><p>Account deletion controls, report deletion, retention automation, and a public contact channel are not implemented yet. Do not submit a report if you need a deletion guarantee in this early release.</p>
      <h2>Limitations</h2><p>The checker is a limited rules-based aid, not a fraud verdict. AI assistant responses and translations can be inaccurate. A low-risk result does not guarantee safety. Community reports are allegations for review, not proof of wrongdoing.</p>
    </section>
  </main>;
}