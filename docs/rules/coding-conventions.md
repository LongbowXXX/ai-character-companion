<!-- This document is generated and updated by .github/prompts/doc-sync.prompt.md -->

# Coding Conventions

## TypeScript Standards

- Use strict TypeScript settings as defined in [tsconfig.json](../../tsconfig.json) (`"strict": true`).
- Prefer explicit typing for IPC contracts and public APIs.
- Keep shared message shapes in [src/shared/types.ts](../../src/shared/types.ts).

## Style & Formatting

- Follow ESLint rules from [eslint.config.mjs](../../eslint.config.mjs).
- Use double quotes for strings (consistent with existing code).
- Use trailing commas in multiline objects/arrays where present in the codebase.

## Extension Host vs Webview Boundaries

- Extension Host code lives under [src/extension](../../src/extension).
- Webview code lives under [src/webview](../../src/webview).
- Do not import VS Code APIs in Webview code; use IPC messages instead.

## React Patterns (Webview)

- Prefer functional components and hooks.
- Place reusable hooks under [src/webview/hooks](../../src/webview/hooks).
- Keep 3D scene composition in [src/webview/components](../../src/webview/components).

## IPC Messaging

- Only use message types declared in [src/shared/types.ts](../../src/shared/types.ts).
- Add new message types in `ToWebviewMessage` / `FromWebviewMessage` before use.
