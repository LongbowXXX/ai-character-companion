<!-- This document is generated and updated by .github/prompts/doc-sync.prompt.md -->

# Key Flows

## 1) Extension Activation and Webview Initialization

When VS Code activates the extension, it registers the Webview view and loads the React bundle.

```mermaid
sequenceDiagram
  participant VS as VS Code
  participant EH as Extension Host
  participant WV as Webview

  VS->>EH: activate()
  EH->>EH: registerWebviewViewProvider()
  VS->>EH: resolveWebviewView()
  EH->>WV: set HTML (webview.js)
  WV->>EH: postMessage READY
  EH->>WV: postMessage LOAD_VRM (uri/vrmaUri)
```

Files:

- [src/extension/extension.ts](../../src/extension/extension.ts)
- [src/webview/index.tsx](../../src/webview/index.tsx)

## 2) Copilot Chat → Avatar Speech

The chat participant streams responses, uses tools, and dispatches avatar speech to the Webview.

```mermaid
sequenceDiagram
  participant User
  participant Chat as Copilot Chat
  participant EH as Extension Host
  participant WV as Webview

  User->>Chat: @avatar prompt
  Chat->>EH: ChatRequestHandler
  EH->>Chat: sendRequest (tools)
  Chat-->>EH: toolCall (speak)
  EH->>WV: postMessage SPEAK(text, expression)
  WV-->>EH: postMessage SPEECH_END
```

Files:

- [src/extension/chat/participant.ts](../../src/extension/chat/participant.ts)
- [src/shared/types.ts](../../src/shared/types.ts)

## 3) Settings Change → Reload Avatar

VRM/VRMA or system prompt changes trigger a Webview update.

```mermaid
sequenceDiagram
  participant VS as VS Code
  participant EH as Extension Host
  participant WV as Webview

  VS->>EH: onDidChangeConfiguration
  EH->>EH: updateWebviewState()
  EH->>WV: postMessage LOAD_VRM
```

Files:

- [src/extension/extension.ts](../../src/extension/extension.ts)
