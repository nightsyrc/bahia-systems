// El equipo de creación de Bahía Systems. Cada agente tiene un trabajo y una puerta: nada avanza sin tu aprobación.
export const ZONA = "Bahía de Banderas (Puerto Vallarta, Nuevo Vallarta, Bucerías, La Cruz, Sayulita, San Pancho, Punta Mita, Mezcales)";
export const SECTORES = [
  "administradoras de condominios y rentas vacacionales", "restaurantes, bares y beach clubs", "tours, pesca, yates y operadores turísticos",
  "clínicas, dentistas y turismo médico", "inmobiliarias y brokers", "escuelas, academias y clases", "talleres, ferreterías y comercio local",
  "bodas, eventos y músicos", "ONGs, iglesias y comunidades de expatriados",
];

export type Agente = { id: string; nombre: string; trabajo: string; entrega: string; puerta: string };
export const EQUIPO: Agente[] = [
  { id: "explorador", nombre: "Explorador", trabajo: "Busca en la web pública problemas reales de negocios de la bahía que una app pequeña podría resolver.", entrega: "Ideas con problema, público y evidencia", puerta: "Tú apruebas o descartas cada idea" },
  { id: "analista", nombre: "Analista", trabajo: "Puntúa la idea, la compara con lo que ya existe, estima precio mensual y riesgos.", entrega: "Análisis y puntaje de 1 a 100", puerta: "Tú decides si pasa a diseño" },
  { id: "arquitecto", nombre: "Arquitecto", trabajo: "Escribe la especificación del MVP y un brief de construcción listo para Claude Code o tus agentes.", entrega: "Spec en Markdown con alcance, datos y pantallas", puerta: "Tú apruebas el spec antes de construir" },
  { id: "constructor", nombre: "Constructor", trabajo: "Construye el MVP en un repo aparte a partir del brief (lo hace Claude Code o tus agentes, no el servidor).", entrega: "Repo y vista previa en Vercel", puerta: "Tú pruebas la vista previa" },
  { id: "vendedor", nombre: "Vendedor", trabajo: "Prepara el kit de venta: promesa, precio, texto de la página y tres correos de primer contacto.", entrega: "Kit de venta", puerta: "Los correos pasan por la Bandeja de aprobación" },
  { id: "caravana", nombre: "Caravana", trabajo: "Mide qué canal trae visitas y ventas de cada app.", entrega: "Embudo por canal en Bahía Command", puerta: "Solo lectura" },
];
export const ESTADOS = ["propuesta", "aprobada", "analizada", "especificada", "construyendo", "lanzada", "descartada"] as const;
