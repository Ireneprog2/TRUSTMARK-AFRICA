const guides = [
  { title: "Mobile money requests", body: "Pause before sending money to a number in an unexpected message. Confirm the request with the person or business using a contact method you already trust." },
  { title: "One-time passcodes", body: "Never share an OTP, PIN, or password with someone who contacts you. Support staff should not need your authentication codes." },
  { title: "Job and investment offers", body: "Be cautious when an offer promises guaranteed returns or asks for upfront fees. Verify organizations through independently found official channels." },
  { title: "Links and account warnings", body: "Avoid signing in through an unexpected link. Open the organization’s official app or type its known address yourself to check account notices." },
];

export default function EducationPage() {
  return <div className="page-content">
    <div className="page-heading"><div><div className="eyebrow">Practical digital safety</div><h1>Safety guides</h1><p className="heading-copy">Simple checks for common digital risks. No single sign proves a message is fraudulent.</p></div></div>
    <div className="education-grid">{guides.map((guide, index) => <article className="education-item" key={guide.title}><span className="education-index">0{index + 1}</span><h2>{guide.title}</h2><p>{guide.body}</p></article>)}</div>
  </div>;
}