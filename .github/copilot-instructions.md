# Copilot Instructions for Blog Static

## Project Overview

**Blog Static** is a statically-generated blog application built with Next.js 16 and served by Nginx via Docker. The architecture emphasizes:

- **Static export** (`next.config.ts`: `output: "export"`) for performance and security
- **JSON-based content management** with a pluggable data source architecture
- **Nginx caching strategy** with differentiated TTLs for assets, HTML, and articles
- **Type-safe service layer** (`BlogService`) decoupling data sources from views

## Architecture & Data Flow

### Layers (Bottom-Up)

1. **Data Sources** (`lib/sources/json-source.ts`): Implement `IBlogSource`, `IAuthorSource`, `ICategorySource` interfaces. Currently JSON-based; can be extended to Markdown, databases, etc.

2. **Service Layer** (`lib/blog-service.ts`): `BlogService` class aggregates data sources. Key methods: `getArticleBySlug()`, `getAllArticles()`, `getArticleWithAuthor()`, `getStaticSlugParams()` (for `generateStaticParams()`).

3. **Routes** (`app/blog/page.tsx`, `app/blog/[slug]/page.tsx`): Use `getBlogService()` factory in Server Components. Dynamic routes require `generateStaticParams()` for static export.

4. **Components** (`components/ArticleCard.tsx`, `ArticleDetail.tsx`, `ContentRenderer.tsx`): Receive article data via props; use `Suspense` for async operations.

### Key Data Structures

- **BlogMetadata**: Article metadata (id, slug, title, author, publishedAt, tags, etc.)
- **BlogParagraph**: Content blocks (paragraph, heading, code, quote, list) with type-specific fields
- **BlogArticle**: Combines metadata + content paragraphs
- **Author**, **Category**: Supplementary data; fetched via service methods

### Static Export Constraint

`next.config.ts` sets `output: "export"` + `trailingSlash: true`. This means:

- No Server Actions or dynamic routes without `generateStaticParams()`
- All data fetching happens at build time
- Images must be `unoptimized: true`
- Route `/blog/article-001` must generate `out/blog/article-001/index.html`

## Key Patterns & Conventions

### Adding a New Article

1. Create JSON file in `content/articles/` (naming: `article-XXX.json`)
2. Must conform to `BlogArticle` interface; slug must be unique
3. Run `pnpm build` to regenerate static files (slug is picked up via `getStaticSlugParams()`)

### Adding a New Route Handler

- Use `app/api/route.ts` pattern (Next.js 16 App Router)
- Validate input with TypeScript types from `types/blog.ts`
- For static export, avoid dynamic API routes unless using `revalidateTag()` in ISR (not applicable here)

### Service Method Conventions

- All data-fetching methods are `async` and return promises
- Methods naming: `get*` for retrieval, `getArticles*` for filtering (by tag, category)
- Implement caching logic in the source layer if performance degrades

### Styling

- **Tailwind CSS 4** via `@tailwindcss/postcss` + `postcss.config.mjs`
- Global styles in `app/globals.css`
- Component styles co-located; no CSS modules used

## Build & Deployment Workflow

### Development

```bash
# Start dev server (port 3000)
pnpm dev

# Lint (ESLint 9 with Next.js config)
pnpm lint
```

### Production (Docker)

```bash
# Build and run Nginx container on port 8080
docker-compose up -d

# Dev container (optional, for testing within Docker)
docker-compose --profile dev up dev
```

**Multi-stage Dockerfile** (`Dockerfile`):

1. **deps**: Install dependencies (supports pnpm, yarn, npm)
2. **builder**: Build Next.js static export (`pnpm run build` → `out/` directory)
3. **runner**: Nginx alpine image serving `out/` directory with cache headers

### Nginx Caching Strategy

- **Static assets** (JS/CSS/images): 1 year (`max-age=31536000, immutable`)
- **HTML files**: 1 hour (`max-age=3600, must-revalidate`)
- **Blog articles**: 24 hours (`max-age=86400, must-revalidate`)

Configuration in `nginx/default.conf` uses location blocks and Cache-Control headers.

## Critical Commands

| Command                               | Purpose                                          |
| ------------------------------------- | ------------------------------------------------ |
| `pnpm dev`                            | Start Next.js dev server (http://localhost:3000) |
| `pnpm build`                          | Generate static files to `out/`                  |
| `pnpm lint`                           | Run ESLint                                       |
| `docker-compose up -d`                | Build & run production (Nginx on 8080)           |
| `docker-compose logs -f blog`         | Tail production logs                             |
| `docker-compose --profile dev up dev` | Run dev container (port 3000)                    |

## File Organization

```
app/                    # Next.js pages & routes
  blog/
    [slug]/            # Dynamic article routes (needs generateStaticParams)
components/            # UI components (ArticleCard, ArticleDetail, etc.)
lib/
  blog-service.ts      # Service layer (interfaces + BlogService class)
  sources/json-source.ts  # Data source implementation
content/
  articles/            # JSON article data
  authors/authors.json # Author reference data
  categories/          # Category reference data
types/blog.ts          # TypeScript interfaces (BlogArticle, Author, etc.)
nginx/                 # Nginx configuration for production
```

## Common Pitfalls

1. **Forgetting `generateStaticParams()` in dynamic routes**: Will cause build to fail with static export
2. **Importing from `next/image` without `unoptimized: true`**: Image optimization not available in static export
3. **Using Client Components hooks in Server Components**: Move client logic to separate Client Component; import it directly (no `next/dynamic`)
4. **Modifying content without rebuilding**: JSON articles are read at build time; changes require `pnpm build` then redeploy
5. **Nginx cache issues in Docker**: Clear browser cache or add `?v=1` to asset URLs during development

## Testing Approach

- No test framework configured; add Jest + React Testing Library if needed
- Manual testing: `pnpm dev` for local iteration, Docker for production validation
- Nginx health check uses `wget` to verify root path responds

## Extension Points

- **New data source**: Implement `IBlogSource` interface (e.g., `MarkdownBlogSource`, `DatabaseBlogSource`)
- **New content types**: Extend `BlogParagraph` union type; update `ContentRenderer.tsx`
- **API layer**: Add route handlers in `app/api/` (respects static export constraints)
- **Metadata enrichment**: Extend `BlogService` methods to aggregate tags, popular articles, etc.
