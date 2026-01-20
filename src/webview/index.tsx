/*
 * Copyright (c) 2026 LongbowXXX
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import * as React from "react";
import * as ReactDOM from "react-dom/client";
import { FromWebviewMessage, ToWebviewMessage } from "../shared/types";
import { AvatarScene } from "./components/AvatarScene";

// Acquire VS Code API (must be called once)
const vscode = acquireVsCodeApi();

class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("ErrorBoundary caught an error", error, errorInfo);
    // Send error to Extension Host
    vscode.postMessage({
      type: "ERROR",
      message: error.message,
    } as FromWebviewMessage);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 20, color: "red", backgroundColor: "white" }}>
          <h2>Something went wrong.</h2>
          <pre>{this.state.error?.toString()}</pre>
          <pre>{this.state.error?.stack}</pre>
        </div>
      );
    }

    return this.props.children;
  }
}

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
    <ErrorBoundary>
      <AvatarScene />
      <div
        style={{
          padding: "10px",
          position: "absolute",
          top: 0,
          left: 0,
          color: "white",
          textShadow: "1px 1px 2px black",
        }}
      >
        <h1>Avatar Companion</h1>
        <p>Status: {lastMessage}</p>
        <button onClick={sendReady}>Send READY Signal</button>
      </div>
    </ErrorBoundary>
  );
};

const rootElement = document.getElementById("root");
if (rootElement) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(<App />);
}
