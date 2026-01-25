/*
 * Copyright (c) 2026 LongbowXXX
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import * as vscode from "vscode";
import { AvatarWebviewProvider } from "../extension";

const PARTICIPANT_ID = "ai-character-companion.avatar";

interface IChatResult extends vscode.ChatResult {
  metadata: {
    command: string;
  };
}

export function activateChatParticipant(
  context: vscode.ExtensionContext,
  webviewProvider: AvatarWebviewProvider,
) {
  const handler: vscode.ChatRequestHandler = async (
    request: vscode.ChatRequest,
    context: vscode.ChatContext,
    stream: vscode.ChatResponseStream,
    token: vscode.CancellationToken,
  ): Promise<IChatResult | undefined> => {
    // 1. Define Tools
    const tools: vscode.LanguageModelChatTool[] = [
      {
        name: "speak",
        description:
          "Speak to the user with a specific emotional expression and text. Use this to reply to the user.",
        inputSchema: {
          type: "object",
          properties: {
            text: {
              type: "string",
              description: "The text content to speak.",
            },
            expression: {
              type: "string",
              description:
                "The facial expression/emotion to use. Valid values: neutral, happy, angry, sad, relaxed, surprised.",
              enum: [
                "neutral",
                "happy",
                "angry",
                "sad",
                "relaxed",
                "surprised",
              ],
            },
          },
          required: ["text"],
        },
      },
      {
        name: "get_character_settings",
        description:
          "Retrieve the character's system prompt (personality) and other settings.",
        inputSchema: {
          type: "object",
          properties: {},
        },
      },
    ];

    // 2. Prepare Messages
    const config = vscode.workspace.getConfiguration("ai-character-companion");
    const systemPrompt =
      config.get<string>("systemPrompt") ||
      "You are a helpful AI assistant avatar.";

    const messages: vscode.LanguageModelChatMessage[] = [
      vscode.LanguageModelChatMessage.User(
        `System Prompt: ${systemPrompt}\n\nYou are an avatar. You can speak to the user using the 'speak' tool. Always use the 'speak' tool to reply, unless you are just thinking.`,
      ),
      vscode.LanguageModelChatMessage.User(request.prompt),
    ];

    // 3. Tool Use Loop
    const maxIterations = 5;
    for (let i = 0; i < maxIterations; i++) {
      if (token.isCancellationRequested) {
        break;
      }

      try {
        const chatResponse = await request.model.sendRequest(
          messages,
          { tools },
          token,
        );

        const toolCalls: vscode.LanguageModelToolCallPart[] = [];

        for await (const part of chatResponse.stream) {
          if (part instanceof vscode.LanguageModelTextPart) {
            stream.markdown(part.value);
          } else if (part instanceof vscode.LanguageModelToolCallPart) {
            toolCalls.push(part);
          }
        }

        if (toolCalls.length === 0) {
          // No tools called, we are done
          break;
        }

        // Handle Tool Calls
        for (const toolCall of toolCalls) {
          // Add the tool call to history
          messages.push(
            vscode.LanguageModelChatMessage.Assistant([
              new vscode.LanguageModelToolCallPart(
                toolCall.callId,
                toolCall.name,
                toolCall.input,
              ),
            ]),
          );

          let result: any = "Tool not found or failed";

          if (toolCall.name === "get_character_settings") {
            result = {
              systemPrompt: systemPrompt,
              validExpressions: [
                "neutral",
                "happy",
                "angry",
                "sad",
                "relaxed",
                "surprised",
              ],
            };
          } else if (toolCall.name === "speak") {
            const args = toolCall.input as {
              text: string;
              expression?: string;
            };
            webviewProvider.postMessageToWebview({
              type: "SPEAK",
              text: args.text,
              expression: args.expression,
            });
            result = { status: "success", message: "Message sent to avatar." };
          }

          // Add Tool Result
          messages.push(
            vscode.LanguageModelChatMessage.User([
              new vscode.LanguageModelToolResultPart(toolCall.callId, result),
            ]),
          );
        }
        // Loop triggers again to let the model react to the tool result or stop.
      } catch (err) {
        console.error("Error in chat loop:", err);
        stream.markdown("\n\n*Error communicating with Copilot.*");
        break;
      }
    }

    return { metadata: { command: "" } };
  };

  const participant = vscode.chat.createChatParticipant(
    PARTICIPANT_ID,
    handler,
  );
  context.subscriptions.push(participant);
}
