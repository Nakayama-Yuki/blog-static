import Link from "next/link";
import { BlogArticle } from "@/types/blog";
import { formatDate } from "@/lib/utils";
import ContentRenderer from "./ContentRenderer";

interface Props {
  article: BlogArticle;
  relatedArticles?: BlogArticle[];
}

/**
 * ブログ記事詳細コンポーネント
 */
export default function ArticleDetail({
  article,
  relatedArticles = [],
}: Props) {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      {/* ナビゲーション */}
      <Link
        href="/blog"
        className="text-blue-600 hover:underline mb-8 inline-block"
      >
        ← ブログ一覧に戻る
      </Link>

      {/* 記事本体 */}
      <article>
        {/* ヘッダー */}
        <header className="mb-12">
          <h1 className="text-4xl font-bold mb-4">{article.title}</h1>

          {/* メタ情報 */}
          <div className="flex gap-6 text-sm text-gray-600 mb-4">
            <time dateTime={article.publishedAt}>
              {formatDate(article.publishedAt)}
            </time>
            <span>{article.readingTime} 分で読めます</span>
            {article.featured && (
              <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs font-semibold">
                注目記事
              </span>
            )}
          </div>

          {/* タグ */}
          <div className="flex gap-2 flex-wrap">
            {article.tags.map((tag) => (
              <span
                key={tag}
                className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
              >
                #{tag}
              </span>
            ))}
          </div>
        </header>

        {/* コンテンツ */}
        <div className="mb-12">
          <ContentRenderer paragraphs={article.content} />
        </div>
      </article>

      {/* 関連記事 */}
      {relatedArticles.length > 0 && (
        <aside className="mt-16 pt-8 border-t">
          <h2 className="text-2xl font-bold mb-6">関連記事</h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {relatedArticles.map((related) => (
              <Link
                key={related.id}
                href={`/blog/${related.slug}`}
                className="block p-4 border rounded-lg hover:shadow-md transition-shadow"
              >
                <h3 className="font-semibold mb-2 text-blue-600 hover:underline">
                  {related.title}
                </h3>
                <p className="text-sm text-gray-600 line-clamp-2">
                  {related.description}
                </p>
                <div className="mt-3 text-xs text-gray-500">
                  {formatDate(related.publishedAt)}
                </div>
              </Link>
            ))}
          </div>
        </aside>
      )}
    </div>
  );
}
