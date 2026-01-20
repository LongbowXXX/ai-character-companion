/*
 * Copyright (c) 2026 LongbowXXX
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import * as React from "react";
import * as ReactDOM from "react-dom/client";
import { FromWebviewMessage, ToWebviewMessage } from "../shared/types";

// Acquire VS Code API (must be called once)
const vscode = acquireVsCodeApi();

const App = () => {
  const [lastMessage, setLastMessage] =
    React.useState<string>("No messages yet");

  React.useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      const message = event.data as ToWebviewMessage;
      switch (message.type) {
        case "SPEAK":
          setLastMessage(`Received SPEAK: ${message.text}`);
          break;
        case "UPDATE_PROFILE":
          setLastMessage(`Updated Profile: ${message.profile.name}`);
          break;
        case "LOAD_VRM":
          setLastMessage(`Loading VRM: ${message.uri}`);
          break;
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  const sendReady = () => {
    vscode.postMessage({ type: "READY" } as FromWebviewMessage);
  };

  return (
    <div style={{ padding: "10px" }}>
      <h1>Avatar Companion</h1>
      <p>Status: {lastMessage}</p>
      <button onClick={sendReady}>Send READY Signal</button>
    </div>
  );
};

const rootElement = document.getElementById("root");
if (rootElement) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(<App />);
}
