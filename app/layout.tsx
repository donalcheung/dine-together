import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TableMesh — Effortless Group Dining | Plan Meals with Friends, Teams & Community",
  description:
    "TableMesh makes it easy to organize group meals with friends, colleagues, or new people. Host a table, coordinate dinners, and discover shared dining experiences near you. Download the app today.",
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
    title: "TableMesh — Effortless Group Dining",
    description:
      "Plan meals with friends, colleagues, or new people. Host a table, coordinate dinners, and discover shared dining experiences near you.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "TableMesh — Effortless Group Dining",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "TableMesh — Effortless Group Dining",
    description:
      "Plan meals with friends, colleagues, or new people. Host a table, coordinate dinners, and discover shared dining experiences near you.",
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
    "TableMesh makes it easy to organize group meals with friends, colleagues, or new people. Host a table, coordinate dinners, and discover shared dining experiences near you.",
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
