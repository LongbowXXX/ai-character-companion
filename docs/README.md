# Docs Index

このディレクトリは、AI Character Companion（VS Code拡張）の設計・実装ウォークスルー・開発手順をまとめたものです。

## まず読む

- [walkthrough_phase1.md](walkthrough_phase1.md) — Phase 1（基盤/IPC/ビルド分離）の実装状況まとめ
- [DEVELOPMENT.md](DEVELOPMENT.md) — 開発者向けの実行手順（watch / F5 / 設定）

## 設計資料（リサーチ/計画）

- [INITIAL_DEVELOPMENT_PLAN.md](INITIAL_DEVELOPMENT_PLAN.md) — アーキテクチャと段階的実装計画（研究ノート）

## アーキテクチャ

- [architecture/overview.md](architecture/overview.md) — 全体像と設計方針
- [architecture/directory-structure.md](architecture/directory-structure.md) — ディレクトリ構成
- [architecture/key-flows.md](architecture/key-flows.md) — 主要フロー
- [architecture/tech-stack.md](architecture/tech-stack.md) — 技術スタック
- [architecture/constraints.md](architecture/constraints.md) — 制約/注意点

## ルール

- [rules/coding-conventions.md](rules/coding-conventions.md) — コーディング規約
- [rules/testing.md](rules/testing.md) — テスト方針

## 用語集

- [glossary.md](glossary.md) — 用語/略語

## 補足

- このリポジトリは `externals/terraformer` を参照し、`npm run setup`（[scripts/setup-links.js](../scripts/setup-links.js)）で `knowledge/` と `.copilot/` 配下にジャンクションを作成します。
- 実装上の事実（参加者ID、設定キー、生成されるバンドル名など）は `package.json` と `src/` の内容を正とします。
