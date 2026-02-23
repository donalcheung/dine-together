import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TableMesh — Organize Group Meals Effortlessly",
  description:
    "Coordinate dinners with your friend group. Signal your lunch break to coworkers. Rally people for Korean BBQ, dim sum, and tasting menus. TableMesh is the easiest way to get everyone to the table.",
  keywords: [
    "group dining",
    "social dining",
    "plan meals",
    "eat together",
    "shared meals",
    "team lunch",
    "dinner party",
    "foodie",
    "meet new people",
    "local restaurants",
    "dining app",
    "meal planning",
    "friends dinner",
    "work lunch",
    "community dining",
  ],
  authors: [{ name: "Sheep Labs LLC" }],
  creator: "Sheep Labs LLC",
  publisher: "Sheep Labs LLC",
  metadataBase: new URL("https://tablemesh.com"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://tablemesh.com",
    siteName: "TableMesh",
    title: "TableMesh — Organize Group Meals Effortlessly",
    description:
      "Coordinate dinners with friends, coworkers, and food lovers. The easiest way to get everyone to the table.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "TableMesh — Organize Group Meals Effortlessly. For friends, coworkers, foodies & adventurers.",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "TableMesh — Organize Group Meals Effortlessly",
    description:
      "Coordinate dinners with friends, coworkers, and food lovers. The easiest way to get everyone to the table.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/favicon-32.png",
    apple: "/icon-192x192.png",
  },
  category: "food & drink",
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "MobileApplication",
  name: "TableMesh",
  operatingSystem: "iOS, Android",
  applicationCategory: "LifestyleApplication",
  description:
    "Coordinate dinners with your friend group. Signal your lunch break to coworkers. Rally people for Korean BBQ, dim sum, and tasting menus. TableMesh is the easiest way to get everyone to the table.",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
  author: {
    "@type": "Organization",
    name: "Sheep Labs LLC",
    url: "https://tablemesh.com",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
