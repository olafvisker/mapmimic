import type { ElevationAnalysis } from "@/lib/types";
import { tileSizeInMeters } from "@/lib/utils";
import type { Tile } from "@mapbox/tilebelt";
import React, { useMemo } from "react";
import * as THREE from "three";
import { createNoise2D } from "simplex-noise";
import alea from "alea";

export interface TerrainMeshProceduralProps {
  analysis: ElevationAnalysis;
  satelliteImageUrl: string;
  tile: Tile;
  noiseScale?: number;
  octaves?: number;
}

function TerrainMeshProcedural({
  analysis,
  satelliteImageUrl,
  tile,
  noiseScale = 1,
  octaves = 5,
}: TerrainMeshProceduralProps) {
  const simplex = useMemo(() => {
    const prng = alea("seed");
    return createNoise2D(prng);
  }, []);

  const fbm = (x: number, y: number) => {
    let value = 0;
    let amplitude = 1;
    let frequency = noiseScale;
    let norm = 0;

    for (let o = 0; o < octaves; o++) {
      value += amplitude * simplex(x * frequency, y * frequency);
      norm += amplitude;
      amplitude *= 0.5;
      frequency *= 2;
    }

    // normalize roughly to [–1,1]
    return value / norm;
  };

  // 2) build geometry by sampling FBM + remap through sortedElevations
  const geometry = useMemo(() => {
    const planeSize = 256;
    const widthSegments = 255; // 256×256 grid has 255 segments
    const heightSegments = 255;

    const geom = new THREE.PlaneGeometry(planeSize, planeSize, widthSegments, heightSegments);

    const vertices = geom.attributes.position.array as Float32Array;
    const colors: number[] = [];
    const color = new THREE.Color();

    //
    // 1) Gaussian CDF helper
    //
    function normalCdf(x: number): number {
      const sign = x < 0 ? -1 : 1;
      const a1 = 0.254829592,
        a2 = -0.284496736,
        a3 = 1.421413741;
      const a4 = -1.453152027,
        a5 = 1.061405429,
        p = 0.3275911;
      const ax = Math.abs(x) / Math.SQRT2;
      const t = 1 / (1 + p * ax);
      const y = 1 - ((((a5 * t + a4) * t + a3) * t + a2) * t + a1) * t * Math.exp(-ax * ax);
      const erf = sign * y;
      return 0.5 * (1 + erf);
    }

    //
    // 2) Build remapper closure over sortedElevations
    //
    const { sortedElevations } = analysis!;
    const N = sortedElevations.length;
    const remapNoiseToElev = (n: number): number => {
      // noise CDF → percentile [0,1]
      let t = normalCdf(n);
      if (t < 0) t = 0;
      else if (t > 1) t = 1;
      // index into sorted array
      const idx = Math.floor(t * (N - 1));
      return sortedElevations[idx];
    };

    //
    // 3) Sampling loop: FBM → CDF → elevation → mesh
    //
    const zoom = tile[2];
    const lat = tile[0];
    const tmNS = tileSizeInMeters(zoom, lat).northSouth;
    const verticalScale = planeSize / tmNS;
    const exaggeration = Math.exp(0.2 * (zoom - 15));

    let posIdx = 0;
    let colIdx = 0;
    for (let i = 0; i <= heightSegments; i++) {
      for (let j = 0; j <= widthSegments; j++) {
        const u = j / widthSegments;
        const v = i / heightSegments;
        const n = fbm(u, v); // in ~[-1,1]
        const elevation = remapNoiseToElev(n);
        const elevRel = elevation - analysis!.min;
        const z = (elevRel * verticalScale) / exaggeration;

        // set vertex height
        vertices[posIdx + 2] = z;

        // color by normalized height
        const zn = z / (((analysis!.max - analysis!.min) * verticalScale) / exaggeration);
        if (zn < 0.2) {
          color.setHSL(0.6, 0.8, 0.3 + zn * 0.4);
        } else if (zn < 0.4) {
          color.setHSL(0.25, 0.7, 0.4 + zn * 0.3);
        } else if (zn < 0.7) {
          color.setHSL(0.08, 0.6, 0.4 + zn * 0.2);
        } else {
          color.setHSL(0, 0, 0.7 + zn * 0.3);
        }
        colors[colIdx++] = color.r;
        colors[colIdx++] = color.g;
        colors[colIdx++] = color.b;

        posIdx += 3;
      }
    }

    geom.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
    geom.attributes.position.needsUpdate = true;
    geom.computeVertexNormals();

    return geom;
  }, [analysis, fbm, tile]);

  // 3) satellite texture (unchanged)
  const texture = useMemo(() => {
    if (!satelliteImageUrl) return null;
    const loader = new THREE.TextureLoader();
    const tex = loader.load(satelliteImageUrl);
    tex.wrapS = THREE.ClampToEdgeWrapping;
    tex.wrapT = THREE.ClampToEdgeWrapping;
    tex.flipY = true;
    return tex;
  }, [satelliteImageUrl]);

  return (
    <mesh geometry={geometry} rotation={[-Math.PI / 2, 0, 0]} castShadow receiveShadow position={[0, -0.1, 0]}>
      <meshStandardMaterial
        map={texture}
        vertexColors={!texture}
        flatShading={false}
        metalness={0.1}
        roughness={0.9}
        side={THREE.DoubleSide}
        shadowSide={THREE.BackSide}
      />
    </mesh>
  );
}

export default React.memo(TerrainMeshProcedural);
