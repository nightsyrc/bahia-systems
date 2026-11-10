"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";

const CAMPOS: [string, string, boolean, string?][] = [
  ["empresa", "Empresa", true], ["correo", "Correo de contacto", true, "email"], ["fuente", "Dónde viste ese correo (enlace)", false, "url"], ["sitio", "Sitio web", false, "url"],
  ["ciudad", "Ciudad", false], ["categoria", "Tipo de empresa", false], ["notas", "Teléfono o notas", false],
];
export default function NuevoDestinatario() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  async function ir(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = Object.fromEntries(new FormData(e.currentTarget).entries());
    setBusy(true); setMsg("");
    const r = await fetch("/api/admin/accion", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ accion: "prospecto_nuevo", ...fd }) }).catch(() => null);
    const j = (await r?.json().catch(() => ({}))) as { error?: string };
    setBusy(false);
    if (!r?.ok) return setMsg(j?.error || "No se pudo guardar.");
    router.push("/admin/bandeja");
  }
  return (
    <form className="pc bd-form" onSubmit={ir}>
      {CAMPOS.map(([k, t, req, tipo]) => <label key={k}>{t}<input name={k} type={tipo ?? "text"} required={req} /></label>)}
      <label>Por qué les serviría<input name="razon" maxLength={300} /></label>
      <label>Asunto<input name="asunto" required maxLength={140} /></label>
      <label>Mensaje<textarea name="cuerpo" rows={9} required maxLength={1500} /></label>
      {msg ? <p className="err" role="alert">{msg}</p> : null}
      <button className="btn primario" disabled={busy}>{busy ? "Guardando…" : "Guardar en la bandeja (no se envía)"}</button>
    </form>
  );
}
