"use client";

import { useEffect, useRef } from "react";

// Splits text on whitespace and lights up each word as the user scrolls
// past it, matching the scroll-word-highlight effect in qubool-design.html.
// `keyWords` get the italic gold treatment once lit.
export function ScrollRevealText({
  text,
  keyWords = [],
}: {
  text: string;
  keyWords?: string[];
}) {
  const ref = useRef<HTMLParagraphElement | null>(null);
  const keySet = new Set(keyWords.map((w) => w.toLowerCase()));
  const tokens = text.split(/(\s+)/);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;

    const words = Array.from(el.querySelectorAll<HTMLSpanElement>(".reveal-word"));
    const onScroll = () => {
      const r = el.getBoundingClientRect();
      const vh = window.innerHeight;
      let p = (vh * 0.82 - r.top) / (vh * 0.55);
      p = Math.max(0, Math.min(1, p));
      const n = Math.round(p * words.length);
      words.forEach((w, i) => w.classList.toggle("lit", i < n));
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <p className="reveal-text" ref={ref}>
      {tokens.map((tok, i) => {
        if (!tok.trim()) return tok;
        const isKey = keySet.has(tok.toLowerCase().replace(/[.,]/g, ""));
        return (
          <span key={i} className={`reveal-word${isKey ? " key" : ""}`}>
            {tok}
          </span>
        );
      })}
    </p>
  );
}
