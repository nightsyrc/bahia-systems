import { MEDIDA, mxn } from "@/config/marca";

export type Seleccion = { tipo: string; extras: string[]; urgencia: string };

export function estimar(s: Seleccion): { min: number; max: number; texto: string } | null {
  const t = MEDIDA.tipos.find((x) => x.id === s.tipo);
  if (!t) return null;
  const u = MEDIDA.urgencia.find((x) => x.id === s.urgencia)?.mult ?? 1;
  let min = t.min, max = t.max;
  for (const id of s.extras) { const e = MEDIDA.extras.find((x) => x.id === id); if (e) { min += e.min; max += e.max; } }
  min = Math.round((min * u) / 500) * 500; max = Math.round((max * u) / 500) * 500;
  return { min, max, texto: `${mxn(min)} a ${mxn(max)} + IVA` };
}
