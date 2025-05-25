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
