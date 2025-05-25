import type { Tile } from "@mapbox/tilebelt";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const decodeElevation = (r: number, g: number, b: number): number => {
  return r * 256 + g + b / 256 - 32768;
};

export function calculateHillshadeIntensity(zoom: number): number {
  return Math.max(0.15, Math.min(1, zoom / 20 - 0.1));
}

export function tileToXYZUrl(baseUrl: string, tile: Tile): string {
  return baseUrl
    .replace("{z}", tile[2].toString())
    .replace("{x}", tile[0].toString())
    .replace("{y}", tile[1].toString());
}

export function getParamsFromUrl() {
  const params = new URLSearchParams(window.location.search);
  const lng = parseFloat(params.get("lng") ?? "0");
  const lat = parseFloat(params.get("lat") ?? "0");
  const zoom = parseFloat(params.get("zoom") ?? "1");

  const tileStr = params.get("tile"); // format "z/x/y"
  let tile: Tile | null = null;
  if (tileStr) {
    const parts = tileStr.split("/").map(Number);
    if (parts.length === 3 && parts.every((n) => !isNaN(n))) {
      tile = parts as Tile;
    }
  }

  return {
    lng,
    lat,
    zoom,
    tile,
  };
}

export function setParamsToUrl(lng: number, lat: number, zoom: number, tile: Tile | null) {
  const params = new URLSearchParams(window.location.search);

  params.set("lng", lng.toFixed(5));
  params.set("lat", lat.toFixed(5));
  params.set("zoom", zoom.toFixed(2));

  if (tile) {
    params.set("tile", tile.join("/"));
  } else {
    params.delete("tile");
  }

  const newUrl = window.location.pathname + "?" + params.toString();
  window.history.replaceState({}, "", newUrl);
}
