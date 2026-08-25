import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/utils/site";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = getSiteUrl();

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // Áreas privadas e telas de retorno de pagamento ficam fora do índice.
        // `/adm/` cobre o painel sem revelar o código no robots.txt (que é público).
        disallow: ["/adm/", "/api/", "/agradecimento", "/pagamento/"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}
