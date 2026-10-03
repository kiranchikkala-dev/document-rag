import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "DocRAG · PDF indexing",
  description: "Index PDF documents for retrieval-augmented generation.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
