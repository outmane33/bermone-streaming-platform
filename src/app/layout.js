import Header from "@/components/header/Header";
import { Cairo } from "next/font/google";
import "./globals.css";
import { Suspense } from "react";

const cairo = Cairo({
  variable: "--font-cairo",
  subsets: ["latin", "arabic"],
  display: "swap",
  preload: true,
  fallback: ["system-ui", "sans-serif"],
});

const cairoMono = Cairo({
  variable: "--font-cairo-mono",
  subsets: ["latin", "arabic"],
  display: "swap",
  preload: true,
  fallback: ["monospace"],
  weight: ["400", "600", "700"],
});

export const metadata = {
  title: {
    default: `شاهد وحمل أفلام ومسلسلات مترجمة | ${process.env.NEXT_PUBLIC_SITE_URL}`,
    template: `%s | ${process.env.NEXT_PUBLIC_SITE_URL}`,
  },
  description:
    "مكتبة شاملة لأحدث الأفلام الأجنبية، الآسيوية، والأنمي والمسلسلات مترجمة بدقة عالية. مشاهدة وتحميل مباشر مع دعم الاستئناف والتتبع.",
  keywords: [
    "أفلام مترجمة",
    "مسلسلات مترجمة",
    "أنمي مترجم",
    "مشاهدة أون لاين",
    "تحميل أفلام",
    "أفلام كورية",
    "أفلام يابانية",
    "مسلسلات أمريكية",
    "أفلام ألمانية",
    "جودة 1080p",
    "BluRay",
    "WEB-DL",
  ],
  authors: [{ name: "موقع الأفلام والمسلسلات" }],
  creator: "موقع الأفلام والمسلسلات",
  publisher: "موقع الأفلام والمسلسلات",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "ar_SA",
    url: process.env.NEXT_PUBLIC_SITE_URL,
    siteName: process.env.NEXT_PUBLIC_SITE_URL,
    title: `شاهد وحمل أفلام ومسلسلات مترجمة | ${process.env.NEXT_PUBLIC_SITE_URL}`,
    description:
      "مكتبة شاملة لأحدث الأفلام الأجنبية، الآسيوية، والأنمي والمسلسلات مترجمة بدقة عالية.",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "شعار الموقع - أفلام ومسلسلات مترجمة",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `شاهد وحمل أفلام ومسلسلات مترجمة | ${process.env.NEXT_PUBLIC_SITE_URL}`,
    description:
      "مكتبة شاملة لأحدث الأفلام الأجنبية، الآسيوية، والأنمي والمسلسلات مترجمة بدقة عالية.",
    images: ["/og-image.jpg"],
  },
  icons: {
    icon: "/favicon.ico",
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
};

export default function RootLayout({ children }) {
  return (
    <html lang="ar" dir="rtl">
      <body className={`${cairo.variable} ${cairoMono.variable} antialiased`}>
        <div className="max-w-[1440px] mx-auto min-h-[100dvh]">
          <Suspense fallback={<header className="h-20" />}>
            <Header />
          </Suspense>
          {children}
        </div>
      </body>
    </html>
  );
}
