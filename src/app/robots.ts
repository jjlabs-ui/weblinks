import type { MetadataRoute } from "next";
import { getSiteConfig } from "@/lib/config";

export default function robots(): MetadataRoute.Robots {
  const { meta } = getSiteConfig();
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: `${meta.siteUrl.replace(/\/$/, "")}/sitemap.xml`,
  };
}
