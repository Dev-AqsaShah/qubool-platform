import Link from "next/link";
import { BrandMark } from "@/components/UnionMotif";
import { NotificationBell } from "@/components/app/NotificationBell";

const LINKS = [
  { href: "/discover", label: "Discover" },
  { href: "/interests", label: "Interests" },
  { href: "/matches", label: "Matches" },
  { href: "/me", label: "My profile" },
  { href: "/safety", label: "Safety" },
  { href: "/membership", label: "Membership" },
];

export function AppNav({ active }: { active?: string }) {
  return (
    <nav className="qb-nav">
      <Link href="/discover" className="brand">
        <BrandMark />
        Qubool
      </Link>
      <div className="navlinks">
        {LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            style={active === link.href ? { opacity: 1, color: "var(--henna)" } : undefined}
          >
            {link.label}
          </Link>
        ))}
      </div>
      <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
        <NotificationBell />
        <Link href="/settings" className="btn btn-ghost">
          Settings
        </Link>
      </div>
    </nav>
  );
}
