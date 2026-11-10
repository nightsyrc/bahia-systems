import { randomBytes } from "node:crypto";
import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { esAdmin } from "@/lib/auth";
import { analista, arquitecto, explorador, vendedor } from "@/lib/equipo";
import { ESTADOS as ESTADOS_IDEA } from "@/config/equipo";
import { enviarCola, enviarUno, log, prospector, redactorVuelta, respondedor } from "@/lib/agentes";

export const dynamic = "force-dynamic";
export const maxDuration = 120;
const s = (x: unknown, n: number) => (typeof x === "string" ? x.trim().slice(0, n) : "");
const ESTADOS = ["propuesto", "aprobado", "descartado", "contactado", "respondio", "demo", "propuesta", "cliente", "no_ahora", "sin_respuesta"];

/** Acciones del panel privado: aprobar prospectos y mensajes, cambiar etapas, registrar respuestas y correr agentes a mano. */
export async function POST(req: Request) {
  if (!(await esAdmin())) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const b = (await req.json().catch(() => null)) as Record<string, unknown> | null;
  if (!b) return NextResponse.json({ error: "Solicitud inválida." }, { status: 400 });
  const id = Number(b.id);
  try {
    switch (b.accion) {
      case "prospecto_estado": {
        const estado = s(b.estado, 20);
        if (!ESTADOS.includes(estado) || !Number.isInteger(id)) return NextResponse.json({ error: "Dato inválido." }, { status: 400 });
        const mensual = Number.isFinite(Number(b.valorMensual)) && Number(b.valorMensual) > 0 ? Math.round(Number(b.valorMensual)) : null;
        const unico = Number.isFinite(Number(b.valorUnico)) && Number(b.valorUnico) > 0 ? Math.round(Number(b.valorUnico)) : null;
        await sql`UPDATE prospectos SET estado = ${estado}, estado_at = NOW(), valor_mensual = COALESCE(${mensual}, valor_mensual), valor_unico = COALESCE(${unico}, valor_unico) WHERE id = ${id}`;
        await log("tu", "etapa", `prospecto ${id} → ${estado}`);
        return NextResponse.json({ ok: true });
      }
      case "prospecto_correo": {
        const c = s(b.correo, 160).toLowerCase();
        if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(c)) return NextResponse.json({ error: "Correo no válido." }, { status: 400 });
        await sql`UPDATE prospectos SET correo = ${c} WHERE id = ${id}`;
        return NextResponse.json({ ok: true });
      }
      case "mensaje_aprobar": {
        const asunto = s(b.asunto, 140), cuerpo = s(b.cuerpo, 1500);
        if (!asunto || !cuerpo) return NextResponse.json({ error: "Asunto y cuerpo son obligatorios." }, { status: 400 });
        await sql`UPDATE mensajes SET asunto = ${asunto}, cuerpo = ${cuerpo}, estado = 'aprobado', aprobado_at = NOW() WHERE id = ${id} AND estado = 'borrador'`;
        return NextResponse.json({ ok: true });
      }
      case "mensaje_guardar": {
        const asunto = s(b.asunto, 140), cuerpo = s(b.cuerpo, 1500);
        if (!asunto || !cuerpo) return NextResponse.json({ error: "Asunto y cuerpo son obligatorios." }, { status: 400 });
        await sql`UPDATE mensajes SET asunto = ${asunto}, cuerpo = ${cuerpo} WHERE id = ${id} AND estado IN ('borrador','aprobado')`;
        return NextResponse.json({ ok: true });
      }
      case "mensaje_enviar": {
        const asunto = s(b.asunto, 140), cuerpo = s(b.cuerpo, 1500);
        if (!asunto || !cuerpo) return NextResponse.json({ error: "Asunto y cuerpo son obligatorios." }, { status: 400 });
        await sql`UPDATE mensajes SET asunto = ${asunto}, cuerpo = ${cuerpo}, estado = 'aprobado', aprobado_at = NOW() WHERE id = ${id} AND estado IN ('borrador','aprobado')`;
        const r = await enviarUno(id);
        return r.ok ? NextResponse.json({ ok: true }) : NextResponse.json({ error: r.error }, { status: 422 });
      }
      case "prospecto_nuevo": {
        const empresa = s(b.empresa, 160), correo = s(b.correo, 160).toLowerCase(), asunto = s(b.asunto, 140), cuerpo = s(b.cuerpo, 1500);
        if (!empresa || !asunto || !cuerpo) return NextResponse.json({ error: "Empresa, asunto y cuerpo son obligatorios." }, { status: 400 });
        if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(correo)) return NextResponse.json({ error: "Correo no válido." }, { status: 400 });
        const token = randomBytes(16).toString("hex");
        const p = await sql`INSERT INTO prospectos (empresa, sitio, ciudad, categoria, correo, fuente_url, razon, notas, estado, token)
          VALUES (${empresa}, ${s(b.sitio, 200) || null}, ${s(b.ciudad, 80) || null}, ${s(b.categoria, 80) || null}, ${correo}, ${s(b.fuente, 300) || null}, ${s(b.razon, 300) || null}, ${s(b.notas, 600) || null}, 'aprobado', ${token})
          ON CONFLICT (lower(empresa)) DO UPDATE SET correo = EXCLUDED.correo, fuente_url = COALESCE(EXCLUDED.fuente_url, prospectos.fuente_url), notas = COALESCE(EXCLUDED.notas, prospectos.notas), sitio = COALESCE(EXCLUDED.sitio, prospectos.sitio) RETURNING id`;
        await sql`INSERT INTO mensajes (prospecto_id, tipo, asunto, cuerpo, generado_por) VALUES (${p.rows[0].id as number}, 'frio1', ${asunto}, ${cuerpo}, 'tu')`;
        await log("tu", "prospecto_nuevo", empresa);
        return NextResponse.json({ ok: true });
      }
      case "idea_estado": {
        const estado = s(b.estado, 20);
        if (!(ESTADOS_IDEA as readonly string[]).includes(estado) || !Number.isInteger(id)) return NextResponse.json({ error: "Dato inválido." }, { status: 400 });
        await sql`UPDATE ideas SET estado = ${estado}, actualizado_at = NOW() WHERE id = ${id}`;
        await log("tu", "idea_estado", `idea ${id} → ${estado}`);
        return NextResponse.json({ ok: true });
      }
      case "equipo": {
        const que = s(b.que, 20);
        if (que === "explorador") return NextResponse.json({ ok: true, n: await explorador() });
        if (!Number.isInteger(id)) return NextResponse.json({ error: "Falta la idea." }, { status: 400 });
        const ok = que === "analista" ? await analista(id) : que === "arquitecto" ? await arquitecto(id) : que === "vendedor" ? await vendedor(id) : null;
        if (ok === null) return NextResponse.json({ error: "Agente desconocido." }, { status: 400 });
        return ok ? NextResponse.json({ ok: true }) : NextResponse.json({ error: "El agente no pudo completar el trabajo. Revisa ANTHROPIC_API_KEY." }, { status: 502 });
      }
      case "mensaje_rechazar":
        await sql`UPDATE mensajes SET estado = 'rechazado' WHERE id = ${id} AND estado IN ('borrador', 'aprobado')`;
        return NextResponse.json({ ok: true });
      case "respuesta": {
        const texto = s(b.texto, 3000);
        if (texto.length < 3) return NextResponse.json({ error: "Pega la respuesta del prospecto." }, { status: 400 });
        return NextResponse.json({ ok: true, ...(await respondedor(id, texto)) });
      }
      case "correr": {
        const que = s(b.que, 20);
        const n = que === "prospector" ? await prospector() : que === "redactor" ? await redactorVuelta() : que === "envio" ? await enviarCola(true) : -1;
        if (n < 0) return NextResponse.json({ error: "Agente desconocido." }, { status: 400 });
        return NextResponse.json({ ok: true, n });
      }
      default:
        return NextResponse.json({ error: "Acción desconocida." }, { status: 400 });
    }
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Error." }, { status: 500 });
  }
}
