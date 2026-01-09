# ============================================
# ステージ 1: 依存関係のインストール
# ============================================
FROM node:24-alpine AS deps

WORKDIR /app

# 依存関係ファイルをコピー
COPY package.json pnpm-lock.yaml* package-lock.json* yarn.lock* ./

# パッケージマネージャーに応じてインストール
RUN \
  if [ -f pnpm-lock.yaml ]; then \
    corepack enable pnpm && pnpm install --frozen-lockfile; \
  elif [ -f yarn.lock ]; then \
    yarn install --frozen-lockfile; \
  elif [ -f package-lock.json ]; then \
    npm ci; \
  else \
    echo "No lockfile found." && exit 1; \
  fi

# ============================================
# ステージ 2: ビルド
# ============================================
FROM node:24-alpine AS builder

WORKDIR /app

# 依存関係をコピー
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Next.js テレメトリを無効化
ENV NEXT_TELEMETRY_DISABLED=1

# 静的サイトをビルド
RUN \
  if [ -f pnpm-lock.yaml ]; then \
    corepack enable pnpm && pnpm run build; \
  elif [ -f yarn.lock ]; then \
    yarn build; \
  else \
    npm run build; \
  fi

# ============================================
# ステージ 3: 本番環境（Nginx）
# ============================================
FROM nginx:alpine AS runner

# メタデータ
LABEL maintainer="blog-static"
LABEL description="Static blog built with Next.js and served by Nginx"

# Nginx 設定をコピー
COPY nginx/nginx.conf /etc/nginx/nginx.conf
COPY nginx/default.conf /etc/nginx/conf.d/default.conf

# ビルドした静的ファイルをコピー
COPY --from=builder /app/out /usr/share/nginx/html

# ヘルスチェック
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:80/ || exit 1

# ポート公開
EXPOSE 80

# Nginx をフォアグラウンドで起動
CMD ["nginx", "-g", "daemon off;"]
