"use client";
import { useMemo, useState } from "react";
import { MEDIDA } from "@/config/marca";
import { estimar } from "@/lib/estimado";
import FormContacto from "./FormContacto";

export default function Cotizador() {
  const [tipo, setTipo] = useState("app");
  const [extras, setExtras] = useState<string[]>([]);
  const [urgencia, setUrgencia] = useState("normal");
  const sel = { tipo, extras, urgencia };
  const est = useMemo(() => estimar(sel), [tipo, extras, urgencia]); // eslint-disable-line react-hooks/exhaustive-deps
  const alt = (id: string) => setExtras((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));
  return (
    <div className="cotiza">
      <div className="cotiza-op">
        <fieldset><legend>¿Qué necesitas?</legend>
          {MEDIDA.tipos.map((t) => <label key={t.id} className="opcion"><input type="radio" name="tipo" checked={tipo === t.id} onChange={() => setTipo(t.id)} /><span>{t.nombre}</span></label>)}
        </fieldset>
        <fieldset><legend>¿Qué debe incluir?</legend>
          {MEDIDA.extras.map((x) => <label key={x.id} className="opcion"><input type="checkbox" checked={extras.includes(x.id)} onChange={() => alt(x.id)} /><span>{x.nombre}</span></label>)}
        </fieldset>
        <fieldset><legend>¿Para cuándo?</legend>
          {MEDIDA.urgencia.map((u) => <label key={u.id} className="opcion"><input type="radio" name="urg" checked={urgencia === u.id} onChange={() => setUrgencia(u.id)} /><span>{u.nombre}</span></label>)}
        </fieldset>
      </div>
      <aside className="cotiza-res" aria-live="polite">
        <p className="cotiza-rango">{est?.texto}</p>
        <p className="sub">Rango orientativo. La cotización final por escrito depende de lo que veamos juntos y no se cobra nada por pedirla.</p>
        <FormContacto interes="medida" seleccion={sel} boton="Pedir mi cotización" />
      </aside>
    </div>
  );
}
