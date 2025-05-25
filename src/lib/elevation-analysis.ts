import { decodeElevation } from "@/lib/utils";
import type { ElevationAnalysis } from "@/lib/types";

export async function decodeElevationGrid(imageUrl: string, gridSize = 32): Promise<number[][]> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";

    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      if (!ctx) return resolve([]);

      ctx.drawImage(img, 0, 0);
      const { data, width, height } = ctx.getImageData(0, 0, canvas.width, canvas.height);

      const grid: number[][] = [];
      const stepX = Math.floor(width / gridSize);
      const stepY = Math.floor(height / gridSize);

      for (let y = 0; y < gridSize; y++) {
        grid[y] = [];
        for (let x = 0; x < gridSize; x++) {
          const px = x * stepX;
          const py = y * stepY;
          const idx = (py * width + px) * 4;
          const r = data[idx],
            g = data[idx + 1],
            b = data[idx + 2];
          grid[y][x] = decodeElevation(r, g, b);
        }
      }

      resolve(grid);
    };

    img.onerror = () => resolve([]);
    img.src = imageUrl;
  });
}

export async function analyzeImageElevations(imageUrl: string): Promise<ElevationAnalysis | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";

    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      if (!ctx) return resolve(null);

      ctx.drawImage(img, 0, 0);
      const { data } = ctx.getImageData(0, 0, canvas.width, canvas.height);

      const elevations: number[] = [];
      for (let i = 0; i < data.length; i += 16) {
        const r = data[i],
          g = data[i + 1],
          b = data[i + 2];
        elevations.push(decodeElevation(r, g, b));
      }

      if (elevations.length === 0) return resolve(null);

      const min = Math.min(...elevations);
      const max = Math.max(...elevations);
      const mean = elevations.reduce((a, b) => a + b, 0) / elevations.length;
      const variance = elevations.reduce((a, b) => a + (b - mean) ** 2, 0) / elevations.length;
      const std = Math.sqrt(variance);

      resolve({
        min: Math.round(min),
        max: Math.round(max),
        mean: Math.round(mean),
        std: Math.round(std),
        range: Math.round(max - min),
      });
    };

    img.onerror = () => resolve(null);
    img.src = imageUrl;
  });
}
