import { useEffect, useState } from "react";
import type { ElevationAnalysis } from "@/lib/types";
import type { Tile } from "@mapbox/tilebelt";
import { analyzeImageElevations, decodeElevationGrid } from "@/lib/elevation-analysis";
import { fetchElevationTile } from "@/api/api";

export function useElevationTile(tile: Tile | null) {
  const [imageUrl, setImageUrl] = useState<string>("");
  const [elevationData, setElevationData] = useState<number[][]>([]);
  const [analysis, setAnalysis] = useState<ElevationAnalysis | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!tile) return;

    setLoading(true);
    fetchElevationTile(tile)
      .then((blob) => {
        const url = URL.createObjectURL(blob);
        setImageUrl(url);
        return Promise.all([decodeElevationGrid(url), analyzeImageElevations(url)]);
      })
      .then(([grid, stats]) => {
        setElevationData(grid);
        setAnalysis(stats);
      })
      .catch((err) => console.error("Tile fetch/analyze error:", err))
      .finally(() => setLoading(false));
  }, [tile]);

  return { imageUrl, elevationData, analysis, loading };
}
