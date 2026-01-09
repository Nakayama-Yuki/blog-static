import { notFound } from "next/navigation";
import { getBlogService } from "@/lib/blog-service";
import ArticleDetail from "@/components/ArticleDetail";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const blogService = getBlogService();
  return blogService.getStaticSlugParams();
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const blogService = getBlogService();
  const article = await blogService.getArticleBySlug(slug);

  if (!article) {
    return {};
  }

  return {
    title: article.title,
    description: article.description,
    openGraph: {
      title: article.title,
      description: article.description,
      type: "article",
      publishedTime: article.publishedAt,
      modifiedTime: article.updatedAt,
    },
  };
}

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params;
  const blogService = getBlogService();

  const article = await blogService.getArticleBySlug(slug);
  if (!article) {
    notFound();
  }

  const relatedArticles = await blogService.getRelatedArticles(slug, 3);

  return <ArticleDetail article={article} relatedArticles={relatedArticles} />;
}
