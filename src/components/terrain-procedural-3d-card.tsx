import type { ElevationAnalysis } from "@/lib/types";
import { cn, tileToXYZUrl } from "@/lib/utils";
import { Canvas } from "@react-three/fiber";
import { Loader2Icon } from "lucide-react";
import React from "react";
import TerrainScene from "./terrain-scene";
import type { Tile } from "@mapbox/tilebelt";
import { MAP_SOURCES } from "@/config/map-config";
import TerrainMeshProcedural from "./terrain-mesh-procedural";

interface TerrainProcedural3DCardProps extends React.HTMLAttributes<HTMLDivElement> {
  label: string;
  analysis: ElevationAnalysis | null;
  autoRotate?: boolean;
  loading?: boolean;
  tile: Tile;
}

function TerrainProcedural3DCard({
  label,
  analysis,
  loading,
  tile,
  autoRotate,
  className,
  children,
  ...props
}: TerrainProcedural3DCardProps) {
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
          <TerrainScene autoRotate={autoRotate}>
            {analysis && (
              <TerrainMeshProcedural
                satelliteImageUrl={tileToXYZUrl(MAP_SOURCES.SATELLITE, tile)}
                analysis={analysis}
                tile={tile}
              />
            )}
          </TerrainScene>
        </Canvas>
      </div>

      <div className="text-xs absolute top-0 left-0 m-2 bg-background px-2 py-1 rounded-sm">{label}</div>
      {children}
    </div>
  );
}

export default React.memo(TerrainProcedural3DCard);
