/*
 * Copyright (c) 2026 LongbowXXX
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import * as React from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Environment } from "@react-three/drei";
import { VRMModel } from "./VRMModel";

export const AvatarScene: React.FC<{
  isSpeaking?: boolean;
  vrmUrl?: string;
}> = ({ isSpeaking = false, vrmUrl }) => {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        position: "absolute",
        top: 0,
        left: 0,
        backgroundColor: "#333",
      }}
    >
      <Canvas camera={{ position: [0, 1.4, 1.0], fov: 30 }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[1, 1, 1]} intensity={1} />

        {/* Placeholder VRM or Logic to load */}
        <React.Suspense
          fallback={
            <mesh>
              <boxGeometry />
              <meshStandardMaterial color="hotpink" />
            </mesh>
          }
        >
          <VRMModel isSpeaking={isSpeaking} url={vrmUrl} />
        </React.Suspense>

        <OrbitControls target={[0, 1.3, 0]} />
      </Canvas>
    </div>
  );
};
