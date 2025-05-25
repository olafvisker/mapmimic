import Map, { Layer, Source } from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";
import { tileToGeoJSON, type Tile } from "@mapbox/tilebelt";
import TileGraticuleLayer from "./tile-graticule-layer";
import { useMapState } from "@/hooks/use-map-state";
import { calculateHillshadeIntensity } from "@/lib/utils";
import { MAP_SOURCES } from "@/config/map-config";

const MAP_LIMITS = {
  MAX_ZOOM: 15,
  MIN_ZOOM: 0,
} as const;

interface WorldMapProps {
  onTileSelect?: (tile: Tile | null) => void;
}
function WorldMap({ onTileSelect }: WorldMapProps = {}) {
  const { viewState, selectedTile, handleMapClick, handleMove } = useMapState(onTileSelect);
  const hillshadeIntensity = calculateHillshadeIntensity(viewState.zoom);

  return (
    <Map
      id="map"
      {...viewState}
      mapStyle={MAP_SOURCES.BASE}
      maxZoom={MAP_LIMITS.MAX_ZOOM}
      minZoom={MAP_LIMITS.MIN_ZOOM}
      onMove={handleMove}
      onClick={handleMapClick}
      cursor="pointer"
      doubleClickZoom={false}>
      <Source id="satellite" type="raster" tiles={[MAP_SOURCES.SATELLITE]}>
        <Layer type="raster" paint={{ "raster-opacity": 0.2, "raster-saturation": 0.5 }} />
      </Source>

      <Source id="hillshade-dem" type="raster-dem" tiles={[MAP_SOURCES.ELEVATION]} encoding="terrarium">
        <Layer type="hillshade" paint={{ "hillshade-exaggeration": hillshadeIntensity }} />
      </Source>

      {selectedTile && (
        <Source id="tile-highlight" type="geojson" data={tileToGeoJSON(selectedTile)}>
          <Layer id="tile-highlight-fill" type="fill" paint={{ "fill-color": "#fbbf24", "fill-opacity": 0.2 }} />
          <Layer
            id="tile-highlight-stroke"
            type="line"
            paint={{ "line-color": "rgb(15, 23, 42)", "line-opacity": 0.15 }}
          />
        </Source>
      )}

      <TileGraticuleLayer />
    </Map>
  );
}

export default WorldMap;
