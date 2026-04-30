# Walkthrough - Phase 1: Foundation & IPC

## Goal

Establish the foundational architecture for the VS Code extension, separating the Extension Host (Node.js) from the Webview (React), and enabling secure communication between them.

## Accomplished

- [x] **Directory Structure**: Restructured `src` into `extension`, `webview`, and `shared` to enforce separation of concerns.
- [x] **Build System**: Configured `esbuild` to output two separate bundles:
  - `dist/extension.js` (CommonJS for Node.js)
  - `dist/webview.js` (IIFE for Browser)
- [x] **React Integration**: Set up React 19 with TypeScript support in the Webview.
- [x] **IPC Communication**: Implemented bidirectional messaging:
  - Extension -> Webview: `SPEAK`, `UPDATE_PROFILE`, `LOAD_VRM` (optional `vrmaUri`)
  - Webview -> Extension: `READY`, `SPEECH_END`, `ERROR`
- [x] **WebviewViewProvider**: Registered a custom view provider `AvatarWebviewProvider` that injects the React bundle with correct Content Security Policy (CSP).

## Verification Results

### Build Status

Ran `npm run compile` and confirmed 0 errors.

```bash
> tsc --noEmit
> eslint src
[watch] build finished
```

### Next Steps (Phase 2)

- Implement Chat Participant API to connect with GitHub Copilot.
- Handle LLM streaming response and convert to `SPEAK` messages.

### Notes

- Avatar resources are configurable via settings (`ai-character-companion.vrmPath`, `ai-character-companion.vrmaPath`).
