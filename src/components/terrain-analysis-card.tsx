import type { ElevationAnalysis } from "@/lib/types";
import { Loader2Icon, DownloadIcon } from "lucide-react";
import React from "react";
import { Button } from "./ui/button";

function TerrainAnalysisCard({
  analysis,
  loading,
  onDownload,
}: {
  analysis: ElevationAnalysis;
  loading: boolean;
  onDownload: () => void;
}) {
  return (
    <div className="relative flex flex-col gap-2 min-w-64 grow border rounded-md p-3">
      {loading && <Loader2Icon className="size-4 stroke-1 animate-spin absolute top-0 right-0 m-3" />}
      <div className="text-sm font-medium">Elevation Analysis</div>
      <div className="flex flex-col justify-between grow gap-2">
        <div className="space-y-1 text-xs">
          {[
            ["Min Elevation", analysis?.min],
            ["Max Elevation", analysis?.max],
            ["Mean Elevation", analysis?.mean],
            ["Std Deviation", analysis?.std],
            ["Elevation Range", analysis?.range],
          ].map(([label, value], index) => (
            <div key={index} className="flex justify-between gap-2">
              <span className="text-muted-foreground">{label}:</span>
              <span className="font-mono">
                {loading || value === undefined ? (
                  <span className="inline-block w-8 h-3 bg-muted animate-pulse rounded" />
                ) : (
                  `${value}m`
                )}
              </span>
            </div>
          ))}
        </div>
        <div className="flex flex-col gap-2">
          <Button onClick={onDownload} size="sm" disabled={loading}>
            <DownloadIcon className="w-4 h-4 mr-1" />
            Download Tile
          </Button>
          <div className="text-xs text-muted-foreground text-center">Drag to rotate • Scroll to zoom</div>
        </div>
      </div>
    </div>
  );
}

export default React.memo(TerrainAnalysisCard);
