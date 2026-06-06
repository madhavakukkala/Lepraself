import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'LEPRASELF — Curated Programming Roadmap',
  description: 'A complete programming mastery platform covering DSA, problem solving, core computer science subjects, interview preparation, and multiple programming languages.',
  keywords: 'DSA, programming, learning path, interview preparation, LeetCode tracker, C++, Java, Python, LEPRASELF',
  authors: [{ name: 'LEPRASELF' }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-white dark:bg-black text-[var(--foreground)]">
        {children}
      </body>
    </html>
  );
}
