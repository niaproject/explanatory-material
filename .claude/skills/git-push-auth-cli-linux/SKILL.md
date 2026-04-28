---
name: git-push-auth-cli-linux
description: CLI しか使えない Linux サーバ（ヘッドレス / SSH ログインのみ / GUI ブラウザなし）で git push するときの GitHub 認証手順をユーザーに案内する。ユーザーが「サーバから git push したい」「GitHub のパスワードが通らない」「ヘッドレスで認証したい」「SSH 鍵 / PAT / gh CLI のどれを使うべきか」などの相談をした時に使用する。
argument-hint: [use-case-or-constraint]
---

CLI のみの Linux サーバで `git push` 時の GitHub 認証を通す手順を案内する。対象: `$ARGUMENTS`

## このスキルの役割

ブラウザもキーチェーンも常駐しないヘッドレス Linux 環境で、GitHub に対して `git push` を通すための現実的な方法をユーザーに提示する。2021 年にパスワード認証が廃止されている前提で、**SSH 鍵 / Personal Access Token (PAT) / gh CLI デバイスフロー / Deploy Key** の 4 択から状況に合うものを選ばせる。

秘密情報を不用意に扱わない、平文保存に倒さない、という安全面の配慮を常に優先すること。

## 実行手順

**Step 1**: 状況をヒアリングする。

引数 `$ARGUMENTS` または会話履歴から以下を把握する。足りなければユーザーに質問する:

- そのサーバは個人用か、CI / デプロイ用か、一時検証用か
- 別端末のブラウザは使えるか（OAuth デバイスフローが使えるか）
- 22 番ポートが外向きに開いているか（SSH が素直に使えるか）
- 認証情報をスクリプト / 環境変数で渡したいか（PAT 向きか）
- 共用サーバか、単独ユーザーのサーバか（credential helper の選択に効く）

**Step 2**: 判定チャートに沿って方法を絞る。

| 状況 | 第一候補 | 理由 |
| --- | --- | --- |
| 個人開発サーバに常駐して push したい | **SSH 鍵** | 一度の設定で以後ノーストレス、期限切れなし |
| CI / デプロイ先が 1 リポジトリだけ触る | **Deploy Key** | 被害範囲がリポジトリ内に閉じる |
| 一時検証 / 別端末ブラウザは使える | **gh auth login（デバイスフロー）** | 8 桁コードを別端末で入れるだけ |
| スクリプトで認証情報を差し込みたい | **PAT**（fine-grained + 短寿命） | 環境変数や URL に埋めやすい |
| 22 番が閉じている | **HTTPS + PAT** または **ssh.github.com:443** | 443 経由で経路確保 |

迷う場合は **SSH 鍵**を第一候補として提案する。

**Step 3**: 選んだ方法の手順を提示する。

それぞれ以下のコマンドを正しい順序で案内する。コピペで動く形を意識すること。

### ① SSH 鍵

```bash
# 鍵生成（パスフレーズは必ず設定）
ssh-keygen -t ed25519 -C "server-a-for-github"

# 公開鍵を表示（GitHub の Settings → SSH keys に貼り付け）
cat ~/.ssh/id_ed25519.pub

# 接続テスト
ssh -T git@github.com

# 既存リポジトリのリモートを SSH に切替
git remote set-url origin git@github.com:you/repo.git

# ssh-agent 常駐で入力回数削減
eval "$(ssh-agent -s)"
ssh-add ~/.ssh/id_ed25519
```

### ② Personal Access Token (PAT)

1. 別端末のブラウザで `https://github.com/settings/tokens?type=beta` を開き、Fine-grained PAT を発行（Contents: Read and write / Expiration 30〜90 日）
2. `git push` で Username と PAT を入力
3. credential helper の設定:
   - `git config --global credential.helper 'cache --timeout=28800'`（推奨）
   - `git config --global credential.helper store` は平文保存なので**共用サーバでは禁止**

### ③ gh CLI デバイスフロー

```bash
# インストール（例: Ubuntu）
# 公式手順 https://cli.github.com/ を参照

gh auth login
# GitHub.com → HTTPS → Yes → "Login with a web browser" を選択
# 表示された 8 桁コードを別端末のブラウザで https://github.com/login/device に入力
```

完了後、`gh` が credential helper として自動登録され `git push` が通るようになる。

### ④ Deploy Key

```bash
# リポジトリ専用の鍵を個人鍵と分けて生成
ssh-keygen -t ed25519 -C "deploy-key-repo-xxx" \
    -f ~/.ssh/id_ed25519_repo_xxx

# 公開鍵を https://github.com/you/repo/settings/keys/new に登録
# 書き込みが必要なら "Allow write access" をチェック

# ~/.ssh/config でホストエイリアスを作る
cat >> ~/.ssh/config <<'EOF'
Host github-repo-xxx
  HostName github.com
  User git
  IdentityFile ~/.ssh/id_ed25519_repo_xxx
  IdentitiesOnly yes
EOF

git clone git@github-repo-xxx:you/repo.git
```

**Step 4**: 検証コマンドを案内する。

設定後に動作確認する:

```bash
git ls-remote origin      # 認証が通るか一番軽く確認できる
git push --dry-run        # 実際に push しないで認可の成否だけ見る
```

**Step 5**: 必要に応じて片付け方も示す。

- SSH 鍵の失効: GitHub 側の Settings → SSH keys で該当鍵を削除
- PAT の失効: Settings → Developer settings → Personal access tokens で該当トークンを Delete
- ローカル credential の破棄: `git credential reject <<< $'protocol=https\nhost=github.com\n'`
- gh CLI: `gh auth logout --hostname github.com`

## 重要な注意事項

- **パスワード認証は使えない**: 2021-08-13 に廃止済み。「GitHub のパスワードを入れたら通るはず」という前提は誤り。
- **`credential.helper=store` は平文 YAML**: `~/.git-credentials` に PAT が丸見えになる。root / 共用ユーザー環境では絶対に使わない。
- **SSH 秘密鍵にはパスフレーズを**: サーバ侵害時に秘密鍵ファイルがそのまま GitHub アカウント乗っ取りに直結する。`ssh-agent` と組み合わせれば入力負担はほぼゼロ。
- **PAT を git リポジトリやログに出さない**: 公開リポジトリに一度でも push したら即 revoke。GitHub のシークレットスキャンが走る前に露出する前提で動く。
- **~/.config/gh/hosts.yml も平文**: keyring が動かないサーバでは gh もセキュアストアを使えない。`chmod 600` と .gitignore を確認。
- **環境を勝手に操作しない**: このスキルは手順の「案内」が主務。`ssh-keygen` / `git config` などを実行する前にユーザーの明示的な許可を取る。

## 参照資料

プロジェクト内の解説ページ: [topics/github/git-push-auth-cli-linux.html](../../../topics/github/git-push-auth-cli-linux.html)

このページには以下の視覚化・詳細解説が含まれる。より深い説明を求められたら案内する:

- 4 方法のスペック比較表（対象スコープ / パスフレーズ可否 / 失効管理 / 漏洩時の被害範囲）
- 判定チャート（Q1〜Q4 の分岐）
- 方法別のステップ UI（番号付きカード）
- トラブルシュート（Permission denied / 22 番閉塞 / 複数アカウント / PAT 期限切れ）
- 安全運用のチェックリスト（8 項目）
- ユースケース別の推奨方法 1 枚まとめ

関連スキル: [git-unstage](../git-unstage/SKILL.md) — `git add` の取り消し案内（同プロジェクト内の別 git 系スキル）
