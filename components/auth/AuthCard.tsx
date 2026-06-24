import Link from "next/link";
import type { ReactNode } from "react";
import { BrandMark } from "@/components/UnionMotif";

export function AuthCard({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-16" style={{ background: "var(--ivory)" }}>
      <div className="w-full max-w-md">
        <Link href="/" className="brand justify-center" style={{ display: "flex", marginBottom: 28 }}>
          <BrandMark />
          Qubool
        </Link>
        <div className="price-card" style={{ maxWidth: "100%", textAlign: "left", padding: "36px 32px" }}>
          <h1 style={{ fontSize: "1.7rem", marginBottom: 6 }}>{title}</h1>
          {subtitle && <p style={{ color: "var(--muted)", fontSize: ".95rem", marginBottom: 24 }}>{subtitle}</p>}
          {children}
        </div>
        {footer && <div style={{ textAlign: "center", marginTop: 18, fontSize: ".88rem", color: "var(--muted)" }}>{footer}</div>}
      </div>
    </div>
  );
}
