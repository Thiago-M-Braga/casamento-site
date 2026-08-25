import type { MetadataRoute } from "next";
import { getNavItems } from "@/config/navigation";
import { getSiteUrl } from "@/lib/utils/site";

/** Sitemap gerado a partir da navegação configurada em `config/navigation.ts`. */
export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = getSiteUrl();
  const lastModified = new Date();

  return getNavItems().map((item) => ({
    url: `${baseUrl}${item.href === "/" ? "" : item.href}`,
    lastModified,
    changeFrequency: "monthly",
    priority: item.href === "/" ? 1 : 0.8,
  }));
}
