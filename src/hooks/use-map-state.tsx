import { getParamsFromUrl, setParamsToUrl } from "@/lib/utils";
import { pointToTile, type Tile } from "@mapbox/tilebelt";
import { useCallback, useEffect, useState } from "react";
import { useMap, type MapLayerMouseEvent, type ViewState, type ViewStateChangeEvent } from "react-map-gl/maplibre";

export function useMapState(onTileSelect?: (tile: Tile | null) => void) {
  const { map } = useMap();

  const { lng, lat, zoom, tile } = getParamsFromUrl();

  const [viewState, setViewState] = useState<ViewState>({
    longitude: lng,
    latitude: lat,
    zoom: zoom,
    bearing: 0,
    pitch: 0,
    padding: { top: 0, bottom: 0, left: 0, right: 0 },
  });

  const [selectedTile, setSelectedTile] = useState<Tile | null>(tile);

  const updateSelectedTile = useCallback(
    (tile: Tile | null) => {
      setSelectedTile(tile);
      onTileSelect?.(tile);
    },
    [onTileSelect]
  );

  const handleMapClick = useCallback(
    (e: MapLayerMouseEvent) => {
      if (!map) return;

      const tile = pointToTile(e.lngLat.lng, e.lngLat.lat, Math.floor(map.getZoom() + 1));
      const isSameTile =
        selectedTile && selectedTile.length === tile.length && selectedTile.every((val, i) => val === tile[i]);

      updateSelectedTile(isSameTile ? null : tile);
    },
    [map, selectedTile, updateSelectedTile]
  );

  const handleMove = useCallback((e: ViewStateChangeEvent) => {
    setViewState(e.viewState);
  }, []);

  useEffect(() => {
    setParamsToUrl(viewState.longitude, viewState.latitude, viewState.zoom, selectedTile);
  }, [viewState.longitude, viewState.latitude, viewState.zoom, selectedTile]);

  return {
    viewState,
    selectedTile,
    handleMapClick,
    handleMove,
  };
}
