import { NextResponse } from "next/server";
import { createHash, randomBytes } from "node:crypto";
import { ensureSchema, sql } from "@/lib/db";
import { enviar, plantilla, esc } from "@/lib/correo";
import { estimar } from "@/lib/estimado";
import { MARCA, MEDIDA, PLANES } from "@/config/marca";

export const dynamic = "force-dynamic";
const s = (x: unknown, n: number) => (typeof x === "string" ? x.trim().slice(0, n) : "");
const INTERESES = ["demo", "atalaya", "medida", "otro"];

/** Recibe un prospecto, lo guarda, avisa al dueño y le responde de inmediato al prospecto. */
export async function POST(req: Request) {
  const b = (await req.json().catch(() => null)) as Record<string, unknown> | null;
  if (!b) return NextResponse.json({ error: "Solicitud inválida." }, { status: 400 });
  if (s(b.sitio, 50)) return NextResponse.json({ ok: true }); // campo trampa para robots

  const nombre = s(b.nombre, 120), email = s(b.email, 160).toLowerCase();
  if (nombre.length < 2) return NextResponse.json({ error: "Escribe tu nombre." }, { status: 400 });
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return NextResponse.json({ error: "Revisa tu correo: no parece válido." }, { status: 400 });
  if (b.acepta !== true) return NextResponse.json({ error: "Acepta el aviso de privacidad para continuar." }, { status: 400 });

  const interes = INTERESES.includes(s(b.interes, 20)) ? s(b.interes, 20) : "demo";
  const origen = s(b.origen, 30).toLowerCase().replace(/[^a-z0-9_-]/g, "") || "directo";
  const empresa = s(b.empresa, 160), telefono = s(b.telefono, 40), mensaje = s(b.mensaje, 2000);
  const sel = interes === "medida" && b.seleccion && typeof b.seleccion === "object" ? (b.seleccion as Record<string, unknown>) : null;
  const seleccion = sel ? { tipo: s(sel.tipo, 20), extras: Array.isArray(sel.extras) ? (sel.extras as unknown[]).filter((x): x is string => typeof x === "string").slice(0, 10) : [], urgencia: s(sel.urgencia, 20) } : null;
  const est = seleccion ? estimar(seleccion) : null;

  const ip = (req.headers.get("x-forwarded-for") ?? "").split(",")[0].trim();
  const ipHash = createHash("sha256").update(ip + (process.env.CRON_SECRET ?? "")).digest("hex").slice(0, 24);
  const token = randomBytes(16).toString("hex");

  try {
    await ensureSchema();
    const reciente = await sql`SELECT COUNT(*)::int AS n FROM leads WHERE ip_hash = ${ipHash} AND creado_at > NOW() - INTERVAL '1 hour'`;
    if ((reciente.rows[0].n as number) >= 5) return NextResponse.json({ error: "Demasiados envíos seguidos. Intenta en una hora." }, { status: 429 });
    await sql`INSERT INTO leads (nombre, empresa, email, telefono, interes, mensaje, detalle, estimado, token, ip_hash, origen)
              VALUES (${nombre}, ${empresa || null}, ${email}, ${telefono || null}, ${interes}, ${mensaje || null}, ${seleccion ? JSON.stringify(seleccion) : null}::jsonb, ${est?.texto ?? null}, ${token}, ${ipHash}, ${origen})`;
  } catch {
    return NextResponse.json({ error: "No pudimos guardar tu solicitud. Escríbenos a " + MARCA.correo + "." }, { status: 500 });
  }

  const baja = `${MARCA.url}/baja?t=${token}`;
  const quePidio = interes === "medida" ? "una solución a la medida" : interes === "atalaya" ? "información de Atalaya" : "una demo de Atalaya";
  const detalleMedida = seleccion
    ? `Tipo: ${MEDIDA.tipos.find((x) => x.id === seleccion.tipo)?.nombre ?? "-"}. Extras: ${seleccion.extras.map((id) => MEDIDA.extras.find((x) => x.id === id)?.nombre).filter(Boolean).join(", ") || "ninguno"}. Urgencia: ${MEDIDA.urgencia.find((x) => x.id === seleccion.urgencia)?.nombre ?? "-"}.${est ? ` Rango orientativo: ${est.texto}.` : ""}`
    : "";

  // Aviso al dueño y respuesta automática; si el correo falla, el prospecto ya quedó guardado.
  try {
    await enviar(MARCA.correo, `Nuevo prospecto: ${nombre}${empresa ? " · " + empresa : ""} (${interes})`,
      plantilla("Nuevo prospecto", [`<b>${esc(nombre)}</b>${empresa ? " · " + esc(empresa) : ""}`, `${esc(email)}${telefono ? " · " + esc(telefono) : ""}`, `Pidió ${quePidio}.`, esc(detalleMedida), mensaje ? "“" + esc(mensaje) + "”" : ""].filter(Boolean)),
      `${nombre} (${email}) pidió ${quePidio}. ${detalleMedida} ${mensaje}`, { replyTo: email });
    const paso = interes === "medida"
      ? ["Recibimos tu solicitud. Revisamos tu proyecto y te respondemos con una cotización por escrito en un día hábil.", est ? `Con lo que nos contaste, el rango orientativo es <b>${est.texto}</b>. Es una referencia; la cifra final depende de lo que veamos juntos.` : ""]
      : ["Recibimos tu solicitud. Te escribimos en un día hábil para agendar una demo corta de Atalaya con datos de ejemplo.", `Mientras tanto, los planes parten desde <b>$${PLANES[0].precio.toLocaleString("es-MX")} MXN al mes</b> + IVA.`];
    await enviar(email, `Recibimos tu solicitud, ${nombre.split(" ")[0]}`,
      plantilla(`Gracias, ${nombre.split(" ")[0]}`, [...paso, "Si prefieres, responde a este correo con tus dudas."].filter(Boolean), undefined, baja),
      `Gracias, ${nombre}. Recibimos tu solicitud y te respondemos en un día hábil. Baja: ${baja}`, { baja });
  } catch { /* el prospecto ya está guardado; el cron de seguimiento no depende de esto */ }

  return NextResponse.json({ ok: true, estimado: est?.texto ?? null });
}
