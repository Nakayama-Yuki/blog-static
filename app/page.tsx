import Link from "next/link";
import { getBlogService } from "@/lib/blog-service";
import ArticleCard from "@/components/ArticleCard";

export default async function Home() {
  const blogService = getBlogService();
  const featuredArticles = await blogService.getFeaturedArticles(3);

  return (
    <main className="min-h-screen">
      {/* ヒーローセクション */}
      <section className="bg-linear-to-r from-blue-600 to-blue-800 text-white py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-4">技術ブログ</h1>
          <p className="text-xl mb-8">
            Next.js、Nginx、Docker などの技術記事を配信しています
          </p>
          <Link
            href="/blog"
            className="inline-block bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
          >
            記事一覧を見る
          </Link>
        </div>
      </section>

      {/* 注目記事セクション */}
      <section className="max-w-4xl mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold mb-8">注目記事</h2>
        <div className="space-y-8">
          {featuredArticles.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>

        {featuredArticles.length === 0 && (
          <p className="text-gray-600 text-center py-12">
            まだ記事がありません
          </p>
        )}
      </section>
    </main>
  );
}
