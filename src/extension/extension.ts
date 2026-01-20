/*
 * Copyright (c) 2026 LongbowXXX
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import * as vscode from "vscode";
import { FromWebviewMessage, ToWebviewMessage } from "../shared/types";
import { activateChatParticipant } from "./chat/participant";

export function activate(context: vscode.ExtensionContext) {
  console.log(
    'Congratulations, your extension "ai-character-companion" is now active!',
  );

  // Register WebviewViewProvider
  const provider = new AvatarWebviewProvider(context.extensionUri);
  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(
      AvatarWebviewProvider.viewType,
      provider,
    ),
  );

  // Activate Chat Participant
  activateChatParticipant(context, provider);

  const disposable = vscode.commands.registerCommand(
    "ai-character-companion.helloWorld",
    () => {
      vscode.window.showInformationMessage(
        "Hello World from AI Character Companion!",
      );
    },
  );
  context.subscriptions.push(disposable);
}

export function deactivate() {}

export class AvatarWebviewProvider implements vscode.WebviewViewProvider {
  public static readonly viewType = "ai-character-companion.avatarView";
  private _view?: vscode.WebviewView;

  constructor(private readonly _extensionUri: vscode.Uri) {}

  public resolveWebviewView(
    webviewView: vscode.WebviewView,
    context: vscode.WebviewViewResolveContext,
    _token: vscode.CancellationToken,
  ) {
    this._view = webviewView;
    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [vscode.Uri.joinPath(this._extensionUri, "dist")],
    };

    webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);

    // Handle messages from the Webview
    webviewView.webview.onDidReceiveMessage((message: FromWebviewMessage) => {
      switch (message.type) {
        case "READY":
          vscode.window.showInformationMessage("Avatar View is Ready!");
          // Send a test message back
          this.postMessageToWebview({
            type: "SPEAK",
            text: "Hello from Extension Host!",
          });
          break;
        case "SPEECH_END":
          console.log("Speech ended");
          break;
        case "ERROR":
          vscode.window.showErrorMessage(`Webview Error: ${message.message}`);
          break;
      }
    });
  }

  public postMessageToWebview(message: ToWebviewMessage) {
    if (this._view) {
      this._view.webview.postMessage(message);
    }
  }

  private _getHtmlForWebview(webview: vscode.Webview) {
    const scriptUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, "dist", "webview.js"),
    );
    const nonce = getNonce();

    return `<!DOCTYPE html>
			<html lang="en">
			<head>
				<meta charset="UTF-8">
				<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource} 'unsafe-inline'; script-src 'nonce-${nonce}';">
				<meta name="viewport" content="width=device-width, initial-scale=1.0">
				<title>Avatar Companion</title>
			</head>
			<body>
				<div id="root"></div>
				<script nonce="${nonce}" src="${scriptUri}"></script>
			</body>
			</html>`;
  }
}

function getNonce() {
  let text = "";
  const possible =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (let i = 0; i < 32; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}
