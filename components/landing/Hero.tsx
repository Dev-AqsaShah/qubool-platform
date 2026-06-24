import Link from "next/link";
import { UnionMotif } from "@/components/UnionMotif";

export function Hero() {
  return (
    <header className="hero">
      <div>
        <span className="eyebrow">Verified profiles · Women in control · Marriage-minded</span>
        <h1>
          Find your other half — without giving up your{" "}
          <span className="serif-em">privacy</span>.
        </h1>
        <p className="lead">
          Qubool is a matrimonial platform for people serious about marriage. Your
          photo stays private until you both agree. She decides who can message.
          Your family can be part of it.
        </p>
        <div className="cta-row">
          <Link href="/sign-up" className="btn btn-primary">
            Start your 3-day free trial
          </Link>
          <a href="#how" className="btn btn-ghost">
            How it works
          </a>
        </div>
        <div className="trust">
          <span>No casual dating.</span>
          <span className="sep">·</span>
          <span>
            Every profile <b>verified</b>.
          </span>
          <span className="sep">·</span>
          <span>PKR &amp; international payments.</span>
        </div>
      </div>

      <div className="union-wrap">
        <UnionMotif />
      </div>
    </header>
  );
}
