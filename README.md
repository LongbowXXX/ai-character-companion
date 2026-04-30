# AI Character Companion

A VS Code extension that integrates GitHub Copilot Chat with an interactive 3D avatar (VRM) that responds with voice and lip-sync animations. Create an immersive coding companion experience by chatting with customizable AI characters.

## Features

- **Copilot Chat Integration**: Interact with the avatar using `@avatar` mentions in VS Code's chat interface
- **3D VRM Avatar**: Display animated 3D avatars using the VRM format, supporting expressions and lip-sync
- **Voice Response**: Text-to-speech synthesis with real-time lip synchronization
- **React-based UI**: Modern, responsive interface built with React and React Three Fiber
- **Customizable Characters**: Configure VRM models and character personalities through VS Code settings

## Requirements

- Visual Studio Code 1.104.0 or higher
- GitHub Copilot subscription (for Chat Participant functionality)
- Node.js 20.x or higher (for development)

## Extension Settings

This extension contributes the following settings:

- `ai-character-companion.vrmPath`: Path to your local .vrm file for the avatar model
- `ai-character-companion.vrmaPath`: Path to your local .vrma file for idle animation
- `ai-character-companion.systemPrompt`: Personality profile of the character (supports multiline text)

## Architecture

This extension follows VS Code's process isolation model:

| Component          | Environment        | Role                                                                        |
| ------------------ | ------------------ | --------------------------------------------------------------------------- |
| **Extension Host** | Node.js            | Handles Copilot API calls, file operations, and settings management         |
| **Webview**        | Chromium (Browser) | Renders the 3D avatar using WebGL (Three.js), plays audio via Web Audio API |

Communication between these environments is handled through VS Code's message passing (IPC) system.

## Technology Stack

- **Extension Host**: TypeScript, VS Code Extension API
- **Webview UI**: React, React Three Fiber
- **3D Rendering**: Three.js, @pixiv/three-vrm
- **Build Tool**: esbuild

## Development

### Prerequisites

1. Clone the repository
2. Run `npm install` to install dependencies
3. (Optional) Run `npm run setup` to create junction links to the `externals/terraformer` content used by the repo
4. Open the project in VS Code

### Building

```bash
# Watch mode for development
npm run watch

# Production build
npm run compile
```

### Running

1. Press `F5` to open a new VS Code window with the extension loaded
2. Ensure the **Avatar Companion** view is visible in the Explorer sidebar
3. Use `@avatar` in Copilot Chat to interact with the avatar

### Project Structure

```
src/
├── extension/        # Extension Host (Node.js)
│   ├── extension.ts  # Entry point
│   ├── chat/         # Copilot Chat Participant
│   └── tools/         # Language Model tools
├── webview/          # Webview (React)
│   ├── index.tsx     # React entry point
│   ├── components/   # UI components
│   └── modules/       # Voice / animation helpers
└── shared/           # Shared type definitions
    └── types.ts      # IPC message protocols

dist/
├── extension.js       # Extension Host bundle (CJS)
└── webview.js         # Webview bundle (IIFE)
```

## Development Phases

1. **Foundation**: React Webview integration and IPC communication
2. **Copilot Integration**: Chat Participant implementation and streaming
3. **3D Avatar**: Three.js/React Three Fiber and VRM rendering
4. **Voice Synthesis**: TTS and lip-sync implementation
5. **Settings Management**: User configuration and profile management

## Known Issues

- Audio autoplay may require user interaction due to browser policies
- WebGL context may be lost when Webview is backgrounded

## Release Notes

### 0.0.1

Initial development release

---

## References

- [VS Code Extension API](https://code.visualstudio.com/api)
- [Chat Participant API](https://code.visualstudio.com/api/extension-guides/ai/chat)
- [Webview API](https://code.visualstudio.com/api/extension-guides/webview)
- [three-vrm](https://pixiv.github.io/three-vrm/)
- [React Three Fiber](https://docs.pmnd.rs/react-three-fiber)

## License

MIT

**Enjoy!**
