import { Suspense } from "react";
import { getBlogService } from "@/lib/blog-service";
import ArticleCard from "@/components/ArticleCard";

async function ArticleList() {
  const blogService = getBlogService();
  const articles = await blogService.getArticlesMeta();

  return (
    <div className="space-y-8">
      {articles.map((article) => (
        <ArticleCard key={article.id} article={article} />
      ))}

      {articles.length === 0 && (
        <p className="text-gray-600 text-center py-12">まだ記事がありません</p>
      )}
    </div>
  );
}

export const metadata = {
  title: "ブログ記事一覧",
  description: "すべての技術記事を閲覧できます",
};

export default function BlogPage() {
  return (
    <main className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-12">ブログ記事一覧</h1>
      <Suspense fallback={<div className="text-gray-600">読み込み中...</div>}>
        <ArticleList />
      </Suspense>
    </main>
  );
}
