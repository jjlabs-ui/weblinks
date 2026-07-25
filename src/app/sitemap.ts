import type { MetadataRoute } from "next";
import { getSiteConfig } from "@/lib/config";

export default function sitemap(): MetadataRoute.Sitemap {
  const { meta } = getSiteConfig();
  const base = meta.siteUrl.replace(/\/$/, "");
  return [
    {
      url: base,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
  ];
}
