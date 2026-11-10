import { sql } from "@/lib/db";
import { extraerJson, llamar } from "@/lib/ia";
import { log } from "@/lib/agentes";
import { SECTORES, ZONA } from "@/config/equipo";

type Hallazgo = { titulo?: string; problema?: string; publico?: string; zona?: string; fuente_url?: string };

/** Explorador: propone ideas nuevas a partir de la web pública. No construye ni contacta a nadie. */
export async function explorador(): Promise<number> {
  const sector = SECTORES[Math.floor(Date.now() / 86_400_000) % SECTORES.length];
  const previas = (await sql`SELECT titulo FROM ideas ORDER BY id DESC LIMIT 40`).rows.map((r) => r.titulo as string);
  const sistema = `Eres un investigador de producto para una empresa de software de Puerto Vallarta. Usa la búsqueda web para encontrar problemas operativos reales de negocios del sector indicado en ${ZONA}.
Cada idea debe ser una app o servicio SaaS pequeño (se construye en semanas), que un negocio local pagaría entre 300 y 3,000 MXN al mes. No propongas nada ilegal ni que dependa de datos personales sensibles. Incluye fuente_url con la página donde viste el problema o la evidencia. No inventes datos.
Evita repetir estas ideas ya registradas: ${previas.join("; ") || "(ninguna)"}.
Responde SOLO con una lista JSON de hasta 4 objetos: titulo, problema (2 frases), publico, zona, fuente_url.`;
  let texto: string;
  try { texto = await llamar(sistema, `Sector: ${sector}`, { buscar: true, maxTokens: 2500 }); }
  catch (e) { await log("explorador", "error", e instanceof Error ? e.message : String(e), false); return 0; }
  const lista = extraerJson<Hallazgo[]>(texto);
  if (!Array.isArray(lista)) { await log("explorador", "sin_resultado", sector, false); return 0; }
  let n = 0;
  for (const h of lista.slice(0, 4)) {
    const titulo = (h.titulo ?? "").trim().slice(0, 120), problema = (h.problema ?? "").trim().slice(0, 600);
    if (!titulo || !problema) continue;
    const r = await sql`INSERT INTO ideas (titulo, problema, publico, zona, fuente_url) VALUES (${titulo}, ${problema}, ${(h.publico ?? "").slice(0, 160) || null}, ${(h.zona ?? "").slice(0, 120) || null}, ${(h.fuente_url ?? "").slice(0, 300) || null})
      ON CONFLICT (lower(titulo)) DO NOTHING RETURNING id`.catch(() => ({ rows: [] }));
    if (r.rows.length) n++;
  }
  await log("explorador", "ideas", `${n} nuevas (${sector})`);
  return n;
}

async function cargar(id: number) {
  const r = await sql`SELECT * FROM ideas WHERE id = ${id}`;
  return r.rows[0] as Record<string, unknown> | undefined;
}
const ficha = (i: Record<string, unknown>) => `Idea: ${i.titulo}\nProblema: ${i.problema}\nPúblico: ${i.publico ?? "-"}\nZona: ${i.zona ?? "-"}\nEvidencia: ${i.fuente_url ?? "-"}`;

/** Analista: puntaje, competencia, precio y riesgos. */
export async function analista(id: number): Promise<boolean> {
  const i = await cargar(id); if (!i) return false;
  const t = await llamar(`Eres analista de producto. Con la búsqueda web revisa si ya existen soluciones para este problema en México. Devuelve SOLO JSON: {"puntaje":1-100,"precio_mensual":MXN entero,"analisis":"Markdown breve con: demanda, competencia real encontrada (con enlaces), precio sugerido, riesgos y por qué sí o no"}. Sé escéptico; un puntaje alto exige evidencia.`, ficha(i), { buscar: true, maxTokens: 2500 });
  const j = extraerJson<{ puntaje?: number; precio_mensual?: number; analisis?: string }>(t);
  if (!j?.analisis) { await log("analista", "error", `idea ${id}`, false); return false; }
  await sql`UPDATE ideas SET puntaje = ${Math.max(1, Math.min(100, Math.round(j.puntaje ?? 50)))}, precio_mensual = ${Math.round(j.precio_mensual ?? 0) || null}, analisis = ${j.analisis.slice(0, 5000)}, estado = 'analizada', actualizado_at = NOW() WHERE id = ${id}`;
  await log("analista", "analisis", `idea ${id}`);
  return true;
}

/** Arquitecto: spec del MVP y brief de construcción. */
export async function arquitecto(id: number): Promise<boolean> {
  const i = await cargar(id); if (!i) return false;
  const t = await llamar(`Eres arquitecto de software. Escribe en Markdown un SPEC de MVP para construir en 2 semanas con Next.js 15, Postgres (Neon), Stripe para cobrar suscripción mensual y multi-cliente (cada negocio su espacio). Secciones: Objetivo, Usuarios, Alcance del MVP (máximo 5 funciones), Fuera de alcance, Modelo de datos (tablas), Pantallas, Cobro y planes, Riesgos y privacidad (LFPDPPP), Criterios de aceptación, y al final un bloque "BRIEF PARA CONSTRUCTOR" de 10 líneas para pegar en Claude Code. Español de México. No inventes datos de mercado.`, `${ficha(i)}\nAnálisis previo: ${i.analisis ?? "-"}\nPrecio mensual sugerido: ${i.precio_mensual ?? "-"} MXN`, { maxTokens: 3500 });
  if (t.length < 200) { await log("arquitecto", "error", `idea ${id}`, false); return false; }
  await sql`UPDATE ideas SET spec = ${t.slice(0, 12000)}, estado = 'especificada', actualizado_at = NOW() WHERE id = ${id}`;
  await log("arquitecto", "spec", `idea ${id}`);
  return true;
}

/** Vendedor: kit de venta. Los correos NO se envían: tú los llevas a la Bandeja de aprobación. */
export async function vendedor(id: number): Promise<boolean> {
  const i = await cargar(id); if (!i) return false;
  const t = await llamar(`Eres redactor comercial B2B en español de México. Escribe en Markdown: Promesa en una línea, Para quién es, Precio y qué incluye, Texto de página de aterrizaje (titular, 3 beneficios, preguntas frecuentes) y TRES borradores de correo de primer contacto de máximo 110 palabras, sin exclamaciones, sin cifras inventadas, sin nombrar clientes, con una sola pregunta al final. No afirmes funciones que el spec no tenga.`, `${ficha(i)}\nPrecio: ${i.precio_mensual ?? "-"} MXN/mes\nSpec:\n${String(i.spec ?? "").slice(0, 4000)}`, { maxTokens: 3000 });
  if (t.length < 200) { await log("vendedor", "error", `idea ${id}`, false); return false; }
  await sql`UPDATE ideas SET kit_venta = ${t.slice(0, 8000)}, actualizado_at = NOW() WHERE id = ${id}`;
  await log("vendedor", "kit", `idea ${id}`);
  return true;
}
