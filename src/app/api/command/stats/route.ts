import { NextResponse } from "next/server";
import { timingSafeEqual } from "node:crypto";
import { ensureSchema, sql } from "@/lib/db";

export const dynamic = "force-dynamic";

function autorizado(req: Request): boolean {
  const secreto = (process.env.COMMAND_TOKEN ?? "").trim();
  if (secreto.length < 32) return false;
  const dado = Buffer.from(req.headers.get("authorization") ?? "");
  const esperado = Buffer.from(`Bearer ${secreto}`);
  return dado.length === esperado.length && timingSafeEqual(dado, esperado);
}

/** Resumen de prospectos para Bahía Command (panel privado del súper administrador). Solo lectura. */
export async function GET(req: Request) {
  if (!autorizado(req)) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  await ensureSchema();
  const c = (await sql`SELECT
      COUNT(*) FILTER (WHERE (creado_at AT TIME ZONE 'America/Mexico_City')::date = (NOW() AT TIME ZONE 'America/Mexico_City')::date)::int AS hoy,
      COUNT(*) FILTER (WHERE creado_at > NOW() - INTERVAL '7 days')::int AS semana,
      COUNT(*) FILTER (WHERE creado_at > NOW() - INTERVAL '30 days')::int AS mes,
      COUNT(*) FILTER (WHERE baja = FALSE AND estado = 'nuevo')::int AS abiertos,
      COUNT(*) FILTER (WHERE baja)::int AS bajas
    FROM leads`).rows[0];
  const porInteres = (await sql`SELECT interes, COUNT(*)::int AS n FROM leads GROUP BY interes ORDER BY n DESC`).rows;
  const porOrigen = (await sql`SELECT COALESCE(origen, 'directo') AS origen, COUNT(*)::int AS n FROM leads WHERE creado_at > NOW() - INTERVAL '30 days' GROUP BY 1 ORDER BY n DESC`).rows;
  const ultimos = (await sql`SELECT creado_at, nombre, empresa, email, interes, estado, seg_paso, origen FROM leads ORDER BY creado_at DESC LIMIT 10`).rows;
  return NextResponse.json({ ...c, porInteres, porOrigen, ultimos }, { headers: { "Cache-Control": "no-store" } });
}
