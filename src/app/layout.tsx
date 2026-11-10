import type { Metadata } from "next";
import "./globals.css";
import { MARCA } from "@/config/marca";

export const metadata: Metadata = {
  metadataBase: new URL(MARCA.url),
  title: { default: "Bahía Systems · Atalaya, caseta digital para condominios", template: "%s · Bahía Systems" },
  description: "Atalaya reemplaza el cuaderno de la caseta: accesos, paquetes, turnos y reportes al administrador. Soluciones de TI a la medida desde Puerto Vallarta para todo México.",
  openGraph: { title: "Bahía Systems · Atalaya", description: "Caseta digital para condominios y soluciones de TI a la medida.", type: "website", locale: "es_MX" },
};

const ld = { "@context": "https://schema.org", "@type": "Organization", name: MARCA.nombre, url: MARCA.url, address: { "@type": "PostalAddress", addressLocality: "Puerto Vallarta", addressRegion: "Jalisco", addressCountry: "MX" }, makesOffer: { "@type": "Offer", itemOffered: { "@type": "SoftwareApplication", name: "Atalaya", applicationCategory: "BusinessApplication", operatingSystem: "Web" } } };

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,500;12..96,700;12..96,800&family=Figtree:wght@400;500;700&display=swap" rel="stylesheet" />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
