<!-- This document is generated and updated by .github/prompts/doc-sync.prompt.md -->

# Testing

## Test Types

- Extension integration tests (VS Code test runner)

## Running Tests

```bash
npm test
```

This executes the VS Code test runner configured by `vscode-test`.

## Watch Mode (TypeScript)

```bash
npm run watch-tests
```

`watch-tests` recompiles tests under the `out/` directory for rapid iteration.

## Related Files

- Test entry point: [src/test/extension.test.ts](../../src/test/extension.test.ts)
- Test scripts: [package.json](../../package.json)
