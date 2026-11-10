"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function EditorMensaje({ id, asunto, cuerpo }: { id: number; asunto: string; cuerpo: string }) {
  const router = useRouter();
  const [a, setA] = useState(asunto);
  const [c, setC] = useState(cuerpo);
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);
  async function ir(accion: string) {
    setBusy(true); setMsg("");
    const r = await fetch("/api/admin/accion", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ accion, id, asunto: a, cuerpo: c }) }).catch(() => null);
    setBusy(false);
    if (!r?.ok) { const j = (await r?.json().catch(() => ({}))) as { error?: string }; return setMsg(j?.error || "No se pudo."); }
    router.refresh();
  }
  return (
    <div className="form">
      <label>Asunto<input value={a} onChange={(e) => setA(e.target.value)} maxLength={140} /></label>
      <label>Mensaje<textarea rows={8} value={c} onChange={(e) => setC(e.target.value)} maxLength={1500} /></label>
      {msg ? <p className="err" role="alert">{msg}</p> : null}
      <div className="acciones">
        <button type="button" className="btn primario" disabled={busy} onClick={() => ir("mensaje_aprobar")}>Aprobar y enviar en la próxima vuelta</button>
        <button type="button" className="btn" disabled={busy} onClick={() => ir("mensaje_rechazar")}>Descartar</button>
      </div>
    </div>
  );
}
