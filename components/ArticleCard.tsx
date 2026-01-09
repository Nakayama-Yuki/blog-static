import Link from "next/link";
import { BlogMetadata } from "@/types/blog";
import { formatDate } from "@/lib/utils";

interface Props {
  article: BlogMetadata;
}

/**
 * ブログ記事カードコンポーネント（一覧表示用）
 */
export default function ArticleCard({ article }: Props) {
  return (
    <article className="border-l-4 border-blue-500 pl-4 pb-6 hover:border-blue-600 transition-colors">
      <div className="flex justify-between items-start mb-2">
        <Link
          href={`/blog/${article.slug}`}
          className="text-2xl font-bold text-blue-600 hover:underline"
        >
          {article.title}
        </Link>
        {article.featured && (
          <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs font-semibold">
            注目
          </span>
        )}
      </div>

      <p className="text-gray-700 mb-4">{article.description}</p>

      <div className="flex gap-4 text-sm text-gray-600 mb-3">
        <time dateTime={article.publishedAt}>
          {formatDate(article.publishedAt)}
        </time>
        <span>{article.readingTime} 分で読めます</span>
      </div>

      <div className="flex gap-2 flex-wrap">
        {article.tags.map((tag) => (
          <span
            key={tag}
            className="inline-block bg-gray-200 text-gray-800 px-2 py-1 rounded text-xs hover:bg-gray-300 transition-colors"
          >
            #{tag}
          </span>
        ))}
      </div>
    </article>
  );
}
