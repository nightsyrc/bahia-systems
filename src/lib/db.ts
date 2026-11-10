import { neon } from "@neondatabase/serverless";

type Rows = { rows: Record<string, unknown>[] };
let listo: Promise<void> | null = null;

/** Consulta con plantilla: sql`SELECT ... ${valor}`. Los valores siempre viajan como parámetros. */
export async function sql(strings: TemplateStringsArray, ...vals: unknown[]): Promise<Rows> {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("Falta DATABASE_URL");
  const rows = (await neon(url)(strings, ...(vals as never[]))) as Record<string, unknown>[];
  return { rows };
}

export function ensureSchema(): Promise<void> {
  listo ??= (async () => {
    await sql`CREATE TABLE IF NOT EXISTS leads (
      id SERIAL PRIMARY KEY, creado_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      nombre TEXT NOT NULL, empresa TEXT, email TEXT NOT NULL, telefono TEXT,
      interes TEXT NOT NULL, mensaje TEXT, detalle JSONB, estimado TEXT,
      token TEXT NOT NULL, baja BOOLEAN NOT NULL DEFAULT FALSE,
      estado TEXT NOT NULL DEFAULT 'nuevo', seg_paso INT NOT NULL DEFAULT 0, seg_ultimo TIMESTAMPTZ,
      ip_hash TEXT)`;
    await sql`CREATE INDEX IF NOT EXISTS leads_email_idx ON leads (lower(email))`;
    await sql`ALTER TABLE leads ADD COLUMN IF NOT EXISTS origen TEXT`; // Caravana: canal de origen
    await sql`CREATE TABLE IF NOT EXISTS prospectos (
      id SERIAL PRIMARY KEY, creado_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      empresa TEXT NOT NULL, sitio TEXT, ciudad TEXT, categoria TEXT, correo TEXT, fuente_url TEXT, razon TEXT,
      estado TEXT NOT NULL DEFAULT 'propuesto', baja BOOLEAN NOT NULL DEFAULT FALSE, token TEXT NOT NULL,
      notas TEXT, valor_mensual INT, valor_unico INT, ultimo_contacto TIMESTAMPTZ, estado_at TIMESTAMPTZ NOT NULL DEFAULT NOW())`;
    await sql`CREATE UNIQUE INDEX IF NOT EXISTS prospectos_empresa_uq ON prospectos (lower(empresa))`;
    await sql`CREATE TABLE IF NOT EXISTS mensajes (
      id SERIAL PRIMARY KEY, creado_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), prospecto_id INT NOT NULL REFERENCES prospectos(id) ON DELETE CASCADE,
      tipo TEXT NOT NULL, asunto TEXT NOT NULL, cuerpo TEXT NOT NULL, estado TEXT NOT NULL DEFAULT 'borrador',
      generado_por TEXT NOT NULL DEFAULT 'redactor', aprobado_at TIMESTAMPTZ, enviado_at TIMESTAMPTZ, error TEXT)`;
    await sql`CREATE TABLE IF NOT EXISTS agentes_log (
      id SERIAL PRIMARY KEY, ts TIMESTAMPTZ NOT NULL DEFAULT NOW(), agente TEXT NOT NULL, accion TEXT NOT NULL, detalle TEXT, ok BOOLEAN NOT NULL DEFAULT TRUE)`;
  })().catch((e) => { listo = null; throw e; });
  return listo;
}
