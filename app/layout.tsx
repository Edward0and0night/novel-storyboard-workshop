import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "小说分镜工坊",
  description: "粘贴小说章节，生成竖屏短剧分镜表",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-background text-bone">{children}</body>
    </html>
  );
}
