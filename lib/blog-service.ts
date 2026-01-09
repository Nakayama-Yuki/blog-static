import { BlogArticle, BlogMetadata, Author, Category } from "@/types/blog";

/**
 * ブログデータソースの抽象インターフェース
 * JSON、Markdown、Database など異なる実装に対応可能
 */
export interface IBlogSource {
  getArticleBySlug(slug: string): Promise<BlogArticle | null>;
  getAllArticles(): Promise<BlogArticle[]>;
  getArticlesByTag(tag: string): Promise<BlogArticle[]>;
  getArticlesByCategory(categoryId: string): Promise<BlogArticle[]>;
  getArticlesMeta(): Promise<BlogMetadata[]>;
}

/**
 * 著者データソースのインターフェース
 */
export interface IAuthorSource {
  getAuthorById(id: string): Promise<Author | null>;
  getAllAuthors(): Promise<Author[]>;
}

/**
 * カテゴリーデータソースのインターフェース
 */
export interface ICategorySource {
  getCategoryById(id: string): Promise<Category | null>;
  getAllCategories(): Promise<Category[]>;
}

/**
 * ブログサービス - ビジネスロジック層
 * データソースから取得したデータを加工・集計する
 */
export class BlogService {
  constructor(
    private blogSource: IBlogSource,
    private authorSource: IAuthorSource,
    private categorySource: ICategorySource,
  ) {}

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

  async getArticlesByCategory(categoryId: string): Promise<BlogArticle[]> {
    return this.blogSource.getArticlesByCategory(categoryId);
  }

  async getArticlesMeta(): Promise<BlogMetadata[]> {
    return this.blogSource.getArticlesMeta();
  }

  /**
   * 記事と著者情報を合わせて取得
   */
  async getArticleWithAuthor(
    slug: string,
  ): Promise<(BlogArticle & { authorInfo: Author | null }) | null> {
    const article = await this.getArticleBySlug(slug);
    if (!article) return null;

    const authorInfo = await this.authorSource.getAuthorById(article.author);
    return { ...article, authorInfo };
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

  // ==================== 著者操作 ====================

  async getAuthorById(id: string): Promise<Author | null> {
    return this.authorSource.getAuthorById(id);
  }

  async getAllAuthors(): Promise<Author[]> {
    return this.authorSource.getAllAuthors();
  }

  // ==================== カテゴリー操作 ====================

  async getCategoryById(id: string): Promise<Category | null> {
    return this.categorySource.getCategoryById(id);
  }

  async getAllCategories(): Promise<Category[]> {
    return this.categorySource.getAllCategories();
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

import {
  JsonBlogSource,
  JsonAuthorSource,
  JsonCategorySource,
} from "./sources/json-source";

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

  const authorSource = new JsonAuthorSource();
  const categorySource = new JsonCategorySource();

  return new BlogService(blogSource, authorSource, categorySource);
}
