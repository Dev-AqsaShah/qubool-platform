import { ScrollRevealText } from "@/components/ScrollRevealText";

export function Reveal() {
  return (
    <section className="reveal">
      <div className="wrap">
        <ScrollRevealText
          text="We built Qubool on one belief — that finding a life partner should feel safe, respectful, and fully in your control, never like being put on display."
          keyWords={["safe", "your", "control"]}
        />
      </div>
    </section>
  );
}
