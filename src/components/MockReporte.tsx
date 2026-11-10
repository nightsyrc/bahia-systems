// Vista del correo que recibe el administrador al cerrar un turno (datos de ejemplo).
export default function MockReporte() {
  return (
    <div className="rep" role="img" aria-label="Ejemplo del correo de reporte de turno que recibe el administrador, con datos de ejemplo">
      <div className="rep-barra"><span /><span /><span /><em>Reporte de turno · ejemplo</em></div>
      <div className="rep-cuerpo">
        <p className="rep-eyebrow">REPORTE DE TURNO · 8 DE NOVIEMBRE</p>
        <p className="rep-titulo">Turno matutino.<br />Cerrado en orden.</p>
        <p className="rep-sub">Todo se registró y se entregó en tiempo real. Nada queda pendiente por revisar.</p>
        <ul className="rep-kpis">
          <li><b>24</b>personas entraron</li>
          <li><b>9</b>paquetes entregados</li>
          <li><b>3</b>proveedores</li>
        </ul>
        <div className="rep-fila"><span>📸</span><div><b>Cada paquete, con firma y hora</b><small>Constancia de entrega adjunta al PDF</small></div></div>
        <div className="rep-fila"><span>🤝</span><div><b>Relevo firmado</b><small>El turno siguiente ve lo que quedó pendiente</small></div></div>
      </div>
    </div>
  );
}
