import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "技術ブログ",
    template: "%s | 技術ブログ",
  },
  description:
    "Next.js、Nginx、Docker などの技術記事を配信する静的ブログサイト",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className="antialiased">
        <header className="bg-white border-b">
          <nav className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
            <Link href="/" className="text-xl font-bold text-blue-600">
              技術ブログ
            </Link>
            <div className="flex gap-6">
              <Link href="/" className="hover:text-blue-600 transition-colors">
                ホーム
              </Link>
              <Link
                href="/blog"
                className="hover:text-blue-600 transition-colors"
              >
                記事一覧
              </Link>
            </div>
          </nav>
        </header>
        {children}
        <footer className="bg-gray-100 border-t mt-16">
          <div className="max-w-4xl mx-auto px-4 py-8 text-center text-gray-600">
            <p>&copy; 2026 技術ブログ. All rights reserved.</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
