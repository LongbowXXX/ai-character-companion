<!-- This document is generated and updated by .github/prompts/doc-sync.prompt.md -->

# Tech Stack

## Languages

- TypeScript (Extension Host + Webview)
- JavaScript (build scripts)

## Frameworks & Libraries

- VS Code Extension API
- React 19
- React Three Fiber / Drei
- Three.js
- @pixiv/three-vrm / @pixiv/three-vrm-animation

## Build & Tooling

- esbuild (dual bundles)
- TypeScript (`tsc`)
- ESLint (`eslint.config.mjs`)
- npm-run-all (watch scripts)

## Testing

- @vscode/test-cli
- @vscode/test-electron
- Mocha types (@types/mocha)

## Platform & Runtime

- VS Code `^1.104.0`
- Node.js 20+

## Key Configuration

- Build: [esbuild.js](../../esbuild.js)
- TypeScript: [tsconfig.json](../../tsconfig.json)
- Scripts & dependencies: [package.json](../../package.json)
