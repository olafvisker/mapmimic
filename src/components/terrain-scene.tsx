import React from "react";
import { OrbitControls } from "@react-three/drei";
import TerrainMesh from "./terrain-mesh";
import type { Tile } from "@mapbox/tilebelt";
import { tileToXYZUrl } from "@/lib/utils";
import { MAP_SOURCES } from "@/config/map-config";
import type { ElevationAnalysis } from "@/lib/types";

interface TerrainSceneProps {
  autoRotate?: boolean;
  elevationData: number[][];
  analysis: ElevationAnalysis | null;
  tile: Tile;
}

function TerrainScene({ tile, elevationData, analysis, autoRotate = false }: TerrainSceneProps) {
  return (
    <>
      <directionalLight
        castShadow
        position={[50, 80, 30]}
        intensity={2.5}
        color={"#ffffff"}
        shadow-mapSize-width={4096}
        shadow-mapSize-height={4096}
        shadow-camera-near={5}
        shadow-camera-far={150}
        shadow-camera-left={-25}
        shadow-camera-right={25}
        shadow-camera-top={25}
        shadow-camera-bottom={-25}
        shadow-bias={-0.0001}
        shadow-normalBias={0.02}
        shadow-radius={4}
      />

      <ambientLight intensity={0.4} color={"#E6F3FF"} />
      <directionalLight position={[-30, 40, -20]} intensity={0.8} color={"#87CEEB"} />
      {/* <fog attach="fog" args={["#B8D4F0", 0, 20]} /> */}
      <TerrainMesh
        satelliteImageUrl={tileToXYZUrl(MAP_SOURCES.SATELLITE, tile)}
        elevationData={elevationData}
        analysis={analysis}
      />

      <OrbitControls
        enableZoom={true}
        enablePan={true}
        enableRotate={true}
        minDistance={1}
        maxDistance={1500}
        autoRotate={autoRotate}
        autoRotateSpeed={0.3}
        enableDamping={true}
        dampingFactor={0.1}
        maxPolarAngle={Math.PI * 0.48}
        minPolarAngle={Math.PI * 0.1}
      />
    </>
  );
}

export default React.memo(TerrainScene);
