---
name: git-unstage
description: git add でステージングしたファイルを、特定のファイルだけ／全部まとめて安全に取り消す手順をユーザーに案内する。ユーザーが「add を取り消したい」「ステージから外したい」「間違えて add した」などの相談をした時に使用する。
argument-hint: [file-path-or-pattern]
---

`git add` のステージングを取り消す手順を案内する。対象: `$ARGUMENTS`

## このスキルの役割

ユーザーが `git add` で誤ってステージしたファイルを取り消したいときに、状況を診断し、安全なコマンドを提示する。破壊的な `git reset --hard` や `git restore <file>`（`--staged` なし）を誤って勧めないこと。

## 実行手順

**Step 1**: 現状を確認する。

まず `git status` を実行し、以下を把握する:
- ステージング中のファイル（Changes to be committed）
- 変更のみのファイル（Changes not staged for commit）
- 新規ファイル（Untracked files）

**Step 2**: ユーザーの意図を整理する。

以下のいずれかを判別する:
- A. 特定の 1 ファイルだけ取り消したい
- B. 複数ファイル / ディレクトリ配下を取り消したい
- C. 全ステージングを取り消したい
- D. 新規ファイル（Untracked だったもの）の初回 add を取り消したい

引数 `$ARGUMENTS` が空の場合は、どのファイルを取り消したいかユーザーに確認する。

**Step 3**: 適切なコマンドを提示する。

Git 2.23 以降を前提に `git restore --staged` を第一推奨とする。

| シナリオ | 推奨コマンド |
| --- | --- |
| A. 特定の 1 ファイル | `git restore --staged <file>` |
| B. 複数 / ディレクトリ | `git restore --staged <path1> <path2>` または `git restore --staged <dir>/` |
| C. 全部 | `git restore --staged .` |
| D. 新規ファイルの初回 add | `git restore --staged <file>`（`HEAD` が無い初回コミット前のみ `git rm --cached <file>`） |

**Step 4**: 実行結果の確認方法を案内する。

コマンド実行後は再度 `git status` を実行させ、対象ファイルが「Changes not staged for commit」または「Untracked files」に移動していることを確認してもらう。

**Step 5**: 必要に応じて再ステージングをガイドする。

本当に必要なファイルだけを改めて `git add <file>` でステージし、`git commit` に進めるよう案内する。

## 重要な注意事項

- **破壊的コマンドを勧めない**: `git restore <file>`（`--staged` なし）、`git reset --hard`、`git checkout -- <file>` は作業ディレクトリの編集内容を消してしまう。ステージ解除だけが目的なら絶対に使わない。
- **`git reset HEAD <file>`**: 古い Git 向けの互換コマンドとして有効。動作は `git restore --staged` と同等だが、`HEAD` が無い初回コミット前はエラーになる。その場合は `git rm --cached <file>` を使う。
- **ファイルの中身は変わらない**: `git restore --staged` はステージング領域のみを操作し、作業ディレクトリのファイル内容は変更しない旨を明示する。
- **ユーザーの環境を勝手に操作しない**: このスキルはあくまで「手順の案内」を行う。ユーザーが明示的に依頼しない限り、`git` コマンドを実行エージェント側で勝手に走らせない。

## 参照資料

プロジェクト内の解説ページ: [topics/git/git-unstage.html](../../../topics/git/git-unstage.html)

このページには、ステージング状態の可視化図、コマンド比較早見表、FAQ（初回コミット前の挙動、ワイルドカード指定など）が含まれる。ユーザーがより詳しい図解を求める場合は、このページを案内する。
