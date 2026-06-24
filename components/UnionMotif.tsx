export function UnionMotif({ className }: { className?: string }) {
  return (
    <svg
      className={className ?? "union"}
      viewBox="0 0 400 400"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Two interlocking rings inside a geometric star"
    >
      <g className="union-star" stroke="#B8893C" strokeOpacity=".35" fill="none" strokeWidth="1.2">
        <rect x="80" y="80" width="240" height="240" transform="rotate(0 200 200)" />
        <rect x="80" y="80" width="240" height="240" transform="rotate(45 200 200)" />
        <circle cx="200" cy="200" r="170" />
      </g>
      <circle cx="200" cy="200" r="150" fill="none" stroke="#7C2B3D" strokeOpacity=".12" strokeWidth="1" />
      <g fill="none" strokeWidth="3">
        <circle className="union-ring" cx="172" cy="200" r="74" stroke="#7C2B3D" />
        <circle className="union-ring union-ring2" cx="228" cy="200" r="74" stroke="#B8893C" />
      </g>
      <circle cx="200" cy="200" r="5" fill="#B8893C" />
    </svg>
  );
}

export function BrandMark() {
  return (
    <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="16" cy="20" r="11" stroke="#7C2B3D" strokeWidth="2" />
      <circle cx="24" cy="20" r="11" stroke="#B8893C" strokeWidth="2" />
    </svg>
  );
}
