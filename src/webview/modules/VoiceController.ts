/*
 * Copyright (c) 2026 LongbowXXX
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

export class VoiceController {
  private synth: SpeechSynthesis;

  constructor() {
    this.synth = window.speechSynthesis;
  }

  public speak(text: string, onStart?: () => void, onEnd?: () => void) {
    if (this.synth.speaking) {
      console.warn("Already speaking, canceling previous.");
      this.synth.cancel();
    }

    const utterance = new SpeechSynthesisUtterance(text);

    // Select voice: Prefer Japanese female voice, then English female, then default
    const voices = this.synth.getVoices();
    const preferredVoice =
      voices.find((v) => v.lang.includes("ja") && v.name.includes("Female")) ||
      voices.find((v) => v.lang.includes("ja")) ||
      voices.find((v) => v.lang.includes("en") && v.name.includes("Female")) ||
      null;

    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    utterance.onstart = () => {
      if (onStart) {
        onStart();
      }
    };

    utterance.onend = () => {
      if (onEnd) {
        onEnd();
      }
    };

    utterance.onerror = (e) => {
      console.error("Speech Error:", e);
      if (onEnd) {
        onEnd();
      }
    };

    this.synth.speak(utterance);
  }

  public cancel() {
    this.synth.cancel();
  }
}
