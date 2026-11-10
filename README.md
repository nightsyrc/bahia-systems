# Bahía Systems (sitio público)

1. Crea un proyecto en Vercel con esta carpeta (repositorio nuevo en GitHub).
2. Variables de entorno (ver `.env.example`): DATABASE_URL (Neon, base nueva), SITE_URL, SMTP_USER, SMTP_PASS, CONTACT_TO, CRON_SECRET.
3. En GitHub, Settings > Secrets: CRON_SECRET (igual que en Vercel) y SITE_URL. El flujo `seguimiento.yml` corre a diario.
4. Precios, contacto y cotizador: `src/config/marca.ts`.
5. Antes de publicar: abogado revisa `/privacidad`; compra dominio; usa un correo del dominio propio.
