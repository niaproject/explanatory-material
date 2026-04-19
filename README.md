# explanatory-material

技術トピックに関する解説資料をまとめたリポジトリです。各種テーマごとにモダンなHTMLで可視化・解説したページを収録しています。

## 収録コンテンツ

| カテゴリ | ファイル | 内容 |
| --- | --- | --- |
| Git | [topics/git/git-commands.html](topics/git/git-commands.html) | Git の主要コマンド（add / commit / push / HEAD など）の関係性を図解 |
| Git | [topics/git/git-unstage.html](topics/git/git-unstage.html) | `git add` を取り消す手順（特定ファイルだけ / 全部）を図解 |
| Hosting | [topics/hosting/hosting-comparison.html](topics/hosting/hosting-comparison.html) | 各種ホスティングサービスの比較解説 |
| VSCode | [topics/vscode/vscode-shortcuts.html](topics/vscode/vscode-shortcuts.html) | VSCode キーボードショートカット集（カテゴリ別チートシート） |
| VSCode | [topics/vscode/vscode-multi-cursor.html](topics/vscode/vscode-multi-cursor.html) | Ctrl+D 系ショートカット徹底解説（複数カーソルの使いこなし） |
| Node.js | [topics/nodejs/npm-vs-pnpm.html](topics/nodejs/npm-vs-pnpm.html) | npm と pnpm の違い（node_modules 構造・ファントム依存・ディスク・速度・コマンド対応表） |

## 使い方

各 HTML ファイルをブラウザで開くと、解説ページが表示されます。

## ディレクトリ構成

```
explanatory-material/
└── topics/
    ├── git/         Git 関連の解説資料
    ├── hosting/     ホスティング関連の解説資料
    ├── nodejs/      Node.js / npm / pnpm 関連の解説資料
    └── vscode/      VSCode 関連の解説資料
```
