import type { ElevationAnalysis } from "@/lib/types";
import { tileSizeInMeters } from "@/lib/utils";
import type { Tile } from "@mapbox/tilebelt";
import React, { useMemo } from "react";
import * as THREE from "three";

export interface TerrainMeshProps {
  elevationData: number[][];
  analysis: ElevationAnalysis | null;
  satelliteImageUrl: string;
  tile: Tile;
}

function TerrainMesh({ elevationData, analysis, satelliteImageUrl, tile }: TerrainMeshProps) {
  const geometry = useMemo(() => {
    if (!elevationData.length || !analysis) return new THREE.PlaneGeometry(1, 1, 1, 1);

    const planeSize = 256;
    const widthSegments = elevationData[0].length;
    const heightSegments = elevationData.length;
    const geometry = new THREE.PlaneGeometry(planeSize, planeSize, widthSegments - 1, heightSegments - 1);
    const vertices = geometry.attributes.position.array as Float32Array;

    const colors: number[] = [];
    const color = new THREE.Color();

    const zoom = tile[2];
    const lat = tile[0];
    const tmNS = tileSizeInMeters(zoom, lat).northSouth;
    const verticalScale = planeSize / tmNS;
    const exaggeration = Math.exp(0.2 * (zoom - 15));

    let posIdx = 0;
    let colIdx = 0;
    for (let i = 0; i < heightSegments; i++) {
      for (let j = 0; j < widthSegments; j++) {
        const elev = elevationData[i][j] - analysis.min;
        const z = (elev * verticalScale) / exaggeration;

        // overwrite the Z coordinate
        vertices[posIdx + 2] = z;

        // choose color by normalized elevation (you can tweak these thresholds)
        if (z < 0.2) {
          color.setHSL(0.6, 0.8, 0.3 + z * 0.4);
        } else if (z < 0.4) {
          color.setHSL(0.25, 0.7, 0.4 + z * 0.3);
        } else if (z < 0.7) {
          color.setHSL(0.08, 0.6, 0.4 + z * 0.2);
        } else {
          color.setHSL(0, 0, 0.7 + z * 0.3);
        }

        // write RGB into the colors array
        colors[colIdx] = color.r;
        colors[colIdx + 1] = color.g;
        colors[colIdx + 2] = color.b;

        posIdx += 3;
        colIdx += 3;
      }
    }

    geometry.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
    geometry.attributes.position.needsUpdate = true;
    geometry.computeVertexNormals();

    return geometry;
  }, [elevationData, analysis, tile]);

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
