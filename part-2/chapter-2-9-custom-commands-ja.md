# 2.9: カスタムコマンドの作成

`2.1 > 2.2 > 2.3 > 2.4 > 2.5 > 2.6 > 2.7 > 2.8 | [ 2.9 ] 2.10 > 2.11`

> *"繰り返しのワークフローを1つのコマンドに固める"* -- カスタムコマンドがチーム規約を実行可能な契約に変える。

## 問題

日常の開発において、多くの高頻度・繰り返しタスクがあります：
- テストスイートの実行とレポート生成
- チーム規約に従ったコードのコミット
- 特定ファイルのボイラープレートコード生成
- セキュリティチェックと依存関係の監査

これらのタスクを実行するたびに：
1. 正しい実行手順を思い出す
2. 複数行のコマンドを手動入力
3. チーム規約への準拠を確認
4. 実行結果を検証

このプロセスは時間がかかるだけでなく、人為的なミスによるエラーが発生しやすいです。

## 解決策

```
+-------------------+      +-------------------+      +-------------------+
|   ユーザー入力    |      |   カスタムコマンド |      |   自動実行        |
|   /audit          | ---> |   解析とマッチング | ---> |   npm audit       |
|   /test-api       |      |   引数置換        |      |   レポート生成     |
|   /deploy         |      |   ツール呼び出し   |      |   検証チェック     |
+-------------------+      +-------------------+      +-------------------+
        ^                                                    |
        |                                                    v
        +---------------------------------------------- 結果フィードバック
```

カスタムコマンドの本質：**高頻度・繰り返し・標準化されたワークフローを、再利用可能なコマンドエントリーポイントとして固める**。

コア設計原則：

| 原則 | 説明 | 例 |
|------|------|-----|
| 単一責任 | 1つのコマンドは1つの明確なタスクに対応 | `/audit` はセキュリティ監査のみを処理 |
| パラメータ化 | 変数入力をサポートし、再利用性を向上 | `/test $FILE` で指定ファイルをテスト |
| ツールバインディング | 呼び出し可能なツールを宣言し、能力境界を明確化 | `tools: Read, Bash` |
| テキスト即コード | Markdown + FrontMatter で定義 | バージョン管理に友好 |

## 仕組み

### 1. コマンドファイル構造

カスタムコマンドは Markdown ファイルとして保存され、FrontMatter でメタデータを定義します：

```markdown
---
name: audit
description: npm audit を実行してセキュリティ脆弱性をチェックし修正する
tools: Bash
---

npm audit を実行して脆弱なインストール済みパッケージを特定
npm audit fix を実行してアップデートを適用
アップデートが機能を破壊していないことを確認するためテストを実行
```

**保存場所と有効範囲：**

```
プロジェクトレベル（推奨）
├── .claude/
│   └── commands/           # コマンド保存ディレクトリ
│       ├── audit.md        # /audit コマンド
│       ├── test-api.md     # /test-api コマンド
│       └── deploy.md       # /deploy コマンド
│
ユーザーレベル（グローバル）
~/.claude/commands/         # このマシンのすべてのプロジェクトで有効
```

プロジェクトレベルのコマンドを推奨します。ユーザーレベルコマンドは関係ないリポジトリに誤って影響を与える可能性があるためです。

### 2. コマンド解析とマッチング

ユーザーがスラッシュコマンドを入力すると、Claude は以下のマッチングロジックを実行します：

```python
# 擬似コードでの説明
class CommandManager:
    def __init__(self):
        self.commands = self._load_commands()

    def _load_commands(self):
        """.claude/commands/ からすべてのコマンドを読み込み"""
        commands = {}
        for cmd_file in Path('.claude/commands').glob('*.md'):
            cmd = self._parse_command(cmd_file)
            commands[cmd['name']] = cmd
        return commands

    def execute(self, command_name, arguments=None):
        """マッチしたコマンドを実行"""
        if command_name not in self.commands:
            return f"不明なコマンド: {command_name}"

        cmd = self.commands[command_name]

        # 権限検証：コマンドが宣言したツールをチェック
        allowed_tools = cmd.get('tools', [])

        # 引数置換
        prompt = cmd['content']
        if arguments:
            prompt = prompt.replace('$ARGUMENTS', arguments)

        # コマンドプロンプトを実行
        return self._execute_with_tools(prompt, allowed_tools)
```

### 3. パラメータ化コマンド

カスタムコマンドは `$ARGUMENTS` プレースホルダーを使用して引数を受け入れることができます：

```markdown
---
name: write_tests
description: 指定ファイルの包括的なテストを作成する
tools: Read, Write
---

以下の包括的なテストを作成：$ARGUMENTS

テスト規約：
* Vitest と React Testing Library を使用
* テストファイルをソースファイルと同じフォルダの __tests__ ディレクトリに配置
* テストファイル名を [filename].test.ts(x) とする
* インポートには @/ プレフィックスを使用

カバレッジ：
* 正常系のテスト
* 境界値のテスト
* エラー状態のテスト
```

使用方法：

```
/write_tests hooks ディレクトリの use-auth.ts ファイル
```

### 4. ツール権限宣言

コマンドは FrontMatter の `tools` フィールドを通じて呼び出し可能なツールを宣言します。これは権限境界となります：

```markdown
---
name: deploy
description: アプリケーションを本番環境にデプロイする
tools: Bash, Read, Write
---
```

ツール権限タイプ：

| ツールタイプ | 用途 | 例 |
|------------|------|-----|
| Bash | コマンド実行 | `Bash(npm run build)` |
| Read | ファイル読み取り | `Read` |
| Write | ファイル書き込み | `Write` |
| Edit | ファイル編集 | `Edit` |

## 使用例

### 例 1: Git コミット規約コマンド

```markdown
---
name: commit
description: チーム規約に従って Git コミットを実行する
tools: Bash, Read
---

以下の手順でコミットを実行：

1. 現在のブランチ名が規約に従っているかチェック (feature|bugfix|hotfix)/JIRA-ID-説明
2. `git status` を実行して変更ファイルを確認
3. `git diff --cached` を実行してステージング内容を確認
4. 規約に従ってコミットメッセージを作成：
   - タイプ: 説明（50文字以内）
   - 空行
   - 詳細説明（オプション）
5. `git commit` を実行
6. 機能ブランチの場合、プッシュが必要かどうかを確認
```

### 例 2: API エンドポイントテストコマンド

```markdown
---
name: test-api
description: 指定された API エンドポイントをテストする
tools: Bash, Read
---

API エンドポイントをテスト：$ARGUMENTS

実行手順：
1. API ドキュメントまたはルート定義を読み取る
2. テストリクエストを構築（必要な headers、body を含む）
3. curl または httpie を使用してリクエストを送信
4. レスポンスステータスコードと構造を検証
5. 失敗した場合、エラー原因を分析し修正提案を提供

テストカバレッジ：
- 正常系 (200 OK)
- 無効パラメータ (400 Bad Request)
- 未認証アクセス (401 Unauthorized)
- リソース不存在 (404 Not Found)
```

### 例 3: コードレビューコマンド

```markdown
---
name: review
description: 指定ファイルのコード品質をレビューする
tools: Read
---

コード品質をレビュー：$ARGUMENTS

レビューチェックリスト：
□ コード可読性（命名、コメント、構造）
□ 潜在的なバグ（ヌルポインタ、リソースリーク、競合条件）
□ パフォーマンス問題（不要なループ、非効率なアルゴリズム）
□ セキュリティ脆弱性（インジェクション、XSS、機密情報露出）
□ テストカバレッジ（境界値、エラーパス）
□ プロジェクト規約準拠（スタイル、アーキテクチャパターン）

出力形式：
- 重大な問題（修正必須）
- 改善提案（推奨）
- 肯定的なフィードバック（よくできている点）
```

## 変更点の比較

| コンポーネント | 以前 | 以降 (2.9) |
|-------------|------|-----------|
| 繰り返しタスク実行 | 複数行コマンドを手動入力 | 単一の `/command` で実行 |
| チーム規約 | 口頭/文書で伝達 | 実行可能なコマンドとして固化 |
| 権限制御 | 明確な境界なし | FrontMatter でツール権限を宣言 |
| パラメータ化 | ハードコード | `$ARGUMENTS` 変数置換 |
| 保守性 | スクリプトに分散 | 集中管理、バージョン管理に友好 |

## ベストプラクティス

### コマンド設計原則

1. **単一責任**: 1つのコマンドは1つのことを行う
   ```markdown
   # 良い
   /deploy - デプロイのみを処理

   # 悪い
   /deploy-and-test - 責任が混在
   ```

2. **明確な説明**: 説明にトリガー条件と期待される動作を含める
   ```markdown
   description: APIエンドポイントの検証が必要な場合に、指定インターフェースをテストして状態レポートを返す
   ```

3. **最小権限**: 必要なツールのみを宣言する
   ```markdown
   # 良い
   tools: Read, Bash(npm:*)

   # 悪い（過剰な権限）
   tools: Read, Write, Edit, Bash
   ```

4. **引数検証**: `$ARGUMENTS` の有効性をチェックする
   ```markdown
   実行手順：
   1. $ARGUMENTS が空でないことを検証
   2. ファイル $ARGUMENTS が存在することを検証
   3. 操作を実行
   ```

### コマンド構成の推奨

```
.claude/commands/
├── dev/                    # 開発関連
│   ├── start-dev.md
│   ├── run-tests.md
│   └── lint-fix.md
├── deploy/                 # デプロイ関連
│   ├── deploy-staging.md
│   └── deploy-prod.md
├── review/                 # コードレビュー
│   ├── review-code.md
│   └── security-check.md
└── utils/                  # ユーティリティ
    ├── git-commit.md
    └── update-deps.md
```

適切に設計され構成されたカスタムコマンドを通じて、チームはベストプラクティスを実行可能な標準として固化し、開発効率とコード品質の一貫性を大幅に向上させることができます。
