import { redirect } from "next/navigation";
import AdminNav from "@/components/AdminNav";
import AdminBtn from "@/components/AdminBtn";
import ProspectoControl from "@/components/ProspectoControl";
import { ensureSchema, sql } from "@/lib/db";
import { esAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function Prospectos() {
  if (!(await esAdmin())) redirect("/admin/login");
  await ensureSchema();
  const r = await sql`SELECT id, empresa, sitio, ciudad, categoria, correo, fuente_url, razon, estado, baja, valor_mensual, valor_unico FROM prospectos WHERE estado <> 'descartado' ORDER BY (estado = 'propuesto') DESC, estado_at DESC LIMIT 200`;
  const filas = r.rows;
  return (
    <main className="adm">
      <h1>Prospectos</h1>
      <AdminNav actual="prospectos" />
      {filas.length === 0 ? <p className="sub">Aún no hay prospectos. Ve al Monitor y pulsa «Buscar prospectos ahora».</p> : null}
      <ul className="adm-lista">
        {filas.map((p) => {
          const id = p.id as number;
          const propuesto = p.estado === "propuesto";
          return (
            <li key={id} className="adm-card">
              <div className="adm-card-cab"><h2>{p.empresa as string}</h2><span className={`chip ${p.baja ? "mal" : ""}`}>{p.baja ? "Baja" : (p.estado as string)}</span></div>
              <p className="sub">{[p.categoria, p.ciudad].filter(Boolean).join(" · ")}</p>
              {p.razon ? <p>{p.razon as string}</p> : null}
              <p className="sub">
                {p.sitio ? <a href={p.sitio as string} target="_blank" rel="noopener noreferrer">Sitio</a> : null}
                {p.fuente_url ? <> · <a href={p.fuente_url as string} target="_blank" rel="noopener noreferrer">Fuente</a></> : null}
                {p.correo ? <> · {p.correo as string}</> : <> · <b>sin correo genérico: agrégalo</b></>}
              </p>
              {propuesto ? (
                <div className="acciones">
                  <AdminBtn primario texto="Aprobar" cuerpo={{ accion: "prospecto_estado", id, estado: "aprobado" }} />
                  <AdminBtn texto="Descartar" cuerpo={{ accion: "prospecto_estado", id, estado: "descartado" }} />
                </div>
              ) : null}
              <details>
                <summary>Etapa y respuesta</summary>
                <ProspectoControl id={id} estado={p.estado as string} correo={p.correo as string | null} mensual={p.valor_mensual as number | null} unico={p.valor_unico as number | null} />
              </details>
            </li>
          );
        })}
      </ul>
    </main>
  );
}
