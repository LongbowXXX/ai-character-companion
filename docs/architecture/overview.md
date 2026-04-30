<!-- This document is generated and updated by .github/prompts/doc-sync.prompt.md -->

# Architecture Overview

## System Overview

AI Character Companion is a VS Code extension that hosts an interactive 3D avatar inside a Webview view and connects it to Copilot Chat through a custom chat participant. The Extension Host (Node.js) handles Copilot requests and configuration changes, while the Webview (browser sandbox) renders the avatar and plays audio.

Key entry points:

- Extension activation and Webview registration: [src/extension/extension.ts](../../src/extension/extension.ts)
- Chat participant handler: [src/extension/chat/participant.ts](../../src/extension/chat/participant.ts)
- IPC message types: [src/shared/types.ts](../../src/shared/types.ts)
- Webview bundle entry: [src/webview/index.tsx](../../src/webview/index.tsx)

## Main Components

### Extension Host (Node.js)

- Registers the Webview view (`AvatarWebviewProvider`).
- Responds to configuration changes (VRM/VRMA paths, system prompt).
- Implements the Copilot Chat participant and invokes tools to speak through the avatar.

Files:

- [src/extension/extension.ts](../../src/extension/extension.ts)
- [src/extension/chat/participant.ts](../../src/extension/chat/participant.ts)
- [src/extension/tools/avatar_tools.ts](../../src/extension/tools/avatar_tools.ts)

### Webview (Browser)

- Renders the VRM avatar using React + React Three Fiber.
- Receives `SPEAK`/`LOAD_VRM` messages and plays voice + animations.

Files:

- [src/webview/index.tsx](../../src/webview/index.tsx)
- [src/webview/components/AvatarScene.tsx](../../src/webview/components/AvatarScene.tsx)
- [src/webview/components/VRMModel.tsx](../../src/webview/components/VRMModel.tsx)
- [src/webview/modules/VoiceController.ts](../../src/webview/modules/VoiceController.ts)

### Shared Contracts

IPC contracts that define the messages between the Extension Host and Webview:

- [src/shared/types.ts](../../src/shared/types.ts)

## Architecture Diagram

```mermaid
flowchart LR
  subgraph VSCode[VS Code]
    EH[Extension Host]
    WV[Webview (React + WebGL)]
  end

  User((User)) --> Chat[Copilot Chat]
  Chat --> EH
  EH -->|postMessage
  SPEAK/LOAD_VRM| WV
  WV -->|postMessage
  READY/SPEECH_END/ERROR| EH
  EH --> Settings[(Workspace Settings)]
```

## Design Rationale

- **Process Isolation**: VS Code requires Webview UI to run separately from Extension Host logic; IPC is the bridge.
- **Dual Bundles**: `esbuild` produces two bundles (Extension Host and Webview) to keep runtime concerns separate. See [esbuild.js](../../esbuild.js).
- **Typed Messaging**: `ToWebviewMessage`/`FromWebviewMessage` in [src/shared/types.ts](../../src/shared/types.ts) help keep IPC changes explicit and safe.
