/*
 * Copyright (c) 2026 LongbowXXX
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import * as vscode from "vscode";
import { AvatarWebviewProvider } from "../extension"; // Will need to export this from extension.ts or move it

const PARTICIPANT_ID = "ai-character-companion.avatar";

export function activateChatParticipant(
  context: vscode.ExtensionContext,
  webviewProvider: AvatarWebviewProvider,
) {
  const handler: vscode.ChatRequestHandler = async (
    request: vscode.ChatRequest,
    context: vscode.ChatContext,
    stream: vscode.ChatResponseStream,
    token: vscode.CancellationToken,
  ) => {
    // System prompt to define personality
    const systemPrompt =
      "You are a helpful AI assistant avatar. Respond in a friendly manner.";

    const messages = [
      vscode.LanguageModelChatMessage.User(systemPrompt),
      vscode.LanguageModelChatMessage.User(request.prompt),
    ];

    try {
      // Send request to Copilot (GPT-4)
      const chatResponse = await request.model.sendRequest(messages, {}, token);

      let accumulatedText = "";

      for await (const fragment of chatResponse.text) {
        // Stream text to the Code Chat UI
        stream.markdown(fragment);

        accumulatedText += fragment;

        // Simple sentence detection (improve this later)
        if (
          fragment.includes(".") ||
          fragment.includes("!") ||
          fragment.includes("?") ||
          fragment.includes("\n")
        ) {
          // Send chunk to Webview for speech/animation
          // We send the *incremental* chunk if we were sophisticated,
          // but for now let's just send the whole sentence logic in the future.
          // For this step, let's just verify streaming works.
        }
      }

      // After stream ends, send the full text (or remaining text) to Webview
      // In a real app, we'd queue sentences.
      webviewProvider.postMessageToWebview({
        type: "SPEAK",
        text: accumulatedText,
      });
    } catch (err) {
      stream.markdown("Error communicating with Copilot.");
      console.error(err);
    }
  };

  const participant = vscode.chat.createChatParticipant(
    PARTICIPANT_ID,
    handler,
  );
  // participant.iconPath = ... // Icon setup
  context.subscriptions.push(participant);
}
