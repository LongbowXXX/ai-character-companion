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
  // Listen for config changes
  context.subscriptions.push(
    vscode.workspace.onDidChangeConfiguration((e) => {
      if (
        e.affectsConfiguration("ai-character-companion.vrmPath") ||
        e.affectsConfiguration("ai-character-companion.vrmaPath") ||
        e.affectsConfiguration("ai-character-companion.systemPrompt")
      ) {
        provider.updateWebviewState();
      }
    }),
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
      localResourceRoots: [
        vscode.Uri.joinPath(this._extensionUri, "dist"),
        // Allow access to any local file if the user picks one
        vscode.Uri.file("/"),
      ],
    };

    webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);

    // Initial Load
    this._updateWebviewStateInternal(webviewView.webview);

    // Handle messages from the Webview
    webviewView.webview.onDidReceiveMessage((message: FromWebviewMessage) => {
      switch (message.type) {
        case "READY":
          vscode.window.showInformationMessage("Avatar View is Ready!");
          this._updateWebviewStateInternal(webviewView.webview);
          break;
        case "SPEECH_END":
          console.log("Speech ended");
          break;
        case "ERROR":
          vscode.window.showErrorMessage(`Webview Error: ${message.message}`);
          break;
      }
    });

    // Listen for config changes
    // Moved to activate() because we need ExtensionContext
  }

  public updateWebviewState() {
    if (this._view) {
      this._updateWebviewStateInternal(this._view.webview);
    }
  }

  private _updateWebviewStateInternal(webview: vscode.Webview) {
    const config = vscode.workspace.getConfiguration("ai-character-companion");
    const vrmPath = config.get<string>("vrmPath");
    const vrmaPath = config.get<string>("vrmaPath");

    let finalUri = "";
    if (vrmPath && vrmPath.trim() !== "") {
      // Basic validation
      if (
        !vrmPath.toLowerCase().endsWith(".vrm") &&
        !vrmPath.toLowerCase().endsWith(".glb")
      ) {
        vscode.window.showWarningMessage(
          "Invalid VRM Path: Must end with .vrm or .glb",
        );
      } else {
        try {
          const fileUri = vscode.Uri.file(vrmPath);

          // Allow access to the VRM file's directory
          if (this._view) {
            const distUri = vscode.Uri.joinPath(this._extensionUri, "dist");
            const vrmDir = vscode.Uri.joinPath(fileUri, "..");
            this._view.webview.options = {
              enableScripts: true,
              localResourceRoots: [distUri, vrmDir],
            };
          }

          finalUri = webview.asWebviewUri(fileUri).toString();
        } catch (e) {
          console.error("Failed to convert VRM path", e);
        }
      }
    }

    // Handle VRMA Path
    let finalVrmaUri = "";
    console.log("Extension: Reading VRMA Path from Config:", vrmaPath);

    if (vrmaPath && vrmaPath.trim() !== "") {
      if (!vrmaPath.toLowerCase().endsWith(".vrma")) {
        console.warn("Extension: Invalid VRMA extension");
        vscode.window.showWarningMessage(
          "Invalid VRMA Path: Must end with .vrma",
        );
      } else {
        try {
          const vrmaFileUri = vscode.Uri.file(vrmaPath);
          console.log("Extension: Resolved VRMA URI:", vrmaFileUri.toString());
          if (this._view) {
            const vrmaDir = vscode.Uri.joinPath(vrmaFileUri, "..");
            // Add to localResourceRoots (merging with existing)
            // FIXME: Updating options triggers a reload, causing an infinite loop with the READY message.
            /*
            const currentRoots =
              this._view.webview.options.localResourceRoots || [];
            this._view.webview.options = {
              ...this._view.webview.options,
              localResourceRoots: [...currentRoots, vrmaDir],
            };
            */
            console.log(
              "Extension: Skipped updating localResourceRoots to prevent reload loop.",
            );
          }
          finalVrmaUri = webview.asWebviewUri(vrmaFileUri).toString();
          console.log("Extension: Generated Webview URI:", finalVrmaUri);
        } catch (e) {
          console.error("Extension: Failed to process VRMA path", e);
        }
      }
    } else {
      console.log("Extension: VRMA Path is empty or undefined");
    }

    this.postMessageToWebview({
      type: "LOAD_VRM",
      uri: finalUri,
      vrmaUri: finalVrmaUri,
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
				<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource} 'unsafe-inline'; script-src 'nonce-${nonce}'; img-src ${webview.cspSource} https: blob: data:; connect-src ${webview.cspSource} https: blob: data:;">
				<meta name="viewport" content="width=device-width, initial-scale=1.0">
				<title>Avatar Companion</title>
                <style>
                    html, body { margin: 0; padding: 0; width: 100%; height: 100%; overflow: hidden; background-color: transparent; }
                    #root { width: 100%; height: 100%; }
                </style>
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
