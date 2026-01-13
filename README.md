# AI Character Companion

A VS Code extension that integrates GitHub Copilot Chat with an interactive 3D avatar (VRM) that responds with voice and lip-sync animations. Create an immersive coding companion experience by chatting with customizable AI characters.

## Features

- **Copilot Chat Integration**: Interact with AI characters using `@character_name` mentions in VS Code's chat interface
- **3D VRM Avatar**: Display animated 3D avatars using the VRM format, supporting expressions and lip-sync
- **Voice Response**: Text-to-speech synthesis with real-time lip synchronization
- **React-based UI**: Modern, responsive interface built with React and React Three Fiber
- **Customizable Characters**: Configure VRM models and character personalities through VS Code settings

## Requirements

- Visual Studio Code 1.96.0 or higher
- GitHub Copilot subscription (for Chat Participant functionality)
- Node.js 18.x or higher (for development)

## Extension Settings

This extension contributes the following settings:

- `ai-character-companion.vrmPath`: Path to your local .vrm file for the avatar model
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
- **Build Tool**: esbuild / Webpack
- **UI Components**: Webview UI Toolkit for VS Code

## Development

### Prerequisites

1. Clone the repository
2. Run `npm install` to install dependencies
3. Open the project in VS Code

### Building

```bash
# Watch mode for development
npm run watch

# Production build
npm run compile
```

### Running

1. Press `F5` to open a new VS Code window with the extension loaded
2. Open the Command Palette and look for extension commands
3. Use `@character_name` in Copilot Chat to interact with the avatar

### Project Structure

```
src/
├── extension/        # Extension Host (Node.js)
│   ├── extension.ts  # Entry point
│   ├── chat/         # Copilot Chat Participant
│   └── utilities/
├── webview/          # Webview (React)
│   ├── index.tsx     # React entry point
│   ├── components/   # UI components
│   ├── avatar/       # Three.js/VRM logic
│   └── style/
└── shared/           # Shared type definitions
    └── types.ts      # IPC message protocols
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
