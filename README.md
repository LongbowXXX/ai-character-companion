# AI Character Companion (VS Code Extension)

VS Code 上で 3D アバター (VRM) と対話できる拡張機能プロジェクトです。
GitHub Copilot Chat と連携し、React ベースの UI 上でアバターが音声応答を行うマルチモーダルインターフェースを提供します。

## 概要

このプロジェクトは、以下の技術を統合して、よりインタラクティブなコーディング体験を実現することを目指しています。

- **GitHub Copilot Chat 連携**: `@character_name` としてチャットに参加し、LLM による応答を生成します。
- **3D アバター表示**: VRM 形式のアバターを React Three Fiber を使用して Webview 上にレンダリングします。
- **音声合成とリップシンク**: アバターが応答内容を音声で読み上げ、口の動き (リップシンク) を同期させます。
- **React ベースの UI**: VS Code の Webview UI Toolkit を活用したモダンなユーザーインターフェース。

## 開発計画

詳細は `docs/INITIAL_DEVELOPMENT_PLAN.md` を参照してください。現在は以下のフェーズに分けて開発を進めています。

1. **基盤構築**: Extension Host と Webview (React) 間の通信確立。
2. **Copilot 連携**: Chat Participant API を使用した対話ロジックの実装。
3. **アバター表示**: Three.js / React Three Fiber による VRM アバターの描画。
4. **音声・リップシンク**: 音声合成とアバターの口パク同期の実装。
5. **設定・カスタマイズ**: ユーザー設定によるアバター変更等の機能追加。

## ライセンス

[MIT License](LICENSE)
