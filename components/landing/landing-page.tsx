import Link from "next/link";
import { ArrowDown, ArrowRight, BookOpenText, Check, ChevronDown, ShieldAlert, ShieldCheck } from "lucide-react";

const steps = [
  { number: "01", title: "Paste a message", text: "Share only the text you want checked. The starter analysis runs on this server and does not save the message." },
  { number: "02", title: "Review the signals", text: "See which wording patterns were matched and why they may deserve a closer look." },
  { number: "03", title: "Verify independently", text: "Use practical next steps to check a sender or request through a channel you already trust." },
];

const guides = [
  { title: "Mobile money requests", text: "Verify the recipient before transferring money.", icon: ShieldCheck },
  { title: "OTP and PIN safety", text: "Never disclose codes to someone who contacts you.", icon: ShieldAlert },
  { title: "Unexpected job offers", text: "Check the organization before paying a fee.", icon: BookOpenText },
];

export function LandingPage() {
  return <main className="landing min-h-screen">
    <header className="landing-nav">
      <Link aria-label="TrustMark Africa home" className="landing-brand" href="/"><span className="brand-mark"><ShieldCheck size={19} /></span><span>trustmark<span> africa</span></span></Link>
      <nav aria-label="Main navigation" className="landing-links"><Link href="/alerts">Community alerts</Link><Link href="/education">Safety guides</Link><Link href="/assistant">Help &amp; translation</Link><Link href="/login">Sign in</Link><Link className="landing-nav-cta" href="/analyze">Check a message <ArrowRight size={15} /></Link></nav>
    </header>

    <section className="landing-hero">
      <div className="hero-copy hero-center">
        <div className="landing-kicker"><span /> DIGITAL SAFETY, BUILT FOR EVERYDAY LIFE</div>
        <h1>TrustMark Africa</h1>
        <p className="hero-tagline">Verify before you trust.</p>
        <p>Get a clearer view of suspicious messages, understand common warning signs, and take a moment to verify before you act.</p>
        <div className="hero-actions"><Link className="button" href="/analyze"><ShieldCheck size={16} /> Check a message</Link><Link className="hero-secondary" href="/alerts">Explore community alerts <ArrowRight size={15} /></Link></div>
        <div className="hero-note"><ShieldCheck size={15} /> Your message is checked without saving its text.</div>
      </div>
      <a className="hero-scroll" href="#how-it-works"><ArrowDown size={14} /> HOW IT WORKS</a>
    </section>

    <section aria-label="Example message review" className="analysis-preview">
      <div className="preview-copy"><div className="eyebrow">A second look, in seconds</div><h2>Understand the signals.<br />Choose your next step.</h2><p>A transparent pattern check shows why a message may need review. The example below is illustrative, not a live alert.</p></div>
      <div className="hero-art">
        <div aria-hidden="true" className="art-orbit orbit-one" /><div aria-hidden="true" className="art-orbit orbit-two" />
        <div className="review-card">
          <div className="review-card-head"><span className="review-icon"><ShieldAlert size={18} /></span><span>MESSAGE REVIEW</span><span className="review-status">EXAMPLE</span></div>
          <p className="review-message">“Urgent: your mobile money account is locked. Visit https://example.invalid to verify your details now.”</p>
          <div className="review-divider" />
          <div className="review-risk"><div><span className="risk-caption">RULE-BASED SCREEN</span><strong>MEDIUM · Review carefully</strong></div><span className="risk-mark"><ShieldAlert size={19} /></span></div>
          <div className="review-signal"><span>01</span><div><strong>Urgency or pressure</strong><small>Creates pressure to act quickly</small></div><Check size={15} /></div>
          <div className="review-signal"><span>02</span><div><strong>Account threat</strong><small>Verify through the official app or website</small></div><Check size={15} /></div>
          <div className="review-signal"><span>03</span><div><strong>Link included</strong><small>Do not sign in through an unexpected link</small></div><Check size={15} /></div>
          <div className="review-foot"><span className="review-dot" /> A pattern check is not a fraud verdict</div>
        </div>
        <div className="hero-stamp"><span>RW</span><small>STARTING<br />IN RWANDA</small></div>
      </div>
    </section>

    <section className="landing-trustline"><span><ShieldCheck size={17} /> Transparent, explainable checks</span><span><Check size={17} /> No saved message text</span><span><BookOpenText size={17} /> Practical safety guidance</span></section>

    <section className="landing-section" id="how-it-works"><div className="section-heading"><div><div className="eyebrow">A calm second look</div><h2>Three steps. One better pause.</h2></div><p>TrustMark helps you review patterns. You stay in control of what you do next.</p></div><div className="steps-grid">{steps.map((step) => <article className="step-item" key={step.number}><span>{step.number}</span><h3>{step.title}</h3><p>{step.text}</p></article>)}</div></section>

    <section className="landing-feature-band"><div><div className="eyebrow">A useful signal, not a verdict</div><h2>See why a message<br />may deserve a closer look.</h2><p>The message checker looks for common patterns like urgent pressure, requests for authentication codes, unexpected payment requests, and suspicious links. It explains what it found and where uncertainty remains.</p><Link className="button" href="/analyze">Try the message checker <ArrowRight size={15} /></Link></div><div className="feature-callout"><span className="callout-mark"><ShieldCheck size={21} /></span><strong>Low risk is not a guarantee of safety.</strong><p>New or carefully written scams can avoid common signals. Verify requests through a separate trusted channel.</p></div></section>

    <section className="landing-section guide-section"><div className="section-heading"><div><div className="eyebrow">Everyday protection</div><h2>Know the patterns.<br />Keep your options open.</h2></div><Link className="panel-link" href="/education">All safety guides <ArrowRight size={14} /></Link></div><div className="guide-grid">{guides.map(({ title, text, icon: Icon }, index) => <Link className="guide-card" href="/education" key={title}><span className="guide-icon"><Icon size={19} /></span><small>SAFETY NOTE 0{index + 1}</small><h3>{title}</h3><p>{text}</p><span className="guide-arrow"><ArrowRight size={16} /></span></Link>)}</div></section>

    <section className="landing-faq"><div><div className="eyebrow">Clear about what we do</div><h2>Questions worth asking.</h2></div><div className="faq-list"><details><summary>Does a low-risk result mean a message is safe?<ChevronDown size={16} /></summary><p>No. It means this limited rules-based check did not match common warning patterns. Always verify unexpected requests through an independent channel.</p></details><details><summary>Is my message stored or sent to an AI provider?<ChevronDown size={16} /></summary><p>The current checker uses deterministic rules on the application server. Message text is not saved or sent to an external AI provider.</p></details><details><summary>Are community alerts proof that someone committed fraud?<ChevronDown size={16} /></summary><p>No. Community submissions are reports, not established facts. Only reviewed and sanitized reports may appear as public alerts.</p></details></div></section>

    <footer className="landing-footer"><Link aria-label="TrustMark Africa home" className="landing-brand" href="/"><span className="brand-mark"><ShieldCheck size={18} /></span><span>trustmark<span> africa</span></span></Link><span className="footer-tagline">Verify before you trust.</span><nav aria-label="Footer navigation"><Link href="/education">About &amp; safety</Link><Link href="/alerts">Community alerts</Link><Link href="/privacy">Privacy</Link><Link href="/terms">Terms</Link><span>Contact details pending</span></nav><small>Community reports are signals for review, not proof of wrongdoing.</small></footer>
  </main>;
}