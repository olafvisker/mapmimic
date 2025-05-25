import { MAP_SOURCES } from "@/config/map-config";
import { tileToXYZUrl } from "@/lib/utils";
import type { Tile } from "@mapbox/tilebelt";

export async function fetchElevationTile(tile: Tile): Promise<Blob> {
  const tileUrl = tileToXYZUrl(MAP_SOURCES.ELEVATION, tile);
  const response = await fetch(tileUrl);
  if (!response.ok) {
    throw new Error(`Failed to fetch tile: ${response.statusText}`);
  }
  return await response.blob();
}
