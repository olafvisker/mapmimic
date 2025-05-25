import type { ElevationAnalysis } from "@/lib/types";
import React, { useMemo } from "react";
import * as THREE from "three";

export interface TerrainMeshProps {
  elevationData: number[][];
  analysis: ElevationAnalysis | null;
  satelliteImageUrl: string;
}

function TerrainMesh({ elevationData, analysis, satelliteImageUrl }: TerrainMeshProps) {
  const geometry = useMemo(() => {
    if (!elevationData.length || !analysis) return new THREE.PlaneGeometry(1, 1, 1, 1);

    const width = elevationData[0].length;
    const height = elevationData.length;
    const geometry = new THREE.PlaneGeometry(2, 2, width - 1, height - 1);
    const vertices = geometry.attributes.position.array as Float32Array;

    const colors: number[] = [];
    const color = new THREE.Color();
    const normalizedRange = analysis.range || 1;

    for (let i = 0; i < height; i++) {
      for (let j = 0; j < width; j++) {
        const index = (i * width + j) * 3;
        const elevation = elevationData[i][j];
        const normalizedElevation = (elevation - analysis.min) / normalizedRange;

        vertices[index + 2] = normalizedElevation * 0.8;

        // Keep color calculation for fallback when no satellite image
        if (normalizedElevation < 0.2) {
          color.setHSL(0.6, 0.8, 0.3 + normalizedElevation * 0.4);
        } else if (normalizedElevation < 0.4) {
          color.setHSL(0.25, 0.7, 0.4 + normalizedElevation * 0.3);
        } else if (normalizedElevation < 0.7) {
          color.setHSL(0.08, 0.6, 0.4 + normalizedElevation * 0.2);
        } else {
          color.setHSL(0, 0, 0.7 + normalizedElevation * 0.3);
        }

        colors.push(color.r, color.g, color.b);
      }
    }

    geometry.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
    geometry.attributes.position.needsUpdate = true;
    geometry.computeVertexNormals();

    return geometry;
  }, [elevationData, analysis]);

  const texture = useMemo(() => {
    if (!satelliteImageUrl) return null;

    const loader = new THREE.TextureLoader();
    const texture = loader.load(satelliteImageUrl);
    texture.wrapS = THREE.ClampToEdgeWrapping;
    texture.wrapT = THREE.ClampToEdgeWrapping;
    texture.flipY = true; // Important for tile textures
    return texture;
  }, [satelliteImageUrl]);

  return (
    <mesh geometry={geometry} rotation={[-Math.PI / 2, 0, 0]} castShadow receiveShadow position={[0, -0.1, 0]}>
      <meshStandardMaterial
        map={texture} // Apply satellite texture
        vertexColors={!texture} // Use vertex colors only when no texture
        flatShading={false}
        metalness={0.1}
        roughness={0.9}
        side={THREE.DoubleSide}
        shadowSide={THREE.BackSide}
      />
    </mesh>
  );
}

export default React.memo(TerrainMesh);
