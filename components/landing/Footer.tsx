import Link from "next/link";
import { BrandMark } from "@/components/UnionMotif";

export function Footer() {
  return (
    <footer className="qb-footer">
      <div className="wrap foot-grid">
        <div>
          <div className="brand">
            <BrandMark />
            Qubool
          </div>
          <p className="disc">
            Qubool is for adults seeking marriage and serious, respectful
            connections. We verify members and moderate content to keep the
            community safe.
          </p>
        </div>
        <div className="foot-links">
          <div>
            <a href="#how">How it works</a>
            <a href="#safety">Safety</a>
            <a href="#pricing">Pricing</a>
          </div>
          <div>
            <Link href="/sign-in">Sign in</Link>
            <Link href="/privacy">Privacy</Link>
            <Link href="/community-rules">Community rules</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
