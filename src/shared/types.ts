export type ToWebviewMessage =
  | { type: "SPEAK"; text: string }
  | { type: "UPDATE_PROFILE"; profile: UserProfile }
  | { type: "LOAD_VRM"; uri: string };

export type FromWebviewMessage =
  | { type: "READY" }
  | { type: "SPEECH_END" }
  | { type: "ERROR"; message: string };

export interface UserProfile {
  // Define profile properties here as needed
  name?: string;
}
