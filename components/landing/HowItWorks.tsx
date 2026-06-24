import { FadeUp } from "@/components/FadeUp";

const steps = [
  {
    num: "01",
    title: "Create a private profile",
    body: "Share basic details, your values, and what you're looking for. Adding a photo is optional — and never public by default.",
  },
  {
    num: "02",
    title: "Get matched on what matters",
    body: "Our model pairs you on faith, family plans, values, and your dealbreakers — not just on looks.",
  },
  {
    num: "03",
    title: "Connect on your terms",
    body: "She opens the conversation. Want oversight? Add a wali to be part of the chat. Talk only when you're both ready.",
  },
];

export function HowItWorks() {
  return (
    <section id="how" className="qb-section">
      <div className="wrap">
        <FadeUp className="sec-head">
          <span className="eyebrow">How it works</span>
          <h2>Three steps, made for serious intentions.</h2>
        </FadeUp>
        <div className="steps">
          {steps.map((s) => (
            <FadeUp key={s.num} className="step">
              <span className="num">{s.num}</span>
              <h3>{s.title}</h3>
              <p>{s.body}</p>
            </FadeUp>
          ))}
        </div>
      </div>
    </section>
  );
}
