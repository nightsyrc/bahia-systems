// Pantallas de Atalaya con datos de ejemplo (no son datos de ningún cliente).
const FILAS = [
  { u: "14", n: "Familia Ortega", p: "Amazon · hace 40 min", c: 2, avisado: false },
  { u: "22", n: "Carla Ibarra", p: "DHL · hace 3 h", c: 1, avisado: true },
  { u: "31", n: "Familia Navarro", p: "Mercado Libre · ayer", c: 3, avisado: true },
  { u: "08", n: "Roberto Salas", p: "Estafeta · ayer", c: 1, avisado: true },
];
export default function MockAtalaya() {
  return (
    <div className="tel" role="img" aria-label="Ejemplo de la pantalla de paquetería de Atalaya en un celular, con datos de ejemplo">
      <div className="tel-isla" />
      <div className="tel-pant">
        <div className="tel-top"><b>Paquetería</b><span>Turno matutino</span></div>
        <ul className="tel-cifras"><li><b>6</b>paquetes</li><li><b>3</b>unidades</li><li className="aviso"><b>1</b>sin avisar</li></ul>
        <ul className="tel-lista">
          {FILAS.map((f) => (
            <li key={f.u}>
              <span className="tel-num">{f.c}</span>
              <span><b>Unidad {f.u} · {f.n}</b><small>{f.p}</small></span>
              <em className={f.avisado ? "ok" : "no"}>{f.avisado ? "Avisado" : "Avisar"}</em>
            </li>
          ))}
        </ul>
        <div className="tel-btn">+ Registrar paquete</div>
        <div className="tel-nav"><i className="on" /><i /><i /><i /></div>
      </div>
      <div className="tel-flota f1"><b>✓ Entrega firmada</b><small>Unidad 31 · 2:14 pm</small></div>
      <div className="tel-flota f2"><b>📄 Reporte enviado</b><small>Turno matutino · en orden</small></div>
    </div>
  );
}
