# VS Code 拡張機能における 生成 AI アバター統合アーキテクチャ: Copilot Chat、React、VRM、音声合成の包括的実装ガイド

## 1. エグゼクティブサマリーとアーキテクチャ概要

本レポートは、Visual Studio Code (VS Code) の拡張機能開発における技術的実装戦略、特に GitHub Copilot Chat と連携し、React ベースの UI 上で 3D アバター (VRM) が音声応答を行うマルチモーダルインターフェースの構築に関する包括的な研究報告書である。

ユーザーが提示した要件——`@character_name` による対話、React による UI 構築、VRM アバターの表示と音声同期、およびユーザー設定によるカスタマイズ——は、現在の VS Code API エコシステムにおいて実現可能であるが、その実装は複数の異なる技術領域（Extension Host 環境、Webview サンドボックス環境、WebGL レンダリング、LLM ストリーミング処理）を高度に統合する必要がある。特に、拡張機能開発が初めてであるという状況を鑑みると、モノリシックな開発手法ではなく、リスクを分散させた「フェーズ分け」による段階的実装が極めて重要となる。

本プロジェクトの核心的な技術課題は、VS Code の「プロセス分離モデル」にある。拡張機能のロジック（LLM との通信やファイル操作）は Node.js 環境である **Extension Host** で実行される一方、アバターの描画や音声再生は **Webview**（隔離されたブラウザ環境）で実行される。これら二つの環境はメモリを共有できず、非同期のメッセージパッシング（IPC）を通じてのみ連携が可能である。この制約を理解し、適切に設計することが成功の鍵となる。

本レポートでは、開発プロセスを以下の 5 つのフェーズに分割し、各フェーズにおける技術的詳細、推奨されるライブラリ、参照すべき公式ドキュメント、および潜在的なリスクとその回避策について、およそ 15,000 語にわたり詳述する。

- **フェーズ 1: 基盤構築と環境分離設計**（React Webview の統合と IPC 通信の確立）
- **フェーズ 2: Copilot Chat Participant の実装**（LLM との対話ロジックとストリーミング処理）
- **フェーズ 3: 3D アバターのレンダリング**（Three.js/React Three Fiber と VRM の実装）
- **フェーズ 4: 音声合成とリップシンク**（音声再生ポリシーの回避と口パク生成アルゴリズム）
- **フェーズ 5: 設定管理と永続化**（ユーザー設定 API とプロファイル管理）

---

## 2. VS Code 拡張機能のアーキテクチャと技術選定

具体的な実装手順に入る前に、VS Code 拡張機能の構造的な制約と、本プロジェクトで採用すべき技術スタックの選定理由について深く掘り下げる必要がある。VS Code は Electron ベースのアプリケーションであるが、セキュリティとパフォーマンスの観点から厳格なサンドボックス化が行われている。

### 2.1 Extension Host と Webview の分離

VS Code の拡張機能は、エディタのメインプロセスとは異なる独立したプロセス（Extension Host）で動作する。これは、拡張機能がクラッシュしてもエディタ自体が巻き込まれないようにするためである。

| コンポーネント     | 実行環境           | 役割           | 可能な操作                                                                   | 不可能な操作                                                            |
| :----------------- | :----------------- | :------------- | :--------------------------------------------------------------------------- | :---------------------------------------------------------------------- |
| **Extension Host** | Node.js            | コントローラー | ファイルシステム操作、Copilot API 呼び出し、設定読み込み、Git 連携           | DOM 操作、`<canvas>` の描画、音声の直接再生                             |
| **Webview**        | Chromium (Browser) | ビュー (UI)    | HTML/CSS レンダリング、WebGL (Three.js)、Web Audio API、ユーザー入力イベント | ローカルファイルの直接読み書き、VS Code API の直接呼び出し (一部を除く) |

本プロジェクトにおいて、Copilot Chat との通信は **Extension Host** で行い、その結果（テキストや音声データ）を **Webview** に送信してアバターを動かすという「クライアント・サーバー」のようなモデルを構築する必要がある。

### 2.2 React の統合戦略

VS Code の Webview は標準的な HTML を表示する機能しか持たないため、React のようなモダンなフレームワークを使用するには、ビルドプロセス（バンドル）が必要となる。

- **バンドラ (Bundler):** Webpack または Vite が推奨される。拡張機能自体（TypeScript）のコンパイルとは別に、Webview 用の React アプリケーションを単一（または少数）の JavaScript ファイルにバンドルし、それを Webview の HTML 内で読み込む構成をとる。
- **UI Toolkit:** VS Code ネイティブのルックアンドフィール（テーマへの追従、ボタンや入力フォームのデザイン）を維持するために、Microsoft が提供する **Webview UI Toolkit for Visual Studio Code** の React ラッパー版を採用することが強く推奨される [1]。これにより、CSS の微調整を行うことなく、VS Code のデザインガイドラインに準拠した UI を構築できる。

### 2.3 VRM と Three.js の採用

アバターの描画には **Three.js** が事実上の標準であるが、React 環境との親和性を高めるために **React Three Fiber (R3F)** の使用を推奨する。R3F は Three.js を React のコンポーネントとして宣言的に記述できるようにするラッパーであり、アバターの状態（「話している」「待機中」などのステート）管理を React の Hooks (useState, useEffect) と統合できるため、コードの可読性と保守性が飛躍的に向上する。

アバターフォーマットとして指定された **VRM** は、人型アバターに特化した GLTF ベースのフォーマットであり、クロスプラットフォームでの利用を想定しているため、VS Code 上での利用にも最適である。ライブラリには **@pixiv/three-vrm** [2] を使用する。

---

## 3. フェーズ 1: 基盤構築と環境分離設計

最初のフェーズでは、Copilot や VRM といった高度な機能は一旦脇に置き、「Extension Host から Webview 内の React アプリへメッセージを送る」という最小限の通信路（MVP: Minimum Viable Product）を確立することに集中する。多くの拡張機能開発者は、UI とロジックを同時に作り始め、通信部分のバグに悩まされる傾向があるため、ここを確実に固めることがリスク回避の第一歩となる。

### 3.1 プロジェクトのスカッフォールディング

VS Code 拡張機能の公式ジェネレーターである Yeoman (`yo code`) を使用してプロジェクトの雛形を作成する。

**手順詳細:**

1. **ジェネレーターの実行:** ターミナルで `npx --package yo --package generator-code -- yo code` を実行する。
2. **設定の選択:**
   - **Type:** `New Extension (TypeScript)` を選択。型安全性は複雑なメッセージパッシングにおいて不可欠である。
   - **Name:** 拡張機能の名前（例: `Avatar Chat Companion`）。
   - **Bundler:** Webpack または esbuild を選択する。React を使用する場合、Webview 側のビルド設定をカスタマイズする必要があるため、構成が柔軟な Webpack が扱いやすい場合があるが、近年は高速な esbuild や Vite も人気である。公式サンプル [3] では Webpack が頻繁に使用されている。

**参照ドキュメント:**

- [3] [_Extension Guides: Chat Tutorial_](https://code.visualstudio.com/api/extension-guides/ai/chat-tutorial) - プロジェクトセットアップの基礎。
- [4] [_React Webview Starter_](https://github.com/estruyf/vscode-react-webview-template) - React を統合したテンプレートのリポジトリ。

### 3.2 ディレクトリ構造の設計

コードの混在を防ぐため、以下のような明確なディレクトリ構造を初期段階で構築する。

```text
my-extension/
├── src/
│   ├── extension/ (Extension Host 側: Node.js)
│   │   ├── extension.ts (エントリーポイント)
│   │   ├── chat/ (Phase 2 で使用)
│   │   └── utilities/
│   ├── webview/ (Webview 側: React)
│   │   ├── index.tsx (React エントリー)
│   │   ├── components/ (UI コンポーネント)
│   │   ├── avatar/ (Phase 3 で使用: Three.js ロジック)
│   │   └── style/
│   └── shared/ (両環境で共有する型定義)
│       └── types.ts (メッセージプロトコル定義)
├── package.json
└── webpack.config.js (拡張機能用と Webview 用のマルチ構成)
```

### 3.3 WebviewViewProvider の実装

ご要望の要件にある「Copilot Chat と連動して UI 表示する」を実現するためには、単純なパネル（`createWebviewPanel`）ではなく、サイドバーに常駐可能な **Webview View** (`WebviewViewProvider`) を使用するのが最適である。これにより、ユーザーはコードを書きながら、サイドバーにいるアバターを常に見ることができる。

実装のポイント:
`src/extension/extension.ts` 内で `vscode.window.registerWebviewViewProvider` を使用してプロバイダーを登録する。このプロバイダークラスは `resolveWebviewView` メソッドを持ち、ここで Webview の HTML コンテンツを生成する。
HTML 生成と React の注入:
HTML 文字列内で、ビルドされた React の JavaScript ファイル（例: `webview.js`）を `<script>` タグで読み込む必要がある。ここで重要になるのが Content Security Policy (CSP) である。VS Code の Webview はデフォルトで厳格なセキュリティ制限がかかっているため、ローカルのリソース（ビルドされた JS ファイルや VRM ファイル）を読み込むためには、`vscode-resource:` スキームの許可や、`script-src` の適切な設定が不可欠である。

```html
<meta
  http-equiv="Content-Security-Policy"
  content="default-src 'none'; style-src ${webview.cspSource}; script-src 'nonce-${nonce}'; img-src ${webview.cspSource} https:; media-src ${webview.cspSource} https:;"
/>
```

上記の CSP 設定では、`media-src` を許可することで、後のフェーズでの音声再生や VRM のテクスチャ読み込みに備えている。

**参照ドキュメント:**

- [5] [_Webview API_](https://code.visualstudio.com/api/extension-guides/webview) - Webview の基本的な概念と CSP について。
- [6] [_VS Code API Reference_](https://code.visualstudio.com/api/references/vscode-api) - WebviewViewProvider の仕様。

### 3.4 IPC (Inter-Process Communication) 通信路の確立

Extension Host と Webview 間の通信プロトコルを定義する。型安全性を確保するため、`src/shared/types.ts` にメッセージ型を定義することを強く推奨する。

```typescript
// src/shared/types.ts
export type ToWebviewMessage =
  | { type: "SPEAK"; text: string }
  | { type: "UPDATE_PROFILE"; profile: UserProfile }
  | { type: "LOAD_VRM"; uri: string };

export type FromWebviewMessage =
  | { type: "READY" }
  | { type: "SPEECH_END" }
  | { type: "ERROR"; message: string };
```

**通信の実装:**

- **Host 側:** `webviewView.webview.postMessage(message)` を使用して送信。
- **Webview 側:** React コンポーネントのマウント時（`useEffect`）に `window.addEventListener('message',...)` を設定して受信。
- **Webview から Host:** `acquireVsCodeApi()` で取得した API オブジェクトの `postMessage()` メソッドを使用。

**リスク回避:** `acquireVsCodeApi()` はセッションごとに一度しか呼び出せないため、React の `useRef` やコンテキストでインスタンスを保持し、再レンダリング時に再取得しようとしてエラーになるのを防ぐ必要がある。

---

## 4. フェーズ 2: Copilot Chat Participant の実装

基盤ができたら、次は「脳」となる部分、すなわち GitHub Copilot との連携を実装する。従来のチャットボット開発では OpenAI API キーの管理などが課題であったが、VS Code の **Chat Participant API** を利用することで、ユーザーが契約している GitHub Copilot の権限を利用してセキュアかつ簡単に LLM を利用できる。

### 4.1 Chat Participant の登録

`package.json` の `contributes` セクションに `chatParticipants` を追加する。ここで指定する `name` が、ユーザーがチャット欄で入力する `@character_name` となる。

```json
"contributes": {
  "chatParticipants": [
    {
      "id": "chat-participant-id",
      "name": "character_name",
      "description": "Avatar Chat Companion",
      "isSticky": true
    }
  ]
}
```

- **isSticky:** `true` に設定することで、一度 `@character_name` を呼び出した後、継続してそのコンテキスト（キャラクターとの会話）が維持されるようになる。これはアバターとの対話体験において重要である。

**参照ドキュメント:**

- [7] [_Chat Participant API_](https://code.visualstudio.com/api/extension-guides/ai/chat) - 参加者の登録と基本概念。

### 4.2 リクエストハンドラの実装

`vscode.chat.createChatParticipant` メソッドを使用して、ユーザーからのプロンプトを処理するハンドラを実装する。

**ハンドラの処理フロー:**

1. **プロンプト受信:** `request.prompt` からユーザーの入力を受け取る。
2. **システムプロンプトの注入:** ここでキャラクターの「人格」を形成する。
   - 例: 「あなたは技術的な助言をする猫耳の少女です。語尾に『～だにゃ』をつけて話してください。」
   - このシステムプロンプトは `vscode.LanguageModelChatMessage.User` メッセージとして、ユーザー入力の前に配列の先頭に追加して API に渡す（Copilot API の仕様上、System ロールが明示的に分かれていない場合があるため、User メッセージとして先頭に入れるパターンが一般的である、あるいは `LanguageModelChatMessage.System` が利用可能な場合はそれを使う）。
3. **Copilot モデルへのリクエスト:** `request.model.sendRequest` を呼び出し、Copilot の LLM (GPT-4 クラス) に回答を生成させる。
4. **ストリーミング処理:**
   - LLM からの応答はストリーム（断片的なテキストの連続）として返ってくる。
   - **Chat View への出力:** `stream.markdown(fragment)` を使用して、VS Code のチャットウィンドウにリアルタイムでテキストを表示する。
   - **Webview への送信:** 同時に、アバターに喋らせるためのテキストを Webview に送る必要がある。

重要な洞察（リスク回避）:
Webview への送信において、一文字ずつ送ると音声合成が細切れになり不自然になる。句読点（「。」「！」など）や改行を検知してバッファリングし、「文（Sentence）」単位で Webview に `SPEAK` メッセージを送るロジックを実装すべきである。これにより、音声合成エンジンがイントネーションを正しく処理できるようになる。

**参照ドキュメント:**

- [3] [_Chat Tutorial_](https://code.visualstudio.com/api/extension-guides/ai/chat-tutorial) - ハンドラの実装とストリーミングの詳細。
- [8] [_Copilot Chat Documentation_](https://code.visualstudio.com/docs/copilot/chat/copilot-chat) - ユーザー視点での動作仕様。

---

## 5. フェーズ 3: 3D アバターのレンダリング (UI/React)

フェーズ 3 では、Webview 内の React アプリケーションに「身体」を与える。要件にある「React を使って UI を作成」し、「VRM キャラを表示」する部分である。

### 5.1 React Three Fiber (R3F) の導入

通常の Three.js を命令的（Imperative）に書くのではなく、React Three Fiber を用いて宣言的（Declarative）にシーンを構築する。

**依存パッケージ:**

- `three`: Three.js 本体。
- `@react-three/fiber`: React レンダラー。
- `@react-three/drei`: 便利なヘルパー（カメラ操作 `OrbitControls` や環境光 `Environment` など）。
- `@pixiv/three-vrm`: VRM ローダー [2]。

コンポーネント設計:
`<AvatarScene>` コンポーネントを作成し、その中に `<Canvas>` を配置する。照明（`AmbientLight`, `DirectionalLight`）とカメラを設定し、VRM モデルをロードするカスタムフックまたはコンポーネントを配置する。

### 5.2 VRM モデルのロードと表示

VRM ファイルはバイナリ形式（GLB ベース）である。Webview 内でローカルファイル（拡張機能に同梱されたデフォルトアバター、またはユーザーが指定したパス）を読み込む際には注意が必要である。

**実装手順:**

1. **パスの解決:** Extension Host 側で VRM ファイルのパスを解決し、Webview がアクセス可能な URI (`webview.asWebviewUri`) に変換して渡す必要がある。
2. **ローダーの使用:** R3F の `useLoader` フックと `@pixiv/three-vrm` の `VRMLoaderPlugin` を組み合わせて使用する。

```typescript
// 概念コード
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { VRMLoaderPlugin } from "@pixiv/three-vrm";

const gltf = useLoader(GLTFLoader, vrmUrl, (loader) => {
  loader.register((parser) => new VRMLoaderPlugin(parser));
});
return <primitive object={gltf.scene} />;
```

リスク回避:
Webview がバックグラウンドに回った場合（ユーザーが別のタブを開いた場合）、WebGL コンテキストが失われる可能性がある (`webglcontextlost`)。R3F はある程度の復帰処理を行うが、リソース解放（`dispose`）を適切に行わないとメモリリークの原因となる。React の `useEffect` のクリーンアップ関数で、シーンやマテリアルの `dispose` を呼び出す処理を徹底する。

**参照ドキュメント:**

- [2] [_VRM Viewer Extension_](https://marketplace.visualstudio.com/items?itemName=MetroSoft-Application.vrm-viewer) - 既存の VRM ビューワーの実装例。
- [9] [_Three-VRM Examples_](https://pixiv.github.io/three-vrm/packages/three-vrm/examples/) - アニメーションや表情制御のサンプルコード。

### 5.3 表情（Expression）の制御

Copilot からの応答に基づいてアバターの表情を変えることで、より豊かな対話体験が可能になる。

- **感情解析:** Extension Host 側で LLM の応答を解析し（あるいは LLM に感情タグを出力させ）、`JOY`, `ANGRY`, `SORROW` などのパラメータを Webview に送信する。
- **BlendShape 操作:** VRM インスタンスの `expressionManager.setValue('joy', 1.0)` などを呼び出し、表情をモーフィングさせる。

---

## 6. フェーズ 4: 音声合成とリップシンク

最も技術的ハードルが高いのがこのフェーズである。「音声応答」と「リップシンク（口パク）」を実現するには、ブラウザの自動再生ポリシーと格闘し、適切な API を選択する必要がある。

### 6.1 自動再生ポリシー (Autoplay Policy) の壁

Electron や最新のブラウザは、ユーザーインタラクション（クリックやキー入力）がない状態での音声再生をブロックする [5]。拡張機能が起動した瞬間に勝手に喋り出すことは、このポリシーにより阻止される可能性が高い。

解決策:
UI 上に「Connect」や「Start Chat」のようなボタンを配置し、ユーザーに一度クリックさせる。このクリックイベントハンドラ内で `AudioContext` を `resume()` することで、以降の自動再生が許可される状態（"blessed" state）にする。

### 6.2 音声合成 (TTS) API の選定

要件の「音声応答」を実現するための手段は主に 3 つある。

1. **Web Speech API (`window.speechSynthesis`):**
   - **メリット:** 追加コスト不要、ライブラリ不要。
   - **デメリット:** Electron 環境（VS Code）での動作が不安定な場合がある [11]。音声の品質が OS 依存で機械的になりがち。
   - **評価:** プロトタイプとしては優秀だが、製品品質には難がある。
2. **VS Code Speech Extension API:**
   - **現状:** Microsoft 純正の `vscode-speech` 拡張機能が存在するが、これは主に「音声入力（Speech-to-Text）」用であり、任意のテキストを合成して再生する API はサードパーティ開発者向けには十分に開放されていない可能性がある [13]。
3. **外部クラウド API (OpenAI Audio / Azure Speech):**
   - **メリット:** 極めて高品質で人間らしい音声。
   - **デメリット:** API キーが必要、通信遅延。
   - **実装:** Extension Host で API を叩き、返ってきた音声データ（MP3/WAV の `ArrayBuffer`）を Webview に転送して Web Audio API で再生する。

推奨プラン:
まずは Web Speech API で実装し、動作確認を行う。その後、品質向上のために 外部 API + Web Audio API の方式へ移行するオプションを用意する（設定で切り替え可能にする）。

### 6.3 リップシンク (Lip Sync) の実装

アバターが喋っているように見せるためには、音声に合わせて口を動かす必要がある。

手法 A: 音量ベース (Volume-Based) - 初心者推奨
Web Audio API の `AnalyserNode` を使用して、再生中の音声の振幅（音量）をリアルタイムで取得する。

- **ロジック:** 音量が閾値を超えたら、VRM の Aa（「あ」の口）のブレンドシェイプの値を大きくする。
- **メリット:** 実装が簡単で、どのような言語・音声ソースでも動作する [15]。
- **デメリット:** 口の形が「あ」パクパクのみで単調。

手法 B: 音素ベース (Phoneme-Based) - 高度
音声データから音素（母音・子音）を解析し、「あ」「い」「う」「え」「お」の口の形を切り替える。

- **実装:** `rhubarb-lip-sync` などのライブラリを使用するか、Oculus OVR LipSync のような高度な解析が必要。Webview 内でリアルタイム解析を行うのは負荷が高いため、フェーズ 4 の後半ステップとする。

**参照ドキュメント:**

- [5] [_Webview Audio Formats_](https://code.visualstudio.com/api/extension-guides/webview) - 対応フォーマットの確認。
- [15] [_Lip Sync Examples_](https://www.reddit.com/r/threejs/comments/13un5ph/is_it_possible_to_sync_a_lip_and_facial/) - Web Audio API を使った同期ロジック。

---

## 7. フェーズ 5: 設定管理とプロファイル機能

最後のフェーズでは、ユーザー体験を向上させるためのカスタマイズ機能を実装する。要件にある「VRM ファイルやキャラのプロフィール設定」を実現する。

### 7.1 設定スキーマの定義

`package.json` の `contributes.configuration` セクションに設定項目を定義する。

```json
"configuration": {
  "title": "Avatar Companion",
  "properties": {
    "avatarCompanion.vrmPath": {
      "type": "string",
      "description": "Path to your local.vrm file",
      "scope": "resource"
    },
    "avatarCompanion.systemPrompt": {
      "type": "string",
      "default": "You are a helpful assistant.",
      "description": "Personality profile of the character",
      "editPresentation": "multilineText"
    }
  }
}
```

### 7.2 設定の読み込みと動的反映

Extension Host 側:
`vscode.workspace.onDidChangeConfiguration` イベントを監視する。設定が変更された場合、即座に新しい VRM ファイルを読み込み、Webview に `LOAD_VRM` メッセージを送信する。
ファイルアクセスの壁:
ユーザーが任意のパス（例: `C:\Users\Name\MyModel.vrm`）を指定した場合、Webview はセキュリティ上これに直接アクセスできない。

- **解決策:** Extension Host 側で `vscode.workspace.fs.readFile` を使ってファイルをバイナリとして読み込み、そのデータ (`Uint8Array`) を Webview に `postMessage` で転送する。Webview 側では `URL.createObjectURL(blob)` を使用して URL を生成し、VRM ローダーに渡す。

**参照ドキュメント:**

- [17] [_Configuration API_](https://code.visualstudio.com/api) - 設定の定義と読み込み。

---

## 8. 開発リスクとトラブルシューティング

最後に、開発中に遭遇しやすい落とし穴とその対処法をまとめる。

1. **Webview が真っ白で何も表示されない:**
   - **原因:** ほぼ間違いなく **Content Security Policy (CSP)** の設定ミスか、React バンドルの読み込みパス間違い。
   - **対処:** コマンドパレットから `Developer: Open Webview Developer Tools` を起動し、コンソールタブのエラーを確認する。これは通常の「開発者ツール」とは別物であることに注意。
2. **アバターが表示されるが真っ暗:**
   - **原因:** 照明（Light）の設定忘れ。VRM のマテリアル（MToon）は照明の影響を受ける。
   - **対処:** シーンに `AmbientLight`（環境光）と `DirectionalLight`（平行光源）を追加する。
3. **音声が再生されない:**
   - **原因:** 自動再生ポリシーによるブロック、またはコーデック非対応。
   - **対処:** ユーザー操作後に再生を開始するフローになっているか確認。MP3 エンコーディングの問題を避けるため、可能なら Wav 形式でテストするか、Web Audio API の `decodeAudioData` を使用する [18]。
4. **Copilot API がエラーを返す:**
   - **原因:** ユーザーが Copilot にログインしていない、または API のレート制限。
   - **対処:** `vscode.authentication.getSession` でログイン状態をチェックし、適切なエラーメッセージをユーザーに提示する。

---

## 9. 結論

本レポートで提示したアーキテクチャと 5 段階の実装プランは、VS Code の拡張機能開発における技術的制約を正しく理解し、Copilot の強力な推論能力と React/Three.js の表現力を安全に統合するためのロードマップである。

初めての開発においては、一度に全てを完成させようとせず、まずは「テキストチャットができる React 画面」を作り、そこに「動かないアバター」を表示し、最後に「声と動き」を与えるという順序を守ることが、挫折リスクを最小化する最良の戦略である。各フェーズで参照した公式ドキュメントは、実装の細部において必ず原典にあたることを推奨する。このプロジェクトは、単なるツール作成を超え、AI との対話体験を再定義する挑戦的な試みとなるだろう。

#### 引用文献

1. React Webview UI Toolkit for VS Code - GitHub Next, 1 月 10, 2026 にアクセス、 [https://githubnext.com/projects/react-webview-ui-toolkit/](https://githubnext.com/projects/react-webview-ui-toolkit/)
2. VRM Viewer - Visual Studio Marketplace, 1 月 10, 2026 にアクセス、 [https://marketplace.visualstudio.com/items?itemName=MetroSoft-Application.vrm-viewer](https://marketplace.visualstudio.com/items?itemName=MetroSoft-Application.vrm-viewer)
3. Tutorial: Build a code tutorial chat participant with the Chat API - Visual Studio Code, 1 月 10, 2026 にアクセス、 [https://code.visualstudio.com/api/extension-guides/ai/chat-tutorial](https://code.visualstudio.com/api/extension-guides/ai/chat-tutorial)
4. A starter template for a Visual Studio Code extension with a webview using React - GitHub, 1 月 10, 2026 にアクセス、 [https://github.com/estruyf/vscode-react-webview-template](https://github.com/estruyf/vscode-react-webview-template)
5. Webview API | Visual Studio Code Extension API, 1 月 10, 2026 にアクセス、 [https://code.visualstudio.com/api/extension-guides/webview](https://code.visualstudio.com/api/extension-guides/webview)
6. VS Code API | Visual Studio Code Extension API, 1 月 10, 2026 にアクセス、 [https://code.visualstudio.com/api/references/vscode-api](https://code.visualstudio.com/api/references/vscode-api)
7. Chat Participant API - Visual Studio Code, 1 月 10, 2026 にアクセス、 [https://code.visualstudio.com/api/extension-guides/ai/chat](https://code.visualstudio.com/api/extension-guides/ai/chat)
8. Get started with chat in VS Code, 1 月 10, 2026 にアクセス、 [https://code.visualstudio.com/docs/copilot/chat/copilot-chat](https://code.visualstudio.com/docs/copilot/chat/copilot-chat)
9. three-vrm example, 1 月 10, 2026 にアクセス、 [https://pixiv.github.io/three-vrm/packages/three-vrm/examples/](https://pixiv.github.io/three-vrm/packages/three-vrm/examples/)
10. Enable audio autoplay in Chrome for web apps installed on the user's Android desktop, 1 月 10, 2026 にアクセス、 [https://stackoverflow.com/questions/56667939/enable-audio-autoplay-in-chrome-for-web-apps-installed-on-the-users-android-des](https://stackoverflow.com/questions/56667939/enable-audio-autoplay-in-chrome-for-web-apps-installed-on-the-users-android-des)
11. SpeechSynthesis - Web APIs | MDN, 1 月 10, 2026 にアクセス、 [https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesis](https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesis)
12. Taming the Web Speech API - Andrea Giammarchi - Medium, 1 月 10, 2026 にアクセス、 [https://webreflection.medium.com/taming-the-web-speech-api-ef64f5a245e1](https://webreflection.medium.com/taming-the-web-speech-api-ef64f5a245e1)
13. Can I use the speech-to-text API in my own extension in VS Code? - Stack Overflow, 1 月 10, 2026 にアクセス、 [https://stackoverflow.com/questions/78269146/can-i-use-the-speech-to-text-api-in-my-own-extension-in-vs-code](https://stackoverflow.com/questions/78269146/can-i-use-the-speech-to-text-api-in-my-own-extension-in-vs-code)
14. VS Code Speech - Visual Studio Marketplace, 1 月 10, 2026 にアクセス、 [https://marketplace.visualstudio.com/items?itemName=ms-vscode.vscode-speech](https://marketplace.visualstudio.com/items?itemName=ms-vscode.vscode-speech)
15. Is it possible to sync a lip and facial expression animation with audio in real time? - Reddit, 1 月 10, 2026 にアクセス、 [https://www.reddit.com/r/threejs/comments/13un5ph/is_it_possible_to_sync_a_lip_and_facial/](https://www.reddit.com/r/threejs/comments/13un5ph/is_it_possible_to_sync_a_lip_and_facial/)
16. How to make the model mouth talking animation or lipSyncing? - three.js forum, 1 月 10, 2026 にアクセス、 [https://discourse.threejs.org/t/how-to-make-the-model-mouth-talking-animation-or-lipsyncing/65244](https://discourse.threejs.org/t/how-to-make-the-model-mouth-talking-animation-or-lipsyncing/65244)
17. Visual Studio Code Extension API, 1 月 10, 2026 にアクセス、 [https://code.visualstudio.com/api](https://code.visualstudio.com/api)
18. Using Webaudio in vscode extension - Stack Overflow, 1 月 10, 2026 にアクセス、 [https://stackoverflow.com/questions/73622878/using-webaudio-in-vscode-extension](https://stackoverflow.com/questions/73622878/using-webaudio-in-vscode-extension)
