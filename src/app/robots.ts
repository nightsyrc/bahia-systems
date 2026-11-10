import type { MetadataRoute } from "next";
import { MARCA } from "@/config/marca";
export default function robots(): MetadataRoute.Robots {
  return { rules: { userAgent: "*", allow: "/", disallow: ["/api/", "/baja"] }, sitemap: `${MARCA.url}/sitemap.xml` };
}
