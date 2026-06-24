import { FadeUp } from "@/components/FadeUp";

export function Safety() {
  return (
    <section id="safety" className="qb-section">
      <div className="wrap">
        <FadeUp className="modes">
          <span className="eyebrow" style={{ color: "var(--gold-soft)" }}>
            One platform, two worlds
          </span>
          <h2>Built for your community — and beyond.</h2>
          <p>
            Qubool adapts to who&apos;s using it. A respectful, marriage-first
            experience at home; a more open experience for members abroad. Same
            safety and verification, everywhere.
          </p>
          <div className="mode-grid">
            <div className="mode">
              <h3>Pakistan · Rishta</h3>
              <p>Marriage-minded only, modesty-first, wali mode, and full privacy controls.</p>
            </div>
            <div className="mode">
              <h3>International</h3>
              <p>A more open way to meet for members abroad — with the same verification and reporting.</p>
            </div>
          </div>
        </FadeUp>
      </div>
    </section>
  );
}
