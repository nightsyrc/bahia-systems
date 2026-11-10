"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function AdminBtn({ texto, cuerpo, primario, chico = true }: { texto: string; cuerpo: Record<string, unknown>; primario?: boolean; chico?: boolean }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  async function ir() {
    setBusy(true); setMsg("");
    const r = await fetch("/api/admin/accion", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(cuerpo) }).catch(() => null);
    const j = (await r?.json().catch(() => ({}))) as { error?: string; n?: number };
    setBusy(false);
    if (!r?.ok) return setMsg(j?.error || "No se pudo.");
    if (typeof j.n === "number") setMsg(`Listo: ${j.n}`);
    router.refresh();
  }
  return (<span className="adm-btn"><button type="button" className={`btn ${primario ? "primario" : ""} ${chico ? "chico2" : ""}`} disabled={busy} onClick={ir}>{busy ? "…" : texto}</button>{msg ? <small>{msg}</small> : null}</span>);
}
