import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "chat-lemo",
  description: "Chat application powered by LangGraph",
};

import { AuthProvider } from "./contexts/AuthContext";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className="bg-bg-body text-text-main antialiased selection:bg-primary selection:text-white overflow-hidden">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
