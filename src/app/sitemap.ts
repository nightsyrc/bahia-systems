import type { MetadataRoute } from "next";
import { MARCA } from "@/config/marca";
export default function sitemap(): MetadataRoute.Sitemap {
  return ["", "/a-la-medida", "/privacidad"].map((p) => ({ url: MARCA.url + p, lastModified: new Date() }));
}
