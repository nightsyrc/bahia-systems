import { NextResponse } from "next/server";
import { timingSafeEqual } from "node:crypto";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 300;

/** Órdenes que Bahía Command puede dar a este sistema. Cada una corre una tarea que ya existe; nada más es alcanzable desde aquí. */
const ORDENES: Record<string, string> = {
  agentes: "/api/cron/agentes",
  seguimiento: "/api/cron/seguimiento",
};

function autorizado(req: Request): boolean {
  const secreto = (process.env.COMMAND_TOKEN ?? "").trim();
  if (secreto.length < 32) return false;
  const dado = Buffer.from(req.headers.get("authorization") ?? "");
  const esperado = Buffer.from(`Bearer ${secreto}`);
  return dado.length === esperado.length && timingSafeEqual(dado, esperado);
}

export async function GET(req: Request) {
  if (!autorizado(req)) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  return NextResponse.json({ ordenes: Object.keys(ORDENES) });
}

export async function POST(req: Request) {
  if (!autorizado(req)) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const cuerpo = (await req.json().catch(() => null)) as { orden?: string } | null;
  const ruta = cuerpo?.orden ? ORDENES[cuerpo.orden] : undefined;
  if (!ruta) return NextResponse.json({ error: "Orden desconocida", ordenes: Object.keys(ORDENES) }, { status: 400 });
  const secreto = (process.env.CRON_SECRET ?? "").trim();
  if (!secreto) return NextResponse.json({ error: "CRON_SECRET no configurado" }, { status: 503 });
  const inicio = Date.now();
  try {
    const r = await fetch(new URL(ruta, req.url), { headers: { Authorization: `Bearer ${secreto}` }, cache: "no-store" });
    const resultado = await r.json().catch(() => ({}));
    return NextResponse.json({ ok: r.ok, estado: r.status, ms: Date.now() - inicio, resultado }, { status: r.ok ? 200 : 502 });
  } catch (e) {
    return NextResponse.json({ ok: false, error: e instanceof Error ? e.message : String(e), ms: Date.now() - inicio }, { status: 502 });
  }
}
