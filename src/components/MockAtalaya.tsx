// Pantalla de Paquetería de Atalaya con datos de ejemplo (no son datos de ningún cliente).
const FILAS = [
  { u: "14", n: "Familia Ortega", p: "Amazon · llegó hace 40 min", c: 2, avisado: false },
  { u: "22", n: "Rentista · Carla Ibarra", p: "DHL · llegó hace 3 h", c: 1, avisado: true },
  { u: "31", n: "Familia Navarro", p: "Mercado Libre · llegó ayer", c: 3, avisado: true },
];
export default function MockAtalaya() {
  return (
    <figure className="mock" aria-label="Ejemplo de la pantalla de paquetería de Atalaya">
      <div className="mock-barra"><span /><span /><span /><b>Paquetería</b></div>
      <div className="mock-cuerpo">
        <ul className="mock-cifras"><li><b>6</b>paquetes</li><li><b>3</b>unidades</li><li className="aviso"><b>1</b>sin avisar</li></ul>
        <ul className="mock-lista">
          {FILAS.map((f) => (
            <li key={f.u}>
              <span className="mock-num">{f.c}</span>
              <span><b>Unidad {f.u} · {f.n}</b><small>{f.p}</small></span>
              <em className={f.avisado ? "ok" : "no"}>{f.avisado ? "Avisado" : "Sin avisar"}</em>
            </li>
          ))}
        </ul>
      </div>
      <figcaption>Datos de ejemplo</figcaption>
    </figure>
  );
}
