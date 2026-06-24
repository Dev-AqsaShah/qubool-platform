import { FadeUp } from "@/components/FadeUp";
import { PhotoPrivacyDemo } from "@/components/PhotoPrivacyDemo";

export function ProfileDemo() {
  return (
    <section className="qb-section">
      <div className="wrap demo-sec">
        <FadeUp>
          <span className="eyebrow">Photo privacy, shown</span>
          <h2 style={{ fontSize: "clamp(1.9rem, 4vw, 2.7rem)", marginTop: 12 }}>
            Nothing is revealed until you allow it.
          </h2>
          <p className="lead">
            A profile leads with who someone is — their values and intentions —
            not their photo. The picture stays blurred until there&apos;s a
            mutual match, or until you approve a request to view.
          </p>
          <ul>
            <li>
              <span className="tick">✓</span> Blurred by default — tap to see how
              &quot;request to view&quot; works.
            </li>
            <li>
              <span className="tick">✓</span> Verified badge shows the person is
              real.
            </li>
            <li>
              <span className="tick">✓</span> Match score reflects shared values,
              not looks.
            </li>
          </ul>
        </FadeUp>
        <FadeUp>
          <PhotoPrivacyDemo />
        </FadeUp>
      </div>
    </section>
  );
}
