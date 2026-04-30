<!-- This document is generated and updated by .github/prompts/doc-sync.prompt.md -->

# Constraints & Limitations

## Platform Constraints

- **VS Code Engine**: Requires VS Code `^1.104.0` (see [package.json](../../package.json)).
- **Copilot Dependency**: Chat participant features require an active GitHub Copilot subscription.

## Webview Limitations

- **CSP Restrictions**: Webview resources must comply with a strict Content Security Policy configured in [src/extension/extension.ts](../../src/extension/extension.ts).
- **Local Resources**: Only paths in `localResourceRoots` are accessible to the Webview; VRM/VRMA files must be resolvable by the Extension Host.

## Asset Constraints

- `ai-character-companion.vrmPath` must point to a `.vrm` or `.glb` file.
- `ai-character-companion.vrmaPath` must point to a `.vrma` file.
- Invalid paths are rejected with a warning.

## Runtime Constraints

- Audio playback in the Webview may be affected by browser autoplay policies.
- WebGL contexts can be lost when the Webview is backgrounded; code should handle recovery.
