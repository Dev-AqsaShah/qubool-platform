import type { Metadata } from "next";

// All member-facing app pages — and profiles specifically (Section 6.8) —
// must never appear in search engines.
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return children;
}
