import { pointToTile } from "@mapbox/tilebelt";
import React from "react";
import { useEffect, useRef } from "react";
import { useMap } from "react-map-gl/maplibre";

const TileGraticuleLayer = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { map } = useMap();

  useEffect(() => {
    if (!map || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    const drawTiles = () => {
      if (!ctx || !map) return;

      const zoom = map.getZoom();
      const zoomInt = Math.floor(zoom + 1);
      const scale = Math.pow(2, zoomInt);
      const canvasWidth = map.getCanvas().width;
      const canvasHeight = map.getCanvas().height;

      canvas.width = canvasWidth;
      canvas.height = canvasHeight;

      ctx.clearRect(0, 0, canvasWidth, canvasHeight);

      ctx.strokeStyle = "rgba(15, 23, 42, 0.15)";

      ctx.fillStyle = "rgba(15, 23, 42, 0.5)";
      ctx.font = "12px sans-serif";
      ctx.textAlign = "start";
      ctx.textBaseline = "top";
      ctx.lineWidth = 1;
      ctx.shadowColor = "rgba(15, 23, 42, 0.5)";
      ctx.shadowBlur = 3;
      ctx.shadowOffsetX = 1;
      ctx.shadowOffsetY = 1;

      // Get the center point and calculate tile size in pixels
      const center = map.getCenter();
      const centerTile = pointToTile(center.lng, center.lat, zoomInt);

      // Calculate approximate tile size in pixels by projecting adjacent tiles
      const testLng1 = (Math.floor(centerTile[0]) / scale) * 360 - 180;
      const testLng2 = ((Math.floor(centerTile[0]) + 1) / scale) * 360 - 180;
      const n = Math.PI - (2 * Math.PI * Math.floor(centerTile[1])) / scale;
      const testLat = (180 / Math.PI) * Math.atan(0.5 * (Math.exp(n) - Math.exp(-n)));

      const point1 = map.project({ lon: testLng1, lat: testLat });
      const point2 = map.project({ lon: testLng2, lat: testLat });
      const tilePixelWidth = Math.abs(point2.x - point1.x);

      // Calculate how many tiles we need in each direction
      const tilesX = Math.ceil(canvasWidth / tilePixelWidth) + 2;
      const tilesY = Math.ceil(canvasHeight / tilePixelWidth) + 2; // Use same size for Y

      // Get center tile coordinates
      const centerTileX = Math.floor(centerTile[0]);
      const centerTileY = Math.floor(centerTile[1]);

      // Calculate tile range around center
      const minTileX = centerTileX - tilesX;
      const maxTileX = centerTileX + tilesX;
      const minTileY = Math.max(0, centerTileY - tilesY);
      const maxTileY = Math.min(scale - 1, centerTileY + tilesY);

      // Draw all tiles in range
      for (let tileX = minTileX; tileX <= maxTileX; tileX++) {
        for (let tileY = minTileY; tileY <= maxTileY; tileY++) {
          // Calculate wrapped X coordinate for display (this is what shows in the label)
          const wrappedX = ((tileX % scale) + scale) % scale;

          // Convert tile coordinates to lat/lng for positioning
          const tileLng = (tileX / scale) * 360 - 180;
          const n = Math.PI - (2 * Math.PI * tileY) / scale;
          const tileLat = (180 / Math.PI) * Math.atan(0.5 * (Math.exp(n) - Math.exp(-n)));

          // Calculate bottom-right corner
          const bottomTileLng = ((tileX + 1) / scale) * 360 - 180;
          const bottomN = Math.PI - (2 * Math.PI * (tileY + 1)) / scale;
          const bottomTileLat = (180 / Math.PI) * Math.atan(0.5 * (Math.exp(bottomN) - Math.exp(-bottomN)));

          // Project to screen coordinates
          const topLeft = map.project({ lon: tileLng, lat: tileLat });
          const bottomRight = map.project({
            lon: bottomTileLng,
            lat: bottomTileLat,
          });

          const width = bottomRight.x - topLeft.x;
          const height = bottomRight.y - topLeft.y;

          // Only draw if tile is visible on screen (with some margin)
          if (
            topLeft.x + width >= -100 &&
            topLeft.x <= canvasWidth + 100 &&
            topLeft.y + height >= -100 &&
            topLeft.y <= canvasHeight + 100
          ) {
            // Draw tile boundary
            ctx.strokeRect(topLeft.x, topLeft.y, width, height);

            // Draw tile label
            const label = `#${zoomInt}-${wrappedX}-${tileY}`;
            const labelX = topLeft.x + 12;
            const labelY = topLeft.y + 12;

            // Only draw label if it's reasonably visible
            if (labelX >= -50 && labelX <= canvasWidth + 50 && labelY >= -50 && labelY <= canvasHeight + 50) {
              ctx.fillText(label, labelX, labelY);
            }
          }
        }
      }
    };

    drawTiles();
    map.on("move", drawTiles);
    map.on("zoom", drawTiles);

    return () => {
      map.off("move", drawTiles);
      map.off("zoom", drawTiles);
    };
  }, [map]);

  return <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none" />;
};

export default React.memo(TileGraticuleLayer);
