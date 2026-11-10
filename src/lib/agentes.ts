import { randomBytes } from "node:crypto";
import { sql } from "@/lib/db";
import { enviar, plantillaFrio } from "@/lib/correo";
import { extraerJson, llamar } from "@/lib/ia";
import { HECHOS_ATALAYA, OUTREACH } from "@/config/outreach";
import { MARCA } from "@/config/marca";

export async function log(agente: string, accion: string, detalle: string, ok = true) {
  await sql`INSERT INTO agentes_log (agente, accion, detalle, ok) VALUES (${agente}, ${accion}, ${detalle.slice(0, 500)}, ${ok})`.catch(() => null);
}

const EMAIL = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
const GENERICO = /^(info|contacto|contact|ventas|sales|admin|administracion|administración|hola|hello|reservas|reservaciones|gerencia|atencion|atención|comercial)@/i;

// ---------------------------------------------------------------- Prospector
type Hallazgo = { empresa?: string; sitio?: string; ciudad?: string; categoria?: string; correo_contacto?: string | null; fuente_url?: string; razon?: string };

/** Busca en la web pública empresas que encajan y las deja como "propuesto" para tu aprobación. No contacta a nadie. */
export async function prospector(): Promise<number> {
  const zona = OUTREACH.zonas[Math.floor(Date.now() / 86_400_000) % OUTREACH.zonas.length];
  const cat = OUTREACH.categorias[Math.floor(Date.now() / 86_400_000 / 2) % OUTREACH.categorias.length];
  const sistema = `Eres un investigador de ventas B2B en México. Usa la búsqueda web para encontrar empresas reales de la categoría y zona indicadas.
Reglas estrictas: solo empresas, nunca personas privadas. Incluye correo_contacto SOLO si aparece publicado en el sitio de la empresa como contacto comercial general; si no lo ves, pon null. No inventes ningún dato ni correo. Incluye la URL donde lo viste en fuente_url.
Responde SOLO con una lista JSON de hasta ${OUTREACH.propuestasPorVuelta} objetos con: empresa, sitio, ciudad, categoria, correo_contacto, fuente_url, razon (una frase: por qué podría necesitar un sistema de caseta digital para condominios).`;
  let texto: string;
  try { texto = await llamar(sistema, `Categoría: ${cat}. Zona: ${zona}, México.`, { buscar: true, maxTokens: 3000 }); }
  catch (e) { await log("prospector", "error", e instanceof Error ? e.message : String(e), false); return 0; }
  const lista = extraerJson<Hallazgo[]>(texto);
  if (!Array.isArray(lista)) { await log("prospector", "sin_resultado", `Sin JSON válido para ${cat} en ${zona}`, false); return 0; }
  let nuevos = 0;
  for (const h of lista.slice(0, OUTREACH.propuestasPorVuelta)) {
    const empresa = (h.empresa ?? "").trim().slice(0, 160);
    if (!empresa) continue;
    const correo = (h.correo_contacto ?? "").trim().toLowerCase();
    const correoOk = EMAIL.test(correo) && GENERICO.test(correo) ? correo : null; // solo buzones de empresa, no personales
    const r = await sql`INSERT INTO prospectos (empresa, sitio, ciudad, categoria, correo, fuente_url, razon, token)
      VALUES (${empresa}, ${(h.sitio ?? "").slice(0, 200) || null}, ${(h.ciudad ?? zona).slice(0, 80)}, ${(h.categoria ?? cat).slice(0, 80)}, ${correoOk}, ${(h.fuente_url ?? "").slice(0, 300) || null}, ${(h.razon ?? "").slice(0, 300) || null}, ${randomBytes(16).toString("hex")})
      ON CONFLICT (lower(empresa)) DO NOTHING RETURNING id`.catch(() => ({ rows: [] }));
    if (r.rows.length) nuevos++;
  }
  await log("prospector", "propuestas", `${nuevos} nuevas de ${lista.length} (${cat}, ${zona})`);
  return nuevos;
}

// ------------------------------------------------------------------ Redactor
const TONO = `Escribe en español de México, tono cercano y profesional, de persona a persona. Máximo 110 palabras. Sin signos de exclamación, sin adjetivos exagerados, sin cifras ni estadísticas, sin nombrar clientes. Solo puedes afirmar cosas de la lista de hechos. Termina ofreciendo una demo de 20 minutos y el enlace ${MARCA.url}/#contacto. No firmes con nombre propio: firma "Equipo de ${MARCA.nombre}". Responde SOLO con JSON: {"asunto": "...", "cuerpo": "..."}.`;

async function redactar(tipo: "frio1" | "frio2" | "frio3", p: { empresa: string; ciudad: string | null; categoria: string | null; razon: string | null; sitio: string | null }, previo?: string): Promise<{ asunto: string; cuerpo: string } | null> {
  const guia = tipo === "frio1" ? "Primer contacto: presenta Atalaya en una frase y conecta con su caso." : tipo === "frio2" ? "Segundo mensaje, breve: recuerda sin presionar y aporta una idea concreta de cómo ayudaría." : "Último mensaje: cortés, ofrece dejar el enlace y no insistir más.";
  const t = await llamar(`${TONO}\nHechos permitidos:\n- ${HECHOS_ATALAYA.join("\n- ")}\n${guia}`, `Empresa: ${p.empresa}. Ciudad: ${p.ciudad ?? "-"}. Tipo: ${p.categoria ?? "-"}. Sitio: ${p.sitio ?? "-"}. Por qué encaja: ${p.razon ?? "-"}.${previo ? `\nMensaje anterior: ${previo}` : ""}`, { maxTokens: 700 });
  const j = extraerJson<{ asunto?: string; cuerpo?: string }>(t);
  if (!j?.asunto || !j?.cuerpo) return null;
  return { asunto: j.asunto.slice(0, 140), cuerpo: j.cuerpo.slice(0, 1500) };
}

/** Genera borradores: 1.º para prospectos aprobados con correo; 2.º y 3.º si no hubo respuesta. Todo queda en borrador para tu aprobación. */
export async function redactorVuelta(): Promise<number> {
  let n = 0;
  const nuevos = await sql`SELECT p.* FROM prospectos p WHERE p.estado = 'aprobado' AND p.baja = FALSE AND p.correo IS NOT NULL
      AND NOT EXISTS (SELECT 1 FROM mensajes m WHERE m.prospecto_id = p.id) ORDER BY p.id LIMIT 6`;
  for (const p of nuevos.rows as Record<string, string | null>[]) {
    const m = await redactar("frio1", p as never).catch((e) => { void log("redactor", "error", String(e), false); return null; });
    if (m) { await sql`INSERT INTO mensajes (prospecto_id, tipo, asunto, cuerpo) VALUES (${p.id}, 'frio1', ${m.asunto}, ${m.cuerpo})`; n++; }
  }
  const seg = await sql`SELECT p.*, (SELECT tipo FROM mensajes WHERE prospecto_id = p.id AND estado = 'enviado' AND tipo LIKE 'frio%' ORDER BY enviado_at DESC LIMIT 1) AS ult_tipo,
        (SELECT enviado_at FROM mensajes WHERE prospecto_id = p.id AND estado = 'enviado' AND tipo LIKE 'frio%' ORDER BY enviado_at DESC LIMIT 1) AS ult_envio,
        (SELECT cuerpo FROM mensajes WHERE prospecto_id = p.id AND estado = 'enviado' AND tipo LIKE 'frio%' ORDER BY enviado_at DESC LIMIT 1) AS ult_cuerpo
      FROM prospectos p WHERE p.estado = 'contactado' AND p.baja = FALSE
        AND NOT EXISTS (SELECT 1 FROM mensajes m WHERE m.prospecto_id = p.id AND m.estado IN ('borrador', 'aprobado')) LIMIT 6`;
  for (const p of seg.rows as Record<string, unknown>[]) {
    const dias = (Date.now() - new Date(String(p.ult_envio)).getTime()) / 86_400_000;
    const sig = p.ult_tipo === "frio1" && dias >= OUTREACH.diasSeg2 ? "frio2" : p.ult_tipo === "frio2" && dias >= OUTREACH.diasSeg3 ? "frio3" : null;
    if (!sig) { if (p.ult_tipo === "frio3" && dias >= 7) await sql`UPDATE prospectos SET estado = 'sin_respuesta', estado_at = NOW() WHERE id = ${p.id as number}`; continue; }
    const m = await redactar(sig, p as never, String(p.ult_cuerpo ?? "")).catch(() => null);
    if (m) { await sql`INSERT INTO mensajes (prospecto_id, tipo, asunto, cuerpo) VALUES (${p.id as number}, ${sig}, ${m.asunto}, ${m.cuerpo})`; n++; }
  }
  if (n) await log("redactor", "borradores", `${n} borradores para tu aprobación`);
  return n;
}

// ------------------------------------------------------------- Respondedor
export type Clasificacion = "interesado" | "pregunta" | "no_ahora" | "baja" | "otro";
/** Clasifica una respuesta que pegas a mano y propone el borrador de contestación. */
export async function respondedor(prospectoId: number, texto: string): Promise<{ clasificacion: Clasificacion; borrador: string | null }> {
  const t = await llamar(`Clasifica la respuesta de un prospecto a un correo comercial de ${MARCA.nombre} (sistema Atalaya de caseta digital). Devuelve SOLO JSON: {"clasificacion":"interesado|pregunta|no_ahora|baja|otro","borrador":"respuesta breve en español de México o null"}.
Si pide no recibir más correos, clasificacion = "baja" y borrador = null. Si hace una pregunta, respóndela solo con estos hechos y sin inventar nada:\n- ${HECHOS_ATALAYA.join("\n- ")}\nSi muestra interés, propón una demo de 20 minutos y el enlace ${MARCA.url}/#contacto. Firma "Equipo de ${MARCA.nombre}".`, texto.slice(0, 3000), { maxTokens: 700 });
  const j = extraerJson<{ clasificacion?: string; borrador?: string | null }>(t);
  const c = (["interesado", "pregunta", "no_ahora", "baja", "otro"].includes(j?.clasificacion ?? "") ? j!.clasificacion : "otro") as Clasificacion;
  if (c === "baja") await sql`UPDATE prospectos SET baja = TRUE, estado = 'baja', estado_at = NOW() WHERE id = ${prospectoId}`;
  else await sql`UPDATE prospectos SET estado = ${c === "interesado" || c === "pregunta" ? "respondio" : c === "no_ahora" ? "no_ahora" : "respondio"}, estado_at = NOW() WHERE id = ${prospectoId}`;
  if (c !== "baja" && j?.borrador) await sql`INSERT INTO mensajes (prospecto_id, tipo, asunto, cuerpo, generado_por) VALUES (${prospectoId}, 'respuesta', 'Re: Atalaya', ${j.borrador.slice(0, 1500)}, 'respondedor')`;
  await log("respondedor", c, `prospecto ${prospectoId}`);
  return { clasificacion: c, borrador: j?.borrador ?? null };
}

// -------------------------------------------------------------------- Envío
function enHorario(): boolean {
  const d = new Date(new Date().toLocaleString("en-US", { timeZone: "America/Mexico_City" }));
  return d.getDay() >= 1 && d.getDay() <= 5 && d.getHours() >= OUTREACH.horaIni && d.getHours() < OUTREACH.horaFin;
}

/** Envía los mensajes aprobados, respetando horario, tope diario y bajas. Con AUTO_ENVIO=si, envía también los borradores del Redactor. */
export async function enviarCola(forzar = false): Promise<number> {
  if (!forzar && !enHorario()) return 0;
  if (process.env.AUTO_ENVIO === "si") await sql`UPDATE mensajes SET estado = 'aprobado', aprobado_at = NOW() WHERE estado = 'borrador' AND tipo <> 'respuesta'`;
  const hoy = await sql`SELECT COUNT(*)::int AS n FROM mensajes WHERE estado = 'enviado' AND tipo <> 'respuesta' AND enviado_at > NOW() - INTERVAL '24 hours'`;
  let cupo = OUTREACH.enviosPorDia - (hoy.rows[0].n as number);
  const cola = await sql`SELECT m.id, m.tipo, m.asunto, m.cuerpo, p.id AS pid, p.correo, p.token FROM mensajes m JOIN prospectos p ON p.id = m.prospecto_id
      WHERE m.estado = 'aprobado' AND p.baja = FALSE AND p.correo IS NOT NULL ORDER BY m.aprobado_at LIMIT 30`;
  let enviados = 0;
  for (const m of cola.rows as { id: number; tipo: string; asunto: string; cuerpo: string; pid: number; correo: string; token: string }[]) {
    if (m.tipo !== "respuesta" && cupo <= 0) break;
    const baja = `${MARCA.url}/baja?t=${m.token}`;
    try {
      await enviar(m.correo, m.asunto, plantillaFrio(m.cuerpo, baja), `${m.cuerpo}\n\nBaja: ${baja}`, { baja, replyTo: process.env.CONTACT_TO });
      await sql`UPDATE mensajes SET estado = 'enviado', enviado_at = NOW(), error = NULL WHERE id = ${m.id}`;
      if (m.tipo.startsWith("frio")) await sql`UPDATE prospectos SET estado = CASE WHEN estado = 'aprobado' THEN 'contactado' ELSE estado END, ultimo_contacto = NOW(), estado_at = CASE WHEN estado = 'aprobado' THEN NOW() ELSE estado_at END WHERE id = ${m.pid}`;
      if (m.tipo !== "respuesta") cupo--;
      enviados++;
    } catch (e) {
      await sql`UPDATE mensajes SET error = ${String(e instanceof Error ? e.message : e).slice(0, 200)} WHERE id = ${m.id}`;
      await log("envio", "error", `mensaje ${m.id}: ${e instanceof Error ? e.message : e}`, false);
    }
  }
  if (enviados) await log("envio", "enviados", `${enviados} correos enviados`);
  return enviados;
}

/** Envía UN mensaje ya revisado por ti, ahora mismo. Valida baja, correo y tope diario; no depende del horario. */
export async function enviarUno(id: number): Promise<{ ok: boolean; error?: string }> {
  const r = await sql`SELECT m.id, m.tipo, m.asunto, m.cuerpo, m.estado, p.id AS pid, p.correo, p.token, p.baja FROM mensajes m JOIN prospectos p ON p.id = m.prospecto_id WHERE m.id = ${id}`;
  const m = r.rows[0] as { id: number; tipo: string; asunto: string; cuerpo: string; estado: string; pid: number; correo: string | null; token: string; baja: boolean } | undefined;
  if (!m) return { ok: false, error: "Mensaje no encontrado." };
  if (m.estado === "enviado") return { ok: false, error: "Ya se envió." };
  if (m.baja) return { ok: false, error: "Este destinatario se dio de baja." };
  if (!m.correo || !EMAIL.test(m.correo)) return { ok: false, error: "El destinatario no tiene un correo válido." };
  if (m.tipo !== "respuesta") {
    const hoy = await sql`SELECT COUNT(*)::int AS n FROM mensajes WHERE estado = 'enviado' AND tipo <> 'respuesta' AND enviado_at > NOW() - INTERVAL '24 hours'`;
    if ((hoy.rows[0].n as number) >= OUTREACH.enviosPorDia) return { ok: false, error: `Ya enviaste ${OUTREACH.enviosPorDia} en 24 h (tope para cuidar la reputación del dominio).` };
  }
  const baja = `${MARCA.url}/baja?t=${m.token}`;
  try {
    await enviar(m.correo, m.asunto, plantillaFrio(m.cuerpo, baja), `${m.cuerpo}\n\nBaja: ${baja}`, { baja, replyTo: process.env.CONTACT_TO });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    await sql`UPDATE mensajes SET error = ${msg.slice(0, 200)} WHERE id = ${id}`;
    await log("envio", "error", `mensaje ${id}: ${msg}`, false);
    return { ok: false, error: msg };
  }
  await sql`UPDATE mensajes SET estado = 'enviado', aprobado_at = COALESCE(aprobado_at, NOW()), enviado_at = NOW(), error = NULL WHERE id = ${id}`;
  if (m.tipo.startsWith("frio")) await sql`UPDATE prospectos SET estado = CASE WHEN estado IN ('propuesto','aprobado') THEN 'contactado' ELSE estado END, ultimo_contacto = NOW(), estado_at = NOW() WHERE id = ${m.pid}`;
  await log("tu", "envio_manual", `mensaje ${id} → ${m.correo}`);
  return { ok: true };
}
