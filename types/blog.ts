/**
 * ブログ記事のメタデータ
 */
export interface BlogMetadata {
  id: string;
  title: string;
  slug: string;
  description: string;
  author: string;
  publishedAt: string; // ISO 8601
  updatedAt: string;
  tags: string[];
  category: string;
  featured: boolean;
  readingTime: number; // 分単位
}

/**
 * ブログ記事のコンテンツ段落
 */
export interface BlogParagraph {
  type: "paragraph" | "heading" | "code" | "quote" | "list";
  content: string;
  level?: number; // h1-h6 用
  language?: string; // コード用
  ordered?: boolean; // リスト用
}

/**
 * 完全なブログ記事（メタデータ + コンテンツ）
 */
export interface BlogArticle extends BlogMetadata {
  content: BlogParagraph[];
}

/**
 * 著者情報
 */
export interface Author {
  id: string;
  name: string;
  email: string;
  bio: string;
  avatar?: string;
}

/**
 * カテゴリー情報
 */
export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
}

/**
 * 著者情報付き記事
 */
export interface BlogArticleWithAuthor extends BlogArticle {
  authorInfo: Author | null;
}
