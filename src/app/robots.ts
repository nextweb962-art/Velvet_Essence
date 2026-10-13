import type { MetadataRoute } from "next";

import { SITE } from "@/lib/constants";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // Account, admin and transactional surfaces should never be indexed.
        disallow: ["/admin", "/account", "/checkout", "/api", "/auth", "/login", "/signup"],
      },
    ],
    sitemap: `${SITE.url}/sitemap.xml`,
    host: SITE.url,
  };
}
