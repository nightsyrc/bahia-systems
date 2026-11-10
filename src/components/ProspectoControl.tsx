"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";

const ETAPAS: [string, string][] = [["propuesto", "Propuesto"], ["aprobado", "Aprobado"], ["contactado", "Contactado"], ["respondio", "Respondió"], ["demo", "Demo"], ["propuesta", "Propuesta"], ["cliente", "Cliente"], ["no_ahora", "No por ahora"], ["sin_respuesta", "Sin respuesta"], ["descartado", "Descartado"]];

export default function ProspectoControl({ id, estado, correo, mensual, unico }: { id: number; estado: string; correo: string | null; mensual: number | null; unico: number | null }) {
  const router = useRouter();
  const [e, setE] = useState(estado);
  const [m, setM] = useState(mensual ? String(mensual) : "");
  const [u, setU] = useState(unico ? String(unico) : "");
  const [c, setC] = useState(correo ?? "");
  const [resp, setResp] = useState("");
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);
  async function post(body: Record<string, unknown>): Promise<{ error?: string; clasificacion?: string } | null> {
    setBusy(true); setMsg("");
    const r = await fetch("/api/admin/accion", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, ...body }) }).catch(() => null);
    const j = (await r?.json().catch(() => ({}))) as { error?: string; clasificacion?: string };
    setBusy(false);
    if (!r?.ok) { setMsg(j?.error || "No se pudo."); return null; }
    router.refresh();
    return j;
  }
  return (
    <div className="pc">
      <div className="fila">
        <label>Etapa<select value={e} onChange={(x) => setE(x.target.value)}>{ETAPAS.map(([k, t]) => <option key={k} value={k}>{t}</option>)}</select></label>
        <label>Correo de contacto<input value={c} onChange={(x) => setC(x.target.value)} placeholder="contacto@empresa.mx" /></label>
      </div>
      {e === "cliente" || e === "propuesta" ? (
        <div className="fila">
          <label>Mensualidad (MXN)<input inputMode="numeric" value={m} onChange={(x) => setM(x.target.value)} /></label>
          <label>Proyecto a la medida (MXN, una vez)<input inputMode="numeric" value={u} onChange={(x) => setU(x.target.value)} /></label>
        </div>
      ) : null}
      <div className="acciones">
        <button type="button" className="btn chico2" disabled={busy} onClick={async () => { if (c !== (correo ?? "")) await post({ accion: "prospecto_correo", correo: c }); await post({ accion: "prospecto_estado", estado: e, valorMensual: m, valorUnico: u }); }}>Guardar</button>
      </div>
      <details>
        <summary>Registrar su respuesta</summary>
        <label>Pega aquí lo que respondió<textarea rows={4} value={resp} onChange={(x) => setResp(x.target.value)} /></label>
        <button type="button" className="btn chico2" disabled={busy} onClick={async () => { const j = await post({ accion: "respuesta", texto: resp }); if (j) { setResp(""); setMsg(`Clasificada como: ${j.clasificacion}. Si hay borrador de respuesta, está en Mensajes.`); } }}>Clasificar y preparar respuesta</button>
      </details>
      {msg ? <p className="sub" role="status">{msg}</p> : null}
    </div>
  );
}
