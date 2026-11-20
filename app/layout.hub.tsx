import type { Metadata, Viewport } from "next";
import "./globals.css";
import "./hub.css";
export const metadata: Metadata = {
  title: "Amazon US Creator Hub · 创作者发现",
  description:
    "面向 Amazon 美国站卖家的创作者发现、证据评估与合作管理模拟工作区。",
};
export const viewport: Viewport = {
  themeColor: "#152443",
  width: "device-width",
  initialScale: 1,
};
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN" className="bg-background">
      <body className="font-sans">{children}</body>
    </html>
  );
}
