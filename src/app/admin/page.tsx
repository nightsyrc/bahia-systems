import { redirect } from "next/navigation";
import AdminNav from "@/components/AdminNav";
import AdminBtn from "@/components/AdminBtn";
import { ensureSchema, sql } from "@/lib/db";
import { esAdmin } from "@/lib/auth";
import { METAS, OUTREACH } from "@/config/outreach";
import { mxn } from "@/config/marca";

export const dynamic = "force-dynamic";
const n = (r: { rows: Record<string, unknown>[] }, k: string) => Number(r.rows[0]?.[k] ?? 0);

function Meta({ t, real, meta, fmt = (x: number) => String(x) }: { t: string; real: number; meta: number; fmt?: (x: number) => string }) {
  const pct = Math.min(100, Math.round((real / meta) * 100));
  return (
    <li className="meta"><div className="meta-cab"><b>{t}</b><span>{fmt(real)} de {fmt(meta)}</span></div><div className="barra" role="img" aria-label={`${pct}% de la meta`}><i style={{ width: `${pct}%` }} /></div></li>
  );
}

export default async function Monitor() {
  if (!(await esAdmin())) redirect("/admin/login");
  await ensureSchema();
  const [emb, env14, tot, cli, leads, agentes, pend, cola, hoy] = await Promise.all([
    sql`SELECT estado, COUNT(*)::int AS n FROM prospectos GROUP BY estado`,
    sql`SELECT to_char(date_trunc('day', enviado_at AT TIME ZONE 'America/Mexico_City'), 'DD/MM') AS d, COUNT(*)::int AS n FROM mensajes WHERE estado = 'enviado' AND tipo <> 'respuesta' AND enviado_at > NOW() - INTERVAL '14 days' GROUP BY 1 ORDER BY MIN(enviado_at)`,
    sql`SELECT COUNT(*) FILTER (WHERE estado IN ('contactado','respondio','demo','propuesta','cliente','no_ahora','sin_respuesta','baja'))::int AS contactados,
               COUNT(*) FILTER (WHERE estado IN ('respondio','demo','propuesta','cliente'))::int AS respondieron,
               COUNT(*) FILTER (WHERE estado IN ('demo','propuesta','cliente'))::int AS demos,
               COUNT(*) FILTER (WHERE baja)::int AS bajas FROM prospectos`,
    sql`SELECT COUNT(*) FILTER (WHERE estado = 'cliente' AND valor_mensual IS NOT NULL)::int AS clientes, COALESCE(SUM(valor_mensual) FILTER (WHERE estado = 'cliente'), 0)::int AS mrr,
               COUNT(*) FILTER (WHERE estado = 'cliente' AND valor_unico IS NOT NULL)::int AS medida, COALESCE(SUM(valor_unico) FILTER (WHERE estado = 'cliente'), 0)::int AS unico FROM prospectos`,
    sql`SELECT COUNT(*)::int AS n, COUNT(*) FILTER (WHERE interes = 'medida')::int AS medida FROM leads WHERE creado_at > NOW() - INTERVAL '30 days'`,
    sql`SELECT ts, agente, accion, detalle, ok FROM agentes_log ORDER BY ts DESC LIMIT 25`,
    sql`SELECT COUNT(*)::int AS n FROM prospectos WHERE estado = 'propuesto'`,
    sql`SELECT COUNT(*) FILTER (WHERE estado = 'borrador')::int AS borradores, COUNT(*) FILTER (WHERE estado = 'aprobado')::int AS aprobados FROM mensajes`,
    sql`SELECT COUNT(*)::int AS n FROM mensajes WHERE estado = 'enviado' AND tipo <> 'respuesta' AND enviado_at > NOW() - INTERVAL '24 hours'`,
  ]);
  const por = new Map(emb.rows.map((x) => [x.estado as string, x.n as number]));
  const ETAPAS: [string, string][] = [["propuesto", "Propuestos"], ["aprobado", "Aprobados"], ["contactado", "Contactados"], ["respondio", "Respondieron"], ["demo", "Demo"], ["propuesta", "Propuesta"], ["cliente", "Clientes"]];
  const contactados = n(tot, "contactados"), resp = n(tot, "respondieron");
  const dia = Math.max(0, Math.floor((Date.now() - new Date(METAS.inicio).getTime()) / 86_400_000));
  const maxEnv = Math.max(1, ...env14.rows.map((x) => x.n as number));
  const hora = (d: unknown) => new Intl.DateTimeFormat("es-MX", { timeZone: "America/Mexico_City", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }).format(new Date(String(d)));

  return (
    <main className="adm">
      <h1>Monitor de ventas</h1>
      <p className="sub">Día {Math.min(dia, METAS.dias)} de {METAS.dias}. Las metas son supuestos de arranque; se ajustan con tus datos reales.</p>
      <AdminNav actual="monitor" />

      <section className="adm-bloque">
        <h2>Lo que necesita tu atención</h2>
        <ul className="adm-aten">
          <li><b>{n(pend, "n")}</b> prospectos propuestos esperan tu aprobación <a href="/admin/prospectos">Revisar</a></li>
          <li><b>{n(cola, "borradores")}</b> mensajes en borrador esperan tu aprobación <a href="/admin/bandeja">Abrir bandeja</a></li>
          <li><b>{n(cola, "aprobados")}</b> mensajes aprobados esperando envío ({n(hoy, "n")} de {OUTREACH.enviosPorDia} enviados en 24 h)</li>
        </ul>
      </section>

      <section className="adm-bloque">
        <h2>Metas a 90 días</h2>
        <ul className="metas">
          <Meta t="Prospectos contactados" real={contactados} meta={METAS.contactados} />
          <Meta t="Demos hechas" real={n(tot, "demos")} meta={METAS.demos} />
          <Meta t="Clientes de Atalaya" real={n(cli, "clientes")} meta={METAS.clientes} />
          <Meta t="Ingreso mensual recurrente" real={n(cli, "mrr")} meta={METAS.mrr} fmt={mxn} />
          <Meta t="Proyectos a la medida" real={n(cli, "medida")} meta={METAS.proyectosMedida} />
        </ul>
        <p className="sub">Cobrado en proyectos a la medida: {mxn(n(cli, "unico"))}.</p>
      </section>

      <section className="adm-bloque">
        <h2>Embudo</h2>
        <ol className="embudo">{ETAPAS.map(([k, t]) => <li key={k}><b>{por.get(k) ?? 0}</b><span>{t}</span></li>)}</ol>
        <p className="sub">Tasa de respuesta: {contactados ? Math.round((resp / contactados) * 100) : 0}% ({resp} de {contactados}). Bajas: {n(tot, "bajas")}. Entrantes del sitio, 30 días: {n(leads, "n")} ({n(leads, "medida")} a la medida).</p>
      </section>

      <section className="adm-bloque">
        <h2>Correos enviados, últimos 14 días</h2>
        {env14.rows.length === 0 ? <p className="sub">Todavía no se ha enviado ningún correo en frío.</p> : (
          <ul className="barras">{env14.rows.map((x) => <li key={x.d as string}><i style={{ height: `${Math.round(((x.n as number) / maxEnv) * 100)}%` }} /><b>{x.n as number}</b><span>{x.d as string}</span></li>)}</ul>
        )}
      </section>

      <section className="adm-bloque">
        <h2>Agentes</h2>
        <div className="acciones">
          <AdminBtn texto="Buscar prospectos ahora" cuerpo={{ accion: "correr", que: "prospector" }} />
          <AdminBtn texto="Redactar borradores ahora" cuerpo={{ accion: "correr", que: "redactor" }} />
          <AdminBtn texto="Enviar lo aprobado ahora" cuerpo={{ accion: "correr", que: "envio" }} />
        </div>
        <ul className="registro">
          {agentes.rows.length === 0 ? <li className="sub">Sin actividad todavía.</li> : agentes.rows.map((a, i) => (
            <li key={i} className={a.ok ? "" : "mal"}><time>{hora(a.ts)}</time> <b>{a.agente as string}</b> {a.accion as string}<small>{(a.detalle as string) ?? ""}</small></li>
          ))}
        </ul>
      </section>
    </main>
  );
}
