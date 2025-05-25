import { MAP_SOURCES } from "@/config/map-config";
import { decodeElevation } from "@/lib/utils";
import type { Tile } from "@mapbox/tilebelt";
import { DownloadIcon, Loader2Icon, TreesIcon } from "lucide-react";
import React, { useEffect, useState, useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { Button } from "./ui/button";

interface ElevationAnalysis {
  min: number;
  max: number;
  mean: number;
  std: number;
  range: number;
}

interface TerrainMeshProps {
  elevationData: number[][];
  analysis: ElevationAnalysis | null;
}

function TerrainMesh({ elevationData, analysis }: TerrainMeshProps) {
  const meshRef = useRef<THREE.Mesh>(null);

  const geometry = useMemo(() => {
    if (!elevationData.length || !analysis) return new THREE.PlaneGeometry(1, 1, 1, 1);

    const width = elevationData[0].length;
    const height = elevationData.length;
    const geometry = new THREE.PlaneGeometry(2, 2, width - 1, height - 1);

    const vertices = geometry.attributes.position.array as Float32Array;
    const normalizedRange = analysis.range || 1;

    for (let i = 0; i < height; i++) {
      for (let j = 0; j < width; j++) {
        const index = (i * width + j) * 3;
        if (elevationData[i] && elevationData[i][j] !== undefined) {
          vertices[index + 2] = (elevationData[i][j] - analysis.min) / normalizedRange;
        }
      }
    }

    geometry.attributes.position.needsUpdate = true;
    geometry.computeVertexNormals();

    return geometry;
  }, [elevationData, analysis]);

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.z += 0.005;
    }
  });

  return (
    <mesh ref={meshRef} geometry={geometry} rotation={[-Math.PI / 2, 0, 0]}>
      <meshStandardMaterial color="#8B7355" wireframe={false} side={THREE.DoubleSide} />
    </mesh>
  );
}

function Scene({ elevationData, analysis }: TerrainMeshProps) {
  return (
    <>
      <ambientLight intensity={0.75} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
      <TerrainMesh elevationData={elevationData} analysis={analysis} />
      <OrbitControls enableZoom={true} enablePan={true} enableRotate={true} minDistance={1} maxDistance={10} />
    </>
  );
}

function TerrainPanel({ tile }: { tile: Tile | null }) {
  const [imageUrl, setImageUrl] = useState<string>("");
  const [analysis, setAnalysis] = useState<ElevationAnalysis | null>(null);
  const [elevationData, setElevationData] = useState<number[][]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchAndAnalyzeTile();
  }, [tile]);

  if (!tile)
    return (
      <div className="grid place-content-center h-full">
        <TreesIcon className="stroke-1 stroke-muted size-32" />
      </div>
    );

  const tileUrl = MAP_SOURCES.ELEVATION.replace("{z}", tile[2].toString())
    .replace("{x}", tile[0].toString())
    .replace("{y}", tile[1].toString());

  async function fetchAndAnalyzeTile() {
    setLoading(true);

    try {
      const response = await fetch(tileUrl);
      if (!response.ok) throw new Error(`Failed to fetch tile: ${response.statusText}`);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      setImageUrl(url);

      await analyzeElevationData(url);
    } catch (err) {
      console.error(err instanceof Error ? err.message : "Unknown error occurred");
    } finally {
      setLoading(false);
    }
  }

  const analyzeElevationData = async (imageUrl: string): Promise<void> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = "anonymous";

      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (!ctx) return resolve();

        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        const elevations: number[] = [];
        const elevationGrid: number[][] = [];

        // Create a grid for 3D visualization (reduced resolution for performance)
        const gridSize = 32; // 32x32 grid
        const stepX = Math.floor(canvas.width / gridSize);
        const stepY = Math.floor(canvas.height / gridSize);

        for (let y = 0; y < gridSize; y++) {
          elevationGrid[y] = [];
          for (let x = 0; x < gridSize; x++) {
            const pixelX = x * stepX;
            const pixelY = y * stepY;
            const index = (pixelY * canvas.width + pixelX) * 4;

            const r = data[index];
            const g = data[index + 1];
            const b = data[index + 2];
            const elevation = decodeElevation(r, g, b);

            elevationGrid[y][x] = elevation;
            elevations.push(elevation);
          }
        }

        setElevationData(elevationGrid);

        // Sample every 4th pixel for analysis (original logic)
        const analysisElevations: number[] = [];
        for (let i = 0; i < data.length; i += 16) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          const elevation = decodeElevation(r, g, b);
          analysisElevations.push(elevation);
        }

        if (analysisElevations.length === 0) return resolve();

        const min = Math.min(...analysisElevations);
        const max = Math.max(...analysisElevations);
        const mean = analysisElevations.reduce((sum, val) => sum + val, 0) / analysisElevations.length;
        const variance =
          analysisElevations.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / analysisElevations.length;
        const std = Math.sqrt(variance);

        setAnalysis({
          min: Math.round(min),
          max: Math.round(max),
          mean: Math.round(mean),
          std: Math.round(std),
          range: Math.round(max - min),
        });

        resolve();
      };

      img.onerror = () => resolve();
      img.src = imageUrl;
    });
  };

  const downloadTile = () => {
    const link = document.createElement("a");
    link.href = imageUrl;
    link.download = `elevation-tile-${tile[2]}-${tile[0]}-${tile[1]}.png`;
    link.click();
  };

  return (
    <div className="p-4 flex flex-col gap-4 h-full">
      {imageUrl && !loading && (
        <div className="flex gap-4 h-64">
          {/* Analysis Panel */}
          {analysis && (
            <div className="flex flex-col gap-2 min-w-64 grow border rounded-md p-3">
              <div className="text-sm font-medium">Elevation Analysis</div>
              <div className="flex flex-col justify-between grow gap-2">
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between gap-2">
                    <span className="text-muted-foreground">Min Elevation:</span>
                    <span className="font-mono">{analysis.min}m</span>
                  </div>
                  <div className="flex justify-between gap-2">
                    <span className="text-muted-foreground">Max Elevation:</span>
                    <span className="font-mono">{analysis.max}m</span>
                  </div>
                  <div className="flex justify-between gap-2">
                    <span className="text-muted-foreground">Mean Elevation:</span>
                    <span className="font-mono">{analysis.mean}m</span>
                  </div>
                  <div className="flex justify-between gap-2">
                    <span className="text-muted-foreground">Std Deviation:</span>
                    <span className="font-mono">{analysis.std}m</span>
                  </div>
                  <div className="flex justify-between gap-2">
                    <span className="text-muted-foreground">Elevation Range:</span>
                    <span className="font-mono">{analysis.range}m</span>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <Button onClick={downloadTile} size="sm">
                    <DownloadIcon className="w-4 h-4 mr-1" />
                    Download Tile
                  </Button>
                  <div className="text-xs text-muted-foreground text-center">Drag to rotate • Scroll to zoom</div>
                </div>
              </div>
            </div>
          )}

          {/* 2D Terrain Source */}
          <div className="relative overflow-hidden w-full max-w-64">
            <img
              src={imageUrl}
              alt="Elevation tile"
              className="w-full h-full rounded-md object-cover"
              style={{ imageRendering: "pixelated" }}
            />
            <div className="text-xs absolute top-0 left-0 m-2 bg-background/80 px-1 py-0.5 rounded-sm">
              2D: #{tile[2]}-{tile[0]}-{tile[1]}
            </div>
          </div>

          {/* 3D Terrain Visualization */}
          <div className="relative overflow-hidden w-full bg-emerald-950 rounded-md">
            <Canvas camera={{ position: [2, 2, 2], fov: 50 }}>
              <Scene elevationData={elevationData} analysis={analysis} />
            </Canvas>
            <div className="text-xs absolute top-0 left-0 m-2 bg-background px-2 py-1 rounded-sm">
              3D: #{tile[2]}-{tile[0]}-{tile[1]}
            </div>
          </div>
        </div>
      )}

      {loading && (
        <div className="flex gap-4 h-64">
          <div className="rounded-md border min-w-64 grow p-3 flex flex-col">
            <div className="text-sm font-medium">Elevation Analysis</div>
            <div className="grow grid place-content-center">
              <Loader2Icon className="animate-spin stroke-1 stroke-muted-foreground" />
            </div>
          </div>

          <div className="relative rounded-md bg-muted w-full max-w-64 aspect-square grid place-content-center">
            <Loader2Icon className="animate-spin stroke-1 stroke-muted-foreground" />
            <div className="text-xs absolute top-0 left-0 m-2 bg-background px-2 py-1 rounded-sm">
              2D Loading: #{tile[2]}-{tile[0]}-{tile[1]}
            </div>
          </div>

          <div className="relative rounded-md bg-muted w-full aspect-square grid place-content-center">
            <Loader2Icon className="animate-spin stroke-1 stroke-muted-foreground" />
            <div className="text-xs absolute top-0 left-0 m-2 bg-background px-2 py-1 rounded-sm">
              3D Loading: #{tile[2]}-{tile[0]}-{tile[1]}
            </div>
          </div>
        </div>
      )}

      {/* 3D Terrain Visualization */}
      <div className="relative overflow-hidden w-full grow border rounded-md">
        <Canvas camera={{ position: [2, 2, 2], fov: 50 }}>
          <Scene elevationData={elevationData} analysis={analysis} />
        </Canvas>
        <div className="text-xs absolute top-0 left-0 m-2 bg-background px-2 py-1 rounded-sm">Replication: TODO</div>

        <Button disabled size="sm" className="absolute top-0 right-0 m-2">
          <TreesIcon className="w-4 h-4 mr-1" />
          Generate new mimic
        </Button>
      </div>
    </div>
  );
}

export default React.memo(TerrainPanel);
