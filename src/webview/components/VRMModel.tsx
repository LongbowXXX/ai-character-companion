/*
 * Copyright (c) 2026 LongbowXXX
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import * as React from "react";
import { useLoader, useFrame } from "@react-three/fiber";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { VRMLoaderPlugin, VRMUtils } from "@pixiv/three-vrm";

// Using a public sample VRM for testing (Stable GitHub Pages URL)
const DEFAULT_VRM_URL =
  "https://pixiv.github.io/three-vrm/packages/three-vrm/examples/models/VRM1_Constraint_Twist_Sample.vrm";

interface VRMModelProps {
  isSpeaking?: boolean;
  url?: string;
}

export const VRMModel: React.FC<VRMModelProps> = ({ isSpeaking, url }) => {
  const vrmUrl = url && url !== "" ? url : DEFAULT_VRM_URL;

  const gltf = useLoader(GLTFLoader, vrmUrl, (loader) => {
    loader.register((parser) => new VRMLoaderPlugin(parser));
  });

  const [vrm, setVrm] = React.useState<any>(null);

  React.useEffect(() => {
    // Reset VRM state when URL changes (though useLoader handles caching/reloading)
    if (gltf.userData.vrm) {
      const vrmInstance = gltf.userData.vrm;
      VRMUtils.removeUnnecessaryVertices(gltf.scene);
      VRMUtils.combineSkeletons(gltf.scene);
      // vrmInstance.scene.rotation.y = Math.PI; // Face forward
      setVrm(vrmInstance);
    }
  }, [gltf]);

  useFrame((state, delta) => {
    if (vrm) {
      vrm.update(delta);

      // Simple Lip Sync
      if (vrm.expressionManager) {
        const s = Math.sin(state.clock.elapsedTime * 20);
        const value = isSpeaking ? Math.max(0, s) : 0;
        vrm.expressionManager.setValue("aa", value);
      }
    }
  });

  return <primitive object={gltf.scene} />;
};
