import Link from "next/link";
import { redirect } from "next/navigation";
import AdminNav from "@/components/AdminNav";
import TarjetaBandeja, { type Ficha } from "@/components/TarjetaBandeja";
import { ensureSchema, sql } from "@/lib/db";
import { esAdmin } from "@/lib/auth";
import { OUTREACH } from "@/config/outreach";

export const dynamic = "force-dynamic";
const fecha = (d: unknown) => new Intl.DateTimeFormat("es-MX", { timeZone: "America/Mexico_City", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }).format(new Date(String(d)));
const s = (x: unknown) => (x == null || x === "" ? null : String(x));

export default async function Bandeja() {
  if (!(await esAdmin())) redirect("/admin/login");
  await ensureSchema();
  const [pend, hist, hoy, enviados] = await Promise.all([
    sql`SELECT m.id, m.tipo, m.estado, m.asunto, m.cuerpo, m.error, m.generado_por, p.id AS pid, p.empresa, p.correo, p.sitio, p.ciudad, p.categoria, p.fuente_url, p.razon, p.notas, p.estado AS pestado, p.baja, p.creado_at
        FROM mensajes m JOIN prospectos p ON p.id = m.prospecto_id WHERE m.estado IN ('borrador','aprobado') ORDER BY m.creado_at`,
    sql`SELECT prospecto_id, tipo, estado, asunto, COALESCE(enviado_at, creado_at) AS cuando FROM mensajes WHERE estado IN ('enviado','rechazado') ORDER BY cuando DESC`,
    sql`SELECT COUNT(*)::int AS n FROM mensajes WHERE estado = 'enviado' AND tipo <> 'respuesta' AND enviado_at > NOW() - INTERVAL '24 hours'`,
    sql`SELECT m.asunto, m.enviado_at, p.empresa, p.correo FROM mensajes m JOIN prospectos p ON p.id = m.prospecto_id WHERE m.estado = 'enviado' ORDER BY m.enviado_at DESC LIMIT 15`,
  ]);
  const fichas: Ficha[] = pend.rows.map((m) => {
    const correo = s(m.correo), fuente = s(m.fuente_url), baja = Boolean(m.baja);
    const avisos: string[] = [];
    if (baja) avisos.push("Este destinatario se dio de baja: no se puede enviar.");
    if (!correo) avisos.push("No tiene correo: agrégalo en Prospectos.");
    else if (!/^(info|contacto|contact|ventas|sales|admin|administracion|administración|hola|hello|reservas|reservaciones|gerencia|atencion|atención|comercial)@/i.test(correo)) avisos.push("El correo no es genérico de empresa (parece personal): verifica que sea contacto comercial.");
    if (!fuente) avisos.push("No hay fuente registrada de dónde salió el correo.");
    if (m.error) avisos.push("El último envío falló.");
    return {
      id: m.id as number, tipo: m.tipo as string, estado: m.estado as string, asunto: m.asunto as string, cuerpo: m.cuerpo as string, error: s(m.error),
      empresa: m.empresa as string, correo, sitio: s(m.sitio), ciudad: s(m.ciudad), categoria: s(m.categoria), fuente, razon: s(m.razon), notas: s(m.notas),
      estadoProsp: m.pestado as string, baja, creado: fecha(m.creado_at), generadoPor: m.generado_por as string,
      historial: hist.rows.filter((h) => h.prospecto_id === m.pid).map((h) => ({ tipo: h.tipo as string, estado: h.estado as string, asunto: h.asunto as string, cuando: fecha(h.cuando) })),
      avisos,
    };
  });
  const usados = hoy.rows[0].n as number;
  return (
    <main className="adm">
      <h1>Bandeja de aprobación</h1>
      <p className="sub">Nada sale de aquí sin tu confirmación. Hoy: {usados} de {OUTREACH.enviosPorDia} envíos permitidos en 24 h.</p>
      <AdminNav actual="bandeja" />
      <p><Link className="btn primario chico2" href="/admin/bandeja/nuevo">+ Nuevo destinatario y correo</Link></p>
      <h2>Por revisar ({fichas.length})</h2>
      {fichas.length === 0 ? <p className="sub">Bandeja vacía. Agrega un destinatario o aprueba prospectos para que el Redactor prepare borradores.</p> : <ul className="bd-lista">{fichas.map((f) => <TarjetaBandeja key={f.id} f={f} />)}</ul>}
      <h2>Enviados recientes</h2>
      <ul className="registro">
        {enviados.rows.length === 0 ? <li>Aún no se ha enviado nada.</li> : enviados.rows.map((e, i) => <li key={i}><time>{fecha(e.enviado_at)}</time> <b>{e.empresa as string}</b> · {e.correo as string}<small>{e.asunto as string}</small></li>)}
      </ul>
    </main>
  );
}
