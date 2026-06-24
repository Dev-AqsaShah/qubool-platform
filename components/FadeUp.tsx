"use client";

import { useEffect, useRef, type ReactNode } from "react";

export function FadeUp({
  children,
  as: Tag = "div",
  className = "",
}: {
  children: ReactNode;
  as?: keyof React.JSX.IntrinsicElements;
  className?: string;
}) {
  const ref = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      el.classList.add("in");
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add("in");
          observer.unobserve(el);
        }
      },
      { threshold: 0.15 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const Element = Tag as React.ElementType;
  return (
    <Element ref={ref} className={`fade-up ${className}`}>
      {children}
    </Element>
  );
}
