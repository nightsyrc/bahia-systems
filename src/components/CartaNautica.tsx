// Carta náutica de la bahía: curvas de profundidad generadas con una fórmula fija (siempre dibujan lo mismo),
// con Atalaya marcada como el faro de la carta.
function curva(cx: number, cy: number, r: number, i: number): string {
  const pts: string[] = [];
  for (let k = 0; k <= 90; k++) {
    const a = (k / 90) * Math.PI * 2;
    const f = 1 + 0.09 * Math.sin(3 * a + i * 0.55) + 0.05 * Math.sin(5 * a + i * 1.1) + 0.03 * Math.cos(7 * a - i);
    const sx = 1.28; // la bahía se abre hacia los lados
    pts.push(`${k === 0 ? "M" : "L"}${(cx + Math.cos(a) * r * f * sx).toFixed(1)} ${(cy + Math.sin(a) * r * f * 0.82).toFixed(1)}`);
  }
  return pts.join(" ") + "Z";
}

export default function CartaNautica() {
  const cx = 300, cy = 250;
  const profundidades = [16, 24, 33, 41, 50, 58, 67, 76, 84, 92];
  const sondeos: [number, number, string][] = [[470, 130, "18"], [150, 360, "42"], [430, 390, "27"], [120, 150, "9"], [520, 270, "61"], [250, 420, "35"]];
  return (
    <svg className="carta" viewBox="0 0 600 500" role="img" aria-label="Carta náutica con la ubicación de Atalaya en la bahía">
      <defs>
        <pattern id="malla" width="50" height="50" patternUnits="userSpaceOnUse"><path d="M50 0H0V50" fill="none" stroke="#0B3954" strokeOpacity=".07" strokeWidth="1" /></pattern>
      </defs>
      <rect width="600" height="500" fill="url(#malla)" />
      {profundidades.map((r, i) => (
        <path key={i} d={curva(cx, cy, r * 2.05, i)} pathLength={1} className="curva" style={{ animationDelay: `${i * 90}ms` }} stroke="#00A3A1" strokeOpacity={0.9 - i * 0.07} />
      ))}
      {sondeos.map(([x, y, n]) => <text key={n + x} x={x} y={y} className="sondeo">{n}</text>)}
      <g transform={`translate(${cx} ${cy})`}>
        <circle r="26" fill="#F3F8F8" stroke="#0B3954" strokeWidth="1.5" />
        <path d="M0 -15 L7 11 H-7 Z" fill="#0B3954" />
        <rect x="-3.4" y="-18" width="6.8" height="6" fill="#F2674F" />
        <path d="M-28 4 H-48 M28 4 H48" stroke="#F2674F" strokeWidth="2" strokeLinecap="round" />
      </g>
      <text x={cx} y={cy + 52} textAnchor="middle" className="rotulo">Atalaya</text>
      <text x="24" y="478" className="coord">20°39′N 105°14′O · Bahía de Banderas · sondeos en brazas</text>
    </svg>
  );
}
