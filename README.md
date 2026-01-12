# Blog Static - Nginx + Docker 静的ブログ

Next.js で構築し、Nginx + Docker で配信する静的ブログアプリケーションです。

## 特徴

- ✅ **Next.js App Router** - 最新の App Router を使用した静的サイト生成
- ✅ **JSON ベースのコンテンツ管理** - シンプルな JSON ファイルで記事を管理（Markdown への移行も可能）
- ✅ **Nginx キャッシング** - 静的ファイルの長期キャッシュと HTML の短期キャッシュを設定
- ✅ **gzip 圧縮** - 転送データ量を削減
- ✅ **Docker マルチステージビルド** - 軽量な本番イメージ
- ✅ **TypeScript** - 完全な型安全性

## 学習ポイント

このプロジェクトでは以下を学べます：

1. **静的ファイル配信** - Next.js の静的エクスポート機能
2. **Nginx 基本設定** - location ブロック、キャッシング、gzip 圧縮
3. **Docker** - マルチステージビルド、最適化されたイメージ作成
4. **パフォーマンス最適化** - キャッシュ戦略、圧縮設定

## 構成

```
blog-static/
├── app/                    # Next.js App Router
│   ├── blog/              # ブログ記事ページ
│   │   ├── [slug]/        # 動的ルート（記事詳細）
│   │   └── page.tsx       # ブログ一覧
│   ├── layout.tsx         # ルートレイアウト
│   └── page.tsx           # ホームページ
├── components/            # React コンポーネント
├── content/               # JSON データ
│   ├── articles/         # 記事データ
│   ├── authors/          # 著者データ
│   └── categories/       # カテゴリーデータ
├── lib/                   # ビジネスロジック
│   ├── blog-service.ts   # サービス層
│   └── sources/          # データソース実装
├── nginx/                 # Nginx 設定
│   ├── nginx.conf        # メイン設定
│   └── default.conf      # サーバー設定
├── types/                 # TypeScript 型定義
├── Dockerfile            # マルチステージビルド
└── docker-compose.yml    # Docker Compose 設定
```

## 使い方

### 開発環境

```bash
# 依存関係のインストール
pnpm install

# 開発サーバーを起動
pnpm dev
```

ブラウザで http://localhost:3000 を開く

### 本番ビルド（Docker）

```bash
# Docker イメージをビルドして起動
docker-compose up -d

# ログを確認
docker-compose logs -f blog
```

ブラウザで http://localhost:8080 を開く

### Docker での開発環境

```bash
# 開発環境を起動
docker-compose --profile dev up dev
```

### ビルドのみ

```bash
# 静的サイトをビルド
pnpm build

# out/ ディレクトリに静的ファイルが生成される
```

## Nginx 設定の詳細

### キャッシング戦略

| ファイルタイプ              | キャッシュ期間 | Cache-Control                    |
| --------------------------- | -------------- | -------------------------------- |
| 静的アセット（JS/CSS/画像） | 1年            | `max-age=31536000, immutable`    |
| HTML ファイル               | 1時間          | `max-age=3600, must-revalidate`  |
| ブログ記事ページ            | 24時間         | `max-age=86400, must-revalidate` |

### gzip 圧縮

- **圧縮レベル**: 6（バランス型）
- **最小ファイルサイズ**: 256 bytes
- **対象**: HTML, CSS, JS, JSON, XML, SVG など

### セキュリティヘッダー

- `X-Frame-Options: SAMEORIGIN`
- `X-Content-Type-Options: nosniff`
- `X-XSS-Protection: 1; mode=block`
- `Referrer-Policy: strict-origin-when-cross-origin`

## 記事の追加方法

1. `content/articles/` に新しい JSON ファイルを作成

```json
{
  "id": "article-004",
  "title": "記事タイトル",
  "slug": "article-slug",
  "description": "記事の説明",
  "author": "author-001",
  "publishedAt": "2026-01-09T10:00:00Z",
  "updatedAt": "2026-01-09T10:00:00Z",
  "tags": ["タグ1", "タグ2"],
  "category": "tech",
  "featured": false,
  "readingTime": 5,
  "content": [
    {
      "type": "heading",
      "content": "見出し",
      "level": 2
    },
    {
      "type": "paragraph",
      "content": "本文"
    }
  ]
}
```

2. ビルドを再実行

```bash
pnpm build
# または
docker-compose up -d --build
```

## Markdown への移行

将来的に Markdown 形式に移行する場合も、データレイヤーが抽象化されているため容易に対応可能です：

1. `lib/sources/markdown-source.ts` を実装
2. 環境変数 `BLOG_SOURCE_TYPE=markdown` を設定
3. コンテンツを Markdown に移行

詳細は調査レポートを参照してください。

## パフォーマンス

- ✅ 完全な静的サイト生成（SSG）
- ✅ Nginx の高速な静的ファイル配信
- ✅ 長期キャッシュによる帯域幅削減
- ✅ gzip 圧縮による転送量削減
- ✅ Docker マルチステージビルドによる軽量イメージ