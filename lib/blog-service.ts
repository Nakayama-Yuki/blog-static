import { BlogArticle, BlogMetadata } from "@/types/blog";

/**
 * ブログデータソースの抽象インターフェース
 * JSON、Markdown、Database など異なる実装に対応可能
 */
export interface IBlogSource {
  getArticleBySlug(slug: string): Promise<BlogArticle | null>;
  getAllArticles(): Promise<BlogArticle[]>;
  getArticlesByTag(tag: string): Promise<BlogArticle[]>;
  getArticlesMeta(): Promise<BlogMetadata[]>;
}

/**
 * ブログサービス - ビジネスロジック層
 * データソースから取得したデータを加工・集計する
 */
export class BlogService {
  constructor(private blogSource: IBlogSource) {}

  // ==================== 記事操作 ====================

  async getArticleBySlug(slug: string): Promise<BlogArticle | null> {
    return this.blogSource.getArticleBySlug(slug);
  }

  async getAllArticles(): Promise<BlogArticle[]> {
    return this.blogSource.getAllArticles();
  }

  async getArticlesByTag(tag: string): Promise<BlogArticle[]> {
    return this.blogSource.getArticlesByTag(tag);
  }

  async getArticlesMeta(): Promise<BlogMetadata[]> {
    return this.blogSource.getArticlesMeta();
  }

  /**
   * generateStaticParams 用の slug リスト
   */
  async getStaticSlugParams(): Promise<Array<{ slug: string }>> {
    const articles = await this.getAllArticles();
    return articles.map((article) => ({ slug: article.slug }));
  }

  /**
   * 注目記事を取得
   */
  async getFeaturedArticles(limit: number = 3): Promise<BlogArticle[]> {
    const articles = await this.getAllArticles();
    return articles.filter((article) => article.featured).slice(0, limit);
  }

  // ==================== 検索・集計 ====================

  /**
   * 記事を検索（タイトル、説明、タグ）
   */
  async searchArticles(query: string): Promise<BlogArticle[]> {
    const articles = await this.getAllArticles();
    const q = query.toLowerCase();

    return articles.filter(
      (article) =>
        article.title.toLowerCase().includes(q) ||
        article.description.toLowerCase().includes(q) ||
        article.tags.some((tag) => tag.toLowerCase().includes(q)),
    );
  }

  /**
   * 関連記事を取得（同じタグを持つ記事）
   */
  async getRelatedArticles(
    slug: string,
    limit: number = 3,
  ): Promise<BlogArticle[]> {
    const article = await this.getArticleBySlug(slug);
    if (!article) return [];

    const articles = await this.getAllArticles();
    const related = articles
      .filter(
        (a) =>
          a.slug !== slug && a.tags.some((tag) => article.tags.includes(tag)),
      )
      .slice(0, limit);

    return related;
  }
}

// ==================== ファクトリー ====================

import { JsonBlogSource } from "./sources/json-source";

/**
 * BlogService のグローバルインスタンスを取得
 * 環境変数で実装を切り替え可能（将来の拡張用）
 */
export function getBlogService(): BlogService {
  const sourceType = process.env.BLOG_SOURCE_TYPE || "json";

  let blogSource: IBlogSource;

  if (sourceType === "json") {
    blogSource = new JsonBlogSource();
  } else {
    // 将来的に markdown や database 実装を追加可能
    blogSource = new JsonBlogSource();
  }

  return new BlogService(blogSource);
}
