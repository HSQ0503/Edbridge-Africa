// Kente-inspired geometry used as decoration only, so it's hidden from assistive tech.

type BlockProps = { x: number; y: number };

const BLOCK = 16;

function GreenStripes({ x, y }: BlockProps) {
  return (
    <g>
      <rect x={x} y={y} width={BLOCK} height={BLOCK} className="fill-brand" />
      <rect x={x + 5} y={y} width="2" height={BLOCK} className="fill-accent" />
      <rect x={x + 9} y={y} width="2" height={BLOCK} className="fill-accent" />
    </g>
  );
}

function GoldBar({ x, y }: BlockProps) {
  return (
    <g>
      <rect x={x} y={y} width={BLOCK} height={BLOCK} className="fill-accent" />
      <rect x={x} y={y + 7} width={BLOCK} height="2" className="fill-ink" />
    </g>
  );
}

function Diamond({ x, y }: BlockProps) {
  const cx = x + 8;
  const cy = y + 8;
  return (
    <g>
      <rect x={x} y={y} width={BLOCK} height={BLOCK} className="fill-cta" />
      <polygon points={`${cx},${cy - 5} ${cx + 5},${cy} ${cx},${cy + 5} ${cx - 5},${cy}`} className="fill-accent" />
    </g>
  );
}

function InkStripes({ x, y }: BlockProps) {
  return (
    <g>
      <rect x={x} y={y} width={BLOCK} height={BLOCK} className="fill-ink" />
      <rect x={x + 5} y={y} width="2" height={BLOCK} className="fill-brand" />
      <rect x={x + 9} y={y} width="2" height={BLOCK} className="fill-brand" />
    </g>
  );
}

const blocks = [GreenStripes, GoldBar, Diamond, InkStripes];

function Row({ y, shift = 0 }: { y: number; shift?: number }) {
  return blocks.map((_, index) => {
    const Block = blocks[(index + shift) % blocks.length];
    return <Block key={index} x={index * BLOCK} y={y} />;
  });
}

export function WovenBlock({ kind }: { kind: number }) {
  const Block = blocks[kind % blocks.length];
  return (
    <svg aria-hidden="true" focusable="false" viewBox={`0 0 ${BLOCK} ${BLOCK}`} className="block size-full">
      <Block x={0} y={0} />
    </svg>
  );
}

export function WovenBand({ id, className = "h-4" }: { id: string; className?: string }) {
  return (
    <svg aria-hidden="true" focusable="false" className={`block w-full ${className}`} preserveAspectRatio="none">
      <defs>
        <pattern id={id} width={BLOCK * 4} height={BLOCK} patternUnits="userSpaceOnUse">
          <Row y={0} />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${id})`} />
    </svg>
  );
}

// One woven cloth, each row offset by two blocks like strips sewn side by side.
export function WovenPanel({ id, className = "" }: { id: string; className?: string }) {
  return (
    <svg aria-hidden="true" focusable="false" className={`block ${className}`}>
      <defs>
        <pattern
          id={id}
          width={BLOCK * 4}
          height={BLOCK * 2}
          patternUnits="userSpaceOnUse"
          patternTransform="scale(4)"
        >
          <Row y={0} />
          <Row y={BLOCK} shift={2} />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${id})`} />
    </svg>
  );
}
