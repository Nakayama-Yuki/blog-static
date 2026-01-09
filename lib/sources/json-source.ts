import fs from "fs/promises";
import path from "path";
import { BlogArticle, BlogMetadata } from "@/types/blog";
import { IBlogSource } from "../blog-service";

const CONTENT_DIR = path.join(process.cwd(), "content");
const ARTICLES_DIR = path.join(CONTENT_DIR, "articles");

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

  async getArticlesMeta(): Promise<BlogMetadata[]> {
    const articles = await this.getAllArticles();
    // Remove content field from articles to return only metadata
    return articles.map((article) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { content, ...meta } = article;
      return meta;
    });
  }
}
