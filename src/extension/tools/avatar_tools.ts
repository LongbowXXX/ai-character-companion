/*
 * Copyright (c) 2026 LongbowXXX
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import * as vscode from "vscode";
import { AvatarWebviewProvider } from "../extension";

export function registerAvatarTools(
  context: vscode.ExtensionContext,
  webviewProvider: AvatarWebviewProvider,
) {
  // Register 'speak' tool
  context.subscriptions.push(
    vscode.lm.registerTool("ai-character-companion_speak", {
      invoke: async (
        options: vscode.LanguageModelToolInvocationOptions<{
          text: string;
          expression?: string;
        }>,
        token: vscode.CancellationToken,
      ) => {
        const input = options.input;
        webviewProvider.postMessageToWebview({
          type: "SPEAK",
          text: input.text,
          expression: input.expression,
        });

        return new vscode.LanguageModelToolResult([
          new vscode.LanguageModelTextPart("Message sent to avatar."),
        ]);
      },
    }),
  );

  // Register 'get_character_settings' tool
  context.subscriptions.push(
    vscode.lm.registerTool("ai-character-companion_get_character_settings", {
      invoke: async (
        options: vscode.LanguageModelToolInvocationOptions<any>,
        token: vscode.CancellationToken,
      ) => {
        const config = vscode.workspace.getConfiguration(
          "ai-character-companion",
        );
        const systemPrompt =
          config.get<string>("systemPrompt") ||
          "You are a helpful AI assistant avatar.";

        return new vscode.LanguageModelToolResult([
          new vscode.LanguageModelTextPart(
            JSON.stringify({
              systemPrompt: systemPrompt,
              validExpressions: [
                "neutral",
                "happy",
                "angry",
                "sad",
                "relaxed",
                "surprised",
              ],
            }),
          ),
        ]);
      },
    }),
  );
}
