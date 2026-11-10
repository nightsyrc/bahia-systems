"use client";

/** Caravana: de dónde llegó la visita (?src= o utm_source en la URL, o el sitio que la mandó). */
function origenCaravana(): string {
  const q = new URLSearchParams(window.location.search);
  const directo = q.get("src") ?? q.get("utm_source");
  if (directo) return directo;
  try {
    const ref = document.referrer ? new URL(document.referrer) : null;
    if (ref && ref.host !== window.location.host) return ref.hostname.replace(/^www\./, "").split(".")[0];
  } catch { /* sin referencia */ }
  return "directo";
}
import { useState } from "react";

export default function FormContacto({ interes = "demo", seleccion, boton = "Pedir mi demo", extra }: { interes?: string; seleccion?: object; boton?: string; extra?: React.ReactNode }) {
  const [estado, setEstado] = useState<"idle" | "enviando" | "ok">("idle");
  const [msg, setMsg] = useState("");
  const [estimado, setEstimado] = useState<string | null>(null);

  async function enviar(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    setEstado("enviando"); setMsg("");
    const r = await fetch("/api/leads", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nombre: f.get("nombre"), empresa: f.get("empresa"), email: f.get("email"), telefono: f.get("telefono"), mensaje: f.get("mensaje"), sitio: f.get("sitio"), acepta: f.get("acepta") === "on", origen: origenCaravana(), interes: (f.get("interes") as string) || interes, seleccion }),
    }).catch(() => null);
    const j = (await r?.json().catch(() => ({}))) as { error?: string; estimado?: string | null };
    if (!r?.ok) { setEstado("idle"); return setMsg(j?.error || "No se pudo enviar. Revisa tu conexión e inténtalo de nuevo."); }
    setEstimado(j.estimado ?? null); setEstado("ok");
  }

  if (estado === "ok") return (
    <div className="form-ok" role="status">
      <h3>Solicitud enviada</h3>
      <p>Te respondemos en un día hábil. Te enviamos un correo de confirmación.</p>
      {estimado ? <p>Rango orientativo de tu proyecto: <b>{estimado}</b>.</p> : null}
    </div>
  );
  return (
    <form className="form" onSubmit={enviar} noValidate>
      <div className="fila">
        <label>Nombre<input name="nombre" required autoComplete="name" /></label>
        <label>Empresa o condominio<input name="empresa" autoComplete="organization" /></label>
      </div>
      <div className="fila">
        <label>Correo<input name="email" type="email" required autoComplete="email" /></label>
        <label>Teléfono (opcional)<input name="telefono" type="tel" autoComplete="tel" /></label>
      </div>
      {!seleccion ? (
        <label>¿Qué te interesa?
          <select name="interes" defaultValue={interes}>
            <option value="demo">Una demo de Atalaya</option>
            <option value="atalaya">Precios y planes de Atalaya</option>
            <option value="medida">Una solución a la medida</option>
            <option value="otro">Otra cosa</option>
          </select>
        </label>
      ) : null}
      {extra}
      <label>Cuéntanos tu caso (opcional)<textarea name="mensaje" rows={4} /></label>
      <input name="sitio" tabIndex={-1} autoComplete="off" aria-hidden="true" className="trampa" />
      <label className="check"><input type="checkbox" name="acepta" required /><span>Acepto el <a href="/privacidad" target="_blank">aviso de privacidad</a> y que me contacten sobre mi solicitud.</span></label>
      {msg ? <p className="err" role="alert">{msg}</p> : null}
      <button className="btn primario" disabled={estado === "enviando"}>{estado === "enviando" ? "Enviando…" : boton}</button>
    </form>
  );
}
