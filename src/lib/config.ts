import siteConfig from "../../config/site.json";

export type SiteConfig = typeof siteConfig;
export type SiteLink = SiteConfig["links"][number];

export function getSiteConfig(): SiteConfig {
  return siteConfig;
}

export function getSiteUrl(path = ""): string {
  const base = siteConfig.meta.siteUrl.replace(/\/$/, "");
  return path ? `${base}${path.startsWith("/") ? path : `/${path}`}` : base;
}
