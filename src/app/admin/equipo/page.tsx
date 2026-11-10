import { redirect } from "next/navigation";
import AdminNav from "@/components/AdminNav";
import AdminBtn from "@/components/AdminBtn";
import { ensureSchema, sql } from "@/lib/db";
import { esAdmin } from "@/lib/auth";
import { EQUIPO } from "@/config/equipo";

export const dynamic = "force-dynamic";
const ETAPA: Record<string, string> = { propuesta: "Por revisar", aprobada: "Aprobada", analizada: "Analizada", especificada: "Con spec", construyendo: "Construyendo", lanzada: "Lanzada" };

export default async function Equipo() {
  if (!(await esAdmin())) redirect("/admin/login");
  await ensureSchema();
  const r = await sql`SELECT id, titulo, problema, publico, zona, fuente_url, estado, puntaje, precio_mensual, analisis, spec, kit_venta FROM ideas WHERE estado <> 'descartada' ORDER BY (estado = 'propuesta') DESC, COALESCE(puntaje, 0) DESC, id DESC LIMIT 60`;
  return (
    <main className="adm">
      <h1>Equipo de creación</h1>
      <p className="sub">Agentes que buscan problemas de la Bahía de Banderas y los convierten en apps de suscripción. Tú apruebas cada paso.</p>
      <AdminNav actual="equipo" />

      <section className="adm-bloque">
        <h2>Quién hace qué</h2>
        <ul className="eq-roster">
          {EQUIPO.map((a) => (
            <li key={a.id}><b>{a.nombre}</b><span>{a.trabajo}</span><small>Puerta: {a.puerta}</small></li>
          ))}
        </ul>
        <div className="acciones"><AdminBtn primario texto="Buscar ideas ahora" cuerpo={{ accion: "equipo", que: "explorador" }} /></div>
      </section>

      <h2>Ideas ({r.rows.length})</h2>
      {r.rows.length === 0 ? <p className="sub">Aún no hay ideas. Pulsa «Buscar ideas ahora» (requiere ANTHROPIC_API_KEY) o espera la vuelta del lunes.</p> : null}
      <ul className="adm-lista">
        {r.rows.map((i) => {
          const id = i.id as number, e = i.estado as string;
          return (
            <li key={id} className="adm-card">
              <div className="adm-card-cab"><h3>{i.titulo as string}</h3><span className="chip">{ETAPA[e] ?? e}{i.puntaje ? ` · ${i.puntaje}/100` : ""}</span></div>
              <p>{i.problema as string}</p>
              <p className="sub">{[i.publico, i.zona].filter(Boolean).join(" · ")}{i.precio_mensual ? ` · ${i.precio_mensual} MXN/mes sugeridos` : ""}{i.fuente_url ? <> · <a href={i.fuente_url as string} target="_blank" rel="noopener noreferrer">Evidencia</a></> : null}</p>
              <div className="acciones">
                {e === "propuesta" && <AdminBtn primario texto="Aprobar idea" cuerpo={{ accion: "idea_estado", id, estado: "aprobada" }} />}
                {e === "aprobada" && <AdminBtn primario texto="Analizar" cuerpo={{ accion: "equipo", que: "analista", id }} />}
                {e === "analizada" && <AdminBtn primario texto="Escribir spec" cuerpo={{ accion: "equipo", que: "arquitecto", id }} />}
                {e === "especificada" && <><AdminBtn primario texto="Kit de venta" cuerpo={{ accion: "equipo", que: "vendedor", id }} /><AdminBtn texto="Marcar: construyendo" cuerpo={{ accion: "idea_estado", id, estado: "construyendo" }} /></>}
                {e === "construyendo" && <AdminBtn primario texto="Marcar: lanzada" cuerpo={{ accion: "idea_estado", id, estado: "lanzada" }} />}
                <AdminBtn texto="Descartar" cuerpo={{ accion: "idea_estado", id, estado: "descartada" }} />
              </div>
              {i.analisis ? <details><summary>Análisis</summary><div className="eq-md">{i.analisis as string}</div></details> : null}
              {i.spec ? <details><summary>Spec y brief para el constructor</summary><div className="eq-md">{i.spec as string}</div></details> : null}
              {i.kit_venta ? <details><summary>Kit de venta (los correos van a la Bandeja)</summary><div className="eq-md">{i.kit_venta as string}</div></details> : null}
            </li>
          );
        })}
      </ul>
    </main>
  );
}
