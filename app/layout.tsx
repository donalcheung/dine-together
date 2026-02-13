import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TableMesh - Share Meals, Split Bills, Make Memories",
  description: "Join spontaneous dining experiences. Find people to share dishes with at your favorite restaurants.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
