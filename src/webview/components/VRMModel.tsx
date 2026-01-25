/*
 * Copyright (c) 2026 LongbowXXX
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import * as React from "react";
import { useLoader, useFrame } from "@react-three/fiber";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { VRMLoaderPlugin, VRMUtils, VRM } from "@pixiv/three-vrm";
import {
  createVRMAnimationClip,
  VRMAnimationLoaderPlugin,
} from "@pixiv/three-vrm-animation";
import { AnimationMixer } from "three";
import { useVRMAnimation } from "../hooks/useVRMAnimation";
import { useVRMBlink } from "../hooks/useVRMBlink";

// Using a public sample VRM for testing (Stable GitHub Pages URL)
const DEFAULT_VRM_URL =
  "https://pixiv.github.io/three-vrm/packages/three-vrm/examples/models/VRM1_Constraint_Twist_Sample.vrm";

interface VRMModelProps {
  isSpeaking?: boolean;
  url?: string;
  vrmaUrl?: string;
  expression?: string;
}

export const VRMModel: React.FC<VRMModelProps> = ({
  isSpeaking,
  url,
  vrmaUrl,
  expression,
}) => {
  const vrmUrl = url && url !== "" ? url : DEFAULT_VRM_URL;

  const gltf = useLoader(GLTFLoader, vrmUrl, (loader) => {
    loader.register((parser) => new VRMLoaderPlugin(parser));
  });

  const [vrm, setVrm] = React.useState<VRM | null>(null);
  const [mixer, setMixer] = React.useState<AnimationMixer | null>(null);

  React.useEffect(() => {
    if (gltf.userData.vrm) {
      const vrmInstance = gltf.userData.vrm;
      VRMUtils.removeUnnecessaryVertices(gltf.scene);
      VRMUtils.combineSkeletons(gltf.scene);
      setVrm(vrmInstance);
    }
  }, [gltf]);

  React.useEffect(() => {
    if (vrm && vrmaUrl) {
      const loader = new GLTFLoader();
      loader.register((parser) => new VRMAnimationLoaderPlugin(parser));
      loader.load(
        vrmaUrl,
        (gltfVrma) => {
          const vrmAnimations = gltfVrma.userData.vrmAnimations;
          if (vrmAnimations && vrmAnimations.length > 0) {
            const clip = createVRMAnimationClip(vrmAnimations[0], vrm);
            const newMixer = new AnimationMixer(vrm.scene);
            newMixer.clipAction(clip).play();
            setMixer(newMixer);
          }
        },
        undefined,
        (error) => {
          console.error("Failed to load VRMA:", error);
        },
      );
    } else {
      setMixer(null);
    }
  }, [vrm, vrmaUrl]);

  // Use procedural animation ONLY if no mixer (no VRMA playing)
  useVRMAnimation(mixer ? null : vrm);

  // Custom Hook for Blinking
  useVRMBlink(vrm);

  // Set default expression on load
  React.useEffect(() => {
    if (vrm && vrm.expressionManager) {
      vrm.expressionManager.setValue("neutral", 1.0);
    }
  }, [vrm]);

  // Handle Expression Changes
  React.useEffect(() => {
    if (vrm && vrm.expressionManager && expression) {
      // Very basic reset: set common expressions to 0
      // Ideally we would track the previous one or iterate all.
      // For now, let's assume standard presets.
      const presets = [
        "happy",
        "angry",
        "sad",
        "relaxed",
        "surprised",
        "neutral",
      ];
      presets.forEach((name) => vrm.expressionManager!.setValue(name, 0));

      try {
        vrm.expressionManager.setValue(expression, 1.0);
      } catch (e) {
        console.warn(`Failed to set expression: ${expression}`, e);
      }
    }
  }, [vrm, expression]);

  useFrame((state, delta) => {
    if (mixer) {
      mixer.update(delta);
    }
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
