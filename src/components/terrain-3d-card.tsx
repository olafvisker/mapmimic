import type { ElevationAnalysis } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Canvas } from "@react-three/fiber";
import { Loader2Icon } from "lucide-react";
import React from "react";
import TerrainScene from "./terrain-scene";
import type { Tile } from "@mapbox/tilebelt";

interface Terrain3DCardProps extends React.HTMLAttributes<HTMLDivElement> {
  label: string;
  elevationData: number[][];
  analysis: ElevationAnalysis | null;
  autoRotate?: boolean;
  loading?: boolean;
  tile: Tile;
}

function Terrain3DCard({
  label,
  elevationData,
  analysis,
  loading,
  tile,
  autoRotate,
  className,
  children,
  ...props
}: Terrain3DCardProps) {
  if (loading)
    return (
      <div className={cn("relative overflow-hidden rounded-md bg-muted w-full grid place-content-center", className)}>
        <Loader2Icon className="animate-spin stroke-1 stroke-muted-foreground" />
        <div className="text-xs absolute top-0 left-0 m-2 bg-background px-2 py-1 rounded-sm">Loading...</div>
      </div>
    );

  return (
    <div className={cn("relative overflow-hidden rounded-md flex w-full", className)} {...props}>
      <div className="overflow-hidden grow">
        <Canvas shadows camera={{ position: [350, 350, 350], fov: 50 }}>
          <TerrainScene tile={tile} elevationData={elevationData} analysis={analysis} autoRotate={autoRotate} />
        </Canvas>
      </div>

      <div className="text-xs absolute top-0 left-0 m-2 bg-background px-2 py-1 rounded-sm">{label}</div>
      {children}
    </div>
  );
}

export default React.memo(Terrain3DCard);
