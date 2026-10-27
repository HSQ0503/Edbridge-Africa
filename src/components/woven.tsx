// Kente-inspired geometry used as decoration only, so it's hidden from assistive tech.

export function WovenBand({ id, className = "h-4" }: { id: string; className?: string }) {
  return (
    <svg aria-hidden="true" focusable="false" className={`block w-full ${className}`} preserveAspectRatio="none">
      <defs>
        <pattern id={id} width="64" height="16" patternUnits="userSpaceOnUse">
          <rect width="16" height="16" className="fill-brand" />
          <rect x="5" width="2" height="16" className="fill-accent" />
          <rect x="9" width="2" height="16" className="fill-accent" />
          <rect x="16" width="16" height="16" className="fill-accent" />
          <rect x="16" y="7" width="16" height="2" className="fill-ink" />
          <rect x="32" width="16" height="16" className="fill-cta" />
          <polygon points="40,3 45,8 40,13 35,8" className="fill-accent" />
          <rect x="48" width="16" height="16" className="fill-ink" />
          <rect x="53" width="2" height="16" className="fill-brand" />
          <rect x="57" width="2" height="16" className="fill-brand" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${id})`} />
    </svg>
  );
}

function Tile({ children, className }: { children: React.ReactNode; className: string }) {
  return (
    <svg viewBox="0 0 100 100" className={`aspect-square w-full rounded-2xl ${className}`}>
      {children}
    </svg>
  );
}

function Stripes() {
  return (
    <Tile className="bg-brand">
      {[18, 34, 50, 66, 82].map((x) => (
        <rect key={x} x={x - 3} y="0" width="6" height="100" className="fill-accent" />
      ))}
    </Tile>
  );
}

function Diamond() {
  return (
    <Tile className="bg-cta">
      <polygon points="50,12 88,50 50,88 12,50" className="fill-accent" />
      <polygon points="50,32 68,50 50,68 32,50" className="fill-ink" />
    </Tile>
  );
}

function Bands() {
  return (
    <Tile className="bg-accent">
      {[20, 44, 68].map((y) => (
        <rect key={y} x="0" y={y} width="100" height="12" className="fill-ink" />
      ))}
    </Tile>
  );
}

function Checks() {
  return (
    <Tile className="bg-ink">
      {[0, 1, 2, 3].flatMap((row) =>
        [0, 1, 2, 3]
          .filter((col) => (row + col) % 2 === 0)
          .map((col) => (
            <rect key={`${row}-${col}`} x={col * 25} y={row * 25} width="25" height="25" className="fill-brand" />
          )),
      )}
    </Tile>
  );
}

function Zigzag() {
  return (
    <Tile className="bg-brand">
      {[30, 55, 80].map((y) => (
        <polyline
          key={y}
          points={`0,${y} 20,${y - 18} 40,${y} 60,${y - 18} 80,${y} 100,${y - 18}`}
          fill="none"
          strokeWidth="7"
          className="stroke-accent"
        />
      ))}
    </Tile>
  );
}

function Bridge() {
  return (
    <Tile className="bg-sand">
      <path d="M14 70 Q50 18 86 70" fill="none" strokeWidth="9" strokeLinecap="round" className="stroke-brand" />
      <rect x="8" y="68" width="84" height="9" rx="4" className="fill-cta" />
      <rect x="28" y="50" width="6" height="20" className="fill-brand" />
      <rect x="47" y="40" width="6" height="30" className="fill-brand" />
      <rect x="66" y="50" width="6" height="20" className="fill-brand" />
    </Tile>
  );
}

export function WovenTiles({ className = "" }: { className?: string }) {
  return (
    <div aria-hidden="true" className={`grid grid-cols-3 gap-3 ${className}`}>
      <Stripes />
      <Diamond />
      <Bands />
      <Zigzag />
      <Bridge />
      <Checks />
      <Bands />
      <Stripes />
      <Diamond />
    </div>
  );
}
