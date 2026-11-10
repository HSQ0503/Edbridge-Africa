import { WovenBlock } from "./woven";

// Each panel turns relative to the one before it, so alternating turns fold the strip like an accordion.
const turns = [1, -2, 2, -2];

function Panel({ index, shift }: { index: number; shift: number }) {
  return (
    <span
      className="kente-fold-panel"
      data-shade={index % 2 === 1 ? "" : undefined}
      style={{ "--turn": turns[index] } as React.CSSProperties}
    >
      <WovenBlock kind={shift + index} />
      {index < turns.length - 1 && <Panel index={index + 1} shift={shift} />}
    </span>
  );
}

// A short length of kente folded in 3D; it opens out when its card is hovered.
export function KenteFold({ shift = 0, className = "" }: { shift?: number; className?: string }) {
  return (
    <span aria-hidden="true" className={`kente-fold ${className}`}>
      <Panel index={0} shift={shift} />
    </span>
  );
}
