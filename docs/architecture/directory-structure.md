<!-- This document is generated and updated by .github/prompts/doc-sync.prompt.md -->

# Directory Structure

## High-Level Layout

```
.
├── docs/                          # Project documentation
│   ├── architecture/              # Architecture and design docs
│   └── rules/                     # Coding and testing rules
├── dist/                          # Build outputs (generated)
├── src/                           # Source code
│   ├── extension/                 # Extension Host (Node.js)
│   │   ├── chat/                  # Copilot Chat participant
│   │   └── tools/                 # Language Model tools
│   ├── shared/                    # IPC contracts and shared types
│   └── webview/                   # Webview (React + WebGL)
│       ├── components/            # UI/3D components
│       ├── hooks/                 # React hooks
│       └── modules/               # Voice/animation modules
├── scripts/                       # Repo tooling (setup links)
└── package.json                   # Scripts and dependencies
```

## Key Paths and Responsibilities

- Extension Host entry: [src/extension/extension.ts](../../src/extension/extension.ts)
- Chat participant handler: [src/extension/chat/participant.ts](../../src/extension/chat/participant.ts)
- Language model tools: [src/extension/tools/avatar_tools.ts](../../src/extension/tools/avatar_tools.ts)
- Webview entry: [src/webview/index.tsx](../../src/webview/index.tsx)
- VRM rendering: [src/webview/components/VRMModel.tsx](../../src/webview/components/VRMModel.tsx)
- Voice control: [src/webview/modules/VoiceController.ts](../../src/webview/modules/VoiceController.ts)
- Shared IPC types: [src/shared/types.ts](../../src/shared/types.ts)
- Build configuration: [esbuild.js](../../esbuild.js)
- Repo setup script: [scripts/setup-links.js](../../scripts/setup-links.js)

## Build Outputs

`esbuild` generates two bundles:

- [dist/extension.js](../../dist/extension.js) (Extension Host / CommonJS)
- [dist/webview.js](../../dist/webview.js) (Webview / IIFE)
