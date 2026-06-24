import Link from "next/link";
import { BrandMark } from "@/components/UnionMotif";

export function NavBar() {
  return (
    <nav className="qb-nav">
      <div className="brand">
        <BrandMark />
        Qubool
      </div>
      <div className="navlinks">
        <a href="#how">How it works</a>
        <a href="#safety">Safety</a>
        <a href="#pricing">Pricing</a>
        <Link href="/sign-in">Sign in</Link>
      </div>
      <Link href="/sign-up" className="btn btn-primary">
        Start free trial
      </Link>
    </nav>
  );
}
