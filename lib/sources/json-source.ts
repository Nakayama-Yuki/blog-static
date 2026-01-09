import fs from "fs/promises";
import path from "path";
import { BlogArticle, Author, Category, BlogMetadata } from "@/types/blog";
import { IBlogSource, IAuthorSource, ICategorySource } from "../blog-service";

const CONTENT_DIR = path.join(process.cwd(), "content");
const ARTICLES_DIR = path.join(CONTENT_DIR, "articles");
const AUTHORS_FILE = path.join(CONTENT_DIR, "authors", "authors.json");
const CATEGORIES_FILE = path.join(CONTENT_DIR, "categories", "categories.json");

/**
 * JSON ファイルベースのブログデータソース
 */
export class JsonBlogSource implements IBlogSource {
  async getArticleBySlug(slug: string): Promise<BlogArticle | null> {
    try {
      const files = await fs.readdir(ARTICLES_DIR);

      for (const file of files) {
        if (!file.endsWith(".json")) continue;

        const filePath = path.join(ARTICLES_DIR, file);
        const content = await fs.readFile(filePath, "utf-8");
        const article = JSON.parse(content) as BlogArticle;

        if (article.slug === slug) {
          return article;
        }
      }
      return null;
    } catch (error) {
      console.error("Error reading article:", error);
      return null;
    }
  }

  async getAllArticles(): Promise<BlogArticle[]> {
    try {
      const files = await fs.readdir(ARTICLES_DIR);
      const articles: BlogArticle[] = [];

      for (const file of files) {
        if (!file.endsWith(".json")) continue;

        const filePath = path.join(ARTICLES_DIR, file);
        const content = await fs.readFile(filePath, "utf-8");
        articles.push(JSON.parse(content));
      }

      // publishedAt 降順でソート
      return articles.sort(
        (a, b) =>
          new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
      );
    } catch (error) {
      console.error("Error reading articles:", error);
      return [];
    }
  }

  async getArticlesByTag(tag: string): Promise<BlogArticle[]> {
    const articles = await this.getAllArticles();
    return articles.filter((article) => article.tags.includes(tag));
  }

  async getArticlesByCategory(categoryId: string): Promise<BlogArticle[]> {
    const articles = await this.getAllArticles();
    return articles.filter((article) => article.category === categoryId);
  }

  async getArticlesMeta(): Promise<BlogMetadata[]> {
    const articles = await this.getAllArticles();
    return articles.map(({ content, ...meta }) => meta);
  }
}

/**
 * JSON ファイルベースの著者データソース
 */
export class JsonAuthorSource implements IAuthorSource {
  private cache: Map<string, { data: Author[]; timestamp: number }> = new Map();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5分

  async getAllAuthors(): Promise<Author[]> {
    const cacheKey = "authors";
    const cached = this.cache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.data;
    }

    try {
      const content = await fs.readFile(AUTHORS_FILE, "utf-8");
      const authors = JSON.parse(content) as Author[];
      this.cache.set(cacheKey, { data: authors, timestamp: Date.now() });
      return authors;
    } catch (error) {
      console.error("Error reading authors:", error);
      return [];
    }
  }

  async getAuthorById(id: string): Promise<Author | null> {
    const authors = await this.getAllAuthors();
    return authors.find((author) => author.id === id) || null;
  }
}

/**
 * JSON ファイルベースのカテゴリーデータソース
 */
export class JsonCategorySource implements ICategorySource {
  private cache: Map<string, { data: Category[]; timestamp: number }> =
    new Map();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5分

  async getAllCategories(): Promise<Category[]> {
    const cacheKey = "categories";
    const cached = this.cache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.data;
    }

    try {
      const content = await fs.readFile(CATEGORIES_FILE, "utf-8");
      const categories = JSON.parse(content) as Category[];
      this.cache.set(cacheKey, { data: categories, timestamp: Date.now() });
      return categories;
    } catch (error) {
      console.error("Error reading categories:", error);
      return [];
    }
  }

  async getCategoryById(id: string): Promise<Category | null> {
    const categories = await this.getAllCategories();
    return categories.find((cat) => cat.id === id) || null;
  }
}
