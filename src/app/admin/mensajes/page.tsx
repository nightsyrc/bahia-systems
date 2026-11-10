import { redirect } from "next/navigation";
import AdminNav from "@/components/AdminNav";
import EditorMensaje from "@/components/EditorMensaje";
import { ensureSchema, sql } from "@/lib/db";
import { esAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";
const fecha = (d: unknown) => new Intl.DateTimeFormat("es-MX", { timeZone: "America/Mexico_City", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }).format(new Date(String(d)));

export default async function Mensajes() {
  if (!(await esAdmin())) redirect("/admin/login");
  await ensureSchema();
  const [bor, rec] = await Promise.all([
    sql`SELECT m.id, m.tipo, m.asunto, m.cuerpo, p.empresa, p.correo FROM mensajes m JOIN prospectos p ON p.id = m.prospecto_id WHERE m.estado = 'borrador' ORDER BY m.creado_at`,
    sql`SELECT m.tipo, m.asunto, m.estado, m.enviado_at, m.error, p.empresa FROM mensajes m JOIN prospectos p ON p.id = m.prospecto_id WHERE m.estado IN ('enviado','aprobado') OR m.error IS NOT NULL ORDER BY COALESCE(m.enviado_at, m.creado_at) DESC LIMIT 30`,
  ]);
  return (
    <main className="adm">
      <h1>Mensajes</h1>
      <AdminNav actual="mensajes" />
      <h2>Por aprobar ({bor.rows.length})</h2>
      {bor.rows.length === 0 ? <p className="sub">Nada pendiente.</p> : (
        <ul className="adm-lista">
          {bor.rows.map((m) => (
            <li key={m.id as number} className="adm-card">
              <div className="adm-card-cab"><h3>{m.empresa as string}</h3><span className="chip">{m.tipo as string}</span></div>
              <p className="sub">Para: {(m.correo as string) ?? "sin correo"}</p>
              <EditorMensaje id={m.id as number} asunto={m.asunto as string} cuerpo={m.cuerpo as string} />
            </li>
          ))}
        </ul>
      )}
      <h2>Recientes</h2>
      <ul className="registro">
        {rec.rows.map((m, i) => (
          <li key={i} className={m.error ? "mal" : ""}><time>{m.enviado_at ? fecha(m.enviado_at) : "en cola"}</time> <b>{m.empresa as string}</b> {m.tipo as string} · {m.estado as string}<small>{(m.error as string) ?? (m.asunto as string)}</small></li>
        ))}
      </ul>
    </main>
  );
}
