import React, { type ReactNode } from "react";
import { OrbitControls } from "@react-three/drei";

interface TerrainSceneProps {
  autoRotate?: boolean;
  children: ReactNode;
}

function TerrainScene({ children, autoRotate = false }: TerrainSceneProps) {
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
      <fog attach="fog" args={["#B8D4F0", 0, 2000]} />

      {children}

      <OrbitControls
        enableZoom={true}
        enablePan={true}
        enableRotate={true}
        minDistance={1}
        maxDistance={2000}
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
