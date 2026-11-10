"use client";
import { useState } from "react";

export default function Login() {
  const [msg, setMsg] = useState("");
  async function ir(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const clave = new FormData(e.currentTarget).get("clave");
    const r = await fetch("/api/admin/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ clave }) }).catch(() => null);
    if (r?.ok) location.href = "/admin"; else setMsg("Clave incorrecta.");
  }
  return (
    <main className="legal">
      <h1>Panel privado</h1>
      <form className="form" onSubmit={ir}>
        <label>Clave<input name="clave" type="password" autoComplete="current-password" required /></label>
        {msg ? <p className="err" role="alert">{msg}</p> : null}
        <button className="btn primario">Entrar</button>
      </form>
    </main>
  );
}
