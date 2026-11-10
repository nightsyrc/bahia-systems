import { NextResponse } from "next/server";
import { ensureSchema } from "@/lib/db";
import { explorador } from "@/lib/equipo";
import { enviarCola, log, prospector, redactorVuelta } from "@/lib/agentes";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

/** Vuelta diaria de los agentes: propone prospectos, redacta borradores y envía lo aprobado. Protegido con CRON_SECRET. */
export async function GET(req: Request) {
  const secreto = (process.env.CRON_SECRET ?? "").trim();
  if (secreto.length < 16) return NextResponse.json({ error: "CRON_SECRET no configurado" }, { status: 503 });
  if (req.headers.get("authorization") !== `Bearer ${secreto}`) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  await ensureSchema();
  const r = { propuestos: 0, borradores: 0, enviados: 0 };
  try { r.propuestos = process.env.ANTHROPIC_API_KEY ? await prospector() : 0; } catch (e) { await log("prospector", "error", String(e), false); }
  try { r.borradores = process.env.ANTHROPIC_API_KEY ? await redactorVuelta() : 0; } catch (e) { await log("redactor", "error", String(e), false); }
  try { if (process.env.ANTHROPIC_API_KEY && new Date().getUTCDay() === 1) await explorador(); } catch (e) { await log("explorador", "error", String(e), false); }
  try { r.enviados = await enviarCola(); } catch (e) { await log("envio", "error", String(e), false); }
  return NextResponse.json({ ok: true, ...r });
}
