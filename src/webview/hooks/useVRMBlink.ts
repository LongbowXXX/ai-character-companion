import { useState, useEffect } from "react";
import { VRM } from "@pixiv/three-vrm";
import { useFrame } from "@react-three/fiber";

export const useVRMBlink = (vrm: VRM | null) => {
  const [blinkTime, setBlinkTime] = useState(0);
  const [isBlinking, setIsBlinking] = useState(false);
  const [nextBlinkTime, setNextBlinkTime] = useState(2); // Initial blink after 2s

  useFrame((state, delta) => {
    if (!vrm || !vrm.expressionManager) {
      return;
    }

    if (isBlinking) {
      const blinkDuration = 0.1; // seconds
      const progress = (state.clock.elapsedTime - blinkTime) / blinkDuration;

      if (progress >= 1) {
        setIsBlinking(false);
        vrm.expressionManager.setValue("blink", 0);
        // Schedule next blink (random between 2s and 5s)
        setNextBlinkTime(state.clock.elapsedTime + 2 + Math.random() * 3);
      } else {
        // Linear close and open
        const value = progress < 0.5 ? progress * 2 : (1 - progress) * 2;
        vrm.expressionManager.setValue("blink", value);
      }
    } else {
      if (state.clock.elapsedTime > nextBlinkTime) {
        setIsBlinking(true);
        setBlinkTime(state.clock.elapsedTime);
      }
    }
  });
};
