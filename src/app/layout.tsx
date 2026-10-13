import type { Metadata, Viewport } from "next";
import { El_Messiri, IBM_Plex_Sans_Arabic } from "next/font/google";

import { CartDrawer } from "@/components/cart/cart-drawer";
import { AnnouncementBar } from "@/components/layout/announcement-bar";
import { Footer } from "@/components/layout/footer";
import { Navbar } from "@/components/layout/navbar";
import { AppProviders } from "@/components/providers/app-providers";
import { SITE } from "@/lib/constants";
import { isSupabaseConfigured } from "@/lib/env";
import { getCurrentProfile } from "@/lib/supabase/server";

import "./globals.css";

/**
 * El Messiri for display, IBM Plex Sans Arabic for text.
 *
 * Both carry proper Arabic shaping and a matching Latin set, so promo codes and
 * SKUs sit harmoniously next to Arabic copy instead of falling back to Arial.
 */
const display = El_Messiri({
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-display",
  display: "swap",
});

const sans = IBM_Plex_Sans_Arabic({
  subsets: ["arabic", "latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: `${SITE.name} — مكياج فاخر وعطور راقية`,
    template: `%s · ${SITE.name}`,
  },
  description: SITE.description,
  applicationName: SITE.name,
  keywords: [
    "مكياج فاخر",
    "أحمر شفاه",
    "ظلال عيون",
    "عطور",
    "أو دو بارفان",
    "عناية بالبشرة",
    "الأردن",
    "عمّان",
  ],
  authors: [{ name: SITE.name }],
  openGraph: {
    type: "website",
    locale: "ar_JO",
    title: `${SITE.name} — مكياج فاخر وعطور راقية`,
    description: SITE.description,
    siteName: SITE.name,
    url: SITE.url,
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE.name} — مكياج فاخر وعطور راقية`,
    description: SITE.description,
  },
  robots: { index: true, follow: true },
  icons: {
    icon: [{ url: "/icon.svg", type: "image/svg+xml" }],
    apple: [{ url: "/icon.svg" }],
  },
};

export const viewport: Viewport = {
  themeColor: "#FFF8F3",
  colorScheme: "light",
  width: "device-width",
  initialScale: 1,
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await getCurrentProfile();

  const viewer = profile
    ? {
        id: profile.id,
        name: profile.full_name,
        email: profile.email,
        isAdmin: profile.role === "admin",
      }
    : null;

  return (
    <html
      lang="ar"
      dir="rtl"
      className={`${display.variable} ${sans.variable}`}
    >
      <body className="min-h-dvh antialiased">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:start-4 focus:z-[100] focus:rounded-full focus:bg-plum-800 focus:px-5 focus:py-2.5 focus:text-sm focus:text-cream-100"
        >
          تخطَّ إلى المحتوى
        </a>

        <AppProviders userId={viewer?.id ?? null}>
          <AnnouncementBar />
          <Navbar viewer={viewer} demo={!isSupabaseConfigured} />
          <main id="main" className="min-h-[60vh]">
            {children}
          </main>
          <Footer />
          <CartDrawer />
        </AppProviders>
      </body>
    </html>
  );
}
