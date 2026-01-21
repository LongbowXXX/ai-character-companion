/*
 * Copyright (c) 2026 LongbowXXX
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { VRM, VRMHumanBoneName } from "@pixiv/three-vrm";

/**
 * Procedurally animates the VRM model to have an idle breathing animation
 * and lowers the arms from the default T-Pose.
 */
export const useVRMAnimation = (vrm: VRM | null) => {
  useEffect(() => {
    if (!vrm) {
      return;
    }

    // Initial Pose adjustments (Relax from T-pose)
    const humanoid = vrm.humanoid;
    if (!humanoid) {
      return;
    }

    // Helper to rotate a bone if it exists
    // Arms: Rotate down (approx 70-80 degrees)
    // VRM coordinate system: +Y is Up, +Z is Forward, +X is Right (Right Handed)
    // T-Pose: Arms are along X axis.
    // To lower right arm (RightUpperArm), rotate around Z axis.
    // Right arm needs to rotate "down".

    // Note: three-vrm normalize bones.

    const leftUpperArm = humanoid.getNormalizedBoneNode(
      VRMHumanBoneName.LeftUpperArm,
    );
    const rightUpperArm = humanoid.getNormalizedBoneNode(
      VRMHumanBoneName.RightUpperArm,
    );

    if (leftUpperArm) {
      leftUpperArm.rotation.z = -Math.PI / 2.5; // Rotate down (negative for left)
      leftUpperArm.rotation.y = -0.1; // Slight forward/back adjustment
    }

    if (rightUpperArm) {
      rightUpperArm.rotation.z = Math.PI / 2.5; // Rotate down (positive for right)
      rightUpperArm.rotation.y = 0.1;
    }

    const leftLowerArm = humanoid.getNormalizedBoneNode(
      VRMHumanBoneName.LeftLowerArm,
    );
    const rightLowerArm = humanoid.getNormalizedBoneNode(
      VRMHumanBoneName.RightLowerArm,
    );

    if (leftLowerArm) {
      leftLowerArm.rotation.z = 0.1; // Slight bend
    }
    if (rightLowerArm) {
      rightLowerArm.rotation.z = -0.1;
    }
  }, [vrm]);

  useFrame((state) => {
    if (!vrm || !vrm.humanoid) {
      return;
    }

    const t = state.clock.elapsedTime;

    // Breathing animation (Spine/Chest)
    // A subtle sine wave on the spine's rotation x or y
    const spine = vrm.humanoid.getNormalizedBoneNode(VRMHumanBoneName.Spine);
    const chest = vrm.humanoid.getNormalizedBoneNode(VRMHumanBoneName.Chest);
    const neck = vrm.humanoid.getNormalizedBoneNode(VRMHumanBoneName.Neck);

    const breathScale = 0.03; // Amplitude
    const breathSpeed = 1.5; // Speed

    const s = Math.sin(t * breathSpeed) * breathScale;

    if (spine) {
      // Rotation X usually makes it lean forward/back? Or Y?
      // In VRM normalized: Y is Twist, X is Bend side?, Z is Bend forward?
      // Wait, standard glTF/VRM 1.0 conventions.
      // Usually Z is forward.
      // Let's try rotating around X or Z.
      // Testing with simple Y rotation for breathing (chest heave) looks odd if it's twist.
      // Let's try scaling Y slightly?
      // Better: Rotate Spine Z (forward/back) slightly or X (side)? No.
      // Let's assume standard humanoid hierarchy.
      // Rotate Chest X (Bend front/back)??
      // Let's actually try Scale.
      // But rotation is visible.
      // Let's execute a rotation around Y (twist) is 0.
      // Rotation around X (pitch) is common for breathing.
      // Let's try simple rotation.y (twist) very very subtle? No.
      // Rotation around X axis of the bone (local X).
      // If bone is Y-up, local X is side??
      // Let's stick safe: UpperChest or Chest.
      // Rotate around X (Up/Down usually? or Pitch?)
      // VRM normalized bones usually face +Y?
      // If +Y is bone alignment:
      // Rotation Z is Bend Side.
      // Rotation X is Bend Forward/Back.
      // Rotation Y is Twist.
      // Let's apply a small rotation to Z or X.
      // Actually, simple vertical offset of the whole model or hips is common for breathing too "bobbing".
    }

    // Let's animate Chest and Shoulders slightly
    if (chest) {
      chest.rotation.y = Math.sin(t * 0.5) * 0.02; // Subtle twist
      chest.rotation.x = Math.sin(t * breathSpeed) * 0.02; // Breathe in/out (forward/back)
    }

    // Subtle shoulder rise?
    const leftShoulder = vrm.humanoid.getNormalizedBoneNode(
      VRMHumanBoneName.LeftShoulder,
    );
    const rightShoulder = vrm.humanoid.getNormalizedBoneNode(
      VRMHumanBoneName.RightShoulder,
    );

    if (leftShoulder) {
      leftShoulder.rotation.z = Math.sin(t * breathSpeed) * 0.01;
    }
    if (rightShoulder) {
      rightShoulder.rotation.z = -Math.sin(t * breathSpeed) * 0.01;
    }
  });
};
