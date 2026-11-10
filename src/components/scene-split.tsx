import { KenteScene } from "./kente-scene/kente-scene";
import type { SceneName } from "./kente-scene/scenes";

type SceneSplitProps = {
  scene: SceneName;
  count?: number;
  shift?: number;
  side?: "left" | "right";
  children: React.ReactNode;
};

// A section's words beside a 3D scene that pictures their point; on small screens the scene follows the words.
export function SceneSplit({ scene, count, shift, side = "right", children }: SceneSplitProps) {
  const columns = side === "right" ? "lg:grid-cols-[1.25fr_1fr]" : "lg:grid-cols-[1fr_1.25fr]";
  return (
    <div className={`grid items-center gap-10 lg:gap-16 ${columns}`}>
      <div className={side === "left" ? "lg:order-2" : ""}>{children}</div>
      <KenteScene
        scene={scene}
        count={count}
        shift={shift}
        className="mx-auto aspect-[4/3] w-full max-w-lg lg:aspect-square lg:max-w-none"
      />
    </div>
  );
}
