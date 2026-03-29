import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/react";
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

const appJsonLd = {
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

const orgJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "TableMesh",
  url: "https://tablemesh.com",
  logo: "https://tablemesh.com/icon-512x512.png",
  description:
    "TableMesh is the group dining coordination app for friends, coworkers, and food lovers.",
  foundingDate: "2024",
  sameAs: [
    "https://www.instagram.com/tablemesh.official",
    "https://www.youtube.com/@tablemeshofficial",
    "https://www.tiktok.com/@tablemesh",
    "https://www.reddit.com/r/SideProject/comments/1r0potl/built_a_social_dining_app_to_help_people_share/",
  ],
};

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "TableMesh",
  url: "https://tablemesh.com",
  potentialAction: {
    "@type": "SearchAction",
    target: "https://tablemesh.com/?q={search_term_string}",
    "query-input": "required name=search_term_string",
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
        {/* Preconnect to critical origins */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* Google Tag Manager */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','GTM-MQRDF8T8');`,
          }}
        />
        {/* End Google Tag Manager */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(appJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
      </head>
      <body>
        {/* Google Tag Manager (noscript) */}
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-MQRDF8T8"
            height="0"
            width="0"
            style={{ display: 'none', visibility: 'hidden' }}
          />
        </noscript>
        {/* End Google Tag Manager (noscript) */}
        {children}
        <Analytics />
      </body>
    </html>
  );
}
