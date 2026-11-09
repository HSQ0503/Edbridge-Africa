// Drawn rather than an icon-font glyph so its stem and head can move apart on hover (globals.css .arrow).
export function Arrow() {
  return (
    <svg className="arrow" viewBox="0 0 12 12" aria-hidden="true" focusable="false">
      <path className="arrow-stem" d="M1 6h8" />
      <path className="arrow-head" d="M4.5 2.5 8 6l-3.5 3.5" />
    </svg>
  );
}
