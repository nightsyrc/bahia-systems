"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { plantillaFrioVista } from "@/lib/vista";

export type Ficha = {
  id: number; tipo: string; estado: string; asunto: string; cuerpo: string; error: string | null;
  empresa: string; correo: string | null; sitio: string | null; ciudad: string | null; categoria: string | null; fuente: string | null;
  razon: string | null; notas: string | null; estadoProsp: string; baja: boolean; creado: string; generadoPor: string;
  historial: { tipo: string; estado: string; asunto: string; cuando: string }[];
  avisos: string[];
};

export default function TarjetaBandeja({ f }: { f: Ficha }) {
  const router = useRouter();
  const [asunto, setAsunto] = useState(f.asunto);
  const [cuerpo, setCuerpo] = useState(f.cuerpo);
  const [busy, setBusy] = useState("");
  const [msg, setMsg] = useState("");
  const [confirmar, setConfirmar] = useState(false);
  const cambio = asunto !== f.asunto || cuerpo !== f.cuerpo;

  async function accion(que: string, extra: Record<string, unknown> = {}) {
    setBusy(que); setMsg("");
    const r = await fetch("/api/admin/accion", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ accion: que, id: f.id, asunto, cuerpo, ...extra }) }).catch(() => null);
    const j = (await r?.json().catch(() => ({}))) as { error?: string };
    setBusy("");
    if (!r?.ok) { setConfirmar(false); return setMsg(j?.error || "No se pudo."); }
    router.refresh();
  }

  const bloqueado = f.baja || !f.correo;
  return (
    <li className="bd-card">
      <header className="bd-cab">
        <div><h2>{f.empresa}</h2><p className="sub">{[f.categoria, f.ciudad].filter(Boolean).join(" · ") || "Sin categoría"}</p></div>
        <span className="chip">{f.tipo === "frio1" ? "Primer contacto" : f.tipo === "frio2" ? "Seguimiento 1" : f.tipo === "frio3" ? "Seguimiento 2" : "Respuesta"}</span>
      </header>

      <section className="bd-ficha" aria-label="Ficha del destinatario">
        <h3>Destinatario</h3>
        <dl>
          <dt>Correo</dt><dd><b>{f.correo ?? "Sin correo"}</b></dd>
          <dt>Empresa</dt><dd>{f.empresa}</dd>
          <dt>Sitio</dt><dd>{f.sitio ? <a href={f.sitio} target="_blank" rel="noopener noreferrer">{f.sitio}</a> : "—"}</dd>
          <dt>De dónde salió el correo</dt><dd>{f.fuente ? <a href={f.fuente} target="_blank" rel="noopener noreferrer">{f.fuente}</a> : <b className="bd-mal">Sin fuente registrada</b>}</dd>
          <dt>Por qué encaja</dt><dd>{f.razon ?? "—"}</dd>
          <dt>Notas / teléfono</dt><dd>{f.notas ?? "—"}</dd>
          <dt>Etapa</dt><dd>{f.baja ? <b className="bd-mal">Se dio de baja</b> : f.estadoProsp}</dd>
          <dt>Registrado</dt><dd>{f.creado} · por {f.generadoPor}</dd>
        </dl>
        {f.avisos.length ? <ul className="bd-avisos">{f.avisos.map((a) => <li key={a}>{a}</li>)}</ul> : <p className="bd-ok">Sin alertas: tiene correo, fuente y no está dado de baja.</p>}
        {f.historial.length ? (
          <details><summary>Historial con este destinatario ({f.historial.length})</summary>
            <ul className="registro">{f.historial.map((h, i) => <li key={i}><time>{h.cuando}</time> {h.tipo} · {h.estado}<small>{h.asunto}</small></li>)}</ul>
          </details>
        ) : <p className="sub">Primer mensaje a este destinatario.</p>}
      </section>

      <section className="bd-correo" aria-label="Correo">
        <h3>Correo tal como llegará</h3>
        <p className="bd-meta"><span>De: Bahía Systems</span><span>Para: {f.correo ?? "—"}</span></p>
        <div className="pc">
          <label>Asunto<input value={asunto} maxLength={140} onChange={(e) => setAsunto(e.target.value)} /></label>
          <label>Mensaje<textarea rows={8} value={cuerpo} maxLength={1500} onChange={(e) => setCuerpo(e.target.value)} /></label>
        </div>
        <iframe title={`Vista previa para ${f.empresa}`} className="bd-vista" sandbox="" srcDoc={plantillaFrioVista(cuerpo)} />
      </section>

      {msg ? <p className="err" role="alert">{msg}</p> : null}
      {f.error ? <p className="err">Último intento falló: {f.error}</p> : null}
      <div className="acciones bd-acc">
        {!confirmar ? (
          <>
            <button type="button" className="btn primario chico2" disabled={!!busy || bloqueado} onClick={() => setConfirmar(true)}>Revisar y enviar…</button>
            <button type="button" className="btn chico2" disabled={!!busy || !cambio} onClick={() => accion("mensaje_guardar")}>{busy === "mensaje_guardar" ? "…" : "Guardar cambios"}</button>
            <button type="button" className="btn chico2" disabled={!!busy} onClick={() => accion("mensaje_rechazar")}>Descartar</button>
          </>
        ) : (
          <div className="bd-conf" role="alertdialog" aria-label="Confirmar envío">
            <p><b>Se enviará ahora a {f.correo}</b> con el asunto «{asunto}». No se puede deshacer.</p>
            <div className="acciones">
              <button type="button" className="btn primario chico2" disabled={!!busy} onClick={() => accion("mensaje_enviar")}>{busy ? "Enviando…" : "Sí, enviar"}</button>
              <button type="button" className="btn chico2" disabled={!!busy} onClick={() => setConfirmar(false)}>Cancelar</button>
            </div>
          </div>
        )}
      </div>
    </li>
  );
}
