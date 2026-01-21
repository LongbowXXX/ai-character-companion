/*
 * Copyright (c) 2026 LongbowXXX
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

export type ToWebviewMessage =
  | { type: "SPEAK"; text: string }
  | { type: "UPDATE_PROFILE"; profile: UserProfile }
  | { type: "LOAD_VRM"; uri: string; vrmaUri?: string };

export type FromWebviewMessage =
  | { type: "READY" }
  | { type: "SPEECH_END" }
  | { type: "ERROR"; message: string };

export interface UserProfile {
  // Define profile properties here as needed
  name?: string;
}
