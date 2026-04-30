<!-- This document is generated and updated by .github/prompts/doc-sync.prompt.md -->

# Glossary

- **Extension Host**: The Node.js process that runs extension logic (registration, settings, Copilot integration).
- **Webview**: A sandboxed browser environment used to render custom UI inside VS Code.
- **WebviewViewProvider**: VS Code API used to register a persistent view in the sidebar.
- **IPC**: Inter-Process Communication between Extension Host and Webview using `postMessage`.
- **Chat Participant**: A Copilot Chat integration point registered by the extension.
- **Language Model Tool**: A tool exposed to the model to perform actions (e.g., `speak`).
- **VRM**: A 3D avatar format based on glTF, optimized for humanoid avatars.
- **VRMA**: An animation clip format for VRM avatars.
- **R3F (React Three Fiber)**: React renderer for Three.js, used in the Webview.
- **System Prompt**: The character personality text stored in settings.
- **Expression**: Avatar facial emotion applied during speech (`neutral`, `happy`, etc.).
