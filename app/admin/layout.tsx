import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { requireAdmin } from "@/lib/admin";
import { BrandMark } from "@/components/UnionMotif";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

const ADMIN_LINKS = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/moderation", label: "Moderation queue" },
  { href: "/admin/verification", label: "Verification" },
  { href: "/admin/users", label: "Users" },
  { href: "/admin/reports", label: "Reports & blocks" },
  { href: "/admin/payments", label: "Payments" },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const result = await requireAdmin();
  if (!result.ok) redirect(result.status === 401 ? "/sign-in" : "/discover");

  return (
    <div className="wrap" style={{ paddingBottom: 80 }}>
      <nav className="qb-nav">
        <Link href="/admin" className="brand">
          <BrandMark />
          Qubool Admin
        </Link>
        <div className="navlinks">
          {ADMIN_LINKS.map((l) => (
            <Link key={l.href} href={l.href}>{l.label}</Link>
          ))}
        </div>
        <Link href="/discover" className="btn btn-ghost">Back to app</Link>
      </nav>
      {children}
    </div>
  );
}
