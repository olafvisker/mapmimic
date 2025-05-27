import type { Tile } from "@mapbox/tilebelt";
import { MountainSnowIcon, TreesIcon } from "lucide-react";
import React from "react";
import { Button } from "./ui/button";
import { useElevationTile } from "@/hooks/use-elevation-tile";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import TerrainAnalysisCard from "./terrain-analysis-card";
import Terrain2DCard from "./terrain-2d-card";
import Terrain3DCard from "./terrain-3d-card";

function TerrainPanel({ tile }: { tile: Tile | null }) {
  const { imageUrl, elevationData, analysis, loading } = useElevationTile(tile);
  const debouncedLoading = useDebouncedValue(loading, 250);

  const downloadTile = () => {
    if (!tile || !imageUrl) return;
    const link = document.createElement("a");
    link.href = imageUrl;
    link.download = `elevation-tile-${tile[2]}-${tile[0]}-${tile[1]}.png`;
    link.click();
  };

  if (!tile)
    return (
      <div className="grid place-content-center h-full">
        <MountainSnowIcon className="stroke-1 stroke-muted size-24" />
      </div>
    );

  return (
    <div className="@container p-4 flex flex-col gap-4 h-full overflow-y-auto overflow-hidden">
      <div className="@max-3xl:flex-col flex gap-4 min-h-fit">
        <div className="flex gap-4 @max-3xl:grow @max-lg:flex-col min-h-64">
          <TerrainAnalysisCard
            analysis={analysis!}
            loading={debouncedLoading}
            onDownload={downloadTile}
            className="min-w-42 grow"
          />
          <Terrain2DCard
            label={`2D: #${tile[2]}-${tile[0]}-${tile[1]}`}
            tileImgUrl={imageUrl}
            className="@min-sm:min-w-64"
          />
        </div>
        <div className="min-w-48 min-h-64 flex grow">
          <Terrain3DCard
            label={`3D: #${tile[2]}-${tile[0]}-${tile[1]}`}
            elevationData={elevationData}
            analysis={analysis}
            loading={debouncedLoading}
            tile={tile}
            autoRotate
            className="bg-gradient-to-b from-orange-600/10 to-muted/25"
          />
        </div>
      </div>

      <div className="min-h-64 flex grow">
        <Terrain3DCard
          label="Replication: TODO"
          elevationData={elevationData}
          analysis={analysis}
          tile={tile}
          loading={debouncedLoading}
          className="relative overflow-hidden w-full grow border rounded-md bg-gradient-to-b from-sky-400/30 to-green-400/10">
          <Button disabled size="sm" className="absolute bottom-0 @min-sm:top-0 right-0 m-2">
            <TreesIcon className="w-4 h-4 mr-1" />
            Generate new mimic
          </Button>
        </Terrain3DCard>
      </div>
    </div>
  );
}

export default React.memo(TerrainPanel);
