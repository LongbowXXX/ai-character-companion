# Development

このドキュメントは、拡張のローカル開発（ビルド/実行/設定）を最短で回すための手順です。

## 前提

- VS Code `^1.104.0`
- Node.js 20+ / npm
- GitHub Copilot（Chat Participant を使う場合）

## セットアップ

```bash
npm install

# 任意: externals/terraformer の内容をリンク（Windowsではjunction作成）
npm run setup
```

`npm run setup` は `externals/terraformer` が未初期化の場合、`git submodule update --init --recursive` を試行します。

## ビルド

- Watch（開発中はこちら）

```bash
npm run watch
```

`watch` は以下を並列実行します。

- `watch:tsc`: `tsc --noEmit --watch`
- `watch:esbuild`: `node esbuild.js --watch`

- Production（パッケージ向け）

```bash
npm run package
```

生成物:

- `dist/extension.js`（Extension Host / CommonJS）
- `dist/webview.js`（Webview / IIFE）

## 実行（VS Codeでデバッグ）

1. このリポジトリをVS Codeで開く
2. `npm run watch` を動かしたまま
3. `F5` で Extension Development Host を起動
4. Explorer サイドバーに **Avatar Companion** view（`ai-character-companion.avatarView`）が表示されることを確認
5. Copilot Chat で `@avatar` に話しかける

## 設定

VS Codeの設定キー:

- `ai-character-companion.vrmPath`: `.vrm` または `.glb`（空ならデフォルト）
- `ai-character-companion.vrmaPath`: `.vrma`（空なら未使用/プロシージャル）
- `ai-character-companion.systemPrompt`: キャラ人格（複数行）

例（`.vscode/settings.json`）:

```json
{
  "ai-character-companion.systemPrompt": "You are a helpful AI assistant avatar.",
  "ai-character-companion.vrmPath": "C:/path/to/avatar.vrm",
  "ai-character-companion.vrmaPath": "C:/path/to/idle.vrma"
}
```

## トラブルシュート

- VRM/VRMA が読み込まれない: パス拡張子（`.vrm`/`.glb`/`.vrma`）とファイル実在を確認
- Viewが更新されない: 設定変更後に view を開き直す／開発ホスト側の通知を確認
