import { NextResponse } from "next/server";
import { ensureSchema, sql } from "@/lib/db";
import { enviar, plantilla } from "@/lib/correo";
import { MARCA, PLANES } from "@/config/marca";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * Secuencia automática para quien pidió información y aún no respondió:
 * paso 1 a los 2 días, paso 2 a los 6. Se detiene si la persona se da de baja o el estado deja de ser "nuevo".
 * Máximo 25 correos por vuelta para cuidar la reputación del remitente.
 */
export async function GET(req: Request) {
  const secreto = (process.env.CRON_SECRET ?? "").trim();
  if (secreto.length < 16) return NextResponse.json({ error: "CRON_SECRET no configurado" }, { status: 503 });
  if (req.headers.get("authorization") !== `Bearer ${secreto}`) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  await ensureSchema();
  const r = await sql`SELECT id, nombre, email, interes, token, seg_paso FROM leads
    WHERE baja = FALSE AND estado = 'nuevo' AND seg_paso < 2
      AND ((seg_paso = 0 AND creado_at < NOW() - INTERVAL '2 days') OR (seg_paso = 1 AND seg_ultimo < NOW() - INTERVAL '4 days'))
    ORDER BY creado_at LIMIT 25`;
  let enviados = 0;
  for (const l of r.rows as { id: number; nombre: string; email: string; interes: string; token: string; seg_paso: number }[]) {
    const baja = `${MARCA.url}/baja?t=${l.token}`;
    const nom = l.nombre.split(" ")[0];
    const medida = l.interes === "medida";
    const [asunto, parrafos, boton] = l.seg_paso === 0
      ? medida
        ? [`${nom}, ¿pudiste revisar tu proyecto?`, ["Hace unos días nos contaste de tu proyecto. Si ya tienes más claro el alcance, con gusto afinamos la cotización.", "Una llamada de 15 minutos suele bastar para cerrar dudas."], { texto: "Agendar una llamada", url: `${MARCA.url}/a-la-medida` }]
        : [`${nom}, así se ve un turno con Atalaya`, ["Atalaya reemplaza el cuaderno de la caseta: registra accesos y paquetes, y al terminar el turno entrega un reporte claro al administrador.", `Los planes parten desde $${PLANES[0].precio.toLocaleString("es-MX")} MXN al mes + IVA.`], { texto: "Pedir una demo", url: `${MARCA.url}/#contacto` }]
      : [`${nom}, ¿lo vemos esta semana?`, ["Último mensaje de nuestra parte: si te sirve una demo corta o una cotización, responde a este correo y lo agendamos.", "Si no es el momento, no pasa nada."], { texto: "Responder", url: `mailto:${MARCA.correo}` }];
    try {
      await enviar(l.email, asunto as string, plantilla(asunto as string, parrafos as string[], boton as { texto: string; url: string }, baja), `${(parrafos as string[]).join(" ")} Baja: ${baja}`, { baja });
      await sql`UPDATE leads SET seg_paso = seg_paso + 1, seg_ultimo = NOW() WHERE id = ${l.id}`;
      enviados++;
    } catch { /* se reintenta en la siguiente vuelta */ }
  }
  return NextResponse.json({ ok: true, enviados });
}
