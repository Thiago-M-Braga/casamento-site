import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Great_Vibes, Jost } from "next/font/google";
import "./globals.css";

import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { MusicPlayer } from "@/components/layout/MusicPlayer";
import { Analytics } from "@/components/layout/Analytics";
import { SmoothScroll } from "@/components/layout/SmoothScroll";
import { PageTransition } from "@/components/layout/PageTransition";
import { weddingConfig } from "@/config/wedding";
import { theme } from "@/config/theme";
import { getSiteUrl } from "@/lib/utils/site";

const display = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-cormorant",
  display: "swap",
});

const body = Jost({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  variable: "--font-jost",
  display: "swap",
});

const script = Great_Vibes({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-vibes",
  display: "swap",
});

const siteUrl = getSiteUrl();
const siteTitle = `${weddingConfig.site.title} | Nosso Casamento`;

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: siteTitle,
    template: `%s | ${weddingConfig.site.title}`,
  },
  description: weddingConfig.site.description,
  applicationName: weddingConfig.site.title,
  keywords: [
    "casamento",
    weddingConfig.couple.bride,
    weddingConfig.couple.groom,
    "lista de presentes",
    "confirmação de presença",
    weddingConfig.ceremony.city,
  ],
  authors: [{ name: weddingConfig.couple.displayName }],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: siteUrl,
    siteName: weddingConfig.site.title,
    title: siteTitle,
    description: weddingConfig.site.description,
  },
  twitter: {
    card: "summary_large_image",
    title: siteTitle,
    description: weddingConfig.site.description,
  },
  robots: {
    index: true,
    follow: true,
  },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: theme.colors.beige[100],
  colorScheme: "light",
};

/** JSON-LD: ajuda o Google a entender que é um evento. */
function EventStructuredData() {
  const data = {
    "@context": "https://schema.org",
    "@type": "Event",
    name: `Casamento de ${weddingConfig.couple.displayName}`,
    startDate: `${weddingConfig.wedding.date}T${weddingConfig.wedding.time}:00-03:00`,
    eventStatus: "https://schema.org/EventScheduled",
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    description: weddingConfig.site.description,
    url: siteUrl,
    location: {
      "@type": "Place",
      name: weddingConfig.ceremony.name,
      address: {
        "@type": "PostalAddress",
        streetAddress: weddingConfig.ceremony.address,
        addressLocality: weddingConfig.ceremony.city,
        addressRegion: weddingConfig.ceremony.state,
        addressCountry: "BR",
      },
    },
  };

  return (
    <script
      type="application/ld+json"
      // Conteúdo estático vindo da configuração do próprio site.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="pt-BR"
      className={`${display.variable} ${body.variable} ${script.variable}`}
    >
      <body className="flex min-h-dvh flex-col">
        <a
          href="#conteudo"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[200] focus:rounded-full focus:bg-green-800 focus:px-5 focus:py-3 focus:text-xs focus:uppercase focus:tracking-widest focus:text-beige-50"
        >
          Ir para o conteúdo
        </a>

        <Navbar />
        <SmoothScroll />

        <main id="conteudo" className="flex-1">
          <PageTransition>{children}</PageTransition>
        </main>

        <Footer />
        <MusicPlayer />
        <Analytics />
        <EventStructuredData />
      </body>
    </html>
  );
}
