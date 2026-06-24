import { FadeUp } from "@/components/FadeUp";

const features = [
  { icon: "🔒", title: "Photo privacy", body: "Your photo stays blurred until you match — or keep it on \"request to view\" so you decide, every time." },
  { icon: "✋", title: "She decides", body: "Women choose who is allowed to start the conversation. No unwanted messages, ever." },
  { icon: "👪", title: "Wali / Guardian mode", body: "Invite a trusted family member to oversee your chats — comfort for you and your family." },
  { icon: "✓", title: "Real, verified people", body: "Phone and selfie verification on every account. Fake profiles don't make it in." },
  { icon: "🛡️", title: "Quiet, safe spaces", body: "Block, report, screenshot protection, and profiles that never show up on Google." },
  { icon: "♥", title: "Matched on values", body: "Faith, family plans, lifestyle, language, and your dealbreakers — weighed by our matching model." },
];

export function Features() {
  return (
    <section id="features" className="qb-section">
      <div className="wrap">
        <FadeUp className="sec-head center" as="div">
          <span className="eyebrow">Built different</span>
          <h2>Respect and safety, by design.</h2>
        </FadeUp>
        <div className="feat">
          {features.map((f) => (
            <FadeUp key={f.title} className="fcard">
              <div className="ico">{f.icon}</div>
              <h3>{f.title}</h3>
              <p>{f.body}</p>
            </FadeUp>
          ))}
        </div>
      </div>
    </section>
  );
}
